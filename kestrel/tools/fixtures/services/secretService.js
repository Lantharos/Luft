import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const ROOT = '/org/freedesktop/secrets';
const COLLECTION = `${ROOT}/collection/scratch`;
const DEFAULT_ALIAS = `${ROOT}/aliases/default`;
const SECRET = '(oayays)';

const SERVICE_XML = `<node><interface name="org.freedesktop.Secret.Service">
  <method name="OpenSession"><arg type="s" direction="in"/><arg type="v" direction="in"/><arg type="v" direction="out"/><arg type="o" direction="out"/></method>
  <method name="CreateCollection"><arg type="a{sv}" direction="in"/><arg type="s" direction="in"/><arg type="o" direction="out"/><arg type="o" direction="out"/></method>
  <method name="SearchItems"><arg type="a{ss}" direction="in"/><arg type="ao" direction="out"/><arg type="ao" direction="out"/></method>
  <method name="Unlock"><arg type="ao" direction="in"/><arg type="ao" direction="out"/><arg type="o" direction="out"/></method>
  <method name="GetSecrets"><arg type="ao" direction="in"/><arg type="o" direction="in"/><arg type="a{o${SECRET}}" direction="out"/></method>
  <method name="ReadAlias"><arg type="s" direction="in"/><arg type="o" direction="out"/></method>
  <property name="Collections" type="ao" access="read"/>
</interface></node>`;
const COLLECTION_XML = `<node><interface name="org.freedesktop.Secret.Collection">
  <method name="CreateItem"><arg type="a{sv}" direction="in"/><arg type="${SECRET}" direction="in"/><arg type="b" direction="in"/><arg type="o" direction="out"/><arg type="o" direction="out"/></method>
  <method name="SearchItems"><arg type="a{ss}" direction="in"/><arg type="ao" direction="out"/></method>
  <property name="Items" type="ao" access="read"/>
  <property name="Label" type="s" access="read"/>
  <property name="Locked" type="b" access="read"/>
  <property name="Created" type="t" access="read"/>
  <property name="Modified" type="t" access="read"/>
</interface></node>`;
const ITEM_XML = `<node><interface name="org.freedesktop.Secret.Item">
  <method name="GetSecret"><arg type="o" direction="in"/><arg type="${SECRET}" direction="out"/></method>
  <method name="Delete"><arg type="o" direction="out"/></method>
  <property name="Attributes" type="a{ss}" access="read"/>
  <property name="Label" type="s" access="read"/>
  <property name="Locked" type="b" access="read"/>
  <property name="Created" type="t" access="read"/>
  <property name="Modified" type="t" access="read"/>
</interface></node>`;
const SESSION_XML = `<node><interface name="org.freedesktop.Secret.Session"><method name="Close"/></interface></node>`;

const matches = (item, attributes) => Object.entries(attributes).every(([key, value]) => item.attributes[key] === value);
const secretOf = (item, session) => [session, [], [...new TextEncoder().encode(item.secret)], 'text/plain'];

export class ScratchKeyring {
  constructor() {
    const keyring = this;
    this.items = [];
    this._exported = [];
    this._sessions = 0;
    this._created = 0;
    this._connection = Gio.DBusConnection.new_for_address_sync(Gio.dbus_address_get_for_bus_sync(Gio.BusType.SESSION, null),
      Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
    this._export(SERVICE_XML, {
      OpenSessionAsync: ([algorithm], invocation) => {
        if (algorithm !== 'plain') {
          invocation.return_dbus_error('org.freedesktop.DBus.Error.NotSupported', 'Only plain sessions are offered');
          return;
        }
        const path = `${ROOT}/session/${++this._sessions}`;
        this._export(SESSION_XML, {Close: () => {}}, path);
        invocation.return_value(new GLib.Variant('(vo)', [new GLib.Variant('s', ''), path]));
      },
      CreateCollection: () => [COLLECTION, '/'],
      SearchItems: attributes => [this._search(attributes), []],
      Unlock: objects => [objects, '/'],
      GetSecrets: (paths, session) => Object.fromEntries(this.items.filter(item => paths.includes(item.path)).map(item => [item.path, secretOf(item, session)])),
      ReadAlias: () => COLLECTION,
      Collections: [COLLECTION],
    }, ROOT);
    const collection = () => ({
      CreateItem: (properties, [, , value], replace) => {
        const attributes = properties['org.freedesktop.Secret.Item.Attributes'].deepUnpack();
        const label = properties['org.freedesktop.Secret.Item.Label']?.deepUnpack() ?? '';
        const existing = replace ? this.items.find(item => matches(item, attributes) && Object.keys(item.attributes).length === Object.keys(attributes).length) : null;
        if (!existing) return [this.store(attributes, label, new TextDecoder().decode(new Uint8Array(value))), '/'];
        existing.label = label;
        existing.secret = new TextDecoder().decode(new Uint8Array(value));
        return [existing.path, '/'];
      },
      SearchItems: attributes => this._search(attributes),
      get Items() {
        return keyring.items.map(item => item.path);
      },
      Label: 'Scratch', Locked: false, Created: 0, Modified: 0,
    });
    this._export(COLLECTION_XML, collection(), COLLECTION);
    this._export(COLLECTION_XML, collection(), DEFAULT_ALIAS);
  }

  store(attributes, label, secret) {
    const item = {path: `${COLLECTION}/${++this._created}`, attributes, label, secret};
    this.items.push(item);
    const exported = this._export(ITEM_XML, {
      GetSecret: session => secretOf(item, session),
      Delete: () => {
        this.items = this.items.filter(other => other !== item);
        this._exported = this._exported.filter(other => other !== exported);
        exported.unexport();
        return '/';
      },
      get Attributes() {
        return item.attributes;
      },
      get Label() {
        return item.label;
      },
      Locked: false, Created: 0, Modified: 0,
    }, item.path);
    return item.path;
  }

  _search(attributes) {
    return this.items.filter(item => matches(item, attributes)).map(item => item.path);
  }

  _export(xml, implementation, path) {
    const exported = Gio.DBusExportedObject.wrapJSObject(xml, implementation);
    exported.export(this._connection, path);
    this._exported.push(exported);
    return exported;
  }

  async own() {
    const reply = await this._connection.call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'RequestName',
      new GLib.Variant('(su)', ['org.freedesktop.secrets', 4]), new GLib.VariantType('(u)'), Gio.DBusCallFlags.NONE, -1, null);
    return reply.deepUnpack()[0] === 1;
  }

  forget() {
    this.items = [];
  }

  close() {
    for (const exported of this._exported) exported.unexport();
    this._connection.close_sync(null);
  }
}
