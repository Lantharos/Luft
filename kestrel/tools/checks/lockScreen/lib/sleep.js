import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {getLoginManager} from 'resource:///com/lantharos/kestrel/misc/loginManager.js';

import {call, property} from '../../lib/dbus.js';
import {waitUntil} from '../../lib/wait.js';

const DISPLAYS = ['org.gnome.Mutter.DisplayConfig', '/org/gnome/Mutter/DisplayConfig', 'org.gnome.Mutter.DisplayConfig'];
const SCREEN_ON = 0;

function login(method, value) {
  return call('org.freedesktop.login1', '/com/lantharos/KestrelChecks/Login', 'com.lantharos.KestrelChecks.Login', method,
    new GLib.Variant('(b)', [value]), null, {connection: Gio.DBus.system});
}

export const setLidClosed = closed => login('SetLidClosed', closed);

export async function prepareForSleep(sleeping) {
  await login('PrepareForSleep', sleeping);
  await waitUntil(() => getLoginManager().preparingForSleep === sleeping, `Kestrel hears that the computer ${sleeping ? 'is about to sleep' : 'woke up'}`);
}

export const screenOn = async () => await property(...DISPLAYS, 'PowerSaveMode') === SCREEN_ON;
export const externalMonitor = () => property(...DISPLAYS, 'HasExternalMonitor');
