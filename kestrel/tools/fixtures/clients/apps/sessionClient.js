import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GLibUnix from 'gi://GLibUnix';

const MANAGER = 'org.gnome.SessionManager';
const MANAGER_PATH = '/org/gnome/SessionManager';
const READY = 'com.lantharos.KestrelChecks.SessionClient';
const IDLE = 8;
const SIGTERM = 15;

function call(path, iface, method, parameters, replyType) {
  return Gio.DBus.session.call_sync(MANAGER, path, iface, method, parameters,
    replyType ? new GLib.VariantType(replyType) : null, Gio.DBusCallFlags.NONE, -1, null);
}

if (ARGV.includes('--inhibit'))
  call(MANAGER_PATH, MANAGER, 'Inhibit', new GLib.Variant('(susu)', ['org.gnome.Showtime', 0, 'Playing a video', IDLE]), '(u)');

if (ARGV.includes('--screensaver')) {
  Gio.DBus.session.call_sync('org.freedesktop.ScreenSaver', '/org/freedesktop/ScreenSaver', 'org.freedesktop.ScreenSaver', 'Inhibit',
    new GLib.Variant('(ss)', ['firefox', 'Playing a video']), new GLib.VariantType('(u)'), Gio.DBusCallFlags.NONE, -1, null);
}

if (ARGV.includes('--register')) {
  const [client] = call(MANAGER_PATH, MANAGER, 'RegisterClient', new GLib.Variant('(ss)', ['org.gnome.TextEditor', '']), '(o)').deep_unpack();
  Gio.DBus.session.signal_subscribe(MANAGER, `${MANAGER}.ClientPrivate`, null, client, null, Gio.DBusSignalFlags.NONE,
    (_connection, _sender, _path, _iface, signal) => {
      if (signal === 'QueryEndSession' || signal === 'EndSession')
        call(client, `${MANAGER}.ClientPrivate`, 'EndSessionResponse', new GLib.Variant('(bs)', [true, '']), null);
    });
}

Gio.bus_own_name_on_connection(Gio.DBus.session, READY, Gio.BusNameOwnerFlags.NONE, null, null);

const loop = new GLib.MainLoop(null, false);
GLibUnix.signal_add(GLib.PRIORITY_DEFAULT, SIGTERM, () => {
  loop.quit();
  return GLib.SOURCE_REMOVE;
});
loop.run();
