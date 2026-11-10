import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import * as KestrelUi from '../../../kestrelUi.js';
import * as Main from '../../../core/main.js';
import { NotificationError, NotificationErrors } from '../../../core/runtime/dbusErrors.js';
import { loadInterfaceXML } from '../../../core/runtime/dbusUtils.js';
import { ownOnItsOwnConnection } from '../../../shared/dbus/dedicatedName.js';
import { GtkNotificationDaemonNotification, type SerializedNotification } from './gtkNotification.js';
import { GtkNotificationDaemonAppSource, InvalidAppError, type SerializedSource } from './gtkSource.js';

const GtkNotificationsIface = loadInterfaceXML('org.gtk.Notifications')!;

const NOTIFICATION_SERIALIZED_NAME = 'notifications';
const NOTIFICATION_SERIALIZED_FORMAT = 'a(sa(sv))';

export class GtkNotificationDaemon {
  private readonly sources = new Map<string, GtkNotificationDaemonAppSource>();
  private readonly dbusImpl = Gio.DBusExportedObject.wrapJSObject(GtkNotificationsIface, this);
  private isLoading = false;

  constructor() {
    this.loadNotifications();

    ownOnItsOwnConnection('org.gtk.Notifications', [[this.dbusImpl, '/org/gtk/Notifications']], () => {});
  }

  private ensureAppSource(appId: string): GtkNotificationDaemonAppSource {
    const existing = this.sources.get(appId);
    if (existing) return existing;

    const source = new GtkNotificationDaemonAppSource(appId, this.dbusImpl);

    source.connect('destroy', () => {
      this.sources.delete(appId);
      this.saveNotifications();
    });
    source.connect('notify::count', () => this.saveNotifications());
    Main.messageTray.add(source);
    this.sources.set(appId, source);
    return source;
  }

  private loadNotifications(): void {
    this.isLoading = true;

    try {
      const value = global.get_persistent_state(NOTIFICATION_SERIALIZED_FORMAT, NOTIFICATION_SERIALIZED_NAME);
      if (!value) return;

      const sources = value.deepUnpack() as SerializedSource[];
      sources.forEach(([appId, notifications]) => {
        if (notifications.length === 0) return;

        let source: GtkNotificationDaemonAppSource;
        try {
          source = this.ensureAppSource(appId);
        } catch (e) {
          if (e instanceof InvalidAppError) return;
          throw e;
        }

        notifications.forEach(([notificationId, notificationPacked]) => {
          const notification = new GtkNotificationDaemonNotification(source,
            notificationId,
            notificationPacked.deepUnpack() as SerializedNotification);
          notification.acknowledged = true;
          source.addNotification(notification);
        });
      });
    } catch (e) {
      logError(e as Error, 'Failed to load saved notifications');
    } finally {
      this.isLoading = false;
    }
  }

  private saveNotifications(): void {
    if (this.isLoading) return;

    const sources = [...this.sources.values()].map(source => source.serialize());
    global.set_persistent_state(NOTIFICATION_SERIALIZED_NAME,
      sources.length ? new GLib.Variant(NOTIFICATION_SERIALIZED_FORMAT, sources) : null);
  }

  async AddNotificationAsync([appId, notificationId, notificationSerialized]: [string, string, SerializedNotification], invocation: Gio.DBusMethodInvocation): Promise<void> {
    if (await KestrelUi.refuseSandboxed(invocation, 'show notifications for other apps')) return;

    try {
      const source = this.ensureAppSource(appId);
      notificationSerialized['timestamp'] = new GLib.Variant('x', GLib.DateTime.new_now_local().to_unix());
      source.addNotification(new GtkNotificationDaemonNotification(source, notificationId, notificationSerialized,
        invocation.get_message().get_unix_fd_list()));
    } catch (e) {
      if (e instanceof InvalidAppError)
        invocation.return_error_literal(NotificationErrors, NotificationError.INVALID_APP, `The app by ID "${appId}" could not be found`);
      else
        invocation.return_dbus_error('org.freedesktop.DBus.Error.InvalidArgs', `${e}`);
      return;
    }

    invocation.return_value(null);
  }

  async RemoveNotificationAsync([appId, notificationId]: [string, string], invocation: Gio.DBusMethodInvocation): Promise<void> {
    if (await KestrelUi.refuseSandboxed(invocation, 'withdraw notifications of other apps')) return;

    this.sources.get(appId)?.removeNotification(notificationId);

    invocation.return_value(null);
  }
}
