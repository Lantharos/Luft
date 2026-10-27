import GObject from 'gi://GObject';
import NM from 'gi://NM';

import * as KestrelUi from '../../../kestrelUi.js';
import * as Main from '../../main.js';
import * as PopupMenu from '../../popups/popupMenu.js';
import * as Util from '../../runtime/util.js';
import { BroadbandModem } from '../../system/modemManager.js';
import { ItemSorter } from './itemSorter.js';
import { NMDeviceConnectionItem, NMSectionItem, type ConnectionSection } from './menuItems.js';
import { canReachInternet, signalToIcon } from './nmUtils.js';

export class NMDeviceItem extends NMSectionItem implements ConnectionSection {
  static {
    GObject.registerClass({
      Properties: {
        'single-device-mode': GObject.ParamSpec.boolean('single-device-mode', null, null, GObject.ParamFlags.READWRITE, false),
      },
    }, this);
  }

  declare singleDeviceMode: boolean;
  protected deviceName = '';
  protected readonly autoConnectItem: PopupMenu.PopupImageMenuItem;
  private readonly connectionItems = new Map<NM.RemoteConnection, NMDeviceConnectionItem>();
  private readonly itemSorter = new ItemSorter<NMDeviceConnectionItem>({ trackMru: true });
  private readonly deactivateItem: PopupMenu.PopupMenuItem | PopupMenu.PopupImageMenuItem;

  constructor(protected readonly client: NM.Client, protected readonly device: NM.Device) {
    super();

    this.autoConnectItem = this.section.addAction('', () => this.autoConnect(), '') as PopupMenu.PopupImageMenuItem;

    this.bind_property('name', this.autoConnectItem.label, 'text', GObject.BindingFlags.SYNC_CREATE);
    this.bind_property('icon-name', this.autoConnectItem.icon, 'icon-name', GObject.BindingFlags.SYNC_CREATE);

    this.deactivateItem = this.section.addAction('', () => this.deactivateConnection());
    KestrelUi.bindText(this.deactivateItem.label, 'network-menu-turn-off');

    this.client.connectObject(
      'notify::connectivity', () => this.notify('icon-name'),
      'notify::primary-connection', () => this.notify('icon-name'),
      this);

    this.device.connectObject(
      'notify::available-connections', () => this.syncConnections(),
      'notify::active-connection', () => this.activeConnectionChanged(),
      this);

    this.connect('notify::single-device-mode', () => this.sync());

    this.syncConnections();
    this.activeConnectionChanged();
  }

  get timestamp(): number {
    const [item] = this.itemSorter.itemsByMru();
    return item?.timestamp ?? 0;
  }

  protected canReachInternet(): boolean {
    return canReachInternet(this.client, this.device);
  }

  protected autoConnect(): void {
    this.client.add_and_activate_connection_async(new NM.SimpleConnection(), this.device, null, null, null);
  }

  private activeConnectionChanged(): void {
    if (this.activeConnection) this.connectionItems.get(this.activeConnection.connection)?.setActiveConnection(null);

    this.setActiveConnection(this.device.active_connection);

    if (this.activeConnection) this.connectionItems.get(this.activeConnection.connection)?.setActiveConnection(this.activeConnection);
  }

  private syncConnections(): void {
    const available = this.device.get_available_connections().filter(c => c.get_id() != null);
    const removed = [...this.connectionItems.keys()].filter(conn => !available.includes(conn));

    for (const conn of removed) this.removeConnection(conn);
    for (const conn of available) this.addConnection(conn);
  }

  private activatableItem(): PopupMenu.PopupBaseMenuItem {
    const [lastUsed] = this.itemSorter.itemsByMru();
    if (lastUsed?.timestamp > 0) return lastUsed;

    const [firstItem] = this.itemSorter;
    return firstItem ?? this.autoConnectItem;
  }

  activate(): void {
    super.activate();

    if (this.activeConnection) this.deactivateConnection();
    else this.activatableItem().activate(null);
  }

  activateConnection(connection: NM.RemoteConnection): void {
    this.client.activate_connection_async(connection, this.device, null, null, null);
  }

  deactivateConnection(): void {
    this.device.disconnect(null);
  }

  private resortItem(item: NMDeviceConnectionItem): void {
    const pos = this.itemSorter.upsert(item);
    this.section.moveMenuItem(item, pos);
  }

  private addConnection(connection: NM.RemoteConnection): void {
    if (this.connectionItems.has(connection)) return;

    connection.connectObject('changed', () => this.connectionItems.get(connection)!.updateForConnection(connection), this);

    const item = new NMDeviceConnectionItem(this, connection);

    this.bind_property('radio-mode', item, 'radio-mode', GObject.BindingFlags.SYNC_CREATE);
    this.bind_property('name', item, 'device-name', GObject.BindingFlags.SYNC_CREATE);
    this.bind_property('icon-name', item, 'icon-name', GObject.BindingFlags.SYNC_CREATE);
    item.connectObject('notify::name', () => this.resortItem(item), this);

    const pos = this.itemSorter.upsert(item);
    this.section.addMenuItem(item, pos);
    this.connectionItems.set(connection, item);
    this.sync();
  }

  private removeConnection(connection: NM.RemoteConnection): void {
    const item = this.connectionItems.get(connection);
    if (!item) return;

    this.itemSorter.delete(item);
    this.connectionItems.delete(connection);
    item.destroy();

    this.sync();
  }

  setDeviceName(name: string): void {
    this.deviceName = name;
    this.notify('name');
  }

  protected sync(): void {
    const nItems = this.connectionItems.size;
    this.radioMode = nItems > 1;
    this.use_submenu = this.radioMode && !this.singleDeviceMode;
    this.autoConnectItem.visible = nItems === 0;
    this.deactivateItem.visible = this.radioMode && this.is_active;
  }
}

export class NMWiredDeviceItem extends NMDeviceItem {
  static {
    GObject.registerClass(this);
  }

  get icon_name(): string {
    switch (this.state) {
      case NM.ActiveConnectionState.ACTIVATING:
        return 'network-wired-acquiring-symbolic';
      case NM.ActiveConnectionState.ACTIVATED:
        return this.canReachInternet() ? 'network-wired-symbolic' : 'network-wired-no-route-symbolic';
      default:
        return 'network-wired-disconnected-symbolic';
    }
  }

  get name(): string {
    return this.deviceName;
  }

  protected sync(): void {
    this.visible = this.device instanceof NM.DeviceEthernet ? this.device.carrier : true;
    super.sync();
  }
}

export class NMModemDeviceItem extends NMDeviceItem {
  static {
    GObject.registerClass(this);
  }

  private readonly mobileDevice: BroadbandModem | null = null;

  constructor(client: NM.Client, device: NM.DeviceModem) {
    super(client, device);

    if (device.udi.startsWith('/org/freedesktop/ModemManager1/Modem')) this.mobileDevice = new BroadbandModem(device.udi);

    this.mobileDevice?.connectObject(
      'notify::operator-name', () => this.sync(),
      'notify::signal-quality', () => this.notify('icon-name'),
      this);

    Main.sessionMode.connectObject('updated', () => this.sessionUpdated(), this);
    this.sessionUpdated();
  }

  get icon_name(): string {
    switch (this.state) {
      case NM.ActiveConnectionState.ACTIVATING:
        return 'network-cellular-acquiring-symbolic';
      case NM.ActiveConnectionState.ACTIVATED:
        return `network-cellular-signal-${signalToIcon(this.mobileDevice?.signalQuality ?? 0)}-symbolic`;
      default:
        return this.activeConnection ? 'network-cellular-signal-none-symbolic' : 'network-cellular-disabled-symbolic';
    }
  }

  get name(): string {
    return this.mobileDevice?.operatorName || this.deviceName;
  }

  protected autoConnect(): void {
    Util.openSettings('network');
  }

  private sessionUpdated(): void {
    this.autoConnectItem.sensitive = Main.sessionMode.hasWindows;
  }
}

export class NMBluetoothDeviceItem extends NMDeviceItem {
  static {
    GObject.registerClass(this);
  }

  declare protected readonly device: NM.DeviceBt;

  constructor(client: NM.Client, device: NM.DeviceBt) {
    super(client, device);

    this.device.bind_property('name', this, 'name', GObject.BindingFlags.SYNC_CREATE);
  }

  get icon_name(): string {
    switch (this.state) {
      case NM.ActiveConnectionState.ACTIVATING:
        return 'network-cellular-acquiring-symbolic';
      case NM.ActiveConnectionState.ACTIVATED:
        return 'network-cellular-connected-symbolic';
      default:
        return this.activeConnection ? 'network-cellular-signal-none-symbolic' : 'network-cellular-disabled-symbolic';
    }
  }

  get name(): string {
    return this.device.name;
  }
}
