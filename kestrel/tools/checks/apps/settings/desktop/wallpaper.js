import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {checks} from '../../../lib/check.js';
import {drag, moveTo, scroll} from '../../../lib/input/input.js';
import {repository} from '../../../lib/processes.js';
import {capture} from '../../../lib/screenshots.js';
import {show} from '../navigation.js';

const {eventually} = checks('Luft app');
const SCROLL_POINT = [650, 400];
const SCROLL_STEPS = 3;
const PREVIEW = [655, 330];
const DRAG = 60;
const GRID = {left: 328, top: 430, width: 654, gap: 12};
const FOG_FOCUS = [0.5, 0.768];
const FOG_SHAPE = 5899 / 3933;
const BACKGROUNDS = repository('os', 'image', 'files', 'usr', 'share', 'backgrounds', 'luft');
const FOG = GLib.build_filenamev([BACKGROUNDS, 'Fog.jpg']);
const USER_DIRS = GLib.build_filenamev([GLib.get_user_config_dir(), 'user-dirs.dirs']);

function secondTile(shape) {
  const smallest = Math.round(120 * Math.sqrt(shape));
  const columns = Math.floor((GRID.width + GRID.gap) / (smallest + GRID.gap));
  const width = (GRID.width - GRID.gap * (columns - 1)) / columns;
  return [Math.round(GRID.left + width * 1.5 + GRID.gap), Math.round(GRID.top + width / shape / 2)];
}

function shareWallpapers() {
  const folder = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_state_dir(), 'luft-home', 'Pictures', 'Wallpapers']));
  GLib.mkdir_with_parents(folder.get_path(), 0o755);
  for (const name of ['Fog.jpg', 'Fog.json'])
    Gio.File.new_for_path(GLib.build_filenamev([BACKGROUNDS, name])).copy(folder.get_child(name), Gio.FileCopyFlags.OVERWRITE, null, null);
  GLib.file_set_contents(USER_DIRS, 'XDG_PICTURES_DIR="$HOME/Pictures"\n');
  return folder.get_child('Fog.jpg').get_uri();
}

export async function checkWallpaper(app) {
  const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});
  const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  const saved = [
    ...['picture-uri', 'picture-uri-dark', 'picture-options'].map(key => [background, key, background.get_value(key)]),
    ...['wallpaper-focus', 'wallpaper-focus-dark', 'wallpaper-focus-chosen'].map(key => [kestrel, key, kestrel.get_value(key)]),
  ];
  const focus = () => kestrel.get_value('wallpaper-focus-dark').deepUnpack();
  try {
    const libraryFog = shareWallpapers();
    const uri = Gio.File.new_for_path(FOG).get_uri();
    for (const key of ['picture-uri', 'picture-uri-dark']) background.set_string(key, uri);
    background.set_string('picture-options', 'zoom');
    for (const key of ['wallpaper-focus', 'wallpaper-focus-dark']) kestrel.set_value(key, new GLib.Variant('(dd)', [0.5, 0.5]));
    await show(app, 'system/about');
    const top = await show(app, 'appearance');
    for (let step = 0; step < SCROLL_STEPS; step++) scroll(Clutter.ScrollDirection.DOWN, app.at(SCROLL_POINT));
    await app.settle(frame => !frame.looksLike(top));
    moveTo(app.at(PREVIEW));
    (await app.settle(() => true)).save('settings-wallpaper');

    const {width, height} = Main.layoutManager.primaryMonitor;
    const shape = width / height;
    const axis = shape > FOG_SHAPE ? 1 : 0;
    await drag(app.at(PREVIEW), app.at(PREVIEW.map((value, index) => index === axis ? value - DRAG : value)));
    await eventually(() => focus()[axis] > 0.6 && focus()[1 - axis] === 0.5, 'dragging the preview shows another part of the wallpaper');
    const chosen = () => kestrel.get_value('wallpaper-focus-chosen').recursiveUnpack()[uri];
    await eventually(() => chosen()?.[axis] === focus()[axis], 'the chosen position is remembered for that wallpaper');
    await capture('settings-wallpaper-moved');

    app.click(secondTile(shape));
    await eventually(() => background.get_string('picture-uri-dark') === libraryFog && focus().every((value, axis) => value === FOG_FOCUS[axis]),
      'picking a wallpaper uses the focus stored next to it');
  } finally {
    for (const [settings, key, value] of saved) settings.set_value(key, value);
    GLib.unlink(USER_DIRS);
  }
}
