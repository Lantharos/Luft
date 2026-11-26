import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';

import type {LuftApp} from '../../lib/apps/luftApp.js';
import {describe, type Query} from '../../lib/apps/probe.js';
import {checks} from '../../lib/check.js';
import {call} from '../../lib/dbus.js';
import {failureOf} from '../../lib/errors.js';
import {hold, press, release, type} from '../../lib/input/input.js';
import {changes} from '../lib/apps.js';

const {eventually} = checks('Luft app');
const CHECKS = 'com.lantharos.KestrelChecks';

const button = (name: string): Query => ({role: 'button', name});
const item = (name: string): Query => ({role: 'menuitem', name});
const CONTINUE = button('Continue');
const SEAGATE = 'Seagate ST1000DM010 1.1 TB';

export const more = (name: string) => button(`More for ${name}`);

export const AT = {
  unmount: item('Unmount'), mount: button('Mount'), saveImage: item('Save as disk image…'), done: button('Done'),
  format: item('Format…'), safelyRemove: button('Safely remove'), lock: item('Lock'), unlock: button('Unlock'), newPartition: button('New partition'),
  turnOn: item('Turn on encryption…'), encryption: item('Encryption…'), editPartitions: item('Edit partitions…'), moveLuft: item('Move Luft to another drive…'),
  seagate: button(SEAGATE), samsung: button('Samsung SSD 990 PRO 1TB 1.1 TB'), lab: button('Kingston A400 8.6 GB'), micron: button('Micron 7450 PRO 1.1 TB'),
  wdc: button('Western Digital WDC WD20EZRZ 2.1 TB'), crucial: button('Crucial CT500P3SSD8 537 GB'),
  health: button('Failing'), firstDrive: {role: 'radio', name: SEAGATE}, next: CONTINUE, write: button('Erase and write'),
  checked: CONTINUE, writeDown: button('Write it down'), keySaved: CONTINUE, unlocking: CONTINUE, encrypt: button('Encrypt'),
  efi: button('EFI system FAT32 · 629 MB'), boot: button('/boot ext4 · 1.1 GB'), fedora: button('fedora Btrfs · 1.1 TB'), projects: button('Projects ext4 · 2.1 GB'),
  systemVolume: button('Luft Btrfs · 1.1 TB'),
  barProjects: button('Projects, 2.1 GB'), barScratch: button('Scratch, 1.1 GB'), barRaw: button('Partition 6, 268 MB'), barFree: button('Free space, 5.3 GB'),
  delete: button('Delete'), undo: button('Undo'), exact: button('Exact…'), settings: button('Partition settings'), apply: button('Apply'), confirmApply: button('Apply'),
  removeSystem: button('Remove'), confirmRemoveSystem: button('Remove Windows'), systemDone: button('Done'),
  moveToSeagate: {role: 'radio', name: `${SEAGATE} 644 GB free`}, moveOn: CONTINUE, placeErase: {text: 'Erase Seagate ST1000DM010'}, placeOn: CONTINUE,
  eraseName: {role: 'textbox', name: 'Name of the drive'}, eraseBack: button('Back'), placeFree: {text: 'Use the free space'}, sizeOn: CONTINUE,
  moveIt: button('Move Luft'), callOff: button('Call off'), trash: item('Move to trash…'),
} satisfies Record<string, Query>;

export type Control = keyof typeof AT;

export class Driver {
  readonly app: LuftApp;

  constructor(app: LuftApp) {
    this.app = app;
  }

  async take(): Promise<string[]> {
    const reply = await call(CHECKS, '/com/lantharos/KestrelChecks', `${CHECKS}.Calls`, 'Take', null, '(as)', {connection: Gio.DBus.system});
    return reply.deepUnpack()[0];
  }

  async act(label: string, act: () => unknown) {
    await changes(this.app, label, act);
    return this.app.settle(() => true);
  }

  click(control: Control | Query) {
    const query = typeof control === 'string' ? AT[control] : control;
    return this.act(`disks reacts to ${describe(query)}`, async () => this.app.click(await this.app.find(query)));
  }

  key(keyval: number) {
    return this.act(`disks reacts to ${Clutter.keyval_name(keyval)}`, () => press(keyval));
  }

  tab(times = 1, backwards = false) {
    return this.act('Tab moves the focus', () => {
      if (backwards) hold(Clutter.KEY_Shift_L);
      for (let step = 0; step < times; step++) press(Clutter.KEY_Tab);
      if (backwards) release(Clutter.KEY_Shift_L);
    });
  }

  typed(text: string) {
    return this.act(`disks shows ${text} typed`, () => type(text));
  }

  async enter(text: string) {
    await this.typed(text);
    return this.key(Clutter.KEY_Return);
  }

  async called(expected: string[], label: string, timeout = 5000) {
    let seen: string[] = [];
    await eventually(async () => {
      seen = [...seen, ...await this.take()];
      return expected.every(name => seen.includes(name));
    }, label, timeout).catch((error: unknown) => {
      throw new Error(`${failureOf(error).message}: expected ${expected.join(', ')}, saw ${seen.join(', ') || 'nothing'}`);
    });
    return seen;
  }
}
