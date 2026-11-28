#!/usr/bin/python3
"""Runs in each session the check signs in to, and reports what it found."""
import json
import os
import time

import gi

gi.require_version("Gio", "2.0")
from gi.repository import Gio, GLib

HOME = os.path.expanduser("~")
KEY_PIN = "123456"
CARD_PIN = "12345678"
os.environ.setdefault("DBUS_SESSION_BUS_ADDRESS", f"unix:path=/run/user/{os.getuid()}/bus")
with open("/var/lib/sign-in-check/scenario.json") as file:
    scenario = json.load(file)["name"]
results = []


def check(passed, label):
    results.append((label, bool(passed)))


def sign_in_service(method, signature=None, arguments=()):
    bus = Gio.bus_get_sync(Gio.BusType.SYSTEM)
    reply = bus.call_sync("com.lantharos.SignIn1", "/com/lantharos/SignIn1", "com.lantharos.SignIn1", method,
                          GLib.Variant(signature, arguments) if signature else None, None, Gio.DBusCallFlags.NONE, 120000, None)
    return reply.unpack()


def keyring_locked():
    bus = Gio.bus_get_sync(Gio.BusType.SESSION)
    try:
        reply = bus.call_sync("com.lantharos.Keyring1", "/com/lantharos/Keyring1", "org.freedesktop.DBus.Properties", "Get",
                              GLib.Variant("(ss)", ("com.lantharos.Keyring1", "Locked")), None, Gio.DBusCallFlags.NONE, 5000, None)
        return reply.unpack()[0]
    except GLib.Error:
        return None


def unlocked_within(seconds):
    for _ in range(seconds * 4):
        if keyring_locked() is False:
            return True
        time.sleep(0.25)
    return False


def lock_signal_after(remove):
    bus = Gio.bus_get_sync(Gio.BusType.SYSTEM)
    session = os.environ.get("XDG_SESSION_ID", "")
    path = bus.call_sync("org.freedesktop.login1", "/org/freedesktop/login1", "org.freedesktop.login1.Manager", "GetSession",
                         GLib.Variant("(s)", (session,)), None, Gio.DBusCallFlags.NONE, 5000, None).unpack()[0]
    locked = []
    bus.signal_subscribe("org.freedesktop.login1", "org.freedesktop.login1.Session", "Lock", path, None,
                         Gio.DBusSignalFlags.NONE, lambda *_: locked.append(True))
    remove()
    context = GLib.MainContext.default()
    deadline = time.monotonic() + 20
    while not locked and time.monotonic() < deadline:
        context.iteration(False)
        time.sleep(0.05)
    return bool(locked)


def card_inserted():
    for _ in range(60):
        if sign_in_service("FindSmartCard")[0]:
            return True
        time.sleep(0.5)
    return False


def enroll():
    check(unlocked_within(30), "signing in with the password unlocks the keyring")
    key = sign_in_service("AddSecurityKey", "(s)", (KEY_PIN,))[0]
    check(bool(key), "a security key without a PIN is enrolled, with that PIN")
    check(card_inserted(), "the card in the emulated reader is found")
    card = sign_in_service("AddSmartCard", "(s)", (CARD_PIN,))[0]
    check(bool(card), "the emulated smart card is enrolled with its PIN")
    keys, cards, password, can_turn_off = sign_in_service("Methods")
    check(len(keys) == 1 and len(cards) == 1 and password and can_turn_off, "Settings would list both, with the password still on")
    sign_in_service("SetPasswordSignIn", "(b)", (False,))
    check(sign_in_service("Methods")[2] is False, "the password can be turned off")
    check(sign_in_service("Ways", "(u)", (os.getuid(),))[0] == ["security-key", "smart-card"], "the login screen learns the ways, best first, without the password")


def main():
    if scenario == "enrolling":
        enroll()
    elif scenario in ("security key", "smart card"):
        check(unlocked_within(30), "the keyring unlocks with what signed in, without a password")
        if scenario == "smart card":
            check(lock_signal_after(lambda: open(os.path.join(HOME, "remove-card"), "w").close()),
                  "taking the card out locks the session")
    else:
        check(True, "the session started")
    with open(os.path.join(HOME, "result.json"), "w") as output:
        json.dump(results, output)


try:
    main()
except Exception as error:  # noqa: BLE001
    results.append((f"the probe stopped: {error}", False))
    with open(os.path.join(HOME, "result.json"), "w") as output:
        json.dump(results, output)
