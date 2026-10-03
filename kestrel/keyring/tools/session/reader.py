import os
import sys

import gi

gi.require_version("Gio", "2.0")
gi.require_version("GioUnix", "2.0")
from gi.repository import Gio, GLib

SECRETS = "org.freedesktop.secrets"
ROOT = "/org/freedesktop/secrets"
KEYRING = "com.lantharos.Keyring1"

bus = Gio.bus_get_sync(Gio.BusType.SESSION)


def call(name, path, interface, method, signature, arguments, reply=None, fds=None):
    parameters = GLib.Variant(signature, arguments) if signature else None
    if fds is None:
        return bus.call_sync(name, path, interface, method, parameters, GLib.VariantType(reply) if reply else None,
                             Gio.DBusCallFlags.NONE, 120000, None).unpack()
    result, _ = bus.call_with_unix_fd_list_sync(name, path, interface, method, parameters, GLib.VariantType(reply) if reply else None,
                                                Gio.DBusCallFlags.NONE, 120000, fds, None)
    return result.unpack()


def attributes():
    pairs = sys.argv[2:]
    return dict(zip(pairs[::2], pairs[1::2]))


def complete(prompt):
    if prompt == "/":
        return
    loop = GLib.MainLoop()
    bus.signal_subscribe(SECRETS, "org.freedesktop.Secret.Prompt", "Completed", prompt, None, Gio.DBusSignalFlags.NONE,
                         lambda *_: loop.quit())
    call(SECRETS, prompt, "org.freedesktop.Secret.Prompt", "Prompt", "(s)", ("",))
    loop.run()


def read():
    _, session = call(SECRETS, ROOT, "org.freedesktop.Secret.Service", "OpenSession", "(sv)", ("plain", GLib.Variant("s", "")))
    unlocked, locked = call(SECRETS, ROOT, "org.freedesktop.Secret.Service", "SearchItems", "(a{ss})", (attributes(),))
    if locked:
        _, prompt = call(SECRETS, ROOT, "org.freedesktop.Secret.Service", "Unlock", "(ao)", (locked,))
        complete(prompt)
    secrets = call(SECRETS, ROOT, "org.freedesktop.Secret.Service", "GetSecrets", "(aoo)", (unlocked + locked, session))[0]
    for _, (_, _, value, _) in secrets.items():
        sys.stdout.write(bytes(value).decode())
        return


def store():
    _, session = call(SECRETS, ROOT, "org.freedesktop.Secret.Service", "OpenSession", "(sv)", ("plain", GLib.Variant("s", "")))
    label, secret = sys.argv[2], sys.argv[3]
    pairs = sys.argv[4:]
    properties = {"org.freedesktop.Secret.Item.Label": GLib.Variant("s", label),
                  "org.freedesktop.Secret.Item.Attributes": GLib.Variant("a{ss}", dict(zip(pairs[::2], pairs[1::2])))}
    call(SECRETS, "/org/freedesktop/secrets/aliases/default", "org.freedesktop.Secret.Collection", "CreateItem", "(a{sv}(oayays)b)",
         (properties, (session, b"", secret.encode(), "text/plain"), True))


def pipe_with(data):
    reader, writer = os.pipe()
    os.write(writer, data)
    os.close(writer)
    fds = Gio.UnixFDList.new()
    fds.append(reader)
    os.close(reader)
    return fds


def load(name):
    reader, writer = os.pipe()
    fds = Gio.UnixFDList.new()
    fds.append(writer)
    os.close(writer)
    (found,) = call(KEYRING, "/com/lantharos/Keyring1", "com.lantharos.Keyring1.AppSecrets", "Load", "(sh)", (name, 0), "(b)", fds)
    del fds
    value = os.read(reader, 4096) if found else None
    os.close(reader)
    return value


def app_secrets():
    call(KEYRING, "/com/lantharos/Keyring1", "com.lantharos.Keyring1.AppSecrets", "Store", "(sh)", ("account-token", 0), None, pipe_with(b"s3cr3t"))
    value = load("account-token")
    (names,) = call(KEYRING, "/com/lantharos/Keyring1", "com.lantharos.Keyring1.AppSecrets", "List", None, None, "(as)")
    loaded = "account-token" if value == b"s3cr3t" else "wrong"
    sys.stdout.write(f"stored:account-token|loaded:{loaded}|listed:{','.join(names)}")


def portal_secret(connection):
    reader, writer = os.pipe()
    fds = Gio.UnixFDList.new()
    fds.append(writer)
    os.close(writer)
    parameters = GLib.Variant("(osha{sv})", ("/org/freedesktop/portal/desktop/request/1_1/t", "org.example.App", 0, {}))
    try:
        connection.call_with_unix_fd_list_sync(KEYRING, "/org/freedesktop/portal/desktop", "org.freedesktop.impl.portal.Secret",
                                               "RetrieveSecret", parameters, GLib.VariantType("(ua{sv})"), Gio.DBusCallFlags.NONE, 120000, fds, None)
    except GLib.Error as error:
        os.close(reader)
        return Gio.DBusError.get_remote_error(error).rsplit(".", 1)[-1]
    del fds
    value = os.read(reader, 4096)
    os.close(reader)
    return value.hex()


def portal():
    call("org.freedesktop.DBus", "/org/freedesktop/DBus", "org.freedesktop.DBus", "RequestName", "(su)", ("org.freedesktop.portal.Desktop", 4))
    first = portal_secret(bus)
    second = portal_secret(bus)
    stranger = Gio.DBusConnection.new_for_address_sync(Gio.dbus_address_get_for_bus_sync(Gio.BusType.SESSION, None),
                                                       Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, None, None)
    sys.stdout.write(f"{first}|{second}|{portal_secret(stranger)}")


action = sys.argv[1]
if action == "read":
    read()
elif action == "store":
    store()
elif action == "lock":
    call(SECRETS, ROOT, "org.freedesktop.Secret.Service", "Lock", "(ao)", ([],))
elif action == "app-secrets":
    app_secrets()
elif action == "app-load":
    sys.stdout.write("missing" if load("account-token") is None else "found")
elif action == "portal":
    portal()
