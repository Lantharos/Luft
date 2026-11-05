import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const CHOOSER = `<node><interface name="org.freedesktop.impl.portal.FileChooser">
  <method name="OpenFile">
    <arg type="o" name="handle" direction="in"/>
    <arg type="s" name="app_id" direction="in"/>
    <arg type="s" name="parent_window" direction="in"/>
    <arg type="s" name="title" direction="in"/>
    <arg type="a{sv}" name="options" direction="in"/>
    <arg type="u" name="response" direction="out"/>
    <arg type="a{sv}" name="results" direction="out"/>
  </method>
  <method name="SaveFile">
    <arg type="o" name="handle" direction="in"/>
    <arg type="s" name="app_id" direction="in"/>
    <arg type="s" name="parent_window" direction="in"/>
    <arg type="s" name="title" direction="in"/>
    <arg type="a{sv}" name="options" direction="in"/>
    <arg type="u" name="response" direction="out"/>
    <arg type="a{sv}" name="results" direction="out"/>
  </method>
</interface></node>`;

const CHECKS = `<node><interface name="com.lantharos.KestrelChecks.FileChooser">
  <method name="Answer"><arg type="s" name="uri" direction="in"/></method>
</interface></node>`;

const ANSWERED = 0;
const CANCELLED = 1;

let answer = '';

const answered = () => answer ? [ANSWERED, {uris: new GLib.Variant('as', [answer])}] : [CANCELLED, {}];

const chooser = Gio.DBusExportedObject.wrapJSObject(CHOOSER, {OpenFile: answered, SaveFile: answered});
const checks = Gio.DBusExportedObject.wrapJSObject(CHECKS, {
  Answer: (uri: string) => {
    answer = uri;
  },
});
chooser.export(Gio.DBus.session, '/org/freedesktop/portal/desktop');
checks.export(Gio.DBus.session, '/org/freedesktop/portal/desktop');
Gio.bus_own_name_on_connection(Gio.DBus.session, 'org.freedesktop.impl.portal.desktop.rover', Gio.BusNameOwnerFlags.NONE, null, null);
new GLib.MainLoop(null, false).run();
