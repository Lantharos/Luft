import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const CHECKS = 'com.lantharos.KestrelChecks';

function calls(method) {
  return Gio.DBus.system.call_sync(CHECKS, '/com/lantharos/KestrelChecks', `${CHECKS}.Calls`, method, null,
    new GLib.VariantType('(as)'), Gio.DBusCallFlags.NONE, -1, null).deepUnpack()[0];
}

export const takeCalls = () => calls('Take');
export const seenCalls = () => calls('Seen');

export function callLog() {
  const log = [];
  return () => {
    log.push(...takeCalls());
    return log;
  };
}
