import Gio from 'gi://Gio';

import { t } from '../../shared/i18n/index.js';
import * as MessageTray from '../../surfaces/notifications/tray/messageTray.js';
import type { ProblemKind } from './store.js';

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

export function noticeEffectOff(name: string, effect: string, problem: 'shader' | 'slow', openSettings: () => void): void {
  const source = MessageTray.getSystemSource();
  const notification = new MessageTray.Notification({
    source,
    title: t('screen-effect-off-title', { effect }),
    body: t(problem === 'shader' ? 'screen-effect-off-shader' : 'screen-effect-off-slow', { name }),
    gicon: new Gio.ThemedIcon({ name: 'application-x-addon-symbolic' }),
    privacyScope: MessageTray.PrivacyScope.SYSTEM,
  });
  notification.connect('activated', openSettings);
  source.addNotification(notification);
}
