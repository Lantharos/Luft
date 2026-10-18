import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {changes, openApp} from '../../apps/lib/apps.js';
import {checks} from '../../lib/check.js';
import {call} from '../../lib/dbus.js';
import {rest, type} from '../../lib/input.js';
import {capture} from '../../lib/screenshots.js';

export const {require, eventually} = checks('setup');

const CHECKS = 'com.lantharos.KestrelChecks';
const CONTROL = `${CHECKS}.Installer`;

export class Setup {
  constructor() {
    this.bus = Gio.DBusConnection.new_for_address_sync(GLib.getenv('KESTREL_SYSTEM_BUS'),
      Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
    this.seen = [];
  }

  async open() {
    this.app = await openApp('setup');
    await this.app.settle(() => true);
    rest();
  }

  control(method, parameters = null, replyType = null) {
    return call('com.lantharos.Installer1', '/com/lantharos/KestrelChecks/Installer', CONTROL, method, parameters, replyType, {connection: this.bus});
  }

  setPhase(phase) {
    return this.control('SetPhase', new GLib.Variant('(s)', [phase]));
  }

  setStage(stage, progress) {
    return this.control('SetStage', new GLib.Variant('(sd)', [stage, progress]));
  }

  useMeet(meet) {
    return this.control('UseMeet', new GLib.Variant('(b)', [meet]));
  }

  setSigningKey(state) {
    return call(CHECKS, '/com/lantharos/KestrelChecks/Trust', `${CHECKS}.Trust`, 'SetSigningKey', new GLib.Variant('(s)', [state]), null,
      {connection: this.bus});
  }

  async requests() {
    const reply = await this.control('Requests', null, '(as)');
    return reply.deepUnpack()[0].map(request => JSON.parse(request));
  }

  async calls() {
    const reply = await call(CHECKS, '/com/lantharos/KestrelChecks', `${CHECKS}.Calls`, 'Take', null, '(as)', {connection: this.bus});
    this.seen.push(...reply.deepUnpack()[0]);
    return this.seen;
  }

  async called(name, label) {
    await eventually(async () => (await this.calls()).includes(name), label);
  }

  async click(point, label) {
    await changes(this.app, label, () => this.app.click(point));
    await this.app.settle(() => true);
    rest();
  }

  tap(point) {
    this.app.click(point);
  }

  async type(text) {
    type(text);
    await this.app.settle(() => true);
  }

  shot(name) {
    return capture(`setup-${name}`);
  }

  async close() {
    await this.app?.close();
    this.app = null;
  }
}
