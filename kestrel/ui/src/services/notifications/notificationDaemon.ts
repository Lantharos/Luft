import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { ServiceImplementation } from '../dbusService.js';

import { emitSignalToDestination, loadInterfaceXML } from '../../shell/runtime/dbusUtils.js';

type NotifyArgs = [string, number, string, string, string, string[], Record<string, GLib.Variant>, number];

interface NotificationsRemote {
  NotifyAsync(...args: NotifyArgs): Promise<[number]>;
  CloseNotificationAsync(id: number): Promise<[]>;
  GetCapabilitiesAsync(): Promise<[string[]]>;
  GetServerInformationAsync(): Promise<[string, string, string, string]>;
  connectSignal(name: string, callback: (proxy: Gio.DBusProxy, sender: string, args: [number, number | string]) => void): number;
}

const NotificationsIface = loadInterfaceXML('org.freedesktop.Notifications')!;
const NotificationsProxy = Gio.DBusProxy.makeProxyWrapper<NotificationsRemote>(NotificationsIface);

const FORWARDED_SIGNALS = {
  ActivationToken: '(us)',
  ActionInvoked: '(us)',
  NotificationReplied: '(us)',
  NotificationClosed: '(uu)',
};

Gio._promisify(Gio.DBusConnection.prototype, 'call');

export class NotificationDaemon extends ServiceImplementation {
  private readonly activeNotifications = new Map<number, string>();
  private readonly proxy = NotificationsProxy(Gio.DBus.session, 'org.gnome.Shell', '/org/freedesktop/Notifications', (_proxy, error) => {
    if (error) console.error((error as Error).message);
  });

  constructor() {
    super(NotificationsIface, '/org/freedesktop/Notifications', false);

    for (const [signal, signature] of Object.entries(FORWARDED_SIGNALS)) {
      this.proxy.connectSignal(signal, (_proxy, _sender, params) => {
        const [id] = params;
        this.emitSignal(this.activeNotifications.get(id), signal, new GLib.Variant(signature, params));
        if (signal === 'NotificationClosed') this.activeNotifications.delete(id);
      });
    }
  }

  override register(): void {
    Gio.DBus.session.own_name('org.freedesktop.Notifications', Gio.BusNameOwnerFlags.REPLACE, null, null);
  }

  async NotifyAsync(params: NotifyArgs, invocation: Gio.DBusMethodInvocation): Promise<void> {
    const sender = invocation.get_sender()!;
    const pid = await this.getSenderPid(sender);
    const replaceId = params[1];
    const hints = params[6];

    if (!this.checkNotificationId(invocation, replaceId)) return;

    params[6] = {
      ...hints,
      'x-shell-sender-pid': new GLib.Variant('u', pid),
      'x-shell-sender': new GLib.Variant('s', sender),
    };

    try {
      const [id] = await this.proxy.NotifyAsync(...params);
      this.activeNotifications.set(id, sender);
      invocation.return_value(new GLib.Variant('(u)', [id]));
    } catch (error) {
      this.handleError(invocation, error);
    }
  }

  async CloseNotificationAsync([id]: [number], invocation: Gio.DBusMethodInvocation): Promise<void> {
    if (!this.checkNotificationId(invocation, id)) return;

    try {
      await this.proxy.CloseNotificationAsync(id);
      invocation.return_value(null);
    } catch (error) {
      this.handleError(invocation, error);
    }
  }

  async GetCapabilitiesAsync(_params: [], invocation: Gio.DBusMethodInvocation): Promise<void> {
    try {
      invocation.return_value(new GLib.Variant('(as)', await this.proxy.GetCapabilitiesAsync()));
    } catch (error) {
      this.handleError(invocation, error);
    }
  }

  async GetServerInformationAsync(_params: [], invocation: Gio.DBusMethodInvocation): Promise<void> {
    try {
      invocation.return_value(new GLib.Variant('(ssss)', await this.proxy.GetServerInformationAsync()));
    } catch (error) {
      this.handleError(invocation, error);
    }
  }

  protected override untrackSender(sender: string): void {
    super.untrackSender(sender);

    for (const [id, owner] of this.activeNotifications) {
      if (owner === sender) this.activeNotifications.delete(id);
    }
  }

  private emitSignal(sender: string | undefined, signalName: string, params: GLib.Variant): void {
    if (!sender) return;
    emitSignalToDestination(this.dbusImpl, sender, signalName, params);
  }

  private checkNotificationId(invocation: Gio.DBusMethodInvocation, id: number): boolean {
    if (id === 0) return true;
    if (!this.activeNotifications.has(id)) return true;
    if (this.activeNotifications.get(id) === invocation.get_sender()) return true;

    this.handleError(invocation, GLib.Error.new_literal(Gio.DBusError, Gio.DBusError.INVALID_ARGS, 'Invalid notification ID'));
    return false;
  }

  private async getSenderPid(sender: string): Promise<number> {
    const result = await Gio.DBus.session.call('org.freedesktop.DBus', '/', 'org.freedesktop.DBus', 'GetConnectionUnixProcessID',
      new GLib.Variant('(s)', [sender]), new GLib.VariantType('(u)'), Gio.DBusCallFlags.NONE, -1, null);
    const [pid] = result.deepUnpack<[number]>();
    return pid;
  }
}
