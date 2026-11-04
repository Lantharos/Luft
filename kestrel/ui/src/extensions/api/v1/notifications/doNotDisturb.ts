import Gio from 'gi://Gio';

import { formatsLocale, t } from '../../../../shared/i18n/index.js';
import { notificationHolds, type HeldFromApp } from '../../../../surfaces/notifications/tray/holds.js';
import * as MessageTray from '../../../../surfaces/notifications/tray/messageTray.js';
import type { ApiContext } from '../context.js';
import type { DoNotDisturb, HeldNotifications, NotificationHold } from '../types.js';
import { sourceOwners } from './notifications.js';

/** Tells people what came in while the extension held notifications back, when it ended without summing up itself. */
function sumUp({ name, host }: ApiContext, held: readonly HeldFromApp[]): void {
  const count = held.reduce((sum, app) => sum + app.count, 0);
  if (!count) return;
  const apps = new Intl.ListFormat(formatsLocale(), { type: 'conjunction' }).format(held.map(app => app.app));
  const source = MessageTray.getSystemSource();
  const notification = new MessageTray.Notification({
    source,
    title: t('extension-held-title', { name }),
    body: t('extension-held-body', { count, apps }),
    iconName: 'notifications-disabled-symbolic',
  });
  notification.connect('activated', () => host.showNotifications());
  source.addNotification(notification);
}

export function doNotDisturbApi(context: ApiContext): DoNotDisturb {
  const { scope, manifest } = context;
  const banners = new Gio.Settings({ schema_id: 'org.gnome.desktop.notifications' });
  const exempt = (source: MessageTray.Source) => sourceOwners.get(source) === manifest.id;
  return {
    hold: (): NotificationHold => {
      const listeners = new Set<() => void>();
      const hold = notificationHolds.start(exempt, () => listeners.forEach(listener => listener()));
      let summed = false;
      const handle = scope.disposable(() => {
        const held = hold.held;
        notificationHolds.end(hold);
        listeners.clear();
        if (!summed) sumUp(context, held);
      });
      return {
        get held(): HeldNotifications[] {
          return hold.held;
        },
        onHeld: changed => {
          const guarded = scope.guard(changed);
          listeners.add(guarded);
          return scope.disposable(() => listeners.delete(guarded));
        },
        release: () => {
          const held = hold.held;
          summed = true;
          handle.dispose();
          return held;
        },
        dispose: () => handle.dispose(),
      };
    },
    get holding() {
      return !banners.get_boolean('show-banners') || notificationHolds.active;
    },
    onChanged: changed => {
      const guarded = scope.guard(changed);
      const id = banners.connect('changed::show-banners', () => guarded());
      const stop = notificationHolds.watch(guarded);
      return scope.disposable(() => {
        banners.disconnect(id);
        stop();
      });
    },
  };
}
