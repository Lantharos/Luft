import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {BASIC_NAMES, publishBasics} from './basics.js';
import {PACKAGEKIT_NAME, publishPackageKit} from './packageKit.js';
import {publishSecurity, SECURITY_NAMES} from './security.js';
import {publishUdisks} from './udisks/service.js';

const CALLS = `<node><interface name="com.lantharos.KestrelChecks.Calls">
  <method name="Take"><arg type="as" direction="out"/></method>
  <method name="Seen"><arg type="as" direction="out"/></method>
</interface></node>`;

const calls = [];
const taken = [];
const published = [];

function publish(xml, implementation, path) {
  const exported = Gio.DBusExportedObject.wrapJSObject(xml, implementation);
  exported.export(Gio.DBus.system, path);
  published.push(exported);
  return exported;
}

publishBasics(publish, calls);
publish(CALLS, {
  Take: () => {
    const fresh = calls.splice(0);
    taken.push(...fresh);
    return fresh;
  },
  Seen: () => [...taken, ...calls],
}, '/com/lantharos/KestrelChecks');
publishSecurity(publish, calls, publishUdisks(calls));
publishPackageKit(publish, calls);

for (const name of [...BASIC_NAMES, 'com.lantharos.KestrelChecks', 'org.freedesktop.UDisks2', PACKAGEKIT_NAME, ...SECURITY_NAMES])
  Gio.bus_own_name_on_connection(Gio.DBus.system, name, Gio.BusNameOwnerFlags.NONE, null, null);
new GLib.MainLoop(null, false).run();
