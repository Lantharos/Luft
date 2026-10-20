import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { MenuEntry } from '../../../desktop/menus/contextMenus.js';
import { Blackout } from '../../../session/farewell.js';
import { t } from '../../../shared/i18n/index.js';

const ACTIONS = [
  { labelId: 'greeter-suspend', method: 'Suspend', check: 'CanSuspend', fadeOut: false },
  { labelId: 'greeter-restart', method: 'Reboot', check: 'CanReboot', fadeOut: true },
  { labelId: 'greeter-power-off', method: 'PowerOff', check: 'CanPowerOff', fadeOut: true },
];

function callLogind(method: string, parameters: GLib.Variant | null): Promise<GLib.Variant> {
  return new Promise((resolve, reject) => Gio.DBus.system.call(
    'org.freedesktop.login1', '/org/freedesktop/login1', 'org.freedesktop.login1.Manager',
    method, parameters, null, Gio.DBusCallFlags.NONE, -1, null,
    (connection, result) => {
      try {
        resolve(connection!.call_finish(result));
      } catch (error) {
        reject(error);
      }
    }));
}

export class PowerActions {
  private readonly blackout = new Blackout();
  private available: typeof ACTIONS = [];

  async load(): Promise<void> {
    const answers = await Promise.all(ACTIONS.map(action =>
      callLogind(action.check, null).then(reply => reply.deepUnpack<[string]>()[0]).catch(() => 'na')));
    this.available = ACTIONS.filter((_action, index) => ['yes', 'challenge'].includes(answers[index]));
  }

  entries(): MenuEntry[] {
    return this.available.map(action => ({
      label: t(action.labelId),
      run: () => void this.perform(action),
    }));
  }

  private async perform(action: typeof ACTIONS[number]): Promise<void> {
    if (action.fadeOut) await this.blackout.fade();
    try {
      await callLogind(action.method, new GLib.Variant('(b)', [false]));
    } catch (error) {
      this.blackout.lift();
      console.warn(`${action.method} did not start: ${error}`);
    }
  }
}
