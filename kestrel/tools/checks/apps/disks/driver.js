import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../../lib/check.js';
import {call} from '../../lib/dbus.js';
import {hold, press, release, type} from '../../lib/input.js';
import {changes} from '../lib/apps.js';

const {eventually} = checks('Luft app');
const CHECKS = 'com.lantharos.KestrelChecks';

export const AT = {
  more: [1019, 219], unmount: [900, 357], mount: [965, 219], saveImage: [900, 550], done: [1001, 310],
  format: [900, 641], safelyRemove: [943, 85],
  wdc: [130, 157], seagate: [130, 100], unlock: [962, 219], newPartition: [974, 275],
  health: [600, 360], firstDrive: [560, 301], next: [686, 470], write: [666, 419],
  largest: [1009, 467], trash: [860, 565],
  turnOn: [885, 448], checked: [755, 448], saved: [292, 447], keySaved: [755, 498], unlocking: [755, 436], encrypt: [759, 429],
  encryption: [885, 499], lock: [900, 300],
  efi: [400, 219], boot: [400, 275], fedora: [400, 331], lab: [130, 205], projects: [400, 387],
  moreDrive: [1025, 86], editPartitions: [876, 183], barProjects: [460, 118], barScratch: [598, 118], barRaw: [657, 118], barFree: [900, 118],
  deleteProjects: [660, 198], undo: [766, 30], deleteScratch: [767, 198], exact: [803, 243], settings: [861, 198],
  apply: [924, 30], confirmApply: [766, 482],
};

export class Driver {
  constructor(app) {
    this.app = app;
    this.bus = Gio.DBusConnection.new_for_address_sync(GLib.getenv('KESTREL_SYSTEM_BUS'),
      Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
  }

  async take() {
    const reply = await call(CHECKS, '/com/lantharos/KestrelChecks', `${CHECKS}.Calls`, 'Take', null, '(as)', {connection: this.bus});
    return reply.deepUnpack()[0];
  }

  async act(label, act) {
    await changes(this.app, label, act);
    return this.app.settle(() => true);
  }

  click(name) {
    return this.act(`disks reacts to ${name}`, () => this.app.click(AT[name]));
  }

  key(keyval) {
    return this.act(`disks reacts to ${Clutter.keyval_name(keyval)}`, () => press(keyval));
  }

  tab(times = 1, backwards = false) {
    return this.act('Tab moves the focus', () => {
      if (backwards) hold(Clutter.KEY_Shift_L);
      for (let step = 0; step < times; step++) press(Clutter.KEY_Tab);
      if (backwards) release(Clutter.KEY_Shift_L);
    });
  }

  async enter(text) {
    await this.act(`disks shows ${text} typed`, () => type(text));
    return this.key(Clutter.KEY_Return);
  }

  async called(expected, label, timeout = 5000) {
    let seen = [];
    await eventually(async () => {
      seen = [...seen, ...await this.take()];
      return expected.every(name => seen.includes(name));
    }, label, timeout).catch(error => {
      throw new Error(`${error.message}: expected ${expected.join(', ')}, saw ${seen.join(', ') || 'nothing'}`);
    });
    return seen;
  }

  close() {
    this.bus.close_sync(null);
  }
}
