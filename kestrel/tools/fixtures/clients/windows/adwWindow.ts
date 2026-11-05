import Adw from 'gi://Adw?version=1';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=4.0';

const [title, width, height] = ARGV;
const app = new Adw.Application({ application_id: 'com.lantharos.Kestrel.AdwWindow', flags: Gio.ApplicationFlags.NON_UNIQUE });

app.connect('activate', () => {
  const content = new Adw.ToolbarView({ content: new Gtk.Label({ label: title, vexpand: true }) });
  content.add_top_bar(new Adw.HeaderBar());
  new Adw.ApplicationWindow({ application: app, title, default_width: Number(width), default_height: Number(height), content }).present();
});

app.run([]);
