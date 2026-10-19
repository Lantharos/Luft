import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

type Exports = [object: Gio.DBusExportedObject, path: string][];

export function ownOnItsOwnConnection(name: string, exports: Exports, acquired: () => void): () => void {
  const cancellable = new Gio.Cancellable();
  let connection: Gio.DBusConnection | null = null;
  let nameId = 0;
  Gio.DBusConnection.new_for_address(Gio.dbus_address_get_for_bus_sync(Gio.BusType.SESSION, null),
    Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, cancellable, (_source, result) => {
      try {
        connection = Gio.DBusConnection.new_for_address_finish(result);
      } catch (error) {
        if (!(error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)))
          console.warn(`Couldn't connect to the session bus for ${name}: ${error}`);
        return;
      }
      for (const [object, path] of exports) object.export(connection, path);
      nameId = Gio.bus_own_name_on_connection(connection, name, Gio.BusNameOwnerFlags.NONE, acquired, null);
    });
  return () => {
    cancellable.cancel();
    if (nameId) Gio.bus_unown_name(nameId);
    for (const [object] of exports) object.unexport();
    connection?.close(null, null);
  };
}
