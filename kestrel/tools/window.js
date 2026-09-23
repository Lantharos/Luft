import Gtk from 'gi://Gtk?version=4.0';

const app = new Gtk.Application({ application_id: 'dev.lantharos.Kestrel.WindowCapture' });

app.connect('activate', () => {
  const window = new Gtk.ApplicationWindow({
    application: app,
    title: 'Kestrel window check',
    default_width: 680,
    default_height: 420,
  });
  window.set_child(new Gtk.Label({ label: 'A window managed by Kestrel' }));
  window.present();
});

app.run([]);
