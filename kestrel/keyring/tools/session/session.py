import json
import os
import shutil
import subprocess
import sys
import tempfile
import time

import gi

from agent import exercise_agent
from ownership import exercise_ownership
from seal import seal_off_system_services

gi.require_version("Gio", "2.0")
from gi.repository import Gio, GLib

HERE = os.path.dirname(os.path.abspath(__file__))
DAEMON = sys.argv[1]
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
    environment = dict(os.environ, HOME=home, XDG_DATA_HOME=os.path.join(home, ".local/share"), XDG_RUNTIME_DIR=os.path.join(home, "run"))
    return home, environment


def wait_for_name(name):
    bus = Gio.bus_get_sync(Gio.BusType.SESSION)
    for _ in range(100):
        owner = bus.call_sync("org.freedesktop.DBus", "/org/freedesktop/DBus", "org.freedesktop.DBus", "NameHasOwner",
                              GLib.Variant("(s)", (name,)), None, Gio.DBusCallFlags.NONE, -1, None).unpack()[0]
        if owner:
            return
        time.sleep(0.1)
    raise SystemExit(f"{name} never appeared")


def lookup(environment, *attributes):
    result = subprocess.run(["secret-tool", "lookup", *attributes], env=environment, capture_output=True, timeout=60)
    return result.stdout.decode()


def main():
    seal_off_system_services()
    root = tempfile.mkdtemp(prefix="luft-keyring-")
    try:
        run(root)
    finally:
        shutil.rmtree(root, ignore_errors=True)
    print(f"Luft Keyring: {checks} checks passed")


def run(root):
    fixtures = os.path.join(HERE, "fixtures")
    gnome = os.path.join(fixtures, "gnome-keyring.keyring")
    with open(gnome, "rb") as fixture:
        check(fixture.read(18) == b"GnomeKeyring\n\r\0\n\0\0", "the gnome-keyring fixture is its old binary keyring")

    home, environment = scratch_home(root, "person")
    keyrings = os.path.join(home, ".local/share/keyrings")
    os.makedirs(os.path.join(keyrings, "v1"))
    shutil.copy(gnome, os.path.join(keyrings, "login.keyring"))
    shutil.copy(os.path.join(fixtures, "oo7-login.keyring"), os.path.join(keyrings, "v1/login.keyring"))
    shutil.copy(os.path.join(fixtures, "oo7-work.keyring"), os.path.join(keyrings, "v1/Work.keyring"))

    plan = os.path.join(root, "prompter.json")
    prompts = os.path.join(root, "prompts.log")
    def script(**settings):
        with open(plan, "w") as output:
            json.dump(settings, output)
    def requests(kind):
        if not os.path.exists(prompts):
            return []
        with open(prompts) as lines:
            return [entry for entry in map(json.loads, lines) if entry["kind"] == kind]

    script(passwords=[LOGIN], access="allow")
    prompter = subprocess.Popen([sys.executable, os.path.join(HERE, "prompter.py"), plan, prompts], env=environment)
    wait_for_name("com.lantharos.Kestrel")
    started = time.time()
    daemon = subprocess.Popen([DAEMON], env=environment)
    try:
        wait_for_name("org.freedesktop.secrets")
        exercise(root, home, environment, script, requests, started)
    finally:
        daemon.terminate()
        prompter.terminate()
        daemon.wait()
        prompter.wait()


def exercise(root, home, environment, script, requests, started):
    check(lookup(environment, "service", "github.com", "user", "kristof") == "gh-token", "a secret from gnome-keyring's file comes back after setup")
    check([entry["request"]["title"] for entry in requests("access")] == ["Allow secret-tool to use “GitHub”?"],
          "a keyring tool is asked before it uses an imported item")
    setup = requests("password")[0]["request"]
    check(setup.get("confirm") is True, "setting up without the sign-in service asks to confirm the password")
    check(lookup(environment, "service", "mail.example.org") == "mail-pass", "a secret from oo7's file comes back")
    check(lookup(environment, "network", "home") == "hunter2", "every item of the old keyring came along")
    found = subprocess.run(["secret-tool", "search", "--all", "network", "home"], env=environment, capture_output=True, timeout=60)
    check(b"secret = hunter2" in found.stdout and b"returned type" not in found.stderr, "an item hands its secret back in one piece, as Chromium-based apps read it")

    vault = open(os.path.join(home, ".local/share/luft-keyring/vault"), "rb").read()
    check(b"gh-token" not in vault and b"GitHub" not in vault, "secrets and labels are encrypted on disk")

    service = Gio.DBusProxy.new_for_bus_sync(Gio.BusType.SESSION, Gio.DBusProxyFlags.NONE, None,
                                             "com.lantharos.Keyring1", "/com/lantharos/Keyring1", "com.lantharos.Keyring1", None)
    check(service.get_cached_property("PendingImports").unpack() == ["Work"], "a keyring with another password waits to be brought in")
    check(service.get_cached_property("Locked").unpack() is False, "the keyring reports itself unlocked")
    check(service.get_cached_property("ItemCount").unpack() == 4, "the keyring counts its items")

    reader = [sys.executable, os.path.join(HERE, "reader.py")]

    def lock():
        subprocess.run([*reader, "lock"], env=environment, check=True, timeout=30)

    stranger = os.path.join(root, "stranger")
    shutil.copy(sys.executable, stranger)
    asked = len(requests("access"))
    claimed = subprocess.run([stranger, os.path.join(HERE, "reader.py"), "read", "service", "github.com"], env=environment,
                             capture_output=True, timeout=60)
    check(claimed.stdout.decode() == "gh-token" and len(requests("access")) == asked,
          "the first app to use an imported item takes it without being asked")

    def read_as_other_app(*attributes):
        result = subprocess.run([*reader, "read", *attributes], env=environment, capture_output=True, timeout=60)
        return result.stdout.decode()

    script(access="deny", remember=False)
    check(read_as_other_app("service", "github.com") == "", "another app is refused when the person says no")
    check(requests("access")[-1]["request"]["title"].startswith("Allow "), "another app's read asks the person first")
    script(access="allow", remember=True)
    check(read_as_other_app("service", "github.com") == "gh-token", "another app reads once the person allows it")
    asked = len(requests("access"))
    check(read_as_other_app("service", "github.com") == "gh-token", "an allowed app keeps reading")
    check(len(requests("access")) == asked, "a remembered choice doesn't ask again")

    created = subprocess.run([*reader, "created", "service", "github.com"], env=environment, capture_output=True, timeout=60)
    check(0 < int(created.stdout or 0) <= started, "imported items keep the time they were made")

    lock()
    check(service.call_sync("org.freedesktop.DBus.Properties.Get", GLib.Variant("(ss)", ("com.lantharos.Keyring1", "Locked")),
                            Gio.DBusCallFlags.NONE, -1, None).unpack()[0] is True, "locking takes effect")
    script(passwords=["nope", LOGIN], access="allow")
    check(lookup(environment, "service", "github.com", "user", "kristof") == "gh-token", "a locked keyring asks for the password and answers")
    retried = requests("password")[-1]["request"]
    check("didn't unlock" in retried.get("warning", ""), "a wrong password keeps the prompt open with a warning")

    sealed = subprocess.run([*reader, "app-secrets"], env=environment, capture_output=True, timeout=60)
    check(sealed.stdout.decode() == "stored:account-token|loaded:account-token|listed:account-token", "an app stores and reads back its own secret")
    other = subprocess.run([stranger, os.path.join(HERE, "reader.py"), "app-load"], env=environment, capture_output=True, timeout=60)
    check(other.stdout.decode() == "missing", "another app can't read an app's sealed secret")

    portal = subprocess.run([*reader, "portal"], env=environment, capture_output=True, timeout=60)
    first, second, denied = portal.stdout.decode().split("|")
    check(len(bytes.fromhex(first)) == 64 and first == second, "sandboxed apps get the same secret through the portal every time")
    check(denied == "AccessDenied", "only the desktop portal may ask for sandboxed apps' secrets")

    exercise_agent(root, environment, check, script, requests, lock, LOGIN)
    exercise_ownership(root, home, environment, check, script, requests, lock)

    script(passwords=["work pass"], access="allow")
    imported = subprocess.run([*reader, "import", "Work"], env=environment, capture_output=True, timeout=60)
    check(imported.stdout.decode() == "AccessDenied", "only Settings may bring in old keyrings")


if __name__ == "__main__":
    main()
