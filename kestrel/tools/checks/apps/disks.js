import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import {ScratchKeyring} from '../../fixtures/services/secretService.js';
import {checks} from '../lib/check.js';
import {scratch} from '../lib/processes.js';
import {withApp} from './lib/apps.js';
import {exists, removeTree} from './lib/files.js';
import {checkPalette, showDark, withPalette} from './lib/palette.js';
import {Driver} from './disks/driver.js';
import {checkEncrypted, checkEncryption, checkHealth, checkRemovable, copied} from './disks/drives.js';
import {checkEditing} from './disks/editing.js';
import {trashed, writeSpace} from './disks/space.js';

const {require, eventually} = checks('Luft app');
const COPY_TIMEOUT = 10000;

async function withDriver(args, use) {
  return withApp('disks', args, async app => {
    const driver = new Driver(app);
    try {
      await driver.take();
      return await use(driver);
    } finally {
      driver.close();
    }
  });
}

async function checkDrives() {
  const keyring = new ScratchKeyring();
  require(await keyring.own(), 'a scratch keyring stands in for the Secret Service');
  try {
    return await withDriver([`file:///run/media/${GLib.get_user_name()}/TRAVEL`], async driver => {
      (await driver.app.settle(() => true)).save('disks-dark');
      const image = await checkRemovable(driver);
      await checkEncrypted(driver, keyring);
      await checkHealth(driver);
      await checkEncryption(driver);
      return image;
    });
  } finally {
    keyring.close();
  }
}

async function checkWriteImage(image) {
  await withDriver([image], async driver => {
    (await driver.app.settle(() => true)).save('disks-write-image-dark');
    for (const step of ['firstDrive', 'next', 'write']) await driver.click(step);
    await driver.called(['udisks OpenForRestore /dev/sdc'], 'disks opens the drive to write the image');
    await eventually(() => copied(image, scratch('udisks-fixture', 'sdc.img')), 'opening a disk image with disks writes it to the chosen drive', COPY_TIMEOUT);
  });
  GLib.unlink(image);
}

async function checkSpace() {
  const root = writeSpace();
  const before = trashed('Videos');
  try {
    await withDriver([`disks-space://${root}`], async driver => {
      (await driver.app.settle(() => true)).save('disks-space-dark');
      await driver.click('largest');
      await driver.click('trash');
      await driver.tab(1, true);
      await driver.key(Clutter.KEY_Return);
      await eventually(() => !exists(GLib.build_filenamev([root, 'Videos'])) && trashed('Videos') === before + 1,
        'disks measures a folder and moves its largest folder to the trash');
      (await driver.app.settle(() => true)).save('disks-space-trashed-dark');
    });
  } finally {
    removeTree(root);
  }
}

export async function run() {
  await withPalette(async palette => {
    await withDriver([], async driver => {
      await checkPalette(driver.app, palette);
      await showDark(driver.app, palette);
      await checkEditing(driver, palette);
    });
    await checkWriteImage(await checkDrives());
    await checkSpace();
  });
}
