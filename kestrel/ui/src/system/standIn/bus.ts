import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

let bus: Gio.DBusConnection | null | undefined;

export function standInBus(): Gio.DBusConnection | null {
  if (bus === undefined) {
    const address = GLib.getenv('KESTREL_STAND_IN_BUS');
    bus = address ? Gio.DBusConnection.new_for_address_sync(address,
      Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null) : null;
  }
  return bus;
}
