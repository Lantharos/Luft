import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const ITEM_INTERFACE = `<node><interface name="org.kde.StatusNotifierItem">
  <property name="Id" type="s" access="read"/>
  <property name="Title" type="s" access="read"/>
  <property name="Status" type="s" access="read"/>
  <property name="IconName" type="s" access="read"/>
  <property name="IconPixmap" type="a(iiay)" access="read"/>
  <property name="Menu" type="o" access="read"/>
  <property name="ItemIsMenu" type="b" access="read"/>
  <method name="Activate"><arg type="i" direction="in"/><arg type="i" direction="in"/></method>
  <signal name="NewTitle"/>
</interface></node>`;

const MENU_INTERFACE = `<node><interface name="com.canonical.dbusmenu">
  <method name="GetLayout">
    <arg type="i" direction="in"/><arg type="i" direction="in"/><arg type="as" direction="in"/>
    <arg type="u" direction="out"/><arg type="(ia{sv}av)" direction="out"/>
  </method>
  <method name="Event">
    <arg type="i" direction="in"/><arg type="s" direction="in"/><arg type="v" direction="in"/><arg type="u" direction="in"/>
  </method>
  <method name="AboutToShow"><arg type="i" direction="in"/><arg type="b" direction="out"/></method>
</interface></node>`;

const SIZE = 22;
const pixels = new Uint8Array(SIZE * SIZE * 4);
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const inside = Math.hypot(x - SIZE / 2 + 0.5, y - SIZE / 2 + 0.5) < SIZE / 2 - 2;
    pixels.set(inside ? [255, 88, 101, 242] : [0, 0, 0, 0], (y * SIZE + x) * 4);
  }
}

let muted = false;
const node = (id, properties, children = []) => [id, properties, children.map(child => new GLib.Variant('(ia{sv}av)', child))];
const text = value => new GLib.Variant('s', value);

const item = {
  Id: 'kestrel-tray-check',
  Title: 'Chatter',
  Status: 'Active',
  IconName: '',
  IconPixmap: new GLib.Variant('a(iiay)', [[SIZE, SIZE, pixels]]),
  Menu: '/MenuBar',
  ItemIsMenu: false,
  Activate() {
    this.Title = 'Chatter open';
    itemObject.emit_signal('NewTitle', null);
  },
};

const menu = {
  GetLayout() {
    return [1, node(0, {'children-display': text('submenu')}, [
      node(1, {label: text('_Open Chatter')}),
      node(2, {label: text('Mute'), 'toggle-type': text('checkmark'), 'toggle-state': new GLib.Variant('i', muted ? 1 : 0)}),
      node(3, {type: text('separator')}),
      node(4, {label: text('Status'), 'children-display': text('submenu')}, [
        node(5, {label: text('Online'), 'toggle-type': text('radio'), 'toggle-state': new GLib.Variant('i', 1)}),
        node(6, {label: text('Away'), 'toggle-type': text('radio'), 'toggle-state': new GLib.Variant('i', 0)}),
      ]),
      node(7, {label: text('Hidden'), visible: new GLib.Variant('b', false)}),
      node(8, {label: text('Quit')}),
    ])];
  },
  Event(id) {
    if (id === 2) muted = !muted;
  },
  AboutToShow() {
    return false;
  },
};

const itemObject = Gio.DBusExportedObject.wrapJSObject(ITEM_INTERFACE, item);
const menuObject = Gio.DBusExportedObject.wrapJSObject(MENU_INTERFACE, menu);
itemObject.export(Gio.DBus.session, '/StatusNotifierItem');
menuObject.export(Gio.DBus.session, '/MenuBar');
Gio.DBus.session.call('org.kde.StatusNotifierWatcher', '/StatusNotifierWatcher', 'org.kde.StatusNotifierWatcher',
  'RegisterStatusNotifierItem', new GLib.Variant('(s)', ['/StatusNotifierItem']), null, Gio.DBusCallFlags.NONE, -1, null, null);

new GLib.MainLoop(null, false).run();
