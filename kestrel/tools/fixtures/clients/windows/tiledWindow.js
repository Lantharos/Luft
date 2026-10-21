import Gdk from 'gi://Gdk?version=4.0';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk?version=4.0';

const COLOR = [0.75, 0.19, 0.44];
const TITLEBAR_HEIGHT = 32;
const EDGES = [
  [Gdk.ToplevelState.TOP_TILED, 'top'],
  [Gdk.ToplevelState.RIGHT_TILED, 'right'],
  [Gdk.ToplevelState.BOTTOM_TILED, 'bottom'],
  [Gdk.ToplevelState.LEFT_TILED, 'left'],
];

const app = new Gtk.Application({ application_id: 'com.lantharos.Kestrel.TiledWindow', flags: Gio.ApplicationFlags.NON_UNIQUE });

function solid(height = -1) {
  const area = new Gtk.DrawingArea({ content_height: height, hexpand: true, vexpand: height < 0 });
  area.set_draw_func((_area, cr) => {
    cr.setSourceRGB(...COLOR);
    cr.paint();
    cr.$dispose();
  });
  return area;
}

function tiledEdges(state) {
  const edges = EDGES.filter(([flag]) => state & flag).map(([, name]) => name);
  return edges.length ? edges.join(' ') : 'floating';
}

app.connect('activate', () => {
  const name = `Kestrel tiled ${GLib.getenv('GDK_BACKEND')}`;
  const window = new Gtk.ApplicationWindow({ application: app, title: name, default_width: 640, default_height: 400, child: solid() });
  window.set_titlebar(new Gtk.WindowHandle({ child: solid(TITLEBAR_HEIGHT) }));
  window.connect('realize', () => {
    const surface = window.get_surface();
    const report = () => { window.title = `${name}: ${tiledEdges(surface.state)}`; };
    surface.connect('notify::state', report);
    report();
  });
  window.present();
});

app.run([]);
