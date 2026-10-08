import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export async function busCall(busName: string, objectPath: string, iface: string, method: string,
  parameters: GLib.Variant | null, cancellable: Gio.Cancellable | null, timeout = -1): Promise<GLib.Variant | null> {
  try {
    return await Gio.DBus.session.call(busName, objectPath, iface, method, parameters, null, Gio.DBusCallFlags.NONE, timeout, cancellable);
  } catch {
    return null;
  }
}
