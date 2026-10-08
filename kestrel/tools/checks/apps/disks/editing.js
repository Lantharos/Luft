import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import {checks} from '../../lib/check.js';
import {exists, removeTree} from '../lib/files.js';
import {showDark, useScheme} from '../lib/palette.js';
import {followLink} from '../lib/apps.js';
import {trashed, writeSpace} from './space.js';

const {require, eventually} = checks('Luft app');
const DONE_X = 744;
const SPACE_BUTTON = [290, 450];
const ACCENT_TOLERANCE = 24;
const CONTROL_TOLERANCE = 4;
const BUTTON_PIXELS = 12;
const PLAN_TIMEOUT = 15000;
const PLAN = [
  'udisks Delete /dev/sdd5',
  'udisks OpenDevice /dev/sdd rw',
  'udisks Delete /dev/sdd6',
  'udisks CreatePartition /dev/sdd offset=2703228928 size=268435456 type=0fc63daf-8483-4772-8e79-3d69d8477de4 uuid=60000000-0000-4000-8000-003776970752',
  'udisks OpenDevice /dev/sdd5 rw',
  'udisks Rescan /dev/sdd5',
  'udisks Resize /dev/sdd5 536870912',
  'udisks CreatePartitionAndFormat /dev/sdd ext4 size=1073741824 name=lab-data',
];

function actionsRow(frame, accent) {
  const rows = [];
  for (let y = 120; y < 700; y++) if (frame.near(DONE_X, y, accent, ACCENT_TOLERANCE)) rows.push(y);
  return rows.length ? rows[Math.floor(rows.length / 2)] : null;
}

function spaceButtonAt(frame, colors) {
  const y = actionsRow(frame, colors.primary);
  require(y !== null, 'the details dialog has a Done button');
  let control = 0;
  for (let x = SPACE_BUTTON[0]; x < SPACE_BUTTON[1]; x += 2) if (frame.near(x, y, colors.surfaceContainerHigh, CONTROL_TOLERANCE)) control++;
  return control >= BUTTON_PIXELS ? y : null;
}

async function details(driver, name, palette) {
  return spaceButtonAt(await driver.click(name), palette.dark);
}

async function trashLargest(driver, folder, name, label) {
  const before = trashed(name);
  await driver.click('largest');
  await driver.click('trash');
  await driver.tab(1, true);
  await driver.key(Clutter.KEY_Return);
  await eventually(() => !exists(GLib.build_filenamev([folder, name])) && trashed(name) === before + 1, label);
}

async function checkSpaceFromDisks(driver, palette) {
  for (const [name, label] of [['efi', 'EFI system partition'], ['boot', 'small /boot partition']]) {
    require(await details(driver, name, palette) === null, `disks doesn't offer to measure the ${label}`);
    await driver.key(Clutter.KEY_Escape);
  }
  require(await details(driver, 'fedora', palette) !== null, 'disks offers to measure the partition the system runs from');
  await driver.key(Clutter.KEY_Escape);

  const root = writeSpace();
  try {
    await driver.click('lab');
    const button = await details(driver, 'projects', palette);
    require(button !== null, 'disks offers to measure a mounted data partition');
    (await driver.act('disks measures the partition', () => driver.app.click([SPACE_BUTTON[0] + 40, button]))).save('disks-space-from-details-dark');
    await trashLargest(driver, root, 'Videos', 'see what’s using space from a partition’s details measures it and trashes its largest folder');

    const music = GLib.build_filenamev([root, 'Music']);
    (await driver.act('a disks-space link reaches the running disks', () => followLink('disks', `disks-space://${music}`))).save('disks-space-forwarded-dark');
    await trashLargest(driver, music, 'album', 'a disks-space link opened while disks runs, as Rover and the low space notice do, measures that folder');
  } finally {
    removeTree(root);
  }
}

function inOrder(seen, expected) {
  const relevant = seen.filter(name => expected.includes(name));
  return relevant.length === expected.length && relevant.every((name, index) => name === expected[index]);
}

async function checkPlan(driver, palette) {
  for (const step of ['lab', 'moreDrive', 'editPartitions', 'barProjects', 'deleteProjects', 'undo', 'barScratch', 'deleteScratch', 'barRaw', 'exact'])
    await driver.click(step);
  await driver.tab(3, true);
  await driver.enter('0');
  await driver.tab();
  await driver.enter('512');
  await driver.click('barFree');
  await driver.tab();
  await driver.key(Clutter.KEY_Return);
  await driver.enter('1024');
  await driver.tab(4);
  await driver.enter('data');
  await driver.click('settings');
  await driver.tab();
  (await driver.enter('lab-data')).save('disks-editor-dark');
  await driver.key(Clutter.KEY_Escape);
  (await driver.click('apply')).save('disks-editor-apply-dark');
  await driver.take();
  await driver.click('confirmApply');
  const seen = await driver.called(PLAN, 'applying the plan makes its UDisks calls', PLAN_TIMEOUT);
  require(inOrder(seen, PLAN) && !seen.some(name => name.includes('/dev/sdd4')), 'the queued plan becomes the right UDisks calls in order, without the undone delete');
  (await driver.app.settle(() => true)).save('disks-editor-applied-dark');

  (await driver.act('disks follows the light style', () => useScheme('light'))).save('disks-editor-applied-light');
  (await driver.click('barProjects')).save('disks-editor-light');
  await showDark(driver.app, palette);
}

export async function checkEditing(driver, palette) {
  await checkSpaceFromDisks(driver, palette);
  await checkPlan(driver, palette);
}
