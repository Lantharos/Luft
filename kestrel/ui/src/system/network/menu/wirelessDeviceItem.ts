import GObject from 'gi://GObject';
import NM from 'gi://NM';

import * as KestrelUi from '../../../kestrelUi.js';
import * as Main from '../../../core/main.js';
import { ItemSorter } from './itemSorter.js';
import { NMSectionItem } from './menuItems.js';
import { canReachInternet, connectionName, MAX_VISIBLE_NETWORKS, NM80211Mode, signalToIcon, ssidToLabel } from './nmUtils.js';
import { NMWirelessNetworkItem, WirelessNetwork } from './wirelessNetwork.js';

export class NMWirelessDeviceItem extends NMSectionItem {
  static {
    GObject.registerClass({
      Properties: {
        'is-hotspot': GObject.ParamSpec.boolean('is-hotspot', null, null, GObject.ParamFlags.READABLE, false),
        'single-device-mode': GObject.ParamSpec.boolean('single-device-mode', null, null, GObject.ParamFlags.READWRITE, false),
      },
    }, this);
  }

  declare singleDeviceMode: boolean;
  private deviceName = '';
  private readonly networks: WirelessNetwork[] = [];
  private readonly itemSorter = new ItemSorter<NMWirelessNetworkItem>({
    sortFunc: (one, two) => one.network.compare(two.network),
  });
  private activeAccessPoint: NM.AccessPoint | null = null;

  constructor(private readonly client: NM.Client, private readonly device: NM.DeviceWifi) {
    super();

    this.client.connectObject(
      'notify::wireless-enabled', () => this.notify('icon-name'),
      'notify::connectivity', () => this.notify('icon-name'),
      'notify::primary-connection', () => this.notify('icon-name'),
      this);

    this.device.connectObject(
      'notify::active-access-point', () => this.activeApChanged(),
      'notify::active-connection', () => this.setActiveConnection(this.device.active_connection),
      'notify::available-connections', () => this.availableConnectionsChanged(),
      'state-changed', () => this.notify('is-hotspot'),
      'access-point-added', (_device: NM.DeviceWifi, ap: NM.AccessPoint) => {
        this.addAccessPoint(ap);
        this.updateItemsVisibility();
      },
      'access-point-removed', (_device: NM.DeviceWifi, ap: NM.AccessPoint) => {
        this.removeAccessPoint(ap);
        this.updateItemsVisibility();
      }, this);

    this.bind_property('single-device-mode', this, 'use-submenu', GObject.BindingFlags.INVERT_BOOLEAN);

    Main.sessionMode.connectObject('updated', () => this.updateItemsVisibility(), this);

    for (const ap of this.device.get_access_points()) this.addAccessPoint(ap);

    this.activeApChanged();
    this.setActiveConnection(this.device.active_connection);
    this.availableConnectionsChanged();
    this.updateItemsVisibility();

    this.connect('destroy', () => this.networks.forEach(net => net.destroy()));
  }

  get icon_name(): string {
    if (!this.device.client.wireless_enabled) return 'network-wireless-disabled-symbolic';

    switch (this.state) {
      case NM.ActiveConnectionState.ACTIVATING:
      case NM.ActiveConnectionState.DEACTIVATING:
        return 'network-wireless-acquiring-symbolic';

      case NM.ActiveConnectionState.ACTIVATED: {
        if (this.is_hotspot) return 'network-wireless-hotspot-symbolic';
        if (!canReachInternet(this.client, this.device)) return 'network-wireless-no-route-symbolic';

        if (!this.activeAccessPoint) {
          if (this.device.mode !== NM80211Mode.ADHOC)
            console.info('An active wireless connection, in infrastructure mode, involves no access point?');
          return 'network-wireless-offline-symbolic';
        }

        return `network-wireless-signal-${signalToIcon(this.activeAccessPoint.strength)}-symbolic`;
      }
      default:
        return 'network-wireless-signal-none-symbolic';
    }
  }

  get name(): string {
    if (this.is_hotspot) return KestrelUi.t('network-menu-hotspot', { name: this.deviceName });

    const ssid = this.activeAccessPoint?.ssid;
    if (ssid) return ssidToLabel(ssid);

    const { activeConnection } = this.device;
    if (activeConnection) return connectionName(activeConnection.connection, this.deviceName);

    return this.deviceName;
  }

  get is_hotspot(): boolean {
    const ip4config = this.device.active_connection?.connection?.get_setting_ip4_config();
    return ip4config?.get_method() === NM.SETTING_IP4_CONFIG_METHOD_SHARED;
  }

  activate(): void {
    if (!this.is_hotspot) return;
    this.client.deactivate_connection_async(this.device.activeConnection, null, null);
  }

  private activeApChanged(): void {
    this.activeAccessPoint?.disconnectObject(this);
    this.activeAccessPoint = this.device.active_access_point;
    this.activeAccessPoint?.connectObject(
      'notify::strength', () => this.notify('icon-name'),
      'notify::ssid', () => this.notify('name'),
      this);

    this.notify('icon-name');
    this.notify('name');
  }

  private availableConnectionsChanged(): void {
    const connections = this.device.get_available_connections();
    this.networks.forEach(net => net.checkConnections(connections));
  }

  private addAccessPoint(ap: NM.AccessPoint): void {
    if (ap.get_ssid() == null) {
      ap.connectObject('notify::ssid', () => {
        if (!ap.ssid) return;
        ap.disconnectObject(this);
        this.addAccessPoint(ap);
      }, this);
      return;
    }

    let network = this.networks.find(n => n.checkAccessPoint(ap));

    if (!network) {
      const added = new WirelessNetwork(this.device);
      network = added;

      const item = new NMWirelessNetworkItem(added);
      item.connect('activate', () => added.activate());

      added.connectObject(
        'notify::icon-name', () => this.resortItem(item),
        'notify::is-active', () => this.resortItem(item),
        'destroy', () => {
          const idx = this.networks.indexOf(added);
          if (idx >= 0) this.networks.splice(idx, 1);

          this.itemSorter.delete(item);
          item.destroy();
        },
        this);

      const pos = this.itemSorter.upsert(item);
      this.section.addMenuItem(item, pos);
      this.networks.push(added);
    }

    network.addAccessPoint(ap);
  }

  private removeAccessPoint(ap: NM.AccessPoint): void {
    ap.disconnectObject(this);

    const network = this.networks.find(n => n.removeAccessPoint(ap));
    if (!network || network.hasAccessPoints()) return;

    network.destroy();
  }

  private resortItem(item: NMWirelessNetworkItem): void {
    const pos = this.itemSorter.upsert(item);
    this.section.moveMenuItem(item, pos);

    this.updateItemsVisibility();
  }

  private updateItemsVisibility(): void {
    const { hasWindows } = Main.sessionMode;

    let nVisible = 0;
    for (const item of this.itemSorter) {
      const { network } = item;
      item.visible = (hasWindows || network.hasConnections() || network.canAutoconnect()) && nVisible < MAX_VISIBLE_NETWORKS;
      if (item.visible) nVisible++;
    }
  }

  setDeviceName(name: string): void {
    this.deviceName = name;
    this.notify('name');
  }
}
