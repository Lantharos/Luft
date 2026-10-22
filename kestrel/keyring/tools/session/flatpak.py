import itertools
import os
import sys

import gi

gi.require_version("Gio", "2.0")
from gi.repository import Gio, GLib
from seal import in_daemon_user_namespace

HERE = os.path.dirname(os.path.abspath(__file__))
APP = "org.example.Notebook"
OTHER_APP = "org.example.Sketchbook"
TABLE = "keyring-items"
scopes = itertools.count(1)


def choices():
    store = Gio.DBusProxy.new_for_bus_sync(
        Gio.BusType.SESSION,
        Gio.DBusProxyFlags.NONE,
        None,
        "org.freedesktop.impl.portal.PermissionStore",
        "/org/freedesktop/impl/portal/PermissionStore",
        "org.freedesktop.impl.portal.PermissionStore",
        None,
    )
    (ids,) = store.call_sync("List", GLib.Variant("(s)", (TABLE,)), Gio.DBusCallFlags.NONE, -1, None).unpack()

    def lookup(entry):
        arguments = GLib.Variant("(ss)", (TABLE, entry))
        return store.call_sync("Lookup", arguments, Gio.DBusCallFlags.NONE, -1, None).unpack()[0]

    return {entry: lookup(entry) for entry in ids}


def exercise_flatpaks(session, check, login):
    folder = os.path.join(session.environment["XDG_DATA_HOME"], "applications")
    os.makedirs(folder, exist_ok=True)
    with open(os.path.join(folder, f"{APP}.desktop"), "w") as entry:
        entry.write("[Desktop Entry]\nType=Application\nName=Notebook\nExec=notebook\n")
    def sandbox_info(app):
        info = os.path.join(session.root, f"flatpak-info-{app}")
        with open(info, "w") as file:
            file.write(f"[Application]\nname={app}\n")
        return info

    def sandboxed(*arguments, app=APP, program="reader.py", around=(), extra=None):
        system = ["--ro-bind", "/usr", "/usr", "--ro-bind", "/etc", "/etc", "--proc", "/proc", "--dev", "/dev"]
        links = [part for name in ("bin", "lib", "lib64") for part in ("--symlink", f"usr/{name}", f"/{name}")]
        shared = ["--bind", "/tmp", "/tmp", "--ro-bind", HERE, HERE]
        identity = ["--ro-bind", sandbox_info(app), "/.flatpak-info"]
        sandbox = [*around, *in_daemon_user_namespace(session.daemon), "bwrap", *system, *links, *shared, *identity, "--"]
        return session.run([*sandbox, sys.executable, os.path.join(HERE, program), *arguments], extra)

    def asked():
        return len(session.requests("access"))

    session.script(access="allow", remember=True)
    before = asked()
    check(
        sandboxed("read", "service", "github.com") == "gh-token" and asked() == before + 1,
        "a Flatpak is asked before it uses your item",
    )
    check(
        session.requests("access")[-1]["request"]["title"] == "Allow Notebook to use “GitHub”?",
        "a Flatpak is named after its app",
    )
    remembered = {entry: apps for entry, apps in choices().items() if APP in apps}
    check(
        list(remembered.values()) == [{APP: ["yes"]}],
        "a Flatpak's remembered choice is kept in the permission store",
    )
    check(
        os.path.exists(os.path.join(session.environment["XDG_DATA_HOME"], "flatpak/db", TABLE)),
        "the permission store the tests use is the scratch one",
    )
    check(
        sandboxed("read", "service", "github.com") == "gh-token" and asked() == before + 1,
        "a Flatpak's remembered choice holds on its next launch",
    )

    session.script(access="deny", remember=True)
    check(sandboxed("read", "service", "mail.example.org") == "", "a Flatpak is refused when you say no")
    asked_before = asked()
    check(
        sandboxed("read", "service", "mail.example.org") == "" and asked() == asked_before,
        "a remembered no isn't asked again",
    )

    before = asked()
    sandboxed("store", "Notebook sync", "notebook-token", "app", "notebook")
    check(
        sandboxed("read", "app", "notebook") == "notebook-token" and asked() == before,
        "a Flatpak reads what it saved without being asked",
    )
    check(
        sandboxed("app-secrets", APP) == "stored:account-token|loaded:account-token|listed:account-token"
        and sandboxed("app-load", "com.example.Ledger") == "AccessDenied",
        "a Flatpak keeps app secrets only under its own app ID",
    )
    confirmations = len(session.confirmations())
    check(
        sandboxed("history", program="manager.py") == "org.freedesktop.DBus.Error.AccessDenied"
        and len(session.confirmations()) == confirmations,
        "a Flatpak can't manage the keyring",
    )

    before = len(session.confirmations())
    check(
        session.reader("read", "app", "notebook") == "notebook-token" and len(session.confirmations()) == before,
        "a program of yours reads a Flatpak's item without being asked",
    )

    session.script(passwords=[])
    check(
        sandboxed("read", "app", "notebook", app=OTHER_APP) == "" and len(session.confirmations()) == before + 1,
        "another sandboxed app has to confirm it's you to read a Flatpak's item",
    )
    check(
        "Notebook saved it" in session.confirmations()[-1]["request"]["body"],
        "the confirmation names the Flatpak that saved the item",
    )
    scope = f"--unit=app-{APP}-{os.getpid()}{next(scopes)}.scope"
    posing = ["systemd-run", "--user", "--scope", "--quiet", scope]
    host_runtime = {"XDG_RUNTIME_DIR": os.environ["XDG_RUNTIME_DIR"]}
    check(
        sandboxed("read", "app", "notebook", app=OTHER_APP, around=posing, extra=host_runtime) == ""
        and len(session.confirmations()) == before + 2,
        "a sandboxed app in a scope named after a Flatpak doesn't get its items",
    )
    session.script(passwords=[login])
    check(
        sandboxed("read-twice", "app", "notebook", app=OTHER_APP) == "notebook-token|notebook-token"
        and len(session.confirmations()) == before + 3,
        "once you confirm, the other app reads the Flatpak's item",
    )

    session.script(access="allow", remember=True)
    before = asked()
    check(
        session.reader("undumpable", "read", "network", "home") == "hunter2" and asked() == before,
        "a program of yours that keeps others out of its memory is still you",
    )

    session.reader("store", "Planted", "planted", "app_id", APP, "xdg:schema", "org.freedesktop.portal.Secret")
    own, claimed, _, _ = sandboxed("portal").split("|")
    check(
        len(bytes.fromhex(own)) == 64 and claimed == own and own != b"planted".hex(),
        "a Flatpak gets its own portal secret whatever app ID is passed along",
    )

    mail = [entry for entry, apps in choices().items() if apps.get(APP) == ["no"]]
    session.reader("delete", "service", "mail.example.org")
    check(len(mail) == 1 and mail[0] not in choices(), "deleting an item forgets the choices about it")
