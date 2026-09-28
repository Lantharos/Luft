import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const MANAGER = `<node><interface name="org.gnome.SessionManager">
  <method name="GetInhibitors"><arg type="ao" direction="out"/></method>
  <signal name="InhibitorAdded"><arg type="o"/></signal>
  <signal name="InhibitorRemoved"><arg type="o"/></signal>
</interface></node>`;
const INHIBITOR = `<node><interface name="org.gnome.SessionManager.Inhibitor">
  <method name="GetAppId"><arg type="s" direction="out"/></method>
  <method name="GetFlags"><arg type="u" direction="out"/></method>
</interface></node>`;
const MANAGER_PATH = '/org/gnome/SessionManager';
const INHIBITOR_PATH = '/org/gnome/SessionManager/Inhibitor1';
const IDLE = 8;

const manager = Gio.DBusExportedObject.wrapJSObject(MANAGER, { GetInhibitors: () => [INHIBITOR_PATH] });
const inhibitor = Gio.DBusExportedObject.wrapJSObject(INHIBITOR, { GetAppId: () => 'org.gnome.Showtime', GetFlags: () => IDLE });
manager.export(Gio.DBus.session, MANAGER_PATH);
inhibitor.export(Gio.DBus.session, INHIBITOR_PATH);

const loop = new GLib.MainLoop(null, false);
Gio.bus_own_name_on_connection(Gio.DBus.session, 'org.gnome.SessionManager', Gio.BusNameOwnerFlags.NONE,
  () => manager.emit_signal('InhibitorAdded', new GLib.Variant('(o)', [INHIBITOR_PATH])), null);
GLib.unix_signal_add(GLib.PRIORITY_DEFAULT, 15, () => {
  manager.emit_signal('InhibitorRemoved', new GLib.Variant('(o)', [INHIBITOR_PATH]));
  Gio.DBus.session.flush_sync(null);
  loop.quit();
  return GLib.SOURCE_REMOVE;
});
loop.run();
