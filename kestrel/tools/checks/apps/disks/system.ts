import GLib from 'gi://GLib';

import {SYSTEM_FOLDER} from '../../../fixtures/system/devices/udisks/drives.js';
import {checks} from '../../lib/check.js';
import type {Point} from '../../lib/input/input.js';
import {removeTree, write} from '../lib/files.js';
import type {Palette} from '../lib/palette.js';
import type {Driver} from './driver.js';
import {details} from './editing.js';
import {writeSpace} from './space.js';

const {require} = checks('Luft app');
const SPACE_BUTTON_X = 605;
const LUFT_ROW: Point = [600, 467];
const FILES_ROW: Point = [600, 563];
const PARTS = {x: 292, y: 60, width: 750, height: 630};

export const LUFT_ROOT = {LUFT_SYSTEM_ROOT: SYSTEM_FOLDER};

export async function checkSystemVolume(driver: Driver, palette: Palette) {
  const state = GLib.build_filenamev([SYSTEM_FOLDER, 'var']);
  const home = writeSpace(GLib.build_filenamev([state, 'home', GLib.get_user_name()]));
  const apps = GLib.build_filenamev([state, 'lib', 'flatpak']);
  write(GLib.build_filenamev([apps, 'app', 'org.example.Notes', 'files', 'notes']), new Uint8Array(16 << 20).fill(1));
  try {
    await driver.click('micron');
    const button = require(await details(driver, 'systemVolume', palette), 'disks offers to measure the drive Luft runs from');
    (await driver.app.settle(() => true)).save('disks-system-volume-dark');
    (await driver.act('disks measures Luft’s drive by its parts', () => driver.app.click([SPACE_BUTTON_X, button]))).save('disks-luft-space-dark');
    const parts = await driver.app.frame(driver.app.area(PARTS));
    driver.app.click(LUFT_ROW);
    require((await driver.app.settle(() => true, driver.app.area(PARTS))).looksLike(parts), 'Luft itself is shown with its size and doesn’t open a system folder');
    (await driver.act('your files open to the home folders', () => driver.app.click(FILES_ROW))).save('disks-luft-space-files-dark');
  } finally {
    removeTree(home);
    removeTree(apps);
  }
}
