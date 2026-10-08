#!/usr/bin/python3
import json
import os
import pwd
import shutil
import subprocess
import sys
import time

import gi

gi.require_version("Gio", "2.0")
from authenticate import authenticate
from gi.repository import Gio, GLib

HERE = os.path.dirname(os.path.abspath(__file__))
HOME = os.path.expanduser("~")
USER = pwd.getpwuid(os.getuid()).pw_name
PASSWORD = "sign-in words"
SECRET = "repo-token"
os.environ.setdefault("DBUS_SESSION_BUS_ADDRESS", f"unix:path=/run/user/{os.getuid()}/bus")
with open("/var/lib/keyring-test/scenario.json") as file:
    scenario = json.load(file)["name"]
results = []
plan = os.path.join(HOME, "prompter.json")
prompts = os.path.join(HOME, "prompts.log")


def check(passed, label):
    results.append((label, bool(passed)))


def script(passwords):
    with open(plan, "w") as output:
        json.dump({"passwords": passwords, "access": "allow"}, output)


def requests():
    if not os.path.exists(prompts):
        return []
    return [json.loads(line) for line in open(prompts)]


def finger(state):
    with open("/run/keyring-test/finger", "w") as control:
        control.write(state)


def keyring(name):
    bus = Gio.bus_get_sync(Gio.BusType.SESSION)
    try:
        reply = bus.call_sync(
            "com.lantharos.Keyring1",
            "/com/lantharos/Keyring1",
            "org.freedesktop.DBus.Properties",
            "Get",
            GLib.Variant("(ss)", ("com.lantharos.Keyring1", name)),
            None,
            Gio.DBusCallFlags.NONE,
            5000,
            None,
        )
        return reply.unpack()[0]
    except GLib.Error:
        return None


def wait_for(name, wanted, seconds=30):
    for _ in range(seconds * 4):
        if keyring(name) == wanted:
            return True
        time.sleep(0.25)
    return False


def lock():
    Gio.bus_get_sync(Gio.BusType.SESSION).call_sync(
        "com.lantharos.Keyring1",
        "/com/lantharos/Keyring1",
        "com.lantharos.Keyring1",
        "Lock",
        None,
        None,
        Gio.DBusCallFlags.NONE,
        5000,
        None,
    )
    return wait_for("Locked", True, 5)


def secret_tool(*arguments, secret=None):
    return subprocess.run(
        ["secret-tool", *arguments], input=secret, capture_output=True, text=True, timeout=60, check=False
    )


def sudo(password):
    return (
        subprocess.run(
            ["sudo", "-k", "-S", "true"], input=password, capture_output=True, text=True, timeout=120, check=False
        ).returncode
        == 0
    )


def as_settings(method, signature, arguments):
    folder = os.path.join(HOME, "luft/apps/settings/desktop/target/debug")
    os.makedirs(folder, exist_ok=True)
    settings = os.path.join(folder, "settings")
    shutil.copy(sys.executable, settings)
    code = (
        f"import gi; gi.require_version('Gio','2.0'); from gi.repository import Gio, GLib; "
        f"print(Gio.bus_get_sync(Gio.BusType.SESSION).call_sync('com.lantharos.Keyring1', '/com/lantharos/Keyring1', "
        f"'com.lantharos.Keyring1', '{method}', GLib.Variant('{signature}', {arguments!r}), None, Gio.DBusCallFlags.NONE, 60000, None).unpack())"
    )
    return subprocess.run(
        [settings, "-c", code], capture_output=True, text=True, timeout=90, check=False
    ).stdout.strip()


def lock_screen_flows(chip):
    check(lock(), "the keyring locks")
    check(
        authenticate(USER, "password", PASSWORD) == "success" and wait_for("Locked", False),
        "unlocking the screen with the password unlocks it",
    )
    lock()
    check(
        authenticate(USER, "password", "wrong") == "auth_error" and keyring("Locked") is True,
        "a wrong password keeps it locked",
    )
    finger("match")
    lock()
    script([PASSWORD])
    check(authenticate(USER, "fingerprint") == "success", "the lock screen accepts a fingerprint")
    check(wait_for("Locked", False), "unlocking the screen with a fingerprint unlocks it")
    asked = [entry for entry in requests() if entry["kind"] == "password"]
    check(bool(asked) != chip, "a fingerprint needs the password once only without a chip")


def sudo_flows():
    finger("match")
    check(sudo(""), "sudo accepts a fingerprint")
    finger("none")
    check(sudo(PASSWORD + "\n"), "sudo still accepts the password")
    check(not sudo("wrong\n"), "sudo refuses a wrong password")


def main():
    open(prompts, "w").close()
    script([])
    prompter = subprocess.Popen([sys.executable, os.path.join(HERE, "prompter.py"), plan, prompts])
    subprocess.run(["gdbus", "wait", "--session", "--timeout", "20", "com.lantharos.Kestrel"], check=False)
    if scenario == "startup changed":
        script([PASSWORD])
    elif scenario == "fingerprint with a PIN":
        script(["0000", "2468"])
    elif scenario == "fingerprint without a chip":
        script([PASSWORD])
    subprocess.run(["systemctl", "--user", "start", "luft-keyring.socket", "luft-keyring.service"], check=False)
    unlocked = wait_for("Locked", False)
    check(unlocked, "the keyring is unlocked")
    asked = [entry["request"] for entry in requests() if entry["kind"] == "password"]

    if scenario == "first sign-in":
        check(wait_for("TpmSealed", True), "the keyring is sealed by the security chip")
        check(keyring("Chip") == "ready", "the security chip is ready")
        check(not asked, "signing in with the password asked nothing more")
        check(
            secret_tool("store", "--label", "Repository", "service", "repo", secret=SECRET).returncode == 0,
            "a secret is saved",
        )
        lock_screen_flows(chip=True)
        sudo_flows()
    elif scenario in ("fingerprint sign-in", "fingerprint after resealing"):
        check(not asked, "the fingerprint alone unlocked it")
        check(secret_tool("lookup", "service", "repo").stdout == SECRET, "the saved secret is there")
        check(keyring("FingerprintUnlock") is True, "the keyring says a fingerprint unlocks it")
    elif scenario == "startup changed":
        check(
            any("startup settings changed" in request.get("body", "") for request in asked),
            "the password is asked once, explaining why",
        )
        check(wait_for("TpmSealed", True), "the keyring is sealed again for the new startup state")
    elif scenario == "choosing a PIN":
        script(["2468"])
        check(as_settings("SetPin", "(b)", (True,)) == "(True,)", "Settings sets a PIN through Kestrel's prompt")
        check(wait_for("Pin", True), "the keyring needs the PIN after a fingerprint")
    elif scenario == "fingerprint with a PIN":
        pins = [request for request in asked if request.get("label") == "PIN"]
        check(
            len(pins) >= 2 and "PIN isn" in pins[-1].get("warning", ""),
            "a wrong PIN is refused and the right one unlocks",
        )
    elif scenario == "chip gone":
        check(
            keyring("Chip") == "missing" and keyring("TpmSealed") is False,
            "the keyring knows the security chip is gone",
        )
        check(secret_tool("lookup", "service", "repo").stdout == SECRET, "the password still opens everything")
    elif scenario == "first sign-in without a chip":
        check(
            keyring("Chip") == "missing" and keyring("TpmSealed") is False,
            "without a chip the password alone protects it",
        )
        check(
            secret_tool("store", "--label", "Repository", "service", "repo", secret=SECRET).returncode == 0,
            "a secret is saved",
        )
        lock_screen_flows(chip=False)
        sudo_flows()
    elif scenario == "fingerprint without a chip":
        check(
            any("fingerprint can't unlock" in request.get("body", "") for request in asked),
            "the password is asked once, explaining why",
        )
        check(secret_tool("lookup", "service", "repo").stdout == SECRET, "the saved secret is there after the password")

    subprocess.run(["systemctl", "--user", "stop", "luft-keyring.service", "luft-keyring.socket"], check=False)
    prompter.terminate()
    if os.path.exists(prompts):
        shutil.copy(prompts, os.path.join(HOME, f"prompts-{scenario.replace(' ', '-')}.log"))
    with open(os.path.join(HOME, "result.json.partial"), "w") as output:
        json.dump(results, output)
    os.rename(os.path.join(HOME, "result.json.partial"), os.path.join(HOME, "result.json"))


main()
