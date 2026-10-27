import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import * as KestrelUi from '../../../kestrelUi.js';
import * as Config from '../../config.js';
import * as Main from '../../main.js';
import { emitSignalToDestination, loadInterfaceXML } from '../../runtime/dbusUtils.js';
import { Notification, Sound } from '../notification.js';
import { NotificationDestroyedReason, PrivacyScope, Urgency } from '../notificationEnums.js';
import { FdoNotificationDaemonSource } from './fdoSource.js';

const FdoNotificationsIface = loadInterfaceXML('org.freedesktop.Notifications')!;

const NotificationClosedReason = {
  EXPIRED: 1,
  DISMISSED: 2,
  APP_CLOSED: 3,
  UNDEFINED: 4,
} as const;

const FdoUrgency = {
  LOW: 0,
  NORMAL: 1,
  CRITICAL: 2,
} as const;

type ImageData = [number, number, number, boolean, number, number, Uint8Array];

interface Hints {
  'urgency': number;
  'image-data'?: ImageData;
  'image_data'?: ImageData;
  'icon_data'?: ImageData;
  'image-path'?: string;
  'image_path'?: string;
  'x-shell-sender'?: string;
  'x-shell-sender-pid'?: number;
  'desktop-entry'?: string;
  'x-kde-reply-placeholder-text'?: string;
  'x-gnome-privacy-scope'?: string;
  'resident'?: boolean;
  'transient'?: boolean;
  'suppress-sound'?: boolean;
  'sound-name'?: string;
  'sound-file'?: string;
}

type NotifyParams = [string, number, string, string, string, string[], Record<string, GLib.Variant>, number];

interface DaemonNotification {
  notification: Notification;
  source: FdoNotificationDaemonSource;
}

function closedReason(reason: NotificationDestroyedReason): number {
  switch (reason) {
  case NotificationDestroyedReason.EXPIRED:
    return NotificationClosedReason.EXPIRED;
  case NotificationDestroyedReason.DISMISSED:
    return NotificationClosedReason.DISMISSED;
  case NotificationDestroyedReason.SOURCE_CLOSED:
    return NotificationClosedReason.APP_CLOSED;
  default:
    return NotificationClosedReason.UNDEFINED;
  }
}

function soundFromHints(hints: Hints): Sound | null {
  if (hints['suppress-sound'])
    return new Sound(null);
  if (hints['sound-name'] !== undefined)
    return new Sound({ name: hints['sound-name'] });
  if (hints['sound-file'] !== undefined)
    return new Sound({ file: Gio.File.new_for_commandline_arg(hints['sound-file']) });
  return null;
}

function iconForNotificationData(icon: string | undefined): Gio.Icon | null {
  if (!icon) return null;
  if (icon.startsWith('file://'))
    return new Gio.FileIcon({ file: Gio.File.new_for_uri(icon) });
  if (icon.startsWith('/'))
    return new Gio.FileIcon({ file: Gio.File.new_for_path(icon) });
  return new Gio.ThemedIcon({ name: icon });
}

function imageForNotificationData(hints: Hints): Gio.Icon | null {
  const imageData = hints['image-data'];
  if (imageData) {
    const [width, height, rowStride, hasAlpha, bitsPerSample, , data] = imageData;
    return Shell.util_create_pixbuf_from_data(data, GdkPixbuf.Colorspace.RGB, hasAlpha, bitsPerSample, width, height, rowStride);
  }
  return iconForNotificationData(hints['image-path']);
}

function unpackHints(packed: Record<string, GLib.Variant>): Hints {
  const hints: Hints = {
    urgency: FdoUrgency.NORMAL,
    ...Object.fromEntries(Object.entries(packed).map(([name, value]) => [name, value.deepUnpack()])),
  };

  if (!hints['image-path'] && hints['image_path'])
    hints['image-path'] = hints['image_path'];

  if (!hints['image-data']) {
    if (hints['image_data'])
      hints['image-data'] = hints['image_data'];
    else if (hints['icon_data'] && !hints['image-path'])
      hints['image-data'] = hints['icon_data'];
  }
  return hints;
}

function getApp(pid: number | undefined, appId: string | undefined, appName: string): Shell.App | null {
  const appSys = Shell.AppSystem.get_default();
  let app: Shell.App | null = Shell.WindowTracker.get_default().get_app_from_pid(pid ?? 0);
  if (!app && appId)
    app = appSys.lookup_app(`${appId}.desktop`);
  if (!app)
    app = appSys.lookup_app(`${appName}.desktop`);
  return app;
}

export class FdoNotificationDaemon {
  private readonly dbusImpl = Gio.DBusExportedObject.wrapJSObject(FdoNotificationsIface, this);
  private readonly sourcesForApp = new Map<Shell.App, FdoNotificationDaemonSource>();
  private readonly sourceForPidAndName = new Map<string, FdoNotificationDaemonSource>();
  private readonly notifications = new Map<number, DaemonNotification>();
  private nextNotificationId = 1;

  constructor() {
    this.dbusImpl.export(Gio.DBus.session, '/org/freedesktop/Notifications');
  }

  private getSourceForApp(sender: string | undefined, app: Shell.App): FdoNotificationDaemonSource {
    const existing = this.sourcesForApp.get(app);
    if (existing) return existing;

    const source = new FdoNotificationDaemonSource(sender, app);
    this.sourcesForApp.set(app, source);
    source.connect('destroy', () => this.sourcesForApp.delete(app));

    Main.messageTray.add(source);
    return source;
  }

  private getSourceForPidAndName(sender: string | undefined, pid: number | undefined, appName: string): FdoNotificationDaemonSource {
    const key = `${pid}${appName}`;
    const existing = this.sourceForPidAndName.get(key);
    if (existing) return existing;

    const source = new FdoNotificationDaemonSource(sender, null);
    if (pid) {
      this.sourceForPidAndName.set(key, source);
      source.connect('destroy', () => this.sourceForPidAndName.delete(key));
    }

    Main.messageTray.add(source);
    return source;
  }

  private createNotification(hints: Hints, appName: string, invocation: Gio.DBusMethodInvocation): [number, DaemonNotification] {
    const pid = hints['x-shell-sender-pid'];
    const sender = hints['x-shell-sender'];
    const app = getApp(pid, hints['desktop-entry'], appName);

    const id = this.nextNotificationId++;
    const source = app
      ? this.getSourceForApp(sender, app)
      : this.getSourceForPidAndName(sender, pid, appName);

    const notification = new Notification({ source });
    const entry = { notification, source };
    this.notifications.set(id, entry);
    notification.connect('destroy', (_notification, reason) => {
      this.notifications.delete(id);
      this.emitNotificationClosed(id, closedReason(reason), invocation);
      notification.disconnectObject(this);
    });
    return [id, entry];
  }

  NotifyAsync([appName, replacesId, appIcon, summary, body, actions, packedHints]: NotifyParams, invocation: Gio.DBusMethodInvocation): void {
    const hints = unpackHints(packedHints);
    const replaced = replacesId !== 0 ? this.notifications.get(replacesId) : undefined;
    const [id, { notification, source }] = replaced
      ? [replacesId, replaced]
      : this.createNotification(hints, appName, invocation);

    notification.set({
      title: summary,
      body,
      gicon: imageForNotificationData(hints),
      useBodyMarkup: true,
      sound: soundFromHints(hints),
      senderPid: hints['x-shell-sender-pid'] ?? 0,
      acknowledged: false,
    });
    notification.clearActions();
    notification.disconnectObject(this);
    notification.set({ replyLabel: null, replyPlaceholder: null });

    let hasDefaultAction = false;

    for (let i = 0; i < actions.length - 1; i += 2) {
      const [actionId, label] = [actions[i], actions[i + 1]];
      if (actionId === 'default') {
        hasDefaultAction = true;
      } else if (actionId === 'inline-reply') {
        notification.set({
          replyLabel: label || KestrelUi.t('messages-reply'),
          replyPlaceholder: hints['x-kde-reply-placeholder-text'] || KestrelUi.t('messages-reply-placeholder'),
        });
        notification.connectObject('replied', (_notification: Notification, text: string) =>
          this.emitReplied(id, text, invocation), this);
      } else {
        notification.addAction(label, () => {
          this.emitActivationToken(id, invocation);
          this.emitActionInvoked(id, actionId, invocation);
        });
      }
    }

    if (hasDefaultAction) {
      notification.connectObject('activated', () => {
        this.emitActivationToken(id, invocation);
        this.emitActionInvoked(id, 'default', invocation);
      }, this);
    } else {
      notification.connectObject('activated', () => source.open(), this);
    }

    switch (hints.urgency) {
    case FdoUrgency.LOW:
      notification.urgency = Urgency.LOW;
      break;
    case FdoUrgency.NORMAL:
      notification.urgency = Urgency.NORMAL;
      break;
    case FdoUrgency.CRITICAL:
      notification.urgency = Urgency.CRITICAL;
      break;
    }
    notification.resident = !!hints['resident'];
    notification.isTransient = !!hints['transient'];

    const privacyScope = hints['x-gnome-privacy-scope'] || 'user';
    notification.privacyScope = privacyScope === 'system' ? PrivacyScope.SYSTEM : PrivacyScope.USER;

    const sourceGIcon = source.app ? null : iconForNotificationData(appIcon);
    source.processNotification(notification, appName, sourceGIcon);

    invocation.return_value(GLib.Variant.new('(u)', [id]));
  }

  CloseNotification(id: number): void {
    this.notifications.get(id)?.notification.destroy(NotificationDestroyedReason.SOURCE_CLOSED);
  }

  GetCapabilities(): string[] {
    return [
      'actions',
      'body',
      'body-markup',
      'icon-static',
      'inline-reply',
      'persistence',
      'sound',
    ];
  }

  GetServerInformation(): [string, string, string, string] {
    return [
      Config.PACKAGE_NAME,
      'GNOME',
      Config.PACKAGE_VERSION,
      '1.2',
    ];
  }

  private emitNotificationClosed(id: number, reason: number, invocation: Gio.DBusMethodInvocation): void {
    emitSignalToDestination(this.dbusImpl, invocation.get_sender(), 'NotificationClosed',
      GLib.Variant.new('(uu)', [id, reason]));
  }

  private emitActionInvoked(id: number, action: string, invocation: Gio.DBusMethodInvocation): void {
    emitSignalToDestination(this.dbusImpl, invocation.get_sender(), 'ActionInvoked',
      GLib.Variant.new('(us)', [id, action]));
  }

  private emitReplied(id: number, text: string, invocation: Gio.DBusMethodInvocation): void {
    emitSignalToDestination(this.dbusImpl, invocation.get_sender(), 'NotificationReplied',
      GLib.Variant.new('(us)', [id, text]));
  }

  private emitActivationToken(id: number, invocation: Gio.DBusMethodInvocation): void {
    const context = global.create_app_launch_context(0, -1);
    const token = context.get_startup_notify_id(null, []);
    emitSignalToDestination(this.dbusImpl, invocation.get_sender(), 'ActivationToken',
      GLib.Variant.new('(us)', [id, token!]));
  }
}
