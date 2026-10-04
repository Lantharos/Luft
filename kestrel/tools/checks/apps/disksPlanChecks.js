import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {Driver} from './disksDriver.js';
import {remove, trashed, writeSpaceFixture} from './disksSpaceFixture.js';
import {LuftApp, waitFor} from './luftApp.js';

const AT = {
  efi: [400, 219], boot: [400, 275], fedora: [400, 331], lab: [130, 205], projects: [400, 387],
  largest: [1009, 467], trash: [860, 565],
  more: [1025, 86], editPartitions: [876, 183], barProjects: [460, 118], barScratch: [598, 118], barRaw: [657, 118], barFree: [900, 118],
  deleteProjects: [660, 198], undo: [766, 30], deleteScratch: [767, 198], exact: [803, 243], settings: [861, 198],
  apply: [924, 30], confirmApply: [766, 482],
};
const DONE_X = 744;
const SPACE_BUTTON = [290, 450];
const ACCENT_TOLERANCE = 24;
const CONTROL_TOLERANCE = 4;
const BUTTON_PIXELS = 12;
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

function spaceButtonAt(frame, palette) {
  const y = actionsRow(frame, palette.primary);
  if (y === null) throw new Error('Kestrel Luft app check failed: the details dialog has no Done button');
  let control = 0;
  for (let x = SPACE_BUTTON[0]; x < SPACE_BUTTON[1]; x += 2) if (frame.near(x, y, palette.surfaceContainerHigh, CONTROL_TOLERANCE)) control++;
  return control >= BUTTON_PIXELS ? y : null;
}

async function details(driver, name, palette) {
  const frame = await driver.click(name);
  return spaceButtonAt(frame, palette.dark);
}

async function trashLargest(driver, folder, name) {
  const before = trashed(name);
  await driver.click('largest');
  await driver.click('trash');
  await driver.tab(1, true);
  await driver.key(Clutter.KEY_Return);
  await waitFor(() => !GLib.file_test(GLib.build_filenamev([folder, name]), GLib.FileTest.EXISTS) && trashed(name) === before + 1, 5000,
    () => `${name} never reached the trash`);
}

async function checkSpaceFromDisks(driver, {palette, require, output}) {
  for (const name of ['efi', 'boot']) {
    require(await details(driver, name, palette) === null, `disks doesn't offer to measure the ${name === 'efi' ? 'EFI system partition' : 'small /boot partition'}`);
    await driver.key(Clutter.KEY_Escape);
  }
  require(await details(driver, 'fedora', palette) !== null, 'disks offers to measure the partition the system runs from');
  await driver.key(Clutter.KEY_Escape);

  const root = writeSpaceFixture();
  try {
    await driver.click('lab');
    const button = await details(driver, 'projects', palette);
    require(button !== null, 'disks offers to measure a mounted data partition');
    driver.press([SPACE_BUTTON[0] + 40, button]);
    (await driver.shown('space-from-details')).save(`${output}/disks-space-from-details-dark.png`);
    await trashLargest(driver, root, 'Videos');
    require(true, 'see what’s using space from a partition’s details measures it and trashes its largest folder');

    const music = GLib.build_filenamev([root, 'Music']);
    const forwarded = new LuftApp('disks', [`disks-space://${music}`]);
    await forwarded.finished(10000);
    (await driver.shown('space-forwarded')).save(`${output}/disks-space-forwarded-dark.png`);
    await trashLargest(driver, music, 'album');
    require(true, 'a disks-space link opened while disks runs, as Rover and the low space notice do, measures that folder');
  } finally {
    remove(Gio.File.new_for_path(root));
  }
}

function inOrder(seen, expected) {
  const relevant = seen.filter(call => expected.includes(call));
  return relevant.length === expected.length && relevant.every((call, index) => call === expected[index]);
}

async function checkDiskPlan(driver, {styles, require, output}) {
  await driver.click('lab');
  await driver.click('more');
  await driver.click('editPartitions');
  await driver.click('barProjects');
  await driver.click('deleteProjects');
  await driver.click('undo');
  await driver.click('barScratch');
  await driver.click('deleteScratch');
  await driver.click('barRaw');
  await driver.click('exact');
  await driver.tab(3, true);
  await driver.enter('before', '0');
  await driver.tab();
  await driver.enter('size', '512');
  await driver.click('barFree');
  await driver.tab();
  await driver.key(Clutter.KEY_Return);
  await driver.enter('newSize', '1024');
  await driver.tab(4);
  await driver.enter('name', 'data');
  await driver.click('settings');
  await driver.tab();
  (await driver.enter('partitionName', 'lab-data')).save(`${output}/disks-editor-dark.png`);
  await driver.key(Clutter.KEY_Escape);
  (await driver.click('apply')).save(`${output}/disks-editor-apply-dark.png`);
  driver.takeCalls();
  await driver.click('confirmApply');
  const seen = await driver.called(PLAN, 'applying the plan', 15000);
  require(inOrder(seen, PLAN) && !seen.some(call => call.includes('/dev/sdd4')),
    `the queued plan becomes the right UDisks calls in order, without the undone delete: ${seen.join(', ')}`);
  (await driver.shown('applied')).save(`${output}/disks-editor-applied-dark.png`);

  styles.interface.set_string('color-scheme', 'prefer-light');
  (await driver.shown('applied-light')).save(`${output}/disks-editor-applied-light.png`);
  (await driver.click('barProjects')).save(`${output}/disks-editor-light.png`);
  styles.interface.set_string('color-scheme', 'prefer-dark');
}

export async function checkDiskEditing(context) {
  context.styles.interface.set_string('color-scheme', 'prefer-dark');
  const app = new LuftApp('disks');
  try {
    await app.open();
    const driver = new Driver(app, context, AT);
    await driver.shown('editing');
    await checkSpaceFromDisks(driver, context);
    await checkDiskPlan(driver, context);
  } finally {
    await app.close();
  }
}
