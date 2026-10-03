import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {LuftApp, sleep, waitFor} from './luftApp.js';

const LOADING = 800;
const CHECKS = 'com.lantharos.KestrelChecks';
const AT = {
  unmount: [409, 253], mount: [332, 253], format: [501, 253], more: [566, 253], erase: [660, 507],
  saveImage: [440, 351], save: [698, 472], done: [990, 166], safelyRemove: [943, 85],
  wdc: [130, 157], seagate: [130, 100], unlock: [334, 249], free: [900, 166], newPartition: [960, 249], create: [690, 560],
  quickTest: [860, 640], firstDrive: [560, 338], next: [686, 465], write: [666, 419],
};

function systemCalls() {
  const bus = Gio.DBusConnection.new_for_address_sync(GLib.getenv('KESTREL_SYSTEM_BUS'),
    Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
  return () => bus.call_sync(CHECKS, '/com/lantharos/KestrelChecks', `${CHECKS}.Calls`, 'Take', null,
    new GLib.VariantType('(as)'), Gio.DBusCallFlags.NONE, -1, null).deep_unpack()[0];
}

class Driver {
  constructor(app, {pointer, output}) {
    this.app = app;
    this.pointer = pointer;
    this.keyboard = global.stage.context.get_backend().get_default_seat().create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE);
    this.output = output;
    this.takeCalls = systemCalls();
    this.takeCalls();
  }

  async click(name) {
    const [x, y] = AT[name];
    const frame = this.app.window.get_frame_rect();
    this.pointer.notify_absolute_motion(GLib.get_monotonic_time(), frame.x + x, frame.y + y);
    this.pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
    this.pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
    return this.shown(name);
  }

  async type(text) {
    for (const character of text) {
      this.keyboard.notify_keyval(GLib.get_monotonic_time(), character.codePointAt(0), Clutter.KeyState.PRESSED);
      this.keyboard.notify_keyval(GLib.get_monotonic_time(), character.codePointAt(0), Clutter.KeyState.RELEASED);
    }
  }

  async key(keyval) {
    this.keyboard.notify_keyval(GLib.get_monotonic_time(), keyval, Clutter.KeyState.PRESSED);
    this.keyboard.notify_keyval(GLib.get_monotonic_time(), keyval, Clutter.KeyState.RELEASED);
    await sleep(LOADING / 2);
  }

  async scroll(steps) {
    const frame = this.app.window.get_frame_rect();
    this.pointer.notify_absolute_motion(GLib.get_monotonic_time(), frame.x + frame.width * 0.6, frame.y + frame.height / 2);
    for (let step = 0; step < steps; step++)
      this.pointer.notify_discrete_scroll(GLib.get_monotonic_time(), Clutter.ScrollDirection.DOWN, Clutter.ScrollSource.WHEEL);
    return this.shown('scrolled');
  }

  async shown(name) {
    await sleep(LOADING);
    const frame = await this.app.settle(() => true);
    frame.save(`${this.output}/disks-step-${name}.png`);
    return frame;
  }

  async called(expected, describe) {
    let seen = [];
    await waitFor(() => {
      seen = [...seen, ...this.takeCalls()];
      return expected.every(call => seen.includes(call));
    }, 5000, () => `${describe}: expected ${expected.join(', ')}, saw ${seen.join(', ') || 'nothing'}`);
    return seen;
  }
}

const read = path => GLib.file_get_contents(path)[1];
const same = (a, b) => a.length === b.length && a.every((value, index) => value === b[index]);

async function checkRemovable(driver, {require, output}) {
  const {app} = driver;
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

  const format = await driver.click('format');
  format.save(`${output}/disks-format-dark.png`);
  await driver.click('erase');
  require(await driver.called(['udisks Unmount /dev/sdb1', 'udisks Format /dev/sdb1 exfat label=TRAVEL'], 'formatting'),
    'formatting unmounts the partition first and keeps its name');

  await driver.click('safelyRemove');
  require(await driver.called(['udisks PowerOff SanDisk_Ultra'], 'removing'), 'safely removing powers the USB drive off');
  return image;
}

async function checkEncrypted(driver, {require, output}) {
  await driver.click('wdc');
  await driver.click('unlock');
  await driver.type('correct horse');
  await driver.key(Clutter.KEY_Return);
  require(await driver.called(['udisks Unlock /dev/sda1'], 'unlocking'), 'disks unlocks an encrypted partition with its passphrase');
  (await driver.shown('unlocked')).save(`${output}/disks-unlocked-dark.png`);

  await driver.click('free');
  const create = await driver.click('newPartition');
  create.save(`${output}/disks-new-partition-dark.png`);
  await driver.click('create');
  require(await driver.called(['udisks CreatePartitionAndFormat /dev/sda ext4 size=0'], 'creating'), 'disks fills free space with a new ext4 partition');
}

async function checkHealth(driver, {require, output}) {
  await driver.click('seagate');
  const health = await driver.scroll(10);
  health.save(`${output}/disks-health-dark.png`);
  await driver.click('quickTest');
  require(await driver.called(['udisks SelftestStart short Seagate_Barracuda'], 'testing'), 'disks starts a quick self-test on a failing drive');
}

async function checkWriteImage(image, {styles, require, output, pointer}) {
  const app = new LuftApp('disks', [image]);
  try {
    await app.open();
    const driver = new Driver(app, {pointer, output});
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

export async function checkDisks(context) {
  const {styles, output} = context;
  styles.interface.set_string('color-scheme', 'prefer-dark');
  const app = new LuftApp('disks', [`file:///run/media/${GLib.get_user_name()}/TRAVEL`]);
  let image;
  try {
    await app.open();
    const driver = new Driver(app, context);
    (await driver.shown('opened')).save(`${output}/disks-dark.png`);
    image = await checkRemovable(driver, context);
    await checkEncrypted(driver, context);
    await checkHealth(driver, context);
  } finally {
    await app.close();
  }
  await checkWriteImage(image, context);
}
