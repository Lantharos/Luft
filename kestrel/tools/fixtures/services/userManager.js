import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const NAME = 'org.freedesktop.systemd1';
const PATH = '/org/freedesktop/systemd1';
const INTERFACE = `<node><interface name="org.freedesktop.systemd1.Manager">
  <method name="GetUnitFileState"><arg type="s" direction="in"/><arg type="s" direction="out"/></method>
  <method name="EnableUnitFiles">
    <arg type="as" direction="in"/><arg type="b" direction="in"/><arg type="b" direction="in"/>
    <arg type="b" direction="out"/><arg type="a(sss)" direction="out"/>
  </method>
  <method name="DisableUnitFiles">
    <arg type="as" direction="in"/><arg type="b" direction="in"/><arg type="a(sss)" direction="out"/>
  </method>
  <method name="Reload"/>
</interface></node>`;

export class ScratchUserManager {
  constructor() {
    this.enabled = new Set();
    this._connection = Gio.DBusConnection.new_for_address_sync(Gio.dbus_address_get_for_bus_sync(Gio.BusType.SESSION, null),
      Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
    this._exported = Gio.DBusExportedObject.wrapJSObject(INTERFACE, {
      GetUnitFileState: unit => (this.enabled.has(unit) ? 'enabled' : 'disabled'),
      EnableUnitFiles: units => {
        units.forEach(unit => this.enabled.add(unit));
        return [true, []];
      },
      DisableUnitFiles: units => {
        units.forEach(unit => this.enabled.delete(unit));
        return [];
      },
      Reload: () => {},
    });
    this._exported.export(this._connection, PATH);
  }

  async own() {
    const reply = await this._connection.call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'RequestName',
      new GLib.Variant('(su)', [NAME, 4]), new GLib.VariantType('(u)'), Gio.DBusCallFlags.NONE, -1, null);
    return reply.deepUnpack()[0] === 1;
  }

  close() {
    this._exported.unexport();
    this._connection.close_sync(null);
  }
}
