import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {call} from './dbus.js';

/** Sets how the sign-in service stand-in says `user` signs in, besides fingerprints. */
export const setWays = (user: string, ways: string[], password: boolean) =>
  call('com.lantharos.KestrelChecks', '/com/lantharos/KestrelChecks/SignIn', 'com.lantharos.KestrelChecks.SignIn',
    'Set', new GLib.Variant('(sasb)', [user, ways, password]), null, {connection: Gio.DBus.system});
