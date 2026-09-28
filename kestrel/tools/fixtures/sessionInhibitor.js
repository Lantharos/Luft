import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GLibUnix from 'gi://GLibUnix';

const MANAGER = `<node><interface name="org.gnome.SessionManager">
  <method name="GetInhibitors"><arg type="ao" direction="out"/></method>
  <method name="Inhibit">
    <arg type="s" direction="in"/><arg type="u" direction="in"/><arg type="s" direction="in"/><arg type="u" direction="in"/>
    <arg type="u" direction="out"/>
  </method>
  <method name="Uninhibit"><arg type="u" direction="in"/></method>
  <signal name="InhibitorAdded"><arg type="o"/></signal>
  <signal name="InhibitorRemoved"><arg type="o"/></signal>
</interface></node>`;
const INHIBITOR = `<node><interface name="org.gnome.SessionManager.Inhibitor">
  <method name="GetAppId"><arg type="s" direction="out"/></method>
  <method name="GetFlags"><arg type="u" direction="out"/></method>
</interface></node>`;
const MANAGER_PATH = '/org/gnome/SessionManager';
const IDLE = 8;

const inhibitors = new Map();
let nextCookie = 1;

const manager = Gio.DBusExportedObject.wrapJSObject(MANAGER, {
  GetInhibitors: () => [...inhibitors.values()].map(({path}) => path),
  Inhibit: (appId, _window, _reason, flags) => inhibit(appId, flags),
  Uninhibit: cookie => uninhibit(cookie),
});
manager.export(Gio.DBus.session, MANAGER_PATH);

function inhibit(appId, flags) {
  const cookie = nextCookie++;
  const path = `${MANAGER_PATH}/Inhibitor${cookie}`;
  const object = Gio.DBusExportedObject.wrapJSObject(INHIBITOR, { GetAppId: () => appId, GetFlags: () => flags });
  object.export(Gio.DBus.session, path);
  inhibitors.set(cookie, {path, object});
  manager.emit_signal('InhibitorAdded', new GLib.Variant('(o)', [path]));
  return cookie;
}

function uninhibit(cookie) {
  const {path, object} = inhibitors.get(cookie);
  inhibitors.delete(cookie);
  object.unexport();
  manager.emit_signal('InhibitorRemoved', new GLib.Variant('(o)', [path]));
}

const loop = new GLib.MainLoop(null, false);
Gio.bus_own_name_on_connection(Gio.DBus.session, 'org.gnome.SessionManager', Gio.BusNameOwnerFlags.NONE, () => {
  if (ARGV.includes('--app'))
    inhibit('org.gnome.Showtime', IDLE);
}, null);
GLibUnix.signal_add(GLib.PRIORITY_DEFAULT, 15, () => {
  for (const cookie of [...inhibitors.keys()])
    uninhibit(cookie);
  Gio.DBus.session.flush_sync(null);
  loop.quit();
  return GLib.SOURCE_REMOVE;
});
loop.run();
