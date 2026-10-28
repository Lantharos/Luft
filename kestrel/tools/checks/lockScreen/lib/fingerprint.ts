import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {call} from '../../lib/dbus.js';

function control(method: string, parameters: GLib.Variant) {
  return call('com.lantharos.KestrelChecks', '/com/lantharos/KestrelChecks/Fingerprint', 'com.lantharos.KestrelChecks.Fingerprint',
    method, parameters, null, {connection: Gio.DBus.system});
}

export const enroll = (user: string, fingers: string[]) => control('Enroll', new GLib.Variant('(sas)', [user, fingers]));

export async function scan(result: string) {
  const [delivered] = (await control('Scan', new GLib.Variant('(s)', [result]))).deepUnpack<[boolean]>();
  return delivered;
}
