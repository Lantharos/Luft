import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { MenuEntry } from '../menus/contextMenus.js';

const ACTIONS = [
  { label: 'Suspend', method: 'Suspend', check: 'CanSuspend' },
  { label: 'Restart', method: 'Reboot', check: 'CanReboot' },
  { label: 'Power off', method: 'PowerOff', check: 'CanPowerOff' },
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
  private available: typeof ACTIONS = [];

  async load(): Promise<void> {
    const answers = await Promise.all(ACTIONS.map(action =>
      callLogind(action.check, null).then(reply => reply.deepUnpack<[string]>()[0]).catch(() => 'na')));
    this.available = ACTIONS.filter((_action, index) => ['yes', 'challenge'].includes(answers[index]));
  }

  entries(): MenuEntry[] {
    return this.available.map(action => ({
      label: action.label,
      run: () => void callLogind(action.method, new GLib.Variant('(b)', [false]))
        .catch(error => console.warn(`${action.label} did not start: ${error}`)),
    }));
  }
}
