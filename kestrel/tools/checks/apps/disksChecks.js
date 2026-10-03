import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {ScratchKeyring} from '../../fixtures/services/secretService.js';
import {Driver} from './disksDriver.js';
import {checkDiskEditing} from './disksPlanChecks.js';
import {remove, trashed, writeSpaceFixture} from './disksSpaceFixture.js';
import {LuftApp, waitFor} from './luftApp.js';

const AT = {
  more: [1019, 219], unmount: [900, 357], mount: [965, 219], saveImage: [900, 550], save: [698, 472], done: [1001, 310],
  format: [900, 641], erase: [660, 507], safelyRemove: [943, 85],
  wdc: [130, 157], seagate: [130, 100], unlock: [962, 219], newPartition: [974, 275], create: [692, 574],
  health: [600, 360], quickTest: [327, 496], firstDrive: [560, 308], next: [686, 495], write: [666, 419],
  largest: [1009, 467], trash: [860, 565], confirmTrash: [671, 417],
  turnOn: [885, 448], checked: [755, 458], saved: [292, 457], keySaved: [755, 509], unlocking: [755, 452], encrypt: [759, 458],
  encryption: [885, 499], autoUnlock: [772, 290], remember: [362, 392], confirmUnlock: [692, 444], lock: [900, 300],
};
const ARCHIVE = 'archive-luks';
const PASSPHRASE = 'correct horse';

const read = path => GLib.file_get_contents(path)[1];
const same = (a, b) => a.length === b.length && a.every((value, index) => value === b[index]);

async function checkRemovable(driver, {require, output}) {
  await driver.click('more');
  await driver.click('unmount');
  require(await driver.called(['udisks Unmount /dev/sdb1'], 'unmounting'), 'disks opens on the drive holding a mounted folder and unmounts it');
  await driver.click('mount');
  require(await driver.called(['udisks Mount /dev/sdb1'], 'mounting'), 'disks mounts a partition');

  const home = GLib.build_filenamev([GLib.get_user_state_dir(), 'luft-home']);
  const candidates = [GLib.build_filenamev([home, 'Documents', 'TRAVEL.img']), GLib.build_filenamev([home, 'TRAVEL.img'])];
  candidates.forEach(candidate => GLib.unlink(candidate));
  await driver.click('more');
  const dialog = await driver.click('saveImage');
  dialog.save(`${output}/disks-save-image-dark.png`);
  await driver.click('save');
  await driver.called(['udisks OpenForBackup /dev/sdb1'], 'saving an image');
  const source = GLib.build_filenamev([GLib.get_user_cache_dir(), 'udisks-fixture', 'sdb1.img']);
  let image = null;
  await waitFor(() => {
    image = candidates.find(candidate => GLib.file_test(candidate, GLib.FileTest.EXISTS));
    return image && same(read(image), read(source));
  }, 10000, () => 'the disk image never matched the partition');
  require(true, 'disks saves a partition as a disk image byte for byte');
  await driver.click('done');

  await driver.click('more');
  const format = await driver.click('format');
  format.save(`${output}/disks-format-dark.png`);
  await driver.click('erase');
  require(await driver.called(['udisks Unmount /dev/sdb1', 'udisks Format /dev/sdb1 exfat label=TRAVEL'], 'formatting'),
    'formatting unmounts the partition first and keeps its name');

  await driver.click('safelyRemove');
  require(await driver.called(['udisks PowerOff SanDisk_Ultra'], 'removing'), 'safely removing powers the USB drive off');
  return image;
}

async function checkEncrypted(driver, keyring, {require, output}) {
  await driver.click('wdc');
  await driver.click('unlock');
  await driver.type(PASSPHRASE);
  await driver.click('remember');
  await driver.click('confirmUnlock');
  require(await driver.called(['udisks Unlock /dev/sda1'], 'unlocking'), 'disks unlocks an encrypted partition with its passphrase');
  require(keyring.items.some(item => item.attributes['gvfs-luks-uuid'] === ARCHIVE && item.secret === PASSPHRASE),
    'disks remembers the passphrase where the desktop looks when the drive is plugged in');

  await driver.click('more');
  await driver.click('lock');
  require(await driver.called(['udisks Lock /dev/sda1'], 'locking'), 'disks locks an encrypted partition');
  keyring.forget();
  keyring.store({'gvfs-luks-uuid': ARCHIVE}, 'Encryption passphrase for Archive', PASSPHRASE);
  await driver.click('unlock');
  require(await driver.called(['udisks Unlock /dev/sda1'], 'unlocking again'), 'disks unlocks with a passphrase the desktop remembered');
  (await driver.shown('unlocked')).save(`${output}/disks-unlocked-dark.png`);

  const create = await driver.click('newPartition');
  create.save(`${output}/disks-new-partition-dark.png`);
  await driver.click('create');
  require(await driver.called(['udisks CreatePartitionAndFormat /dev/sda ext4 size=0'], 'creating'), 'disks fills free space with a new ext4 partition');
}

async function checkHealth(driver, {require, output}) {
  await driver.click('seagate');
  const health = await driver.click('health');
  health.save(`${output}/disks-health-dark.png`);
  await driver.click('quickTest');
  require(await driver.called(['udisks SelftestStart short Seagate_Barracuda'], 'testing'), 'disks starts a quick self-test on a failing drive');
}

async function checkEncryption(driver, {require, output}) {
  await driver.click('seagate');
  await driver.click('more');
  (await driver.click('turnOn')).save(`${output}/disks-encrypt-dark.png`);
  await driver.click('checked');
  await driver.click('saved');
  await driver.click('keySaved');
  await driver.click('unlocking');
  await driver.click('encrypt');
  require(await driver.called(['Check /dev/sdc1', 'Encrypt /dev/sdc1 auto=true passphrase=false'], 'encrypting'),
    'disks encrypts a partition in place, unlocking automatically on this computer');
  (await driver.shown('encrypting')).save(`${output}/disks-encrypting-dark.png`);

  await driver.click('wdc');
  await driver.click('more');
  (await driver.click('encryption')).save(`${output}/disks-encryption-dark.png`);
  await driver.click('autoUnlock');
  require(await driver.called(['SetUpUnlocking /dev/sda1 auto=true recovery=false'], 'unlocking automatically'),
    'disks lets an encrypted drive unlock automatically on this computer');
}

async function checkWriteImage(image, {styles, require, output, pointer}) {
  const app = new LuftApp('disks', [image]);
  try {
    await app.open();
    const driver = new Driver(app, {pointer, output}, AT);
    (await driver.shown('write-image')).save(`${output}/disks-write-image-dark.png`);
    await driver.click('firstDrive');
    await driver.click('next');
    await driver.click('write');
    await driver.called(['udisks OpenForRestore /dev/sdc'], 'writing an image');
    const target = GLib.build_filenamev([GLib.get_user_cache_dir(), 'udisks-fixture', 'sdc.img']);
    await waitFor(() => GLib.file_test(target, GLib.FileTest.EXISTS) && same(read(target), read(image)), 10000, () => 'the drive never matched the image');
    require(true, 'opening a disk image with disks writes it to the chosen drive');
    styles.interface.set_string('color-scheme', 'prefer-light');
    (await driver.shown('light')).save(`${output}/disks-light.png`);
  } finally {
    await app.close();
  }
}

async function checkSpace({styles, require, output, pointer}) {
  styles.interface.set_string('color-scheme', 'prefer-dark');
  const root = writeSpaceFixture();
  const videos = GLib.build_filenamev([root, 'Videos']);
  const before = trashed('Videos');
  const app = new LuftApp('disks', [`disks-space://${root}`]);
  try {
    await app.open();
    const driver = new Driver(app, {pointer, output}, AT);
    (await driver.shown('space')).save(`${output}/disks-space-dark.png`);
    await driver.click('largest');
    await driver.click('trash');
    await driver.click('confirmTrash');
    await waitFor(() => !GLib.file_test(videos, GLib.FileTest.EXISTS) && trashed('Videos') === before + 1, 5000,
      () => 'the largest folder never reached the trash');
    require(true, 'disks measures a folder and moves its largest folder to the trash');
    (await driver.shown('space-trashed')).save(`${output}/disks-space-trashed-dark.png`);
  } finally {
    await app.close();
    remove(Gio.File.new_for_path(root));
  }
}

export async function checkDisks(context) {
  const {styles, output} = context;
  styles.interface.set_string('color-scheme', 'prefer-dark');
  const keyring = new ScratchKeyring();
  context.require(await keyring.own(), 'a scratch keyring stands in for the Secret Service');
  const app = new LuftApp('disks', [`file:///run/media/${GLib.get_user_name()}/TRAVEL`]);
  let image;
  try {
    await app.open();
    const driver = new Driver(app, context, AT);
    (await driver.shown('opened')).save(`${output}/disks-dark.png`);
    image = await checkRemovable(driver, context);
    await checkEncrypted(driver, keyring, context);
    await checkHealth(driver, context);
    await checkEncryption(driver, context);
  } finally {
    await app.close();
    keyring.close();
  }
  await checkWriteImage(image, context);
  await checkDiskEditing(context);
  await checkSpace(context);
}
