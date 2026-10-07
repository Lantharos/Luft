import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';

const NAME = 'com.lantharos.Keyring1';
const PATH = '/com/lantharos/Keyring1';
const INTERFACE = `<node><interface name="com.lantharos.Keyring1.AppSecrets">
  <method name="Store"><arg type="s" direction="in"/><arg type="h" direction="in"/></method>
  <method name="Load"><arg type="s" direction="in"/><arg type="h" direction="in"/><arg type="b" direction="out"/></method>
  <method name="Delete"><arg type="s" direction="in"/><arg type="b" direction="out"/></method>
  <method name="List"><arg type="as" direction="out"/></method>
</interface></node>`;

const descriptor = (invocation, index) => invocation.get_message().get_unix_fd_list().get(index);

export class ScratchAppSecrets {
  constructor(secrets) {
    this.secrets = new Map(Object.entries(secrets));
    this._connection = Gio.DBusConnection.new_for_address_sync(Gio.dbus_address_get_for_bus_sync(Gio.BusType.SESSION, null),
      Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
    this._exported = Gio.DBusExportedObject.wrapJSObject(INTERFACE, {
      StoreAsync: ([name, index], invocation) => {
        const input = new GioUnix.InputStream({fd: descriptor(invocation, index), close_fd: true});
        const bytes = input.read_bytes(1 << 20, null);
        input.close(null);
        this.secrets.set(name, new TextDecoder().decode(bytes.toArray()));
        invocation.return_value(null);
      },
      LoadAsync: ([name, index], invocation) => {
        const output = new GioUnix.OutputStream({fd: descriptor(invocation, index), close_fd: true});
        const secret = this.secrets.get(name);
        if (secret !== undefined) output.write_all(new TextEncoder().encode(secret), null);
        output.close(null);
        invocation.return_value(new GLib.Variant('(b)', [secret !== undefined]));
      },
      Delete: name => this.secrets.delete(name),
      List: () => [...this.secrets.keys()],
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
