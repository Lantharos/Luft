import Cairo from 'cairo';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import {LockBackdrop} from 'resource:///org/gnome/shell/ui/lockScreen/backdrop.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const STORE_WAIT = 4000;
const LIVE_WAIT = 600;
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

function pixels(actor) {
  return Shell.texture_file_encode(Shell.texture_file_paint_actor(actor), null);
}

export async function checkBackdrops({pause}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel backdrop check failed: ${label}`);
    console.log(`Kestrel backdrop check: ${label}`);
  };
  const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});
  const saved = ['picture-uri', 'picture-uri-dark'].map(key => [key, background.get_string(key)]);
  let previous = null;
  try {
    for (const [index, colors] of PICTURES.entries()) {
      const uri = writePicture(GLib.build_filenamev([GLib.get_user_cache_dir(), `backdrop-check-${index}.png`]), colors);
      background.set_string('picture-uri', uri);
      background.set_string('picture-uri-dark', uri);
      await pause(STORE_WAIT);

      const backdrop = new LockBackdrop();
      global.stage.add_child(backdrop.actor);
      await backdrop.loaded;
      const fromStore = backdrop.actor.get_n_children() > Main.layoutManager.monitors.length;
      const first = pixels(backdrop.actor);
      await pause(LIVE_WAIT);
      const live = pixels(backdrop.actor);
      const placeholderGone = backdrop.actor.get_n_children() === Main.layoutManager.monitors.length;
      backdrop.actor.destroy();

      require(fromStore, `the blurred copy of wallpaper ${index + 1} is stored and shown at once`);
      require(placeholderGone && first.compare(live) === 0, `the stored copy of wallpaper ${index + 1} matches the live blur pixel for pixel`);
      if (previous)
        require(previous.compare(live) !== 0, 'a new wallpaper replaces the stored copy of the old one');
      previous = live;
    }
  } finally {
    for (const [key, value] of saved)
      background.set_string(key, value);
  }
}
