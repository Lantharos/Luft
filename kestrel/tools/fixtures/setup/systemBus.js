import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {BASIC_NAMES, publishBasics} from '../system/basics.js';
import {FINGERPRINT_NAME, publishFingerprint} from '../system/fingerprint.js';
import {publishSecurity, SECURITY_NAMES, variants} from '../system/security.js';
import {publishUdisks} from '../system/udisks/service.js';
import {INSTALLER_NAME, publishInstaller} from './installer.js';
import {NETWORK_MANAGER_NAME, publishNetworkManager} from './networkManager.js';

const CALLS = `<node><interface name="com.lantharos.KestrelChecks.Calls">
  <method name="Take"><arg type="as" direction="out"/></method>
</interface></node>`;
const TRUST_CONTROL = `<node><interface name="com.lantharos.KestrelChecks.Trust">
  <method name="SetSigningKey"><arg type="s" direction="in"/></method>
</interface></node>`;

const calls = [];
const signingKey = {State: 'none', Available: true, Reason: '', Missed: 0, MissedThisBoot: false};
const published = [];

function publish(xml, implementation, path) {
  const exported = Gio.DBusExportedObject.wrapJSObject(xml, implementation);
  exported.export(Gio.DBus.system, path);
  published.push(exported);
  return exported;
}

publishBasics(publish, calls);
publish(CALLS, {Take: () => calls.splice(0)}, '/com/lantharos/KestrelChecks');
publish(TRUST_CONTROL, {SetSigningKey: state => (signingKey.State = state)}, '/com/lantharos/KestrelChecks/Trust');
publishSecurity(publish, calls, publishUdisks(calls), {
  get SigningKey() {
    return variants({State: 's', Available: 'b', Reason: 's', Missed: 'u', MissedThisBoot: 'b'}, signingKey);
  },
  Disk: variants({Device: 's', Encrypted: 'b', State: 's', Progress: 'd', Remaining: 't', Unlock: 'as', RecoveryKeyStored: 'b', TpmRefused: 'b'},
    {Device: '/dev/nvme0n1p3', Encrypted: false, State: 'off', Progress: 0, Remaining: 0, Unlock: [], RecoveryKeyStored: false, TpmRefused: false}),
  EnrollSigningKey: () => {
    calls.push('EnrollSigningKey');
    return '48203917';
  },
});
publishInstaller(publish, calls);
publishNetworkManager(calls);
publishFingerprint(publish, calls);

for (const name of [...BASIC_NAMES, 'com.lantharos.KestrelChecks', 'org.freedesktop.UDisks2', INSTALLER_NAME, NETWORK_MANAGER_NAME, FINGERPRINT_NAME, ...SECURITY_NAMES])
  Gio.bus_own_name_on_connection(Gio.DBus.system, name, Gio.BusNameOwnerFlags.NONE, null, null);
new GLib.MainLoop(null, false).run();
