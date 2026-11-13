import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {getLoginManager} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {call, property} from '../../lib/dbus.js';
import {pause, waitUntil} from '../../lib/wait.js';

const DISPLAYS = ['org.gnome.Mutter.DisplayConfig', '/org/gnome/Mutter/DisplayConfig', 'org.gnome.Mutter.DisplayConfig'] as const;
const SCREEN_ON = 0;
const WATCHDOG_RESUME_GRACE = 30 * GLib.USEC_PER_SEC;

function login(method: string, value: boolean) {
  return call('org.freedesktop.login1', '/com/lantharos/KestrelChecks/Login', 'com.lantharos.KestrelChecks.Login', method,
    new GLib.Variant('(b)', [value]), null, {connection: Gio.DBus.system});
}

export const setLidClosed = (closed: boolean) => login('SetLidClosed', closed);

export async function prepareForSleep(sleeping: boolean) {
  await login('PrepareForSleep', sleeping);
  await waitUntil(() => getLoginManager().preparingForSleep === sleeping, `Kestrel hears that the computer ${sleeping ? 'is about to sleep' : 'woke up'}`);
}

export async function watchdogPastResume() {
  const reply = await call('org.freedesktop.login1', '/com/lantharos/KestrelChecks/Login', 'com.lantharos.KestrelChecks.Login', 'ResumedAt',
    null, '(x)', {connection: Gio.DBus.system});
  const [resumedAt] = reply.deepUnpack<[number]>();
  const grace = WATCHDOG_RESUME_GRACE - (GLib.get_monotonic_time() - resumedAt);
  if (resumedAt && grace > 0) await pause(grace / 1000);
}

export const screenOn = async () => await property<number>(...DISPLAYS, 'PowerSaveMode') === SCREEN_ON;
export const externalMonitor = () => property<boolean>(...DISPLAYS, 'HasExternalMonitor');
