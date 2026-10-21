import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=4.0';

const app = new Gtk.Application({ application_id: 'com.lantharos.Kestrel.TilingWindows', flags: Gio.ApplicationFlags.NON_UNIQUE });

app.connect('activate', () => {
  const main = new Gtk.ApplicationWindow({ application: app, title: 'Tiling main', default_width: 640, default_height: 420 });
  main.present();
  if (ARGV.includes('--dialog')) {
    new Gtk.Window({ application: app, title: 'Tiling dialog', transient_for: main, modal: true, default_width: 360, default_height: 220 }).present();
  }
  if (ARGV.includes('--fixed')) {
    new Gtk.Window({ application: app, title: 'Tiling fixed', resizable: false, default_width: 320, default_height: 240 }).present();
  }
});

app.run([]);
