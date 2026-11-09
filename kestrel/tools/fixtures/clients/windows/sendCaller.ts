import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';
import GLibUnix from 'gi://GLibUnix';
import Gtk from 'gi://Gtk?version=4.0';

const SEND = 10;
const PROBE = 12;
const KESTREL = 'com.lantharos.Kestrel';
const PROBES: [string, string, string, string, GLib.Variant | null][] = [
  ['palette', '/com/lantharos/Kestrel/Appearance', 'org.freedesktop.DBus.Properties', 'Get', new GLib.Variant('(ss)', ['com.lantharos.Kestrel.Appearance', 'AccentColor'])],
  ['file-actions', '/com/lantharos/Kestrel/FileActions', 'com.lantharos.Kestrel.FileActions', 'List', null],
  ['extensions', '/com/lantharos/Kestrel/Extensions', 'com.lantharos.Kestrel.Extensions', 'List', null],
  ['share-introspect', '/com/lantharos/Kestrel/Share', 'org.freedesktop.DBus.Introspectable', 'Introspect', null],
];

/** Each argument is `name=path`: the name to send the file under and the file to open. */
const files = ARGV.map(argument => {
  const at = argument.indexOf('=');
  return { name: argument.slice(0, at), path: argument.slice(at + 1) };
});

const app = new Gtk.Application({ application_id: 'com.lantharos.Kestrel.SendCaller', flags: Gio.ApplicationFlags.NON_UNIQUE });

const TITLE = 'Kestrel send caller';
let window: Gtk.ApplicationWindow;
const probed: Record<string, string> = {};
let answers = 0;

/** Says how each call went in the window's title, numbered, which the check reads. */
const report = (outcome: string) => { window.title = `${TITLE} ${++answers}: ${outcome}`; };

function send() {
  const fds = new Gio.UnixFDList();
  const handed = files.map(({ name, path }): [string, number] => {
    const stream = Gio.File.new_for_path(path).read(null) as unknown as GioUnix.FileDescriptorBased & Gio.InputStream;
    const index = fds.append(stream.get_fd());
    stream.close(null);
    return [name, index];
  });
  Gio.DBus.session.call_with_unix_fd_list(KESTREL, '/com/lantharos/Kestrel/Share', 'com.lantharos.Kestrel.Share', 'Send',
    new GLib.Variant('(a(sh))', [handed]), null, Gio.DBusCallFlags.NONE, -1, fds, null, (connection, result) => {
      try {
        connection!.call_with_unix_fd_list_finish(result);
        report('sent');
      } catch (error) {
        report(`refused ${Gio.DBusError.get_remote_error(error as GLib.Error)} ${(error as GLib.Error).message}`);
      }
    });
}

function probe() {
  for (const [label, path, iface, method, parameters] of PROBES) {
    Gio.DBus.session.call(KESTREL, path, iface, method, parameters, null, Gio.DBusCallFlags.NONE, 5000, null, (connection, result) => {
      try {
        connection!.call_finish(result);
        probed[label] = 'answered';
      } catch (error) {
        probed[label] = Gio.DBusError.get_remote_error(error as GLib.Error) ?? (error as GLib.Error).message;
      }
      if (Object.keys(probed).length === PROBES.length) report(`probed ${JSON.stringify(probed)}`);
    });
  }
}

app.connect('activate', () => {
  window = new Gtk.ApplicationWindow({ application: app, title: TITLE, default_width: 520, default_height: 360 });
  window.set_child(new Gtk.Label({ label: files.map(file => file.name).join('\n') }));
  window.present();
  GLibUnix.signal_add(GLib.PRIORITY_DEFAULT, SEND, () => { send(); return GLib.SOURCE_CONTINUE; });
  GLibUnix.signal_add(GLib.PRIORITY_DEFAULT, PROBE, () => { probe(); return GLib.SOURCE_CONTINUE; });
});

app.run([]);
