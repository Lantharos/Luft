import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export interface CallOptions {
  connection?: Gio.DBusConnection;
  timeout?: number;
}

export async function call<S extends string = string>(name: string | null, path: string, iface: string, method: string,
  parameters: GLib.Variant | null = null, replyType: S | null = null,
  {connection = Gio.DBus.session, timeout = -1}: CallOptions = {}): Promise<GLib.Variant<S>> {
  return connection.call(name, path, iface, method, parameters, replyType ? new GLib.VariantType(replyType) : null, Gio.DBusCallFlags.NONE, timeout, null);
}

export async function property<T>(name: string, path: string, iface: string, key: string, connection = Gio.DBus.session): Promise<T> {
  const reply = await call(name, path, 'org.freedesktop.DBus.Properties', 'Get', new GLib.Variant('(ss)', [iface, key]), '(v)', {connection});
  return reply.recursiveUnpack<[T]>()[0];
}

export interface Subscription {
  sender?: string | null;
  iface?: string | null;
  member?: string | null;
  path?: string | null;
  connection?: Gio.DBusConnection;
}

export function subscribe<T = unknown>({sender = null, iface = null, member = null, path = null, connection = Gio.DBus.session}: Subscription,
  callback: (signal: string, parameters: T) => void): () => void {
  const id = connection.signal_subscribe(sender, iface, member, path, null, Gio.DBusSignalFlags.NONE,
    (_connection, _sender, _path, _iface, signal, parameters) => callback(signal, parameters.recursiveUnpack<T>()));
  return () => connection.signal_unsubscribe(id);
}

export function privateConnection(): Gio.DBusConnection {
  const address = Gio.dbus_address_get_for_bus_sync(Gio.BusType.SESSION, null);
  return Gio.DBusConnection.new_for_address_sync(address,
    Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
}

export async function ownName(connection: Gio.DBusConnection, name: string): Promise<boolean> {
  const DO_NOT_QUEUE = 4;
  const PRIMARY_OWNER = 1;
  const reply = await call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'RequestName',
    new GLib.Variant('(su)', [name, DO_NOT_QUEUE]), '(u)', {connection});
  return reply.deepUnpack()[0] === PRIMARY_OWNER;
}
