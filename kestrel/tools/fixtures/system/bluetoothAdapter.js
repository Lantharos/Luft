import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const SERVICE = 'org.bluez';
const ADAPTER = '/org/bluez/hci0';
const OBJECT_MANAGER = `<node><interface name="org.freedesktop.DBus.ObjectManager">
  <method name="GetManagedObjects"><arg type="a{oa{sa{sv}}}" direction="out"/></method>
  <signal name="InterfacesAdded"><arg type="o"/><arg type="a{sa{sv}}"/></signal>
  <signal name="InterfacesRemoved"><arg type="o"/><arg type="as"/></signal>
</interface></node>`;

const adapterProperties = () => ({
  'org.bluez.Adapter1': {
    Address: new GLib.Variant('s', '00:1A:7D:DA:71:13'),
    Alias: new GLib.Variant('s', 'Check Adapter'),
    Powered: new GLib.Variant('b', false),
    Discoverable: new GLib.Variant('b', false),
    DiscoverableTimeout: new GLib.Variant('u', 180),
    Discovering: new GLib.Variant('b', false),
  },
});

export function plugInBluetoothAdapter() {
  const connection = Gio.DBusConnection.new_for_address_sync(GLib.getenv('KESTREL_SYSTEM_BUS'),
    Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
  const manager = Gio.DBusExportedObject.wrapJSObject(OBJECT_MANAGER, {
    GetManagedObjects: () => ({[ADAPTER]: adapterProperties()}),
  });
  manager.export(connection, '/');
  const owner = Gio.bus_own_name_on_connection(connection, SERVICE, Gio.BusNameOwnerFlags.NONE, null, null);
  return {
    unplug() {
      Gio.bus_unown_name(owner);
      manager.unexport();
      connection.close_sync(null);
    },
  };
}
