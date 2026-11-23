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
  more: [922, 244], unmount: [877, 382], mount: [978, 244], saveImage: [877, 575], done: [974, 348],
  format: [877, 666], safelyRemove: [961, 103],
  wdc: [130, 157], seagate: [130, 100], unlock: [978, 244], newPartition: [991, 304],
  health: [600, 376], firstDrive: [560, 274], next: [686, 512], write: [666, 419],
  largest: [1001, 483], trash: [852, 581],
  turnOn: [781, 470], checked: [755, 448], writeDown: [570, 447], keySaved: [755, 525], unlocking: [755, 436], encrypt: [759, 429],
  encryption: [760, 521], lock: [760, 339],
  efi: [400, 243], boot: [400, 305], fedora: [400, 367], lab: [130, 205], projects: [400, 429],
  moreDrive: [1017, 102], editPartitions: [868, 199], barProjects: [458, 134], barScratch: [595, 134], barRaw: [653, 134], barFree: [893, 134],
  deleteProjects: [660, 214], undo: [758, 42], deleteScratch: [767, 214], exact: [803, 259], settings: [782, 214],
  apply: [916, 42], confirmApply: [766, 482],
  crucial: [130, 262], removeSystem: [965, 578], confirmRemoveSystem: [728, 517], systemDone: [767, 530],
  micron: [130, 330], systemVolume: [400, 243],
  samsung: [130, 43], moveLuft: [868, 246], moveToSeagate: [540, 231], moveOn: [755, 605],
  placeFree: [540, 327], placeErase: [540, 382], placeOn: [755, 448], eraseName: [540, 440], eraseBack: [605, 495], sizeOn: [755, 490], moveIt: [752, 464], callOff: [582, 425],
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
