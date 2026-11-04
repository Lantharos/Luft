import type { Notification, Source } from './notification.js';

/** One app's notifications that came in during a hold and are still around. */
export interface HeldFromApp {
  app: string;
  count: number;
}

/** A hold on banners and sounds that something other than the person started, such as an extension's work session. */
export class NotificationHold {
  private readonly notifications = new Map<Notification, number>();

  constructor(private readonly exempt: (source: Source) => boolean, private readonly changed: () => void) {}

  applies(notification: Notification): boolean {
    return !this.exempt(notification.source);
  }

  take(notification: Notification): void {
    if (this.notifications.has(notification)) return;
    this.notifications.set(notification, notification.connect('destroy', () => {
      this.notifications.delete(notification);
      this.changed();
    }));
    this.changed();
  }

  get held(): HeldFromApp[] {
    const counts = new Map<string, number>();
    for (const notification of this.notifications.keys()) {
      const app = notification.source.title ?? '';
      counts.set(app, (counts.get(app) ?? 0) + 1);
    }
    return [...counts].map(([app, count]) => ({ app, count })).sort((a, b) => b.count - a.count);
  }

  forget(): void {
    for (const [notification, id] of this.notifications) notification.disconnect(id);
    this.notifications.clear();
  }
}

/** Every hold that's on, which the message tray asks before it shows a banner or plays a sound. */
class NotificationHolds {
  private readonly holds = new Set<NotificationHold>();
  private readonly listeners = new Set<() => void>();

  get active(): boolean {
    return this.holds.size > 0;
  }

  /** The holds that hold this notification back, which it counts toward. */
  applying(notification: Notification): NotificationHold[] {
    return [...this.holds].filter(hold => hold.applies(notification));
  }

  start(exempt: (source: Source) => boolean, changed: () => void): NotificationHold {
    const hold = new NotificationHold(exempt, changed);
    this.holds.add(hold);
    this.notify();
    return hold;
  }

  end(hold: NotificationHold): void {
    if (!this.holds.delete(hold)) return;
    hold.forget();
    this.notify();
  }

  watch(changed: () => void): () => void {
    this.listeners.add(changed);
    return () => this.listeners.delete(changed);
  }

  private notify(): void {
    for (const listener of [...this.listeners]) listener();
  }
}

export const notificationHolds = new NotificationHolds();
