import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GLibUnix from 'gi://GLibUnix';
import Gtk from 'gi://Gtk?version=4.0';

const SHOW = 10;
const OPEN = 12;
const [folder, ...opener] = ARGV;

const app = new Gtk.Application({ application_id: 'com.lantharos.Kestrel.FolderCaller' });

function showFolder() {
  Gio.DBus.session.call('org.freedesktop.FileManager1', '/org/freedesktop/FileManager1', 'org.freedesktop.FileManager1', 'ShowFolders',
    new GLib.Variant('(ass)', [[GLib.filename_to_uri(folder, null)], '']), null, Gio.DBusCallFlags.NONE, -1, null, null);
}

function openFolder() {
  const launcher = new Gio.SubprocessLauncher({ flags: Gio.SubprocessFlags.NONE });
  launcher.unsetenv('XDG_ACTIVATION_TOKEN');
  launcher.unsetenv('DESKTOP_STARTUP_ID');
  launcher.spawnv([...opener, folder]);
}

app.connect('activate', () => {
  const window = new Gtk.ApplicationWindow({ application: app, title: 'Kestrel folder caller', default_width: 520, default_height: 360 });
  window.present();
  GLibUnix.signal_add(GLib.PRIORITY_DEFAULT, SHOW, () => { showFolder(); return GLib.SOURCE_CONTINUE; });
  GLibUnix.signal_add(GLib.PRIORITY_DEFAULT, OPEN, () => { openFolder(); return GLib.SOURCE_CONTINUE; });
});

app.run([]);
