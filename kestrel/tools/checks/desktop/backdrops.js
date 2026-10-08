import Cairo from 'cairo';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import {LockBackdrop} from 'resource:///com/lantharos/kestrel/ui/lockScreen/backdrop.js';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {checks} from '../lib/check.js';
import {scratch} from '../lib/processes.js';
import {waitUntil} from '../lib/wait.js';

const {require, eventually} = checks('backdrop');
const STORE = GLib.build_filenamev([GLib.get_user_cache_dir(), 'kestrel', 'backgrounds']);
const STORE_TIMEOUT = 10000;
const PICTURES = [
  [[0.10, 0.12, 0.30], [0.85, 0.45, 0.20]],
  [[0.05, 0.25, 0.15], [0.70, 0.80, 0.95]],
];

function writePicture(path, [from, to]) {
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

const pixels = actor => Shell.texture_file_encode(Shell.texture_file_paint_actor(actor), null);
const storedPath = key => GLib.build_filenamev([STORE, GLib.compute_checksum_for_string(GLib.ChecksumType.SHA256, key, -1)]);

async function stored(uri) {
  const probe = new LockBackdrop();
  try {
    const keys = await waitUntil(async () => {
      const current = await Promise.all(probe._monitors.map(monitor => monitor._key()));
      return current.every(key => key?.startsWith(`${uri} `)) && current;
    }, 'the backdrop shows the new wallpaper');
    await waitUntil(() => keys.every(key => GLib.file_test(storedPath(key), GLib.FileTest.EXISTS)), 'the blurred wallpaper is stored', STORE_TIMEOUT);
  } finally {
    probe.actor.destroy();
  }
}

async function checkPicture(index, uri, previous) {
  await stored(uri);
  const backdrop = new LockBackdrop();
  let first = null;
  backdrop.actor.connect('child-added', () => (first ??= pixels(backdrop.actor)));
  global.stage.add_child(backdrop.actor);
  try {
    await backdrop.loaded;
    require(first, `the blurred copy of wallpaper ${index + 1} is stored and shown at once`);
    await eventually(() => backdrop.actor.get_n_children() === Main.layoutManager.monitors.length, `the live blur of wallpaper ${index + 1} takes over`);
    const live = pixels(backdrop.actor);
    require(first.compare(live) === 0, `the stored copy of wallpaper ${index + 1} matches the live blur pixel for pixel`);
    if (previous) require(previous.compare(live) !== 0, 'a new wallpaper replaces the stored copy of the old one');
    return live;
  } finally {
    backdrop.actor.destroy();
  }
}

export async function run() {
  const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});
  const saved = ['picture-uri', 'picture-uri-dark'].map(key => [key, background.get_string(key)]);
  let previous = null;
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
