import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import {checks} from '../../lib/check.js';
import {type} from '../../lib/input.js';
import {scratch} from '../../lib/processes.js';
import {exists} from '../lib/files.js';

const {require, eventually} = checks('Luft app');
const ARCHIVE = 'archive-luks';
const PASSPHRASE = 'correct horse';
const COPY_TIMEOUT = 10000;

const bytes = path => GLib.file_get_contents(path)[1];
const same = (a, b) => a.length === b.length && a.every((value, index) => value === b[index]);
export const copied = (from, to) => exists(to) && same(bytes(from), bytes(to));

export async function checkRemovable(driver) {
  await driver.click('more');
  await driver.click('unmount');
  await driver.called(['udisks Unmount /dev/sdb1'], 'disks opens on the drive holding a mounted folder and unmounts it');
  await driver.click('mount');
  await driver.called(['udisks Mount /dev/sdb1'], 'disks mounts a partition');

  const candidates = ['Documents/TRAVEL.img', 'TRAVEL.img'].map(name => GLib.build_filenamev([GLib.get_home_dir(), name]));
  candidates.forEach(candidate => GLib.unlink(candidate));
  await driver.click('more');
  (await driver.click('saveImage')).save('disks-save-image-dark');
  await driver.tab();
  await driver.key(Clutter.KEY_Return);
  await driver.called(['udisks OpenForBackup /dev/sdb1'], 'disks opens the partition to save it');
  const source = scratch('udisks-fixture', 'sdb1.img');
  let image = null;
  await eventually(() => (image = candidates.find(candidate => copied(source, candidate))), 'disks saves a partition as a disk image byte for byte', COPY_TIMEOUT);
  await driver.click('done');

  await driver.click('more');
  (await driver.click('format')).save('disks-format-dark');
  await driver.tab(1, true);
  await driver.key(Clutter.KEY_Return);
  await driver.called(['udisks Unmount /dev/sdb1', 'udisks Format /dev/sdb1 exfat label=TRAVEL'], 'formatting unmounts the partition first and keeps its name');

  await driver.click('safelyRemove');
  await driver.called(['udisks PowerOff SanDisk_Ultra'], 'safely removing powers the USB drive off');
  return image;
}

export async function checkEncrypted(driver, keyring) {
  await driver.click('wdc');
  await driver.click('unlock');
  await driver.act('disks shows the typed passphrase', () => type(PASSPHRASE));
  await driver.tab(2);
  await driver.key(Clutter.KEY_space);
  await driver.tab(2, true);
  await driver.key(Clutter.KEY_Return);
  await driver.called(['udisks Unlock /dev/sda1'], 'disks unlocks an encrypted partition with its passphrase');
  require(keyring.items.some(item => item.attributes['gvfs-luks-uuid'] === ARCHIVE && item.secret === PASSPHRASE),
    'disks remembers the passphrase where the desktop looks when the drive is plugged in');

  await driver.click('more');
  await driver.click('lock');
  await driver.called(['udisks Lock /dev/sda1'], 'disks locks an encrypted partition');
  keyring.forget();
  keyring.store({'gvfs-luks-uuid': ARCHIVE}, 'Encryption passphrase for Archive', PASSPHRASE);
  (await driver.click('unlock')).save('disks-unlocked-dark');
  await driver.called(['udisks Unlock /dev/sda1'], 'disks unlocks with a passphrase the desktop remembered');

  (await driver.click('newPartition')).save('disks-new-partition-dark');
  await driver.key(Clutter.KEY_Return);
  await driver.called(['udisks CreatePartitionAndFormat /dev/sda ext4 size=0'], 'disks fills free space with a new ext4 partition');
}

export async function checkHealth(driver) {
  await driver.click('seagate');
  (await driver.click('health')).save('disks-health-dark');
  await driver.tab(2, true);
  await driver.key(Clutter.KEY_Return);
  await driver.called(['udisks SelftestStart short Seagate_Barracuda'], 'disks starts a quick self-test on a failing drive');
}

export async function checkEncryption(driver) {
  await driver.click('seagate');
  await driver.click('more');
  (await driver.click('turnOn')).save('disks-encrypt-dark');
  for (const step of ['checked', 'saved', 'keySaved', 'unlocking']) await driver.click(step);
  await driver.click('encrypt');
  await driver.called(['Check /dev/sdc1', 'Encrypt /dev/sdc1 auto=true passphrase=false'], 'disks encrypts a partition in place, unlocking automatically on this computer');
  (await driver.app.settle(() => true)).save('disks-encrypting-dark');

  await driver.click('wdc');
  await driver.click('more');
  (await driver.click('encryption')).save('disks-encryption-dark');
  await driver.tab();
  await driver.key(Clutter.KEY_space);
  await driver.called(['SetUpUnlocking /dev/sda1 auto=true recovery=false'], 'disks lets an encrypted drive unlock automatically on this computer');
}
