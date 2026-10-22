import json
import os
import pwd
import shutil
import subprocess
import sys
import tempfile
import time

import gi
from agent import exercise_agent
from flatpak import exercise_flatpaks
from manage import exercise_management
from sabine import exercise_sabine
from seal import sealed

gi.require_version("Gio", "2.0")
from gi.repository import Gio, GLib

HERE = os.path.dirname(os.path.abspath(__file__))
DAEMON = os.path.abspath(sys.argv[1])
PERMISSION_STORE = "/usr/libexec/xdg-permission-store"
LOGIN = "correct horse"
checks = 0


def check(condition, label):
    global checks
    if not condition:
        raise SystemExit(f"Luft Keyring check failed: {label}")
    checks += 1
    print(f"Luft Keyring check: {label}", flush=True)


def scratch_home(root, name):
    home = os.path.join(root, name)
    for folder in (".local/share", "run"):
        os.makedirs(os.path.join(home, folder), mode=0o700, exist_ok=True)
    environment = dict(
        os.environ,
        HOME=home,
        XDG_DATA_HOME=os.path.join(home, ".local/share"),
        XDG_RUNTIME_DIR=os.path.join(home, "run"),
    )
    return home, environment


def bus_call(method, signature, arguments):
    return (
        Gio.bus_get_sync(Gio.BusType.SESSION)
        .call_sync(
            "org.freedesktop.DBus",
            "/org/freedesktop/DBus",
            "org.freedesktop.DBus",
            method,
            GLib.Variant(signature, arguments),
            None,
            Gio.DBusCallFlags.NONE,
            -1,
            None,
        )
        .unpack()
    )


def wait_for_name(name):
    for _ in range(100):
        if bus_call("NameHasOwner", "(s)", (name,))[0]:
            return
        time.sleep(0.1)
    raise SystemExit(f"{name} never appeared")


def lookup(environment, *attributes):
    result = subprocess.run(
        ["secret-tool", "lookup", *attributes], env=environment, capture_output=True, timeout=60, check=False
    )
    return result.stdout.decode()


def main():
    root = tempfile.mkdtemp(prefix="luft-keyring-")
    try:
        run(root)
    finally:
        shutil.rmtree(root, ignore_errors=True)
    print(f"Luft Keyring: {checks} checks passed")


class Session:
    def __init__(self, root):
        self.root = root
        self.home, self.environment = scratch_home(root, "person")
        self.plan = os.path.join(root, "prompter.json")
        self.prompts = os.path.join(root, "prompts.log")
        self.attempts = os.path.join(root, "authenticate.log")
        self.daemon = None

    def script(self, **settings):
        with open(self.plan, "w") as output:
            json.dump(settings, output)

    def requests(self, kind):
        if not os.path.exists(self.prompts):
            return []
        with open(self.prompts) as lines:
            return [entry for entry in map(json.loads, lines) if entry["kind"] == kind]

    def confirmations(self):
        return [entry for entry in self.requests("password") if entry["request"].get("continue") == "Confirm"]

    def authentications(self):
        if not os.path.exists(self.attempts):
            return []
        with open(self.attempts) as lines:
            return [json.loads(line) for line in lines]

    def run(self, command, extra=None):
        environment = dict(self.environment, **(extra or {}))
        return subprocess.run(
            command, env=environment, capture_output=True, timeout=90, check=False
        ).stdout.decode()

    def reader(self, *arguments, program=sys.executable):
        return self.run([program, os.path.join(HERE, "reader.py"), *arguments])

    def manager(self, *arguments, extra=None):
        return self.run([sys.executable, os.path.join(HERE, "manager.py"), *arguments], extra)

    def lock(self):
        self.reader("lock")


def run(root):
    session = Session(root)
    data = session.environment["XDG_DATA_HOME"]
    bus_call(
        "UpdateActivationEnvironment",
        "(a{ss})",
        ({"HOME": session.home, "XDG_DATA_HOME": data},),
    )
    socket = os.path.join(root, "authenticate")
    helpers = [
        subprocess.Popen([PERMISSION_STORE, "--replace"], env=session.environment),
        subprocess.Popen(
            [sys.executable, os.path.join(HERE, "authenticator.py"), socket, LOGIN, session.attempts],
            env=session.environment,
        ),
    ]
    session.script(passwords=[LOGIN], access="allow")
    helpers.append(
        subprocess.Popen(
            [sys.executable, os.path.join(HERE, "prompter.py"), session.plan, session.prompts], env=session.environment
        )
    )
    wait_for_name("org.freedesktop.impl.portal.PermissionStore")
    wait_for_name("com.lantharos.Kestrel")
    for _ in range(100):
        if os.path.exists(socket):
            break
        time.sleep(0.1)
    daemon = subprocess.Popen(sealed([DAEMON], socket), env=session.environment)
    session.daemon = daemon.pid
    try:
        wait_for_name("org.freedesktop.secrets")
        exercise(session)
    finally:
        daemon.terminate()
        daemon.wait()
        for helper in helpers:
            helper.terminate()
            helper.wait()


def store(environment, label, secret, *attributes):
    subprocess.run(
        ["secret-tool", "store", "--label", label, *attributes],
        input=secret.encode(),
        env=environment,
        check=True,
        timeout=60,
    )


def exercise(session):
    environment = session.environment
    stranger = os.path.join(session.root, "stranger")
    shutil.copy(sys.executable, stranger)

    store(environment, "Home network", "hunter2", "network", "home")
    setup = session.requests("password")[0]["request"]
    you = pwd.getpwuid(os.getuid()).pw_name
    check(
        not setup.get("confirm") and session.authentications() == [{"user": you, "accepted": True}],
        "setting up checks the password with the sign-in service instead of asking for it twice",
    )
    session.reader("store", "GitHub", "gh-token", "service", "github.com", "user", "mara", program=stranger)
    store(environment, "Mail", "mail-pass", "service", "mail.example.org")

    asked = len(session.requests("access")) + len(session.requests("password"))
    check(
        lookup(environment, "service", "github.com", "user", "mara") == "gh-token"
        and session.reader("read", "network", "home", program=stranger) == "hunter2"
        and len(session.requests("access")) + len(session.requests("password")) == asked,
        "every program you run reads what any other saved, without being asked",
    )
    found = subprocess.run(
        ["secret-tool", "search", "--all", "network", "home"],
        env=environment,
        capture_output=True,
        timeout=60,
        check=False,
    )
    check(
        b"secret = hunter2" in found.stdout and b"returned type" not in found.stderr,
        "an item hands its secret back in one piece, as Chromium-based apps read it",
    )

    with open(os.path.join(session.home, ".local/share/luft-keyring/vault"), "rb") as file:
        vault = file.read()
    check(b"gh-token" not in vault and b"GitHub" not in vault, "secrets and labels are encrypted on disk")

    service = Gio.DBusProxy.new_for_bus_sync(
        Gio.BusType.SESSION,
        Gio.DBusProxyFlags.NONE,
        None,
        "com.lantharos.Keyring1",
        "/com/lantharos/Keyring1",
        "com.lantharos.Keyring1",
        None,
    )
    check(service.get_cached_property("Locked").unpack() is False, "the keyring reports itself unlocked")
    check(service.get_cached_property("ItemCount").unpack() == 3, "the keyring counts its items")

    session.lock()
    check(
        service.call_sync(
            "org.freedesktop.DBus.Properties.Get",
            GLib.Variant("(ss)", ("com.lantharos.Keyring1", "Locked")),
            Gio.DBusCallFlags.NONE,
            -1,
            None,
        ).unpack()[0]
        is True,
        "locking takes effect",
    )
    session.script(passwords=["nope", LOGIN], access="allow")
    check(
        lookup(environment, "service", "github.com", "user", "mara") == "gh-token",
        "a locked keyring asks for the password and answers",
    )
    unlock = session.requests("password")[-1]["request"]
    check("didn't unlock" in unlock.get("warning", ""), "a wrong password keeps the prompt open with a warning")
    check(
        unlock.get("body") == "An app on this computer wants to use something you saved.",
        "the unlock prompt doesn't name a program it can't vouch for",
    )

    check(
        session.reader("app-secrets", "com.example.Ledger")
        == "stored:account-token|loaded:account-token|listed:account-token",
        "an app stores and reads back its own secret",
    )
    check(
        session.reader("app-load", "com.example.Other") == "missing",
        "an app's secrets are kept apart from another app's",
    )

    first, other, unsent, unidentified = session.reader("portal").split("|")
    check(len(bytes.fromhex(first)) == 64, "an app gets a secret through the portal")
    check(other != first and len(bytes.fromhex(other)) == 64, "each app ID the portal passes gets its own secret")
    check(session.reader("portal").split("|")[:2] == [first, other], "an app gets the same secret again")
    check(unsent == "AccessDenied", "only the desktop portal may ask for apps' secrets")
    check(unidentified == "AccessDenied", "a request from an app that can't be identified is refused")

    exercise_agent(session, check, LOGIN)
    exercise_management(session, check, LOGIN)
    exercise_flatpaks(session, check, LOGIN)
    exercise_sabine(session, check)


if __name__ == "__main__":
    main()
