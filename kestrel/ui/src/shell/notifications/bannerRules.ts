import type Gio from 'gi://Gio';

import type { Notification } from './notification.js';
import { Urgency } from './notificationEnums.js';

const allowedDuringDoNotDisturb = (notification: Notification): boolean => {
  const { duringDoNotDisturb } = notification.source.policy;
  return duringDoNotDisturb === 'always' ||
    (notification.urgency === Urgency.CRITICAL && duringDoNotDisturb === 'urgent');
};

export function soundAllowed(notification: Notification, settings: Gio.Settings): boolean {
  return settings.get_boolean('show-banners') || allowedDuringDoNotDisturb(notification);
}

export function bannerAllowed(notification: Notification, settings: Gio.Settings): boolean {
  const urgent = notification.urgency === Urgency.CRITICAL;
  if (notification.urgency === Urgency.LOW || (!notification.source.policy.showBanners && !urgent)) return false;
  return settings.get_boolean('show-banners') || allowedDuringDoNotDisturb(notification);
}
