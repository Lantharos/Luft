import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Shell from 'gi://Shell';

import * as Main from '../../../core/main.js';
import { Source, type Notification } from '../tray/notification.js';
import { policyForApp } from '../tray/notificationPolicy.js';

export const FdoNotificationDaemonSource = GObject.registerClass(
class FdoNotificationDaemonSource extends Source {
  private appName: string | null = null;
  private appIcon: Gio.Icon | null = null;
  private nameWatcherId = 0;

  constructor(sender: string | undefined, readonly app: Shell.App | null) {
    super({ policy: policyForApp(app) });

    if (sender)
      this.nameWatcherId = Gio.DBus.session.watch_name(sender, Gio.BusNameWatcherFlags.NONE, null, () => this.onNameVanished());
  }

  private onNameVanished(): void {
    if (this.app)
      this.destroy();
  }

  processNotification(notification: Notification, appName: string, appIcon: Gio.Icon | null): void {
    if (!this.app && appName) {
      this.appName = appName;
      this.notify('title');
    }

    if (!this.app && appIcon) {
      this.appIcon = appIcon;
      this.notify('icon');
    }

    const tracker = Shell.WindowTracker.get_default();
    if (notification.resident && this.app && tracker.focus_app === this.app)
      notification.acknowledged = true;

    this.addNotification(notification);
  }

  open(): void {
    this.openApp();
    this.destroyNonResidentNotifications();
  }

  private openApp(): void {
    if (!this.app) return;
    this.app.activate();
    Main.closeShellPopups();
  }

  destroy(): void {
    if (this.nameWatcherId) {
      Gio.DBus.session.unwatch_name(this.nameWatcherId);
      this.nameWatcherId = 0;
    }

    super.destroy();
  }

  get title(): string | null {
    return this.app?.get_name() ?? this.appName;
  }

  get icon(): Gio.Icon | null {
    return this.app?.get_icon() ?? this.appIcon;
  }
});
export type FdoNotificationDaemonSource = InstanceType<typeof FdoNotificationDaemonSource>;
