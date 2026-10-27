import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import NM from 'gi://NM';
import Polkit from 'gi://Polkit';
import type St from 'gi://St';

import * as KestrelUi from '../../../kestrelUi.js';
import * as MessageTray from '../../../surfaces/notifications/tray/messageTray.js';
import { SystemIndicator } from '../../toggles/quickSettings.js';
import { CaptivePortalHandler } from './captivePortal.js';
import { NMBluetoothToggle, NMModemToggle, NMWiredToggle, NMWirelessToggle } from './deviceToggles.js';
import { connectionName, deviceKind } from './nmUtils.js';
import { NMVpnToggle } from './vpn.js';

Gio._promisify(NM.Client, 'new_async');

interface AsyncClient {
  new_async(cancellable: Gio.Cancellable | null): Promise<NM.Client>;
}

interface AsyncPermission {
  'new'(actionId: string, subject: Polkit.Subject | null, cancellable: Gio.Cancellable | null): Promise<Polkit.Permission>;
}

export class Indicator extends SystemIndicator {
  static {
    GObject.registerClass(this);
  }

  readonly wirelessToggle = new NMWirelessToggle();
  private readonly vpnToggle = new NMVpnToggle();
  private readonly deviceToggles = new Map<NM.DeviceType, NMWiredToggle | NMWirelessToggle | NMModemToggle | NMBluetoothToggle>([
    [NM.DeviceType.ETHERNET, new NMWiredToggle()],
    [NM.DeviceType.WIFI, this.wirelessToggle],
    [NM.DeviceType.MODEM, new NMModemToggle()],
    [NM.DeviceType.BT, new NMBluetoothToggle()],
  ]);

  private readonly toggles = [...this.deviceToggles.values(), this.vpnToggle];
  private readonly primaryIndicator: St.Icon;
  private readonly primaryIndicatorBinding = new GObject.BindingGroup();
  private client: NM.Client | null = null;
  private portalHandler: CaptivePortalHandler | null = null;
  private mainConnection: NM.ActiveConnection | null = null;
  private notification: MessageTray.Notification | null = null;

  constructor() {
    super();

    this.quickSettingsItems.push(...this.toggles);
    this.toggles.forEach(toggle => toggle.connectObject('activation-failed', () => this.onActivationFailed(), this));

    this.primaryIndicator = this._addIndicator();
    const vpnIndicator = this._addIndicator();

    this.primaryIndicatorBinding.bind('icon-name', this.primaryIndicator, 'icon-name', GObject.BindingFlags.DEFAULT);

    this.vpnToggle.bind_property('checked', vpnIndicator, 'visible', GObject.BindingFlags.SYNC_CREATE);
    this.vpnToggle.bind_property('icon-name', vpnIndicator, 'icon-name', GObject.BindingFlags.SYNC_CREATE);

    this.loadClient().catch(logError);
  }

  private async loadClient(): Promise<void> {
    const client = await (NM.Client as unknown as AsyncClient).new_async(null);
    this.client = client;

    this.toggles.forEach(toggle => toggle.setClient(client));

    client.bind_property('nm-running', this, 'visible', GObject.BindingFlags.SYNC_CREATE);

    this.portalHandler = new CaptivePortalHandler(client.connectivityCheckUri);

    client.connectObject(
      'notify::primary-connection', () => this.syncMainConnection(),
      'notify::activating-connection', () => this.syncMainConnection(),
      'notify::connectivity', () => this.syncConnectivity(),
      this);
    this.wirelessToggle.connectObject('notify::visible', () => this.updateIcon(), this);
    this.syncMainConnection();

    try {
      const permission = await (Polkit.Permission as unknown as AsyncPermission).new('org.freedesktop.NetworkManager.network-control', null, null);
      this.toggles.forEach(toggle => permission.bind_property('allowed', toggle, 'reactive', GObject.BindingFlags.SYNC_CREATE));
    } catch (e) {
      log(`No permission to control network connections: ${e}`);
    }
  }

  private onActivationFailed(): void {
    this.notification?.destroy();

    const source = MessageTray.getSystemSource();
    this.notification = new MessageTray.Notification({
      source,
      title: KestrelUi.t('network-menu-failed-title'),
      body: KestrelUi.t('network-menu-failed-body'),
      iconName: 'network-error-symbolic',
      urgency: MessageTray.Urgency.HIGH,
      isTransient: true,
    });
    this.notification.connect('destroy', () => (this.notification = null));

    source.addNotification(this.notification);
  }

  private syncMainConnection(): void {
    this.mainConnection?.disconnectObject(this);

    this.mainConnection = this.client!.get_primary_connection() || this.client!.get_activating_connection();

    if (this.mainConnection) {
      this.mainConnection.connectObject('notify::state', () => this.mainConnectionStateChanged(), this);
      this.mainConnectionStateChanged();
    }

    this.syncConnectivity();
  }

  private mainConnectionStateChanged(): void {
    if (this.mainConnection!.state === NM.ActiveConnectionState.ACTIVATED) this.notification?.destroy();
  }

  private syncConnectivity(): void {
    this.updateIcon();
    if (this.mainConnection == null || this.mainConnection.state !== NM.ActiveConnectionState.ACTIVATED) {
      this.portalHandler!.clear();
      return;
    }

    let isPortal = this.client!.connectivity === NM.ConnectivityState.PORTAL;
    if (GLib.getenv('KESTREL_CONNECTIVITY_TEST') != null) isPortal ||= this.client!.connectivity < NM.ConnectivityState.FULL;

    if (isPortal) {
      const [device] = this.mainConnection.get_devices();
      this.portalHandler!.addConnection(
        connectionName(this.mainConnection.connection, deviceKind(device)),
        this.mainConnection.get_path()!);
    } else {
      this.portalHandler!.clear();
    }
  }

  private updateIcon(): void {
    const [device] = this.mainConnection?.get_devices() ?? [];
    const idleToggle = this.wirelessToggle.visible ? this.wirelessToggle : null;
    const primaryToggle = this.mainConnection
      ? (device && this.deviceToggles.get(device.device_type)) ?? null
      : idleToggle;
    this.primaryIndicatorBinding.set_source(primaryToggle);

    if (!primaryToggle) {
      this.primaryIndicator.icon_name = this.client!.connectivity === NM.ConnectivityState.FULL
        ? 'network-wired-symbolic'
        : 'network-wired-no-route-symbolic';
    }

    const connected = this.client!.get_state() === NM.State.CONNECTED_GLOBAL;
    this.primaryIndicator.visible = primaryToggle != null || connected;
  }
}
