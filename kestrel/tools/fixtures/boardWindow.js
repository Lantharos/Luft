import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=4.0';

const [title, width, height] = ARGV;
const app = new Gtk.Application({ application_id: 'com.lantharos.Kestrel.BoardWindow', flags: Gio.ApplicationFlags.NON_UNIQUE });

app.connect('activate', () => {
  const window = new Gtk.ApplicationWindow({ application: app, title, default_width: Number(width), default_height: Number(height) });
  const entry = new Gtk.Entry({ margin_top: 40, margin_start: 40, margin_end: 40, valign: Gtk.Align.START });
  entry.connect('changed', () => { window.title = `${title}: ${entry.text}`; });
  window.set_child(entry);
  window.present();
});

app.run([]);
