import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

Gio._promisify(Gio.DBusConnection.prototype, 'call_with_unix_fd_list');

export const KEYBOARD = 1;
export const POINTER = 2;
export const TOUCHSCREEN = 4;
export const ALL_DEVICES = KEYBOARD | POINTER | TOUCHSCREEN;

export interface MutterObject {
  readonly name: string;
  readonly path: string;
  readonly iface: string;
}

export type SignalHandlers = Record<string, (parameters: GLib.Variant) => void>;

export function mutterObject(name: string, path: string, iface: string): MutterObject {
  return { name, path, iface };
}

export function mutterCall({ name, path, iface }: MutterObject, method: string, parameters: GLib.Variant | null = null, replyType = '()'): Promise<GLib.Variant> {
  return Gio.DBus.session.call(name, path, iface, method, parameters, new GLib.VariantType(replyType), Gio.DBusCallFlags.NONE, -1, null);
}

export function mutterCallWithFd({ name, path, iface }: MutterObject, method: string, parameters: GLib.Variant | null = null): Promise<[GLib.Variant, Gio.UnixFDList | null]> {
  return Gio.DBus.session.call_with_unix_fd_list(name, path, iface, method, parameters, new GLib.VariantType('(h)'), Gio.DBusCallFlags.NONE, -1, null, null);
}

export async function mutterProperty<T>({ name, path, iface }: MutterObject, property: string): Promise<T> {
  const reply = await mutterCall({ name, path, iface: 'org.freedesktop.DBus.Properties' }, 'Get', new GLib.Variant('(ss)', [iface, property]), '(v)');
  const [value] = reply.recursiveUnpack() as [T];
  return value;
}

export function mutterSignals({ name, path, iface }: MutterObject, handlers: SignalHandlers): () => void {
  const id = Gio.DBus.session.signal_subscribe(name, iface, null, path, null, Gio.DBusSignalFlags.NONE,
    (_connection, _sender, _path, _iface, signal, parameters) => handlers[signal]?.(parameters));
  return () => Gio.DBus.session.signal_unsubscribe(id);
}

export function forwardFd(invocation: Gio.DBusMethodInvocation, [reply, fds]: [GLib.Variant, Gio.UnixFDList | null]): void {
  invocation.return_value_with_unix_fd_list(reply, fds);
}

export function failed(invocation: Gio.DBusMethodInvocation, error: { message: string }): void {
  invocation.return_dbus_error('org.freedesktop.portal.Error.Failed', error.message);
}
