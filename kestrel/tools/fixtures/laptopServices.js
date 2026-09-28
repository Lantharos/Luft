import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const RFKILL = `<node><interface name="org.gnome.SettingsDaemon.Rfkill">
  <property name="AirplaneMode" type="b" access="readwrite"/>
  <property name="HasAirplaneMode" type="b" access="read"/>
  <property name="HardwareAirplaneMode" type="b" access="read"/>
  <property name="ShouldShowAirplaneMode" type="b" access="read"/>
</interface></node>`;
const KEYBOARD = `<node><interface name="org.gnome.SettingsDaemon.Power.Keyboard">
  <property name="Brightness" type="i" access="readwrite"/>
  <property name="Steps" type="i" access="read"/>
</interface></node>`;

function exportWritable(xml, path, name, type, initial, constants) {
  let value = initial;
  const object = {
    ...constants,
    get [name]() { return value; },
    set [name](next) {
      value = next;
      exported.emit_property_changed(name, new GLib.Variant(type, next));
    },
  };
  const exported = Gio.DBusExportedObject.wrapJSObject(xml, object);
  exported.export(Gio.DBus.session, path);
}

exportWritable(RFKILL, '/org/gnome/SettingsDaemon/Rfkill', 'AirplaneMode', 'b', false,
  { HasAirplaneMode: true, HardwareAirplaneMode: false, ShouldShowAirplaneMode: true });
exportWritable(KEYBOARD, '/org/gnome/SettingsDaemon/Power', 'Brightness', 'i', 50, { Steps: 3 });
for (const name of ['org.gnome.SettingsDaemon.Rfkill', 'org.gnome.SettingsDaemon.Power'])
  Gio.bus_own_name_on_connection(Gio.DBus.session, name, Gio.BusNameOwnerFlags.NONE, null, null);
new GLib.MainLoop(null, false).run();
