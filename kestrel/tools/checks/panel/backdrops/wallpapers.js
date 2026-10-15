import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {repository, scratch} from '../../lib/processes.js';

const WIDTH = 640;
const HEIGHT = 400;
const STRIPE = 24;
const HUES = [[230, 45, 66], [255, 196, 0], [33, 144, 164], [145, 65, 172], [58, 200, 74], [237, 91, 0], [53, 132, 228]];

function pictureFile(name, paint) {
  const pixels = new Uint8Array(WIDTH * HEIGHT * 3);
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) pixels.set(paint(x, y), (y * WIDTH + x) * 3);
  }
  const path = scratch(`backdrop-${name}.png`);
  GdkPixbuf.Pixbuf.new_from_bytes(new GLib.Bytes(pixels), GdkPixbuf.Colorspace.RGB, false, 8, WIDTH, HEIGHT, WIDTH * 3).savev(path, 'png', [], []);
  return Gio.File.new_for_path(path);
}

const solid = color => () => color;
const stripes = x => HUES[Math.floor(x / STRIPE) % HUES.length];

export const WALLPAPERS = [
  ['green', () => pictureFile('green', solid([60, 180, 75]))],
  ['grey', () => pictureFile('grey', solid([128, 128, 128]))],
  ['white', () => pictureFile('white', solid([250, 250, 250]))],
  ['black', () => pictureFile('black', solid([12, 12, 14]))],
  ['fog', () => Gio.File.new_for_path(repository('os', 'image', 'files', 'usr', 'share', 'backgrounds', 'luft', 'Fog.jpg'))],
  ['stripes', () => pictureFile('stripes', stripes)],
];
