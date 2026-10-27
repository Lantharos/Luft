import type Cairo from 'cairo';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=4.0';

const [title, width, height] = ARGV;
const STRIPE = 24;
const COLORS: [number, number, number][] = [[1, 0.1, 0.6], [0.1, 1, 0.2], [0.1, 0.3, 1], [1, 0.9, 0]];
const app = new Gtk.Application({ application_id: 'com.lantharos.Kestrel.StripedWindow', flags: Gio.ApplicationFlags.NON_UNIQUE });

function paint(_area: Gtk.DrawingArea, cr: Cairo.Context, areaWidth: number, areaHeight: number) {
  for (let offset = -areaHeight, index = 0; offset < areaWidth; offset += STRIPE, index++) {
    cr.setSourceRGB(...COLORS[index % COLORS.length]);
    cr.moveTo(offset, 0);
    cr.lineTo(offset + STRIPE, 0);
    cr.lineTo(offset + STRIPE + areaHeight, areaHeight);
    cr.lineTo(offset + areaHeight, areaHeight);
    cr.fill();
  }
}

app.connect('activate', () => {
  const window = new Gtk.ApplicationWindow({ application: app, title, default_width: Number(width), default_height: Number(height) });
  const area = new Gtk.DrawingArea();
  area.set_draw_func(paint);
  window.set_child(area);
  window.present();
});

app.run([]);
