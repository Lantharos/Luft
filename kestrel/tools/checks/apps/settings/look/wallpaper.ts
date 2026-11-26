import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import type {LuftApp} from '../../../lib/apps/luftApp.js';
import {checks} from '../../../lib/check.js';
import {middle} from '../../../lib/apps/probe.js';
import {drag, moveTo} from '../../../lib/input/input.js';
import {repository} from '../../../lib/processes.js';
import {capture} from '../../../lib/screenshots.js';
import {show} from '../navigation.js';

const {eventually} = checks('Luft app');
const DRAG = 60;
const GROUP = 'Coast';
const FOG_FOCUS = [0.5, 0.768];
const FOG_SHAPE = 5899 / 3933;
const BACKGROUNDS = repository('os', 'image', 'files', 'usr', 'share', 'backgrounds', 'luft');
const FOG = GLib.build_filenamev([BACKGROUNDS, 'Fog.jpg']);
const USER_DIRS = GLib.build_filenamev([GLib.get_user_config_dir(), 'user-dirs.dirs']);

type Focus = [number, number];
type Saved = [Gio.Settings, string, GLib.Variant];

function copyWallpaper(name: string, folder: Gio.File) {
  for (const file of [`${name}.jpg`, `${name}.json`])
    Gio.File.new_for_path(GLib.build_filenamev([BACKGROUNDS, file])).copy(folder.get_child(file), Gio.FileCopyFlags.OVERWRITE, null, null);
  return folder.get_child(`${name}.jpg`);
}

function shareWallpapers() {
  const folder = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_state_dir(), 'luft-home', 'Pictures', 'Wallpapers']));
  GLib.mkdir_with_parents(folder.get_path()!, 0o755);
  GLib.file_set_contents(USER_DIRS, 'XDG_PICTURES_DIR="$HOME/Pictures"\n');
  return {fog: copyWallpaper('Fog', folder).get_uri(), folder};
}

function addGroup(folder: Gio.File) {
  const group = folder.get_child(GROUP);
  group.make_directory(null);
  return copyWallpaper('Dunes', group).get_uri();
}

function remove(folder: Gio.File) {
  for (const file of [`${GROUP}/Dunes.jpg`, `${GROUP}/Dunes.json`, GROUP, 'Fog.jpg', 'Fog.json'].map(name => folder.get_child(name)))
    if (file.query_exists(null)) file.delete(null);
}

export async function checkWallpaper(app: LuftApp) {
  const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});
  const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  const saved = [
    ...['picture-uri', 'picture-uri-dark', 'picture-options'].map((key): Saved => [background, key, background.get_value(key)]),
    ...['wallpaper-focus', 'wallpaper-focus-dark', 'wallpaper-focus-chosen'].map((key): Saved => [kestrel, key, kestrel.get_value(key)]),
  ];
  const focus = () => kestrel.get_value('wallpaper-focus-dark').deepUnpack<Focus>();
  const shared = shareWallpapers();
  try {
    const uri = Gio.File.new_for_path(FOG).get_uri();
    for (const key of ['picture-uri', 'picture-uri-dark']) background.set_string(key, uri);
    background.set_string('picture-options', 'zoom');
    for (const key of ['wallpaper-focus', 'wallpaper-focus-dark']) kestrel.set_value(key, new GLib.Variant('(dd)', [0.5, 0.5]));
    await show(app, 'system/about');
    await show(app, 'appearance/wallpaper');
    const preview = middle(await app.find({role: 'application'}));
    moveTo(app.at(preview));
    (await app.settle(() => true)).save('settings-wallpaper');

    const {width, height} = Main.layoutManager.primaryMonitor!;
    const shape = width / height;
    const axis = shape > FOG_SHAPE ? 1 : 0;
    const [x, y] = preview;
    await drag(app.at(preview), app.at(axis === 1 ? [x, y - DRAG] : [x - DRAG, y]));
    await eventually(() => focus()[axis] > 0.6 && focus()[1 - axis] === 0.5, 'dragging the preview shows another part of the wallpaper');
    const chosen = () => kestrel.get_value('wallpaper-focus-chosen').recursiveUnpack<Record<string, Focus>>()[uri];
    await eventually(() => chosen()?.[axis] === focus()[axis], 'the chosen position is remembered for that wallpaper');
    await capture('settings-wallpaper-moved');

    app.click(await app.find({role: 'button', name: 'Fog'}));
    await eventually(() => background.get_string('picture-uri-dark') === shared.fog && focus().every((value, axis) => value === FOG_FOCUS[axis]),
      'picking a wallpaper uses the focus stored next to it');

    const panel = await app.settle(() => true);
    const dunes = addGroup(shared.folder);
    await app.changes(panel, 'a folder added to the wallpapers folder shows up as a group');
    const grouped = await app.settle(() => true);
    grouped.save('settings-wallpaper-groups');
    app.click(await app.find({role: 'button', name: GROUP}));
    await app.changes(grouped, 'the group opens');
    (await app.settle(() => true)).save('settings-wallpaper-group');
    app.click(await app.find({role: 'button', name: 'Dunes'}));
    await eventually(() => background.get_string('picture-uri-dark') === dunes, 'picking a wallpaper from a group sets it');
  } finally {
    for (const [settings, key, value] of saved) settings.set_value(key, value);
    remove(shared.folder);
    GLib.unlink(USER_DIRS);
  }
}
