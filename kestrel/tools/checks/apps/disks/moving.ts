import {squareCorners} from '../lib/corners.js';
import {saveBothStyles, type Palette} from '../lib/palette.js';
import type {Driver} from './driver.js';

async function saveLooks(driver: Driver, palette: Palette, name: string) {
  await saveBothStyles(driver.app, palette, name);
  await squareCorners(async () => (await driver.app.settle(() => true)).save(`${name}-square`));
}

export async function checkMoveLuft(driver: Driver, palette: Palette) {
  await driver.click('seagate');
  await driver.click('samsung');
  await driver.click('moreDrive');
  await driver.click('moveLuft');
  await saveLooks(driver, palette, 'disks-move-drive');
  await driver.click('moveToSeagate');
  await driver.click('moveOn');
  await saveLooks(driver, palette, 'disks-move-place');
  await driver.click('placeErase');
  await driver.click('placeOn');
  await saveLooks(driver, palette, 'disks-move-erase');
  await driver.click('eraseBack');
  await driver.click('placeFree');
  await saveLooks(driver, palette, 'disks-move-size');
  await driver.click('sizeOn');
  await saveLooks(driver, palette, 'disks-move-confirm');
  await driver.click('moveIt');
  await driver.called(['MoveSystem /org/freedesktop/UDisks2/drives/Seagate_Barracuda'], 'disks asks trustd to move Luft into the free space');
  await saveLooks(driver, palette, 'disks-move-waiting');
  await driver.click('callOff');
  await driver.called(['CancelSystemMove'], 'disks calls off the move');
}
