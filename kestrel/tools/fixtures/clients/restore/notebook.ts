import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=4.0';

const [id, name, count] = ARGV;

const app = new Gtk.Application({application_id: id, flags: Gio.ApplicationFlags.NON_UNIQUE});
app.connect('activate', () => {
  for (let number = 1; number <= Number(count); number++)
    new Gtk.ApplicationWindow({application: app, title: `${name} ${number}`, default_width: 480, default_height: 320}).present();
});
app.run([]);
