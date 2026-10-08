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
from portal import exercise_portal
from sabine import exercise_sabine
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
    environment = dict(
        os.environ,
        HOME=home,
        XDG_DATA_HOME=os.path.join(home, ".local/share"),
        XDG_RUNTIME_DIR=os.path.join(home, "run"),
    )
    return home, environment


def wait_for_name(name):
    bus = Gio.bus_get_sync(Gio.BusType.SESSION)
    for _ in range(100):
        owner = bus.call_sync(
            "org.freedesktop.DBus",
            "/org/freedesktop/DBus",
            "org.freedesktop.DBus",
            "NameHasOwner",
            GLib.Variant("(s)", (name,)),
            None,
            Gio.DBusCallFlags.NONE,
            -1,
            None,
        ).unpack()[0]
        if owner:
            return
        time.sleep(0.1)
    raise SystemExit(f"{name} never appeared")


def lookup(environment, *attributes):
    result = subprocess.run(
        ["secret-tool", "lookup", *attributes], env=environment, capture_output=True, timeout=60, check=False
    )
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
    home, environment = scratch_home(root, "person")

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
    daemon = subprocess.Popen([DAEMON], env=environment)
    try:
        wait_for_name("org.freedesktop.secrets")
        exercise(root, home, environment, script, requests)
    finally:
        daemon.terminate()
        prompter.terminate()
        daemon.wait()
        prompter.wait()


def store(environment, label, secret, *attributes):
    subprocess.run(
        ["secret-tool", "store", "--label", label, *attributes],
        input=secret.encode(),
        env=environment,
        check=True,
        timeout=60,
    )


def exercise(root, home, environment, script, requests):
    reader = [sys.executable, os.path.join(HERE, "reader.py")]
    stranger = os.path.join(root, "stranger")
    shutil.copy(sys.executable, stranger)

    store(environment, "Home network", "hunter2", "network", "home")
    setup = requests("password")[0]["request"]
    check(setup.get("confirm") is True, "setting up without the sign-in service asks to confirm the password")
    subprocess.run(
        [
            stranger,
            os.path.join(HERE, "reader.py"),
            "store",
            "GitHub",
            "gh-token",
            "service",
            "github.com",
            "user",
            "kristof",
        ],
        env=environment,
        check=True,
        timeout=60,
    )
    store(environment, "Mail", "mail-pass", "service", "mail.example.org")
    store(environment, "Parley", "parley-key", "application", "parley")
    store(environment, "Reader", "reader-key", "application", "reader")

    check(
        lookup(environment, "service", "github.com", "user", "kristof") == "gh-token",
        "a keyring tool reads another app's item once the person allows it",
    )
    check(
        [entry["request"]["title"] for entry in requests("access")] == ["Allow secret-tool to use “GitHub”?"],
        "a keyring tool is asked before it uses another app's item",
    )
    check(lookup(environment, "service", "mail.example.org") == "mail-pass", "a keyring tool reads back what it stored")
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

    with open(os.path.join(home, ".local/share/luft-keyring/vault"), "rb") as file:
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
    check(service.get_cached_property("ItemCount").unpack() == 5, "the keyring counts its items")

    def lock():
        subprocess.run([*reader, "lock"], env=environment, check=True, timeout=30)

    asked = len(requests("access"))
    owned = subprocess.run(
        [stranger, os.path.join(HERE, "reader.py"), "read", "service", "github.com"],
        env=environment,
        capture_output=True,
        timeout=60,
        check=False,
    )
    check(
        owned.stdout.decode() == "gh-token" and len(requests("access")) == asked,
        "the app that stored an item reads it without being asked",
    )

    def read_as_other_app(*attributes):
        result = subprocess.run(
            [*reader, "read", *attributes], env=environment, capture_output=True, timeout=60, check=False
        )
        return result.stdout.decode()

    script(access="deny", remember=False)
    check(read_as_other_app("service", "github.com") == "", "another app is refused when the person says no")
    check(requests("access")[-1]["request"]["title"].startswith("Allow "), "another app's read asks the person first")
    script(access="allow", remember=True)
    check(read_as_other_app("service", "github.com") == "gh-token", "another app reads once the person allows it")
    asked = len(requests("access"))
    check(read_as_other_app("service", "github.com") == "gh-token", "an allowed app keeps reading")
    check(len(requests("access")) == asked, "a remembered choice doesn't ask again")

    lock()
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
    script(passwords=["nope", LOGIN], access="allow")
    check(
        lookup(environment, "service", "github.com", "user", "kristof") == "gh-token",
        "a locked keyring asks for the password and answers",
    )
    retried = requests("password")[-1]["request"]
    check("didn't unlock" in retried.get("warning", ""), "a wrong password keeps the prompt open with a warning")

    sealed = subprocess.run([*reader, "app-secrets"], env=environment, capture_output=True, timeout=60, check=False)
    check(
        sealed.stdout.decode() == "stored:account-token|loaded:account-token|listed:account-token",
        "an app stores and reads back its own secret",
    )
    other = subprocess.run(
        [stranger, os.path.join(HERE, "reader.py"), "app-load"],
        env=environment,
        capture_output=True,
        timeout=60,
        check=False,
    )
    check(other.stdout.decode() == "missing", "another app can't read an app's sealed secret")

    exercise_portal(root, home, environment, check)
    exercise_agent(root, environment, check, script, requests, lock, LOGIN)
    exercise_ownership(root, home, environment, check, script, requests, lock)
    exercise_sabine(home, environment, check, script, requests)


if __name__ == "__main__":
    main()
