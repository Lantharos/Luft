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
        return bus.call_sync(
            name,
            path,
            interface,
            method,
            parameters,
            GLib.VariantType(reply) if reply else None,
            Gio.DBusCallFlags.NONE,
            120000,
            None,
        ).unpack()
    result, _ = bus.call_with_unix_fd_list_sync(
        name,
        path,
        interface,
        method,
        parameters,
        GLib.VariantType(reply) if reply else None,
        Gio.DBusCallFlags.NONE,
        120000,
        fds,
        None,
    )
    return result.unpack()


def attributes():
    pairs = sys.argv[2:]
    return dict(zip(pairs[::2], pairs[1::2]))


def complete(prompt):
    if prompt == "/":
        return
    loop = GLib.MainLoop()
    bus.signal_subscribe(
        SECRETS,
        "org.freedesktop.Secret.Prompt",
        "Completed",
        prompt,
        None,
        Gio.DBusSignalFlags.NONE,
        lambda *_: loop.quit(),
    )
    call(SECRETS, prompt, "org.freedesktop.Secret.Prompt", "Prompt", "(s)", ("",))
    loop.run()


def read():
    _, session = call(
        SECRETS, ROOT, "org.freedesktop.Secret.Service", "OpenSession", "(sv)", ("plain", GLib.Variant("s", ""))
    )
    unlocked, locked = call(SECRETS, ROOT, "org.freedesktop.Secret.Service", "SearchItems", "(a{ss})", (attributes(),))
    if locked:
        _, prompt = call(SECRETS, ROOT, "org.freedesktop.Secret.Service", "Unlock", "(ao)", (locked,))
        complete(prompt)
    secrets = call(
        SECRETS, ROOT, "org.freedesktop.Secret.Service", "GetSecrets", "(aoo)", (unlocked + locked, session)
    )[0]
    for _, _, value, _ in secrets.values():
        sys.stdout.write(bytes(value).decode())
        return


def store():
    _, session = call(
        SECRETS, ROOT, "org.freedesktop.Secret.Service", "OpenSession", "(sv)", ("plain", GLib.Variant("s", ""))
    )
    label, secret = sys.argv[2], sys.argv[3]
    pairs = sys.argv[4:]
    properties = {
        "org.freedesktop.Secret.Item.Label": GLib.Variant("s", label),
        "org.freedesktop.Secret.Item.Attributes": GLib.Variant("a{ss}", dict(zip(pairs[::2], pairs[1::2]))),
    }
    call(
        SECRETS,
        "/org/freedesktop/secrets/aliases/default",
        "org.freedesktop.Secret.Collection",
        "CreateItem",
        "(a{sv}(oayays)b)",
        (properties, (session, b"", secret.encode(), "text/plain"), True),
    )


def safe_storage():
    _, session = call(
        SECRETS, ROOT, "org.freedesktop.Secret.Service", "OpenSession", "(sv)", ("plain", GLib.Variant("s", ""))
    )
    default = "/org/freedesktop/secrets/aliases/default"
    (found,) = call(
        SECRETS, default, "org.freedesktop.Secret.Collection", "SearchItems", "(a{ss})", ({"application": "chromium"},)
    )
    if not found:
        key = os.urandom(16).hex()
        properties = {
            "org.freedesktop.Secret.Item.Label": GLib.Variant("s", "Chromium Safe Storage"),
            "org.freedesktop.Secret.Item.Attributes": GLib.Variant(
                "a{ss}", {"application": "chromium", "xdg:schema": "chrome_libsecret_os_crypt_password_v2"}
            ),
        }
        call(
            SECRETS,
            default,
            "org.freedesktop.Secret.Collection",
            "CreateItem",
            "(a{sv}(oayays)b)",
            (properties, (session, b"", key.encode(), "text/plain"), False),
        )
        sys.stdout.write(key)
        return
    _, prompt = call(SECRETS, ROOT, "org.freedesktop.Secret.Service", "Unlock", "(ao)", ([found[0]],))
    complete(prompt)
    secrets = call(SECRETS, ROOT, "org.freedesktop.Secret.Service", "GetSecrets", "(aoo)", ([found[0]], session))[0]
    sys.stdout.write("".join(bytes(value).decode() for _, (_, _, value, _) in secrets.items()))


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
    (found,) = call(
        KEYRING, "/com/lantharos/Keyring1", "com.lantharos.Keyring1.AppSecrets", "Load", "(sh)", (name, 0), "(b)", fds
    )
    del fds
    value = os.read(reader, 4096) if found else None
    os.close(reader)
    return value


def app_secrets():
    call(
        KEYRING,
        "/com/lantharos/Keyring1",
        "com.lantharos.Keyring1.AppSecrets",
        "Store",
        "(sh)",
        ("account-token", 0),
        None,
        pipe_with(b"s3cr3t"),
    )
    value = load("account-token")
    (names,) = call(KEYRING, "/com/lantharos/Keyring1", "com.lantharos.Keyring1.AppSecrets", "List", None, None, "(as)")
    loaded = "account-token" if value == b"s3cr3t" else "wrong"
    sys.stdout.write(f"stored:account-token|loaded:{loaded}|listed:{','.join(names)}")


def portal_secret(connection, requester, app_id=""):
    reader, writer = os.pipe()
    fds = Gio.UnixFDList.new()
    fds.append(writer)
    os.close(writer)
    handle = f"/org/freedesktop/portal/desktop/request/{requester[1:].replace('.', '_')}/t"
    parameters = GLib.Variant("(osha{sv})", (handle, app_id, 0, {}))
    try:
        connection.call_with_unix_fd_list_sync(
            KEYRING,
            "/org/freedesktop/portal/desktop",
            "org.freedesktop.impl.portal.Secret",
            "RetrieveSecret",
            parameters,
            GLib.VariantType("(ua{sv})"),
            Gio.DBusCallFlags.NONE,
            120000,
            fds,
            None,
        )
    except GLib.Error as error:
        os.close(reader)
        return Gio.DBusError.get_remote_error(error).rsplit(".", 1)[-1]
    del fds
    value = os.read(reader, 4096)
    os.close(reader)
    return value.hex()


def portal():
    portal = Gio.DBusConnection.new_for_address_sync(
        Gio.dbus_address_get_for_bus_sync(Gio.BusType.SESSION, None),
        Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION,
        None,
        None,
    )
    portal.call_sync(
        "org.freedesktop.DBus",
        "/org/freedesktop/DBus",
        "org.freedesktop.DBus",
        "RequestName",
        GLib.Variant("(su)", ("org.freedesktop.portal.Desktop", 4)),
        None,
        Gio.DBusCallFlags.NONE,
        -1,
        None,
    )
    app = bus.get_unique_name()
    answers = [
        portal_secret(portal, app),
        portal_secret(portal, app, "org.example.Sandboxed"),
        portal_secret(bus, app),
        portal_secret(portal, ":1.999999"),
    ]
    sys.stdout.write("|".join(answers))


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
elif action == "safe-storage":
    safe_storage()
