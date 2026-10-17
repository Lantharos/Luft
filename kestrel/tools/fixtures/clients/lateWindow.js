import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk?version=4.0';

const [id, title, delay] = ARGV;

GLib.set_prgname(id);
const app = new Gtk.Application({application_id: id, flags: Gio.ApplicationFlags.NON_UNIQUE});

app.connect('activate', () => {
  app.hold();
  print('connected');
  GLib.timeout_add(GLib.PRIORITY_DEFAULT, Number(delay), () => {
    const window = new Gtk.ApplicationWindow({application: app, title, default_width: 560, default_height: 360});
    window.set_child(new Gtk.Label({label: 'A window that took a while to open'}));
    window.present();
    app.release();
    return GLib.SOURCE_REMOVE;
  });
});

app.run([]);
