import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {getLoginManager} from 'resource:///com/lantharos/kestrel/misc/loginManager.js';

import {call, property} from '../../lib/dbus.js';

const DISPLAYS = ['org.gnome.Mutter.DisplayConfig', '/org/gnome/Mutter/DisplayConfig', 'org.gnome.Mutter.DisplayConfig'];
const SCREEN_ON = 0;

let bus = null;

function login(method, value) {
  bus ??= Gio.DBusConnection.new_for_address_sync(GLib.getenv('KESTREL_SYSTEM_BUS'),
    Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
  return call('org.freedesktop.login1', '/com/lantharos/KestrelChecks/Login', 'com.lantharos.KestrelChecks.Login', method,
    new GLib.Variant('(b)', [value]), null, {connection: bus});
}

export const setLidClosed = closed => login('SetLidClosed', closed);

export async function prepareForSleep(sleeping) {
  await login('PrepareForSleep', sleeping);
  getLoginManager()._prepareForSleep(null, null, [sleeping]);
}

export const screenOn = async () => await property(...DISPLAYS, 'PowerSaveMode') === SCREEN_ON;
export const externalMonitor = () => property(...DISPLAYS, 'HasExternalMonitor');
