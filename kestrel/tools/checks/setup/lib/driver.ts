import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {changes, openApp} from '../../apps/lib/apps.js';
import type {LuftApp} from '../../lib/apps/luftApp.js';
import {checks} from '../../lib/check.js';
import {call} from '../../lib/dbus.js';
import {rest, type, type Point} from '../../lib/input/input.js';
import {capture} from '../../lib/screenshots.js';

export const {require, eventually} = checks('setup');

const CHECKS = 'com.lantharos.KestrelChecks';
const CONTROL = `${CHECKS}.Installer`;

interface InstallRequest {
  variant: string;
  target: {kind: string; drive: string; size: number};
  encryption?: {recoveryKey?: string; passphrase: string};
}

interface RegionalRequest {
  hostname: string;
  keyboard: {layout: string};
  timezone: string;
  locale: string;
}

type Request = InstallRequest & RegionalRequest;

export class Setup {
  readonly seen: string[] = [];
  private _app: LuftApp | null = null;

  get app(): LuftApp {
    if (!this._app) throw new Error('Setup is not open');
    return this._app;
  }

  async open() {
    this._app = await openApp('setup');
    await this.app.settle(() => true);
    rest();
  }

  control<S extends string>(method: string, parameters: GLib.Variant | null = null, replyType: S | null = null) {
    return call('com.lantharos.Installer1', '/com/lantharos/KestrelChecks/Installer', CONTROL, method, parameters, replyType, {connection: Gio.DBus.system});
  }

  setPhase(phase: string) {
    return this.control('SetPhase', new GLib.Variant('(s)', [phase]));
  }

  setStage(stage: string, progress: number) {
    return this.control('SetStage', new GLib.Variant('(sd)', [stage, progress]));
  }

  useMeet(meet: boolean) {
    return this.control('UseMeet', new GLib.Variant('(b)', [meet]));
  }

  setSigningKey(state: string) {
    return call(CHECKS, '/com/lantharos/KestrelChecks/Trust', `${CHECKS}.Trust`, 'SetSigningKey', new GLib.Variant('(s)', [state]), null,
      {connection: Gio.DBus.system});
  }

  async requests(): Promise<Request[]> {
    const reply = await this.control('Requests', null, '(as)');
    return reply.deepUnpack()[0].map(request => JSON.parse(request));
  }

  async calls() {
    const reply = await call(CHECKS, '/com/lantharos/KestrelChecks', `${CHECKS}.Calls`, 'Take', null, '(as)', {connection: Gio.DBus.system});
    this.seen.push(...reply.deepUnpack()[0]);
    return this.seen;
  }

  async called(name: string, label: string) {
    await eventually(async () => (await this.calls()).includes(name), label);
  }

  async click(point: Point, label: string) {
    await changes(this.app, label, () => this.app.click(point));
    await this.app.settle(() => true);
    rest();
  }

  tap(point: Point) {
    this.app.click(point);
  }

  async type(text: string) {
    type(text);
    await this.app.settle(() => true);
  }

  shot(name: string) {
    return capture(`setup-${name}`);
  }

  async close() {
    await this._app?.close();
    this._app = null;
  }
}
