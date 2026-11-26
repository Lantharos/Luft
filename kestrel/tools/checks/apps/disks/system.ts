import GLib from 'gi://GLib';

import {SYSTEM_FOLDER} from '../../../fixtures/system/devices/udisks/drives.js';
import {checks} from '../../lib/check.js';
import {middle} from '../../lib/apps/probe.js';
import {moveTo} from '../../lib/input/input.js';
import {removeTree, write} from '../lib/files.js';
import type {Driver} from './driver.js';
import {details} from './editing.js';
import {writeSpace} from './space.js';

const {require} = checks('Luft app');
const PARTS = {x: 292, y: 76, width: 750, height: 370};

export const LUFT_ROOT = {LUFT_SYSTEM_ROOT: SYSTEM_FOLDER};

export async function checkSystemVolume(driver: Driver) {
  const state = GLib.build_filenamev([SYSTEM_FOLDER, 'var']);
  const home = writeSpace(GLib.build_filenamev([state, 'home', GLib.get_user_name()]));
  const apps = GLib.build_filenamev([state, 'lib', 'flatpak']);
  write(GLib.build_filenamev([apps, 'app', 'org.example.Notes', 'files', 'notes']), new Uint8Array(16 << 20).fill(1));
  try {
    await driver.click('micron');
    const button = require(await details(driver, 'systemVolume'), 'disks offers to measure the drive Luft runs from');
    (await driver.app.settle(() => true)).save('disks-system-volume-dark');
    (await driver.act('disks measures Luft’s drive by its parts', () => driver.app.click(button))).save('disks-luft-space-dark');
    const luft = await driver.app.find({text: 'The version running now'});
    moveTo(driver.app.at(middle(luft)));
    const parts = await driver.app.settle(() => true, driver.app.area(PARTS));
    driver.app.click(luft);
    require((await driver.app.settle(() => true, driver.app.area(PARTS))).looksLike(parts), 'Luft itself is shown with its size and doesn’t open a system folder');
    (await driver.act('your files open to the home folders', async () => driver.app.click(await driver.app.find({text: 'Your files'})))).save('disks-luft-space-files-dark');
  } finally {
    removeTree(home);
    removeTree(apps);
  }
}
