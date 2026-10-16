import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk?version=4.0';

const app = new Gtk.Application({ application_id: 'com.lantharos.Kestrel.Game', flags: Gio.ApplicationFlags.NON_UNIQUE });

app.connect('activate', () => {
  const scene = new Gtk.DrawingArea();
  let frame = 0;
  scene.set_draw_func((_area, cr) => {
    const shade = (frame % 120) / 240;
    cr.setSourceRGB(0.1 + shade, 0.2, 0.35);
    cr.paint();
    cr.$dispose();
  });
  scene.add_tick_callback(() => {
    frame++;
    scene.queue_draw();
    return GLib.SOURCE_CONTINUE;
  });

  const window = new Gtk.ApplicationWindow({ application: app, title: `Kestrel game ${GLib.getenv('GDK_BACKEND')}`, child: scene });
  window.connect('notify::is-active', () => {
    if (!window.is_active) window.present();
  });
  window.fullscreen();
  window.present();
});

app.run([]);
