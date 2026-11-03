import Gio from 'gi://Gio';

import { t } from '../../shared/i18n/index.js';
import * as MessageTray from '../../surfaces/notifications/tray/messageTray.js';
import type { ProblemKind } from './store.js';

/** Tells the person that Kestrel switched an extension off, and why. */
export function noticeTurnedOff(name: string, kind: ProblemKind, openSettings: () => void): void {
  const source = MessageTray.getSystemSource();
  const notification = new MessageTray.Notification({
    source,
    title: t('extension-turned-off-title', { name }),
    body: t(kind === 'crash' ? 'extension-turned-off-crash' : 'extension-turned-off-error'),
    gicon: new Gio.ThemedIcon({ name: 'application-x-addon-symbolic' }),
    privacyScope: MessageTray.PrivacyScope.SYSTEM,
  });
  notification.connect('activated', openSettings);
  source.addNotification(notification);
}
