import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {LuftApp} from '../../lib/apps/luftApp.js';
import {checks} from '../../lib/check.js';
import {press} from '../../lib/input/input.js';
import {changes} from '../lib/apps.js';
import {write} from '../lib/files.js';

const {eventually} = checks('Luft app');
const TRIPS = {text: 'Trips'};
const COLORS = 8;

type Open = (app: LuftApp, path: string) => Promise<void>;

const lookOf = (path: string) =>
  Gio.File.new_for_path(path).query_info('xattr::luft.look', Gio.FileQueryInfoFlags.NONE, null).get_attribute_string('xattr::luft.look');

async function keys(app: LuftApp, label: string, ...presses: number[][]) {
  await changes(app, label, () => {
    for (const keys of presses) press(...keys);
  });
}

async function chooseLook(app: LuftApp) {
  await changes(app, 'Change icon opens the folder icon dialog', async () => app.click(await app.find({role: 'menuitem', name: 'Change icon…'})));
  (await app.settle(() => true)).save('rover-folder-icon-dialog-dark');
  const tab = [Clutter.KEY_Tab];
  const back = [Clutter.KEY_Shift_L, Clutter.KEY_Tab];
  const space = [Clutter.KEY_space];
  await keys(app, 'the folder icon dialog picks the last icon', back, back, space);
  await keys(app, 'the folder icon dialog picks the first color swatch', tab, tab, tab, space);
  await keys(app, 'the folder icon dialog picks the last color', ...Array(COLORS).fill(tab), space);
  (await app.settle(() => true)).save('rover-folder-icon-chosen-dark');
  await keys(app, 'Save closes the folder icon dialog', ...Array(COLORS + 1).fill(back), space);
}

export async function checkLooks(app: LuftApp, folder: string, open: Open) {
  const trips = GLib.build_filenamev([folder, 'Trips']);
  GLib.mkdir_with_parents(trips, 0o755);
  write(GLib.build_filenamev([folder, 'Packing.txt']), 'Passport\nCharger\n');
  await open(app, folder);
  await changes(app, 'right-clicking a folder in Rover opens its menu', async () => app.click(await app.find(TRIPS), Clutter.BUTTON_SECONDARY));
  await chooseLook(app);
  await eventually(() => lookOf(trips) === 'lock:pink', 'Rover keeps the chosen icon and color on the folder itself');
  (await app.settle(() => true)).save('rover-folder-icon-list-dark');
}
