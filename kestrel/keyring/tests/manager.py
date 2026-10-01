import sys

import gi

gi.require_version("Gio", "2.0")
from gi.repository import Gio, GLib

bus = Gio.bus_get_sync(Gio.BusType.SESSION)


def call(method, signature, arguments, reply):
    try:
        return bus.call_sync("com.lantharos.Keyring1", "/com/lantharos/Keyring1", "com.lantharos.Keyring1.Ssh", method,
                             GLib.Variant(signature, arguments), GLib.VariantType(reply), Gio.DBusCallFlags.NONE, 60000, None).unpack()
    except GLib.Error as error:
        return (Gio.DBusError.get_remote_error(error),)


action = sys.argv[1]
if action == "generate":
    sys.stdout.write(call("Generate", "(sb)", (sys.argv[2], False), "(s)")[0])
elif action == "public":
    sys.stdout.write(call("PublicKey", "(s)", (sys.argv[2],), "(s)")[0])
