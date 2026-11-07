import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import type {LuftApp} from '../../lib/apps/luftApp.js';
import {checks} from '../../lib/check.js';
import type {Point} from '../../lib/input/input.js';
import {changes} from '../lib/apps.js';
import {repository} from '../../lib/processes.js';
import {exists, read} from '../lib/files.js';

const {eventually} = checks('Luft app');
const HOME: Point = [70, 82];
const DOCUMENTS: Point = [70, 156];
const MENU_ITEM = 38;
const MENU_TOP = 25;
const SEPARATOR = 9;
const SETTINGS = GLib.build_filenamev([GLib.get_user_config_dir(), 'rover', 'settings.json']);
const DOCUMENTS_PATH = GLib.build_filenamev([GLib.get_home_dir(), 'Documents']);

export const menuItem = ([x, y]: Point, index: number, separators = 0): Point => [x + 70, y + MENU_TOP + index * MENU_ITEM + separators * SEPARATOR];

const USER_DIRS = GLib.build_filenamev([GLib.get_user_config_dir(), 'user-dirs.dirs']);

/** Gives the session the folders a new Luft account gets, from the image's defaults, which Rover reads as it starts. */
export async function withUserFolders(run: () => Promise<void>) {
  const defaults = read(repository('os/image/files/etc/xdg', 'user-dirs.defaults')).trim().split('\n');
  GLib.file_set_contents(USER_DIRS, defaults.map(line => {
    const [name, folder] = line.split('=');
    return `XDG_${name}_DIR="$HOME/${folder}"\n`;
  }).join(''));
  try {
    await run();
  } finally {
    GLib.unlink(USER_DIRS);
  }
}

const hiddenPlaces = (): string[] => exists(SETTINGS) ? JSON.parse(read(SETTINGS)).hiddenPlaces ?? [] : [];

export async function checkPlaces(app: LuftApp) {
  await changes(app, "right-clicking Documents in Rover's sidebar opens its menu", () => app.click(DOCUMENTS, Clutter.BUTTON_SECONDARY));
  await changes(app, 'Rover takes Documents out of the sidebar', () => app.click(menuItem(DOCUMENTS, 2)));
  await eventually(() => hiddenPlaces().includes(DOCUMENTS_PATH), 'Rover remembers that Documents left the sidebar');

  await changes(app, "right-clicking Home in Rover's sidebar opens its menu", () => app.click(HOME, Clutter.BUTTON_SECONDARY));
  (await app.settle(() => true)).save('rover-sidebar-restore-dark');
  await changes(app, 'Rover puts Documents back in its place', () => app.click(menuItem(HOME, 4, 1)));
  await eventually(() => !hiddenPlaces().includes(DOCUMENTS_PATH), 'Rover remembers that Documents is back in the sidebar');
  (await app.settle(() => true)).save('rover-sidebar-restored-dark');
}
