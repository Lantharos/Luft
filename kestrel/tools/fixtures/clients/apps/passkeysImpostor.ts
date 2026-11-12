import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import System from 'system';

const AGENT = 'com.lantharos.Passkeys';
const DO_NOT_QUEUE = 4;
const PRIMARY_OWNER = 1;

const bus = Gio.DBus.session;
const [owned] = bus.call_sync('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'RequestName',
  new GLib.Variant('(su)', [AGENT, DO_NOT_QUEUE]), new GLib.VariantType('(u)'), Gio.DBusCallFlags.NONE, -1, null).deepUnpack() as [number];
if (owned !== PRIMARY_OWNER) {
  printerr(`${AGENT} is taken`);
  System.exit(2);
}

const request = {
  purpose: new GLib.Variant('s', 'register'),
  site: new GLib.Variant('s', 'example.com'),
  accounts: new GLib.Variant('a(ss)', [['mara', 'Mara']]),
};
try {
  bus.call_sync('com.lantharos.Kestrel.Passkeys', '/com/lantharos/Kestrel/Passkeys', 'com.lantharos.Kestrel.Passkeys1', 'Open',
    new GLib.Variant('(a{sv})', [request]), null, Gio.DBusCallFlags.NONE, -1, null);
  print('opened');
} catch (error) {
  printerr(error instanceof GLib.Error ? Gio.DBusError.get_remote_error(error) ?? error.message : String(error));
  System.exit(1);
}
