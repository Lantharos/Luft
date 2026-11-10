import type Gio from 'gi://Gio';

import { notificationHolds, type NotificationHold } from './holds.js';
import type { Notification } from './notification.js';
import { Urgency } from './notificationEnums.js';

const allowedDuringDoNotDisturb = (notification: Notification): boolean => {
  const { duringDoNotDisturb } = notification.source.policy;
  return duringDoNotDisturb === 'always' ||
    (notification.urgency === Urgency.CRITICAL && duringDoNotDisturb === 'urgent');
};

const wouldBanner = (notification: Notification): boolean =>
  notification.urgency !== Urgency.LOW && (notification.source.policy.showBanners || notification.urgency === Urgency.CRITICAL);

const quieted = (notification: Notification, settings: Gio.Settings): boolean =>
  !settings.get_boolean('show-banners') || notificationHolds.applying(notification).length > 0;

export function soundAllowed(notification: Notification, settings: Gio.Settings): boolean {
  return !quieted(notification, settings) || allowedDuringDoNotDisturb(notification);
}

export function bannerAllowed(notification: Notification, settings: Gio.Settings): boolean {
  return wouldBanner(notification) && (!quieted(notification, settings) || allowedDuringDoNotDisturb(notification));
}

export function heldBack(notification: Notification): NotificationHold[] {
  return wouldBanner(notification) && !allowedDuringDoNotDisturb(notification) ? notificationHolds.applying(notification) : [];
}
