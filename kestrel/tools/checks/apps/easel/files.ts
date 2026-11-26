import GdkPixbuf from 'gi://GdkPixbuf';
import GLib from 'gi://GLib';

import {call} from '../../lib/dbus.js';
import {outcome, scratch} from '../../lib/processes.js';

export type Rgb = [number, number, number];

export const folder = scratch('easel-checks');
export const inFolder = (name: string) => GLib.build_filenamev([folder, name]);

export function writePicture(path: string, [red, green, blue]: Rgb, width = 600, height = 400) {
  GLib.mkdir_with_parents(folder, 0o755);
  const picture = GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.RGB, false, 8, width, height);
  picture.fill(((red << 24) | (green << 16) | (blue << 8) | 0xff) >>> 0);
  picture.savev(path, 'png', [], []);
}

export const answerChooser = (path: string) => call('org.freedesktop.impl.portal.desktop.rover', '/org/freedesktop/portal/desktop',
  'com.lantharos.KestrelChecks.FileChooser', 'Answer', new GLib.Variant('(s)', [GLib.filename_to_uri(path, null)]));

export function pixelAt(path: string, x: number, y: number): Rgb {
  const picture = GdkPixbuf.Pixbuf.new_from_file(path);
  const at = y * picture.get_rowstride() + x * picture.get_n_channels();
  const pixels = picture.get_pixels();
  return [pixels[at], pixels[at + 1], pixels[at + 2]];
}

export function colorsOf(path: string): Rgb[] {
  const picture = GdkPixbuf.Pixbuf.new_from_file(path);
  const pixels = picture.get_pixels();
  const stride = picture.get_rowstride();
  const channels = picture.get_n_channels();
  const found: Rgb[] = [];
  for (let y = 0; y < picture.get_height(); y += 4)
    for (let x = 0; x < picture.get_width(); x += 4) found.push([pixels[y * stride + x * channels], pixels[y * stride + x * channels + 1], pixels[y * stride + x * channels + 2]]);
  return found;
}

export const near = (a: Rgb, b: Rgb, tolerance = 3) => a.every((channel, index) => Math.abs(channel - b[index]) <= tolerance);

export async function documentOf(path: string) {
  const read = await outcome(['python3', '-I', '-c', 'import sys, zipfile; print(zipfile.ZipFile(sys.argv[1]).read("document.json").decode())', path]);
  return JSON.parse(read.stdout);
}

export function remove(path: string) {
  if (GLib.file_test(path, GLib.FileTest.EXISTS)) GLib.unlink(path);
}
