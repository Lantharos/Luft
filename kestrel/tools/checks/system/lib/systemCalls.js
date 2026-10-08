import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const CHECKS = 'com.lantharos.KestrelChecks';

let bus = null;

function calls(method) {
  bus ??= Gio.DBusConnection.new_for_address_sync(GLib.getenv('KESTREL_SYSTEM_BUS'),
    Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
  return bus.call_sync(CHECKS, '/com/lantharos/KestrelChecks', `${CHECKS}.Calls`, method, null,
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
