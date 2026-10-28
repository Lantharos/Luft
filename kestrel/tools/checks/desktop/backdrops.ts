import Cairo from 'cairo';
import type Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import {LockBackdrop, Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {checks} from '../lib/check.js';
import {scratch} from '../lib/processes.js';
import {nextFrame, waitUntil} from '../lib/wait.js';

type Rgb = [number, number, number];

const {require} = checks('backdrop');
const STORE = GLib.build_filenamev([GLib.get_user_cache_dir(), 'kestrel', 'backgrounds']);
const STORE_TIMEOUT = 10000;
const PICTURES: [Rgb, Rgb][] = [
  [[0.10, 0.12, 0.30], [0.85, 0.45, 0.20]],
  [[0.05, 0.25, 0.15], [0.70, 0.80, 0.95]],
];

function writePicture(path: string, [from, to]: [Rgb, Rgb]) {
  const [width, height] = [2400, 1350];
  const surface = new Cairo.ImageSurface(Cairo.Format.RGB24, width, height);
  const context = new Cairo.Context(surface);
  const gradient = new Cairo.LinearGradient(0, 0, width, height);
  gradient.addColorStopRGB(0, ...from);
  gradient.addColorStopRGB(1, ...to);
  context.setSource(gradient);
  context.paint();
  context.setSourceRGB(1, 1, 1);
  context.arc(width * 0.3, height * 0.4, height * 0.15, 0, 2 * Math.PI);
  context.fill();
  surface.writeToPNG(path);
  return Gio.File.new_for_path(path).get_uri();
}

const pixels = (actor: Clutter.Actor) => Shell.texture_file_encode(Shell.texture_file_paint_actor(actor)!, null);
const DOWNSCALE = 4;
const storedPath = (key: string) => GLib.build_filenamev([STORE, GLib.compute_checksum_for_string(GLib.ChecksumType.SHA256, key, -1)!]);

async function stored(uri: string) {
  const probe = new LockBackdrop();
  try {
    const keys = await waitUntil(async () => {
      const current = await Promise.all(probe.monitors.map(monitor => monitor.key()));
      return current.every((key): key is string => !!key?.startsWith(`${uri} `)) && current;
    }, 'the backdrop shows the new wallpaper');
    await waitUntil(() => keys.every(key => GLib.file_test(storedPath(key), GLib.FileTest.EXISTS)), 'the blurred wallpaper is stored', STORE_TIMEOUT);
    return keys;
  } finally {
    probe.actor.destroy();
  }
}

async function storedWidth(key: string) {
  const [texture] = await Shell.texture_file_load_async(Gio.File.new_for_path(storedPath(key)), GLib.PRIORITY_DEFAULT, null);
  return texture.get_width();
}

async function checkPicture(index: number, uri: string, previous: GLib.Bytes | null) {
  const [key] = await stored(uri);
  const {width} = Main.layoutManager.primaryMonitor!;
  require(await storedWidth(key) <= Math.ceil(width / DOWNSCALE), `the frost of wallpaper ${index + 1} is kept at a quarter of the display's size`);
  const backdrop = new LockBackdrop();
  global.stage.add_child(backdrop.actor);
  try {
    await backdrop.loaded;
    await nextFrame();
    const shown = pixels(backdrop.actor);
    require(previous?.compare(shown) !== 0, 'a new wallpaper replaces the frost of the old one');
    return shown;
  } finally {
    backdrop.actor.destroy();
  }
}

export async function run() {
  const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});
  const saved = ['picture-uri', 'picture-uri-dark'].map((key): [string, string] => [key, background.get_string(key)]);
  let previous: GLib.Bytes | null = null;
  try {
    for (const [index, colors] of PICTURES.entries()) {
      const uri = writePicture(scratch(`backdrop-check-${index}.png`), colors);
      background.set_string('picture-uri', uri);
      background.set_string('picture-uri-dark', uri);
      previous = await checkPicture(index, uri, previous);
    }
  } finally {
    for (const [key, value] of saved) background.set_string(key, value);
  }
}
