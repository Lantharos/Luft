import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const MANAGER = `<node><interface name="org.freedesktop.NetworkManager">
  <property name="Connectivity" type="u" access="read"/>
  <method name="CheckConnectivity"><arg type="u" direction="out"/></method>
</interface></node>`;
const CONTROL = `<node><interface name="com.lantharos.KestrelChecks.NetworkManager">
  <method name="SetConnectivity"><arg type="u" direction="in"/></method>
  <method name="Checks"><arg type="u" direction="out"/></method>
</interface></node>`;
const PORTAL = 2;

let connectivity = PORTAL;
let checks = 0;
const manager = Gio.DBusExportedObject.wrapJSObject(MANAGER, {
  get Connectivity() {
    return connectivity;
  },
  CheckConnectivity() {
    checks++;
    return connectivity;
  },
});
manager.export(Gio.DBus.system, '/org/freedesktop/NetworkManager');
Gio.DBusExportedObject.wrapJSObject(CONTROL, {
  SetConnectivity(state) {
    connectivity = state;
    manager.emit_property_changed('Connectivity', new GLib.Variant('u', state));
  },
  Checks: () => checks,
}).export(Gio.DBus.system, '/com/lantharos/KestrelChecks/NetworkManager');
Gio.bus_own_name_on_connection(Gio.DBus.system, 'org.freedesktop.NetworkManager', Gio.BusNameOwnerFlags.NONE, null, null);
new GLib.MainLoop(null, false).run();
