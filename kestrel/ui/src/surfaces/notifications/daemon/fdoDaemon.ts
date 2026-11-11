import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import * as KestrelUi from '../../../kestrelUi.js';
import * as Config from '../../../core/config.js';
import * as Main from '../../../core/main.js';
import { emitSignalToDestination, loadInterfaceXML } from '../../../core/runtime/dbusUtils.js';
import { systemPrograms } from '../../../shared/apps/luftApps.js';
import { callerOwns, callerProcess } from '../../../shared/dbus/processes.js';
import { connectionRuns, identify, identifySender, type Caller } from '../../../shared/dbus/sandbox.js';
import { Notification, Sound } from '../tray/notification.js';
import { NotificationDestroyedReason, PrivacyScope, Urgency } from '../tray/notificationEnums.js';
import { FdoNotificationDaemonSource } from './fdoSource.js';
import { launchContext } from '../../../shared/apps/launch.js';

const FdoNotificationsIface = loadInterfaceXML('org.freedesktop.Notifications')!;
const RELAY = 'org.freedesktop.Notifications';
const SYSTEM_NOTICES = systemPrograms('kestrel-settings');
const MAX_SOURCES_WITHOUT_APP = 30;
const MAX_SOURCES_PER_PROCESS = 5;

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
  sender: string | undefined;
}

interface Origin {
  readonly sender: string | undefined;
  readonly pid: number;
  readonly caller: Caller;
}

interface SourceWithoutApp {
  readonly key: string | null;
  readonly pid: number;
  readonly source: FdoNotificationDaemonSource;
}

async function callerPid(invocation: Gio.DBusMethodInvocation): Promise<number> {
  const process = await callerProcess(invocation).catch(() => null);
  try {
    return process?.pid ?? 0;
  } finally {
    process?.close();
  }
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

function getApp({ pid, caller }: Origin, appId: string | undefined, appName: string): Shell.App | null {
  const appSys = Shell.AppSystem.get_default();
  if (caller.kind === 'app') return appSys.lookup_app(`${caller.app}.desktop`);

  let app: Shell.App | null = Shell.WindowTracker.get_default().get_app_from_pid(pid);
  if (app || caller.kind === 'unknown') return app;
  if (appId)
    app = appSys.lookup_app(`${appId}.desktop`);
  if (!app)
    app = appSys.lookup_app(`${appName}.desktop`);
  return app;
}

export class FdoNotificationDaemon {
  private readonly dbusImpl = Gio.DBusExportedObject.wrapJSObject(FdoNotificationsIface, this);
  private readonly sourcesForApp = new Map<Shell.App, FdoNotificationDaemonSource>();
  private readonly sourcesWithoutApp: SourceWithoutApp[] = [];
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

  private getSourceForPidAndName({ sender, pid }: Origin, appName: string): FdoNotificationDaemonSource {
    const key = pid ? `${pid}${appName}` : null;
    const existing = key && this.sourcesWithoutApp.find(known => known.key === key);
    if (existing) return existing.source;

    const fromProcess = this.sourcesWithoutApp.filter(known => known.pid === pid);
    if (fromProcess.length >= MAX_SOURCES_PER_PROCESS) fromProcess[0].source.destroy(NotificationDestroyedReason.EXPIRED);
    else if (this.sourcesWithoutApp.length >= MAX_SOURCES_WITHOUT_APP) this.sourcesWithoutApp[0].source.destroy(NotificationDestroyedReason.EXPIRED);

    const source = new FdoNotificationDaemonSource(sender, null);
    const entry = { key, pid, source };
    this.sourcesWithoutApp.push(entry);
    source.connect('destroy', () => this.sourcesWithoutApp.splice(this.sourcesWithoutApp.indexOf(entry), 1));

    Main.messageTray.add(source);
    return source;
  }

  private createNotification(origin: Origin, hints: Hints, appName: string, invocation: Gio.DBusMethodInvocation): [number, DaemonNotification] {
    const app = getApp(origin, hints['desktop-entry'], appName);

    const id = this.nextNotificationId++;
    const source = app
      ? this.getSourceForApp(origin.sender, app)
      : this.getSourceForPidAndName(origin, appName);

    const notification = new Notification({ source });
    const entry = { notification, source, sender: origin.sender };
    this.notifications.set(id, entry);
    notification.connect('destroy', (_notification, reason) => {
      this.notifications.delete(id);
      this.emitNotificationClosed(id, closedReason(reason), invocation);
      notification.disconnectObject(this);
    });
    return [id, entry];
  }

  async NotifyAsync(params: NotifyParams, invocation: Gio.DBusMethodInvocation): Promise<void> {
    let id: number;
    try {
      const hints = unpackHints(params[6]);
      const origin = await this.origin(hints, invocation);
      id = this.notify(params, hints, origin, await this.privacyScope(hints, origin, invocation), invocation);
    } catch (error) {
      invocation.return_dbus_error('org.freedesktop.DBus.Error.InvalidArgs', `${error}`);
      return;
    }
    invocation.return_value(GLib.Variant.new('(u)', [id]));
  }

  private async origin(hints: Hints, invocation: Gio.DBusMethodInvocation): Promise<Origin> {
    if (!await this.relayed(invocation))
      return { sender: invocation.get_sender()!, pid: await callerPid(invocation), caller: await identify(invocation) };

    const sender = hints['x-shell-sender'];
    const caller: Caller = sender ? await identifySender(invocation.get_connection(), sender) : { kind: 'you' };
    return { sender, pid: hints['x-shell-sender-pid'] ?? 0, caller };
  }

  private async relayed(invocation: Gio.DBusMethodInvocation): Promise<boolean> {
    return invocation.get_sender() === invocation.get_connection().get_unique_name() || await callerOwns(invocation, RELAY);
  }

  private async privacyScope(hints: Hints, { sender }: Origin, invocation: Gio.DBusMethodInvocation): Promise<PrivacyScope> {
    if (hints['x-gnome-privacy-scope'] !== 'system') return PrivacyScope.USER;
    const trusted = typeof sender === 'string' && await connectionRuns(invocation.get_connection(), sender, SYSTEM_NOTICES);
    return trusted ? PrivacyScope.SYSTEM : PrivacyScope.USER;
  }

  private notify([appName, replacesId, appIcon, summary, body, actions]: NotifyParams, hints: Hints, origin: Origin,
    privacyScope: PrivacyScope, invocation: Gio.DBusMethodInvocation): number {
    const gicon = imageForNotificationData(hints);
    const sound = soundFromHints(hints);
    const known = replacesId !== 0 ? this.notifications.get(replacesId) : undefined;
    const replaced = known?.sender === origin.sender ? known : undefined;
    const [id, { notification, source }] = replaced
      ? [replacesId, replaced]
      : this.createNotification(origin, hints, appName, invocation);

    notification.set({
      title: summary,
      body,
      gicon,
      useBodyMarkup: true,
      sound,
      senderPid: origin.pid,
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

    notification.privacyScope = privacyScope;

    const sourceGIcon = source.app ? null : iconForNotificationData(appIcon);
    source.processNotification(notification, appName, sourceGIcon);
    return id;
  }

  async CloseNotificationAsync([id]: [number], invocation: Gio.DBusMethodInvocation): Promise<void> {
    const entry = this.notifications.get(id);
    if (entry && (entry.sender === invocation.get_sender() || await this.relayed(invocation)))
      entry.notification.destroy(NotificationDestroyedReason.SOURCE_CLOSED);
    invocation.return_value(null);
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
      'Lantharos',
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
    const context = launchContext();
    const token = context.get_startup_notify_id(null, []);
    emitSignalToDestination(this.dbusImpl, invocation.get_sender(), 'ActivationToken',
      GLib.Variant.new('(us)', [id, token!]));
  }
}
