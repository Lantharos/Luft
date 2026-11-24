import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { setPermission, WINDOW_CAPTURE } from '../../../shared/dbus/permissionStore.js';
import { t } from '../../../shared/i18n/index.js';
import { CaptureError } from './errors.js';
import { askToRecordWindows } from './prompt.js';
import type { Requester } from './requester.js';

const permitted = (app: string) => global.context.is_app_permitted(WINDOW_CAPTURE.table, app);

export class WindowCaptureAccess {
  private readonly asking = new Map<string, Promise<boolean>>();
  private readonly declined = new Map<string, number>();

  async require(requester: Requester): Promise<void> {
    if (permitted(requester.app)) return;
    if (this.declined.has(requester.sender)) throw new CaptureError('Denied', t('window-capture-error-declined'));
    let asking = this.asking.get(requester.app);
    if (!asking) {
      asking = this.ask(requester).finally(() => this.asking.delete(requester.app));
      this.asking.set(requester.app, asking);
    }
    if (!await asking) throw new CaptureError('Denied', t('window-capture-error-not-allowed'));
  }

  destroy(): void {
    for (const watch of this.declined.values()) Gio.bus_unwatch_name(watch);
    this.declined.clear();
  }

  private async ask(requester: Requester): Promise<boolean> {
    if (!await askToRecordWindows(requester)) {
      this.decline(requester.sender);
      return false;
    }
    const since = Math.floor(GLib.get_real_time() / GLib.USEC_PER_SEC);
    await setPermission(WINDOW_CAPTURE, requester.app, ['yes', `${since}`]);
    return true;
  }

  private decline(sender: string): void {
    if (this.declined.has(sender)) return;
    this.declined.set(sender, Gio.bus_watch_name_on_connection(Gio.DBus.session, sender, Gio.BusNameWatcherFlags.NONE, null, () => {
      Gio.bus_unwatch_name(this.declined.get(sender)!);
      this.declined.delete(sender);
    }));
  }
}
