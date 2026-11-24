import Gio from 'gi://Gio';

import { appsAnswering, forgetAnswer, lookup, watchStore, WINDOW_CAPTURE, type Apps } from '../../../../shared/dbus/permissionStore.js';
import type { Remembered } from './remembered.js';

const PREFIX = 'window-capture:';

export const windowCaptureGrant = (app: string) => `${PREFIX}${app}`;

export class StoredGrants {
  private apps: Apps | null = null;

  constructor(changed: () => void) {
    watchStore([WINDOW_CAPTURE], (_permission, apps) => {
      this.apps = apps;
      changed();
    });
  }

  async all(): Promise<Remembered[]> {
    const apps = this.apps ??= await lookup(Gio.DBus.session, WINDOW_CAPTURE);
    return appsAnswering(apps, 'yes').map(app => ({ id: windowCaptureGrant(app), app, kind: 'windows-record', since: Number(apps[app][1]) || 0 }));
  }

  async remove(id: string): Promise<boolean> {
    if (!id.startsWith(PREFIX)) return false;
    await forgetAnswer(WINDOW_CAPTURE, id.slice(PREFIX.length));
    return true;
  }
}
