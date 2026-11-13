import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GLibUnix from 'gi://GLibUnix';
import Gtk from 'gi://Gtk?version=4.0';

const LOOK = 10;
const TITLE = 'Kestrel drive looker';
const [folder] = ARGV;

const app = new Gtk.Application({ application_id: 'com.lantharos.Kestrel.DriveLooker', flags: Gio.ApplicationFlags.NON_UNIQUE });
let window: Gtk.ApplicationWindow;
let answers = 0;

function writable(place: Gio.File) {
  const probe = place.get_child('.kestrel-drive-looker');
  try {
    probe.create(Gio.FileCreateFlags.NONE, null).close(null);
    probe.delete(null);
    return true;
  } catch {
    return false;
  }
}

/** Looks inside the folder the way a file dialog does, and says what it found, what holds it and whether it can write there. */
function look() {
  const place = Gio.File.new_for_path(folder);
  try {
    const names = [...place.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null)].map(info => info.get_name()).sort();
    const kind = place.query_filesystem_info('filesystem::type', null).get_attribute_string('filesystem::type');
    window.title = `${TITLE} ${++answers}: ${JSON.stringify({ names, kind, writable: writable(place) })}`;
  } catch (error) {
    window.title = `${TITLE} ${++answers}: ${JSON.stringify({ error: String(error) })}`;
  }
}

app.connect('activate', () => {
  window = new Gtk.ApplicationWindow({ application: app, title: TITLE, default_width: 420, default_height: 280 });
  window.present();
  GLibUnix.signal_add(GLib.PRIORITY_DEFAULT, LOOK, () => {
    look();
    return GLib.SOURCE_CONTINUE;
  });
});

app.run([]);
