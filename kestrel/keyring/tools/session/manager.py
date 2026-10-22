import sys

import gi

gi.require_version("Gio", "2.0")
from gi.repository import Gio, GLib

bus = Gio.bus_get_sync(Gio.BusType.SESSION)
KEYRING = "com.lantharos.Keyring1"


def call(interface, method, signature, arguments, reply):
    try:
        return bus.call_sync(
            KEYRING,
            "/com/lantharos/Keyring1",
            interface,
            method,
            GLib.Variant(signature, arguments) if signature else None,
            GLib.VariantType(reply) if reply else None,
            Gio.DBusCallFlags.NONE,
            60000,
            None,
        ).unpack()
    except GLib.Error as error:
        return (Gio.DBusError.get_remote_error(error),)


def history():
    answer = call(f"{KEYRING}.Access", "History", "(u)", (50,), None)
    return "ok" if answer and isinstance(answer[0], list) else answer[0]


def ssh(method, signature, arguments, reply):
    return call(f"{KEYRING}.Ssh", method, signature, arguments, reply)[0]


action = sys.argv[1]
if action == "history":
    sys.stdout.write(history())
elif action == "history-twice":
    sys.stdout.write(f"{history()}|{history()}")
elif action == "generate":
    sys.stdout.write(ssh("Generate", "(sb)", (sys.argv[2], False), "(s)"))
elif action == "public":
    sys.stdout.write(ssh("PublicKey", "(s)", (sys.argv[2],), "(s)"))
elif action == "keys":
    keys = ssh("Keys", None, None, None)
    sys.stdout.write(",".join(key[1] for key in keys) if isinstance(keys, list) else keys)
elif action == "remove":
    answer = call(f"{KEYRING}.Ssh", "Remove", "(s)", (sys.argv[2],), None)
    sys.stdout.write(answer[0] if answer else "ok")
