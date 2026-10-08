import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export async function call(name, path, iface, method, parameters = null, replyType = null, {connection = Gio.DBus.session, timeout = -1} = {}) {
  return connection.call(name, path, iface, method, parameters, replyType && new GLib.VariantType(replyType), Gio.DBusCallFlags.NONE, timeout, null);
}

export async function property(name, path, iface, key, connection = Gio.DBus.session) {
  const reply = await call(name, path, 'org.freedesktop.DBus.Properties', 'Get', new GLib.Variant('(ss)', [iface, key]), '(v)', {connection});
  return reply.recursiveUnpack()[0];
}

export function subscribe({sender = null, iface = null, member = null, path = null, connection = Gio.DBus.session}, callback) {
  const id = connection.signal_subscribe(sender, iface, member, path, null, Gio.DBusSignalFlags.NONE,
    (_connection, _sender, _path, _iface, signal, parameters) => callback(signal, parameters.recursiveUnpack()));
  return () => connection.signal_unsubscribe(id);
}

export function privateConnection() {
  const address = Gio.dbus_address_get_for_bus_sync(Gio.BusType.SESSION, null);
  return Gio.DBusConnection.new_for_address_sync(address,
    Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
}

export async function ownName(connection, name) {
  const DO_NOT_QUEUE = 4;
  const PRIMARY_OWNER = 1;
  const reply = await call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'RequestName',
    new GLib.Variant('(su)', [name, DO_NOT_QUEUE]), '(u)', {connection});
  return reply.deepUnpack()[0] === PRIMARY_OWNER;
}
