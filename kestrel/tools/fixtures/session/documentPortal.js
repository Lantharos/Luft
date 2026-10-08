import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const DOCUMENTS = `<node><interface name="org.freedesktop.portal.Documents">
  <method name="GetMountPoint"><arg type="ay" direction="out"/></method>
  <property name="version" type="u" access="read"/>
</interface></node>`;

const [mountPoint] = ARGV;
GLib.mkdir_with_parents(mountPoint, 0o700);
const documents = Gio.DBusExportedObject.wrapJSObject(DOCUMENTS, {
  GetMountPoint: () => new TextEncoder().encode(`${mountPoint}\0`),
  version: 5,
});
documents.export(Gio.DBus.session, '/org/freedesktop/portal/documents');
Gio.bus_own_name_on_connection(Gio.DBus.session, 'org.freedesktop.portal.Documents', Gio.BusNameOwnerFlags.NONE, null, null);
new GLib.MainLoop(null, false).run();
