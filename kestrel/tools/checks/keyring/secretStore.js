import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const ROOT = '/org/freedesktop/secrets';
const SESSION = `${ROOT}/session/check`;
const NO_PROMPT = '/';
const SERVICE_XML = `<node><interface name="org.freedesktop.Secret.Service">
  <method name="OpenSession"><arg type="s" direction="in"/><arg type="v" direction="in"/><arg type="v" direction="out"/><arg type="o" direction="out"/></method>
  <method name="SearchItems"><arg type="a{ss}" direction="in"/><arg type="ao" direction="out"/><arg type="ao" direction="out"/></method>
  <method name="Unlock"><arg type="ao" direction="in"/><arg type="ao" direction="out"/><arg type="o" direction="out"/></method>
</interface></node>`;
const COLLECTION_XML = `<node><interface name="org.freedesktop.Secret.Collection">
  <method name="CreateItem"><arg type="a{sv}" direction="in"/><arg type="(oayays)" direction="in"/><arg type="b" direction="in"/><arg type="o" direction="out"/><arg type="o" direction="out"/></method>
</interface></node>`;
const ITEM_XML = `<node><interface name="org.freedesktop.Secret.Item">
  <method name="GetSecret"><arg type="o" direction="in"/><arg type="(oayays)" direction="out"/></method>
  <method name="Delete"><arg type="o" direction="out"/></method>
</interface></node>`;
const DO_NOT_QUEUE = 4;

export class SecretStore {
  constructor() {
    const address = Gio.dbus_address_get_for_bus_sync(Gio.BusType.SESSION, null);
    this._connection = Gio.DBusConnection.new_for_address_sync(address,
      Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
    this.items = new Map();
    this._exported = [];
    this._serial = 0;
    this._export(SERVICE_XML, ROOT, {
      OpenSession: () => [new GLib.Variant('s', ''), SESSION],
      SearchItems: attributes => [this.find(attributes), []],
      Unlock: paths => [paths, NO_PROMPT],
    });
    this._export(COLLECTION_XML, `${ROOT}/aliases/default`, {
      CreateItem: (properties, [, , value], replace) => {
        const attributes = properties['org.freedesktop.Secret.Item.Attributes'].deepUnpack();
        const existing = replace ? this.find(attributes)[0] : null;
        const path = existing ?? this._item();
        this.items.get(path).attributes = attributes;
        this.items.get(path).value = value;
        return [path, NO_PROMPT];
      },
    });
  }

  _export(xml, path, implementation) {
    const exported = Gio.DBusExportedObject.wrapJSObject(xml, implementation);
    exported.export(this._connection, path);
    this._exported.push(exported);
  }

  _item() {
    const path = `${ROOT}/collection/login/${++this._serial}`;
    const item = {attributes: {}, value: new Uint8Array()};
    this.items.set(path, item);
    this._export(ITEM_XML, path, {
      GetSecret: () => [SESSION, new Uint8Array(), item.value, 'text/plain'],
      Delete: () => {
        this.items.delete(path);
        return NO_PROMPT;
      },
    });
    return path;
  }

  find(attributes) {
    return [...this.items].filter(([, item]) => Object.entries(attributes).every(([key, value]) => item.attributes[key] === value))
      .map(([path]) => path);
  }

  async own() {
    const reply = await this._connection.call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'RequestName',
      new GLib.Variant('(su)', ['org.freedesktop.secrets', DO_NOT_QUEUE]), new GLib.VariantType('(u)'), Gio.DBusCallFlags.NONE, -1, null);
    return reply.deepUnpack()[0] === 1;
  }

  destroy() {
    for (const exported of this._exported) exported.unexport();
    this._connection.close_sync(null);
  }
}
