import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Polkit from 'gi://Polkit';
import type St from 'gi://St';

import * as KestrelUi from '../../../kestrelUi.js';
import * as Main from '../../main.js';
import * as MessageTray from '../../notifications/messageTray.js';
import * as Util from '../../runtime/util.js';
import { SystemIndicator } from '../quickSettings.js';

import { loadInterfaceXML } from '../../runtime/fileUtils.js';

const BOLT_DBUS_CLIENT_IFACE = 'org.freedesktop.bolt1.Manager';
const BOLT_DBUS_NAME = 'org.freedesktop.bolt';
const BOLT_DBUS_PATH = '/org/freedesktop/bolt';

const STATUS_CONNECTED = 'connected';
const POLICY_DEFAULT = 'default';
const AUTH_CTRL_NONE = 'none';
const AUTH_MODE_ENABLED = 'enabled';

interface BoltDeviceRemote {
  readonly Uid: string;
  readonly Name: string;
  readonly Status: string;
}

interface BoltManagerRemote {
  readonly Probing: boolean;
  readonly AuthMode: string;
  EnrollDeviceAsync(uid: string, policy: string, flags: string): Promise<[string]>;
  connectSignal(name: 'DeviceAdded', callback: (proxy: Gio.DBusProxy, sender: string, args: [string]) => void): number;
  disconnectSignal(id: number): void;
}

type BoltDevice = Gio.DBusProxy & BoltDeviceRemote;
type BoltManager = Gio.DBusProxy & BoltManagerRemote;

type AsyncPermission = {
  'new'(actionId: string, subject: Polkit.Subject | null, cancellable: Gio.Cancellable | null): Promise<Polkit.Permission>;
};

const BoltDeviceProxy = Gio.DBusProxy.makeProxyWrapper<BoltDeviceRemote>(loadInterfaceXML('org.freedesktop.bolt1.Device'));

function boltDevice(path: string): BoltDevice {
  return BoltDeviceProxy(Gio.DBus.system, BOLT_DBUS_NAME, path);
}

class Client {
  probing = false;
  private proxy: BoltManager | null = null;
  private deviceAddedId = 0;

  constructor(
    private readonly onProbing: (probing: boolean) => void,
    private readonly onDeviceAdded: (device: BoltDevice) => void,
  ) {
    void this.connectProxy();
  }

  private async connectProxy(): Promise<void> {
    const nodeInfo = Gio.DBusNodeInfo.new_for_xml(loadInterfaceXML(BOLT_DBUS_CLIENT_IFACE)!);
    const proxy = new Gio.DBusProxy({
      g_connection: Gio.DBus.system,
      g_flags: Gio.DBusProxyFlags.DO_NOT_AUTO_START,
      g_interface_info: nodeInfo.lookup_interface(BOLT_DBUS_CLIENT_IFACE),
      g_name: BOLT_DBUS_NAME,
      g_object_path: BOLT_DBUS_PATH,
      g_interface_name: BOLT_DBUS_CLIENT_IFACE,
    }) as BoltManager;
    try {
      await proxy.init_async(GLib.PRIORITY_DEFAULT, null);
    } catch (e) {
      log(`error creating bolt proxy: ${(e as Error).message}`);
      return;
    }
    this.proxy = proxy;
    proxy.connectObject('g-properties-changed', (_proxy: Gio.DBusProxy, properties: GLib.Variant) => {
      if (!properties.lookup_value('Probing', null)) return;
      this.probing = proxy.Probing;
      this.onProbing(this.probing);
    }, this);
    this.deviceAddedId = proxy.connectSignal('DeviceAdded', (_proxy, _sender, [path]) => this.onDeviceAdded(boltDevice(path)));

    this.probing = proxy.Probing;
    if (this.probing) this.onProbing(this.probing);
  }

  close(): void {
    if (!this.proxy) return;

    this.proxy.disconnectSignal(this.deviceAddedId);
    this.proxy.disconnectObject(this);
    this.proxy = null;
  }

  async enrollDevice(id: string, policy: string): Promise<BoltDevice> {
    try {
      const [path] = await this.proxy!.EnrollDeviceAsync(id, policy, AUTH_CTRL_NONE);
      return boltDevice(path);
    } catch (error) {
      Gio.DBusError.strip_remote_error(error as GLib.Error);
      throw error;
    }
  }

  get authMode(): string {
    return this.proxy!.AuthMode;
  }
}

class AuthRobot {
  private readonly devicesToEnroll: BoltDevice[] = [];
  private enrolling = false;

  constructor(
    private readonly client: Client,
    private readonly shouldEnroll: (device: BoltDevice) => boolean,
    private readonly onEnrollFailed: (error: Error) => void,
  ) {}

  deviceAdded(device: BoltDevice): void {
    if (device.Status !== STATUS_CONNECTED) return;
    if (!this.client.authMode.split('|').includes(AUTH_MODE_ENABLED)) return;
    if (!this.shouldEnroll(device)) return;

    this.devicesToEnroll.push(device);
    this.enrollDevices();
  }

  private enrollDevices(): void {
    if (this.enrolling) return;

    this.enrolling = true;
    GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => void this.enrollNextDevice());
  }

  private async enrollNextDevice(): Promise<void> {
    const device = this.devicesToEnroll.shift();
    if (device === undefined) return;

    try {
      await this.client.enrollDevice(device.Uid, POLICY_DEFAULT);

      this.enrolling = this.devicesToEnroll.length > 0;

      if (this.enrolling) GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => void this.enrollNextDevice());
    } catch (error) {
      this.onEnrollFailed(error as Error);
    }
  }
}

export const Indicator = GObject.registerClass(class Indicator extends SystemIndicator {
  private readonly indicator: St.Icon;
  private readonly client: Client;
  private readonly robot: AuthRobot;
  private permission: Polkit.Permission | null = null;
  private notification: MessageTray.Notification | null = null;

  constructor() {
    super();

    this.indicator = this._addIndicator();
    this.indicator.icon_name = 'thunderbolt-symbolic';

    this.client = new Client(probing => this.onProbing(probing), device => this.robot.deviceAdded(device));
    this.robot = new AuthRobot(this.client, device => this.shouldEnroll(device),
      error => this.notifyUser(KestrelUi.t('thunderbolt-error-title'), KestrelUi.t('thunderbolt-error-body', { reason: error.message })));

    this.connect('destroy', () => this.client.close());

    Main.sessionMode.connectObject('updated', () => this.sync(), this);
    this.sync();

    void this.createPermission();
  }

  private async createPermission(): Promise<void> {
    try {
      this.permission = await (Polkit.Permission as unknown as AsyncPermission).new('org.freedesktop.bolt.enroll', null, null);
    } catch (e) {
      log(`Failed to get PolKit permission: ${e}`);
    }
  }

  private notifyUser(title: string, body: string): void {
    this.notification?.destroy();

    const source = MessageTray.getSystemSource();
    const notification = new MessageTray.Notification({
      source,
      title,
      body,
      iconName: 'thunderbolt-symbolic',
      urgency: MessageTray.Urgency.HIGH,
    });
    this.notification = notification;
    notification.connect('destroy', () => {
      this.notification = null;
    });
    notification.connect('activated', () => Util.openSettings('security/protections'));
    source.addNotification(notification);
  }

  private sync(): void {
    this.indicator.visible = !Main.sessionMode.isLocked && this.client.probing;
  }

  private onProbing(probing: boolean): void {
    this.indicator.icon_name = probing ? 'thunderbolt-acquiring-symbolic' : 'thunderbolt-symbolic';
    this.sync();
  }

  private shouldEnroll(device: BoltDevice): boolean {
    const unlocked = !Main.sessionMode.isLocked;
    const allowed = this.permission?.allowed ?? false;
    const auth = unlocked && allowed;

    log(`thunderbolt: [${device.Name}] auto enrollment: ${auth ? 'yes' : 'no'} (allowed: ${allowed ? 'yes' : 'no'})`);

    if (auth) return true;

    if (!unlocked) this.notifyUser(KestrelUi.t('thunderbolt-unknown-title'), KestrelUi.t('thunderbolt-unknown-body'));
    else this.notifyUser(KestrelUi.t('thunderbolt-unauthorized-title'), KestrelUi.t('thunderbolt-unauthorized-body'));
    return false;
  }
});
