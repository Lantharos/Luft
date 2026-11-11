import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import type {LuftApp} from '../../lib/apps/luftApp.js';
import {checks} from '../../lib/check.js';
import {drag, press, type, type Point} from '../../lib/input/input.js';
import {changes} from '../lib/apps.js';
import {exists, write} from '../lib/files.js';

const {require, eventually} = checks('Luft app');
const DRAG = {steps: 24, interval: 30, hover: 300};
const FILE: Point = [338, 140];
const FOLDER: Point = [330, 104];
const NAME_START: Point = [312, 140];
const NAME_END: Point = [600, 140];

const path = (...parts: string[]) => GLib.build_filenamev(parts);

export async function checkRename(app: LuftApp, folder: string, open: (app: LuftApp, path: string) => Promise<void>) {
  write(path(folder, 'Draft.txt'), 'Pack the charger\n');
  GLib.mkdir_with_parents(path(folder, 'Inbox'), 0o755);
  await open(app, folder);
  await changes(app, 'Rover selects a file', () => app.click(FILE));
  await changes(app, 'F2 lets Rover rename the file', () => press(Clutter.KEY_F2));
  press(Clutter.KEY_Home);
  await drag(app.at(NAME_START), app.at(NAME_END), DRAG);
  (await app.settle(() => true)).save('rover-rename-selection-dark');
  type('Report');
  press(Clutter.KEY_Return);
  await eventually(() => exists(path(folder, 'Report')), 'dragging across the name while renaming selects it for typing over');
  require(!exists(path(folder, 'Draft.txt')) && !exists(path(folder, 'ReportDraft.txt')), 'dragging inside the rename field does not start a file drag');
  await drag(app.at(FILE), app.at(FOLDER), DRAG);
  await eventually(() => exists(path(folder, 'Inbox', 'Report')), 'a file can be dragged again once its rename is done');
}
