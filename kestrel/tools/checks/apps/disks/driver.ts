import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';

import type {LuftApp} from '../../lib/apps/luftApp.js';
import {checks} from '../../lib/check.js';
import {call} from '../../lib/dbus.js';
import {failureOf} from '../../lib/errors.js';
import {hold, press, release, type, type Point} from '../../lib/input/input.js';
import {changes} from '../lib/apps.js';

const {eventually} = checks('Luft app');
const CHECKS = 'com.lantharos.KestrelChecks';

export const AT = {
  more: [945, 219], unmount: [900, 357], mount: [1005, 219], saveImage: [900, 550], done: [1001, 310],
  format: [900, 641], safelyRemove: [983, 85],
  wdc: [130, 157], seagate: [130, 100], unlock: [1005, 219], newPartition: [1008, 275],
  health: [600, 360], firstDrive: [560, 282], next: [686, 488], write: [666, 419],
  largest: [1009, 467], trash: [860, 565],
  turnOn: [885, 448], checked: [755, 448], saved: [292, 447], keySaved: [755, 498], unlocking: [755, 436], encrypt: [759, 429],
  encryption: [885, 499], lock: [900, 300],
  efi: [400, 219], boot: [400, 275], fedora: [400, 331], lab: [130, 205], projects: [400, 387],
  moreDrive: [1025, 86], editPartitions: [876, 183], barProjects: [460, 118], barScratch: [598, 118], barRaw: [657, 118], barFree: [900, 118],
  deleteProjects: [660, 198], undo: [766, 30], deleteScratch: [767, 198], exact: [803, 243], settings: [861, 198],
  apply: [924, 30], confirmApply: [766, 482],
  crucial: [130, 262], removeSystem: [992, 534], confirmRemoveSystem: [728, 517], systemDone: [767, 530],
} satisfies Record<string, Point>;

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

  click(name: Control) {
    return this.act(`disks reacts to ${name}`, () => this.app.click(AT[name]));
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

  async enter(text: string) {
    await this.act(`disks shows ${text} typed`, () => type(text));
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
