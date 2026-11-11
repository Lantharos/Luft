
import {SYSTEM_MOUNTS} from '../../../fixtures/system/devices/udisks/drives.js';
import {checks} from '../../lib/check.js';
import {removeTree} from '../lib/files.js';
import type {Palette} from '../lib/palette.js';
import type {Driver} from './driver.js';
import {details, trashLargest} from './editing.js';
import {writeSpace} from './space.js';

const {require} = checks('Luft app');
const SPACE_BUTTON_X = 605;

export async function checkSystemVolume(driver: Driver, palette: Palette) {
  const [, sysroot] = SYSTEM_MOUNTS;
  const root = writeSpace(sysroot);
  try {
    await driver.click('micron');
    const button = require(await details(driver, 'systemVolume', palette), 'disks offers to measure a volume mounted in several places');
    (await driver.app.settle(() => true)).save('disks-system-volume-dark');
    await driver.act('disks measures the volume', () => driver.app.click([SPACE_BUTTON_X, button]));
    await trashLargest(driver, root, 'Videos', 'see what’s using space on a volume mounted in several places measures a mount it can read, not the first one');
  } finally {
    removeTree(root);
  }
}
