import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {ACCOUNTS_NAME, publishAccounts} from './accounts/accounts.js';
import {BASIC_NAMES, publishBasics} from './basics.js';
import {FINGERPRINT_NAME, publishFingerprint} from './security/fingerprint.js';
import {LOGIN_SCREEN_NAME, publishLoginScreen} from './security/loginScreen.js';
import {FIREWALL_NAME, publishFirewall} from './network/firewall.js';
import {NETWORK_MANAGER_NAME, publishNetworkManager} from './network/networkManager.js';
import {PACKAGES_NAME, publishPackages} from './software/packages.js';
import {PRINTERS_NAME, publishPrinters} from './devices/printers.js';
import {publishRemoteLogin, REMOTE_LOGIN_NAME} from './security/remoteLogin.js';
import {publishSecurity, SECURITY_NAMES} from './security/security.js';
import {publishSleep, SLEEP_NAME} from './devices/sleep.js';
import {publishUdisks} from './devices/udisks/service.js';
import {publishUpdater, UPDATER_NAME} from './software/updater.js';
import {publishWindows, WINDOWS_NAME} from './software/windows.js';

const CALLS = `<node><interface name="com.lantharos.KestrelChecks.Calls">
  <method name="Take"><arg type="as" direction="out"/></method>
  <method name="Seen"><arg type="as" direction="out"/></method>
</interface></node>`;

const calls: string[] = [];
const taken: string[] = [];
const published: Gio.DBusExportedObject[] = [];

function publish(xml: string, implementation: object, path: string) {
  const exported = Gio.DBusExportedObject.wrapJSObject(xml, implementation);
  exported.export(Gio.DBus.system, path);
  published.push(exported);
  return exported;
}

publishRemoteLogin(publish, calls, publishBasics(publish, calls));
publishAccounts(publish);
publishFirewall(publish, calls, publishNetworkManager(publish, calls));
publish(CALLS, {
  Take: () => {
    const fresh = calls.splice(0);
    taken.push(...fresh);
    return fresh;
  },
  Seen: () => [...taken, ...calls],
}, '/com/lantharos/KestrelChecks');
publishSecurity(publish, calls, publishUdisks(calls));
publishWindows(publish);
publishSleep(publish, calls);
publishPrinters(publish, calls);
publishUpdater(publish, calls);
publishPackages(publish, calls);
publishFingerprint(publish, calls);
publishLoginScreen(publish, calls);

for (const name of [...BASIC_NAMES, ACCOUNTS_NAME, NETWORK_MANAGER_NAME, FIREWALL_NAME, 'com.lantharos.KestrelChecks', 'org.freedesktop.UDisks2', WINDOWS_NAME, SLEEP_NAME, PRINTERS_NAME, UPDATER_NAME, PACKAGES_NAME, FINGERPRINT_NAME, REMOTE_LOGIN_NAME, LOGIN_SCREEN_NAME, ...SECURITY_NAMES])
  Gio.bus_own_name_on_connection(Gio.DBus.system, name, Gio.BusNameOwnerFlags.NONE, null, null);
new GLib.MainLoop(null, false).run();
