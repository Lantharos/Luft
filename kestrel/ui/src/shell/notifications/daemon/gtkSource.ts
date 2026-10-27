import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Shell from 'gi://Shell';

import * as Main from '../../main.js';
import { Source } from '../notification.js';
import { NotificationDestroyedReason } from '../notificationEnums.js';
import { NotificationApplicationPolicy } from '../notificationPolicy.js';
import type { GtkNotificationDaemonNotification } from './gtkNotification.js';

export class InvalidAppError extends Error {}

export type SerializedSource = [string, [string, GLib.Variant][]];

export const GtkNotificationDaemonAppSource = GObject.registerClass(
class GtkNotificationDaemonAppSource extends Source {
  private readonly app: Shell.App;
  private readonly appNotifications = new Map<string, GtkNotificationDaemonNotification>();
  private notificationPending = false;

  constructor(private readonly appId: string, private readonly dbusImpl: Gio.DBusExportedObject) {
    if (!Gio.Application.id_is_valid(appId))
      throw new InvalidAppError();

    const app = Shell.AppSystem.get_default().lookup_app(`${appId}.desktop`);
    if (!app)
      throw new InvalidAppError();

    super({
      title: app.get_name(),
      icon: app.get_icon(),
      policy: new NotificationApplicationPolicy(appId),
    });

    this.app = app;
  }

  activateAction(actionId: string, target: GLib.Variant | undefined): void {
    const params = target ? GLib.Variant.new('av', [target]) : null;
    this.app.activate_action(actionId, params, 0, -1, null).catch(error => {
      logError(error, `Failed to activate action for ${this.appId}`);
    });
  }

  emitActionInvoked(notificationId: string, actionId: string, target: GLib.Variant | undefined): void {
    const context = global.create_app_launch_context(0, -1);
    const launching = this.app.state === Shell.AppState.STOPPED;
    const token = context.get_startup_notify_id(launching ? this.app.get_app_info() : null, []);

    this.dbusImpl.emit_signal('ActionInvoked',
      GLib.Variant.new('(sssava{sv})', [
        this.appId,
        notificationId,
        actionId,
        target ? [target] : [],
        { 'activation-token': GLib.Variant.new_string(token!) },
      ]));
  }

  open(): void {
    this.app.activate();
    Main.closeShellPopups();
  }

  addNotification(notification: GtkNotificationDaemonNotification): void {
    this.notificationPending = true;

    this.appNotifications.get(notification.id)?.destroy(NotificationDestroyedReason.REPLACED);

    notification.connect('destroy', () => this.appNotifications.delete(notification.id));
    this.appNotifications.set(notification.id, notification);

    super.addNotification(notification);

    this.notificationPending = false;
  }

  destroy(reason?: NotificationDestroyedReason): void {
    if (this.notificationPending) return;
    super.destroy(reason);
  }

  removeNotification(notificationId: string): void {
    this.appNotifications.get(notificationId)?.destroy(NotificationDestroyedReason.SOURCE_CLOSED);
  }

  serialize(): SerializedSource {
    const notifications = [...this.appNotifications].map(([id, notification]): [string, GLib.Variant] => [id, notification.serialize()]);
    return [this.appId, notifications];
  }
});
export type GtkNotificationDaemonAppSource = InstanceType<typeof GtkNotificationDaemonAppSource>;
