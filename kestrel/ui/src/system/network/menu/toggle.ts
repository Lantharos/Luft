import GObject from 'gi://GObject';
import NM from 'gi://NM';
import type St from 'gi://St';

import * as KestrelUi from '../../../kestrelUi.js';
import * as PopupMenu from '../../../shared/popups/popupMenu.js';
import { QuickMenuToggle } from '../../toggles/quickSettings.js';
import { ItemSorter } from './itemSorter.js';
import type { NMMenuItem } from './menuItems.js';
import { deviceKind, deviceNames, MAX_VISIBLE_NETWORKS } from './nmUtils.js';

export namespace NMToggle {
  export interface Signals extends St.Button.SignalSignatures {
    'activation-failed': () => void;
  }
}

export interface DeviceMenuItem extends NMMenuItem {
  singleDeviceMode: boolean;
  setDeviceName(name: string): void;
}

const SHOWN_DEVICE_STATES = new Set([
  NM.DeviceState.DISCONNECTED,
  NM.DeviceState.ACTIVATED,
  NM.DeviceState.DEACTIVATING,
  NM.DeviceState.PREPARE,
  NM.DeviceState.CONFIG,
  NM.DeviceState.IP_CONFIG,
  NM.DeviceState.IP_CHECK,
  NM.DeviceState.SECONDARIES,
  NM.DeviceState.NEED_AUTH,
  NM.DeviceState.FAILED,
]);

export abstract class NMToggle<K, T extends NMMenuItem> extends QuickMenuToggle {
  static {
    GObject.registerClass({
      Signals: {
        'activation-failed': {},
      },
    }, this as unknown as typeof QuickMenuToggle);
  }

  declare connect: GObject.SignalMethods<this, NMToggle.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, NMToggle.Signals>['emit'];
  declare menuButtonAccessibleName: string | null;

  protected client: NM.Client | null = null;
  protected readonly items = new Map<K, T>();
  protected readonly itemBinding = new GObject.BindingGroup();
  private readonly itemSorter = new ItemSorter<T>({ trackMru: true });
  private readonly itemsSection = new PopupMenu.PopupMenuSection();

  constructor() {
    super();

    this.menu.addMenuItem(this.itemsSection);
    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

    this.itemBinding.bind('icon-name', this, 'icon-name', GObject.BindingFlags.DEFAULT);
    this.itemBinding.bind_property_full('source', this, 'title', GObject.BindingFlags.DEFAULT,
      () => [true, this.defaultName()], null);
    this.itemBinding.bind_full('name', this, 'subtitle', GObject.BindingFlags.DEFAULT,
      (_binding, name: string | null) => [true, this.transformSubtitle(name)], null);

    this.connect('clicked', () => this.activate());
  }

  protected get primaryItem(): T | null {
    return this.itemBinding.source as T | null;
  }

  setClient(client: NM.Client | null): void {
    if (this.client === client) return;

    this.client?.disconnectObject(this);
    this.client = client;
    this.client?.connectObject('notify::networking-enabled', () => this.sync(), this);

    this.items.forEach(item => item.destroy());
    this.items.clear();

    if (this.client) this.loadInitialItems(this.client);
    this.sync();
  }

  activate(): void {
    const activeItems = [...this.activeItems()];

    if (activeItems.length > 0) activeItems.forEach(i => i.activate());
    else this.primaryItem?.activate();
  }

  protected abstract loadInitialItems(client: NM.Client): void;

  protected abstract defaultName(): string;

  protected transformSubtitle(name: string | null): string | null {
    const nActive = this.checked ? [...this.activeItems()].length : 0;
    if (nActive > 1) return KestrelUi.t('network-menu-connected-count', { count: nActive });
    return name;
  }

  protected refreshLabels(): void {
    if (this.primaryItem) this.title = this.defaultName();
    this.primaryItem?.notify('name');
  }

  private updateItemsVisibility(): void {
    [...this.itemSorter.itemsByMru()].forEach((item, i) => (item.visible = i < MAX_VISIBLE_NETWORKS));
  }

  private itemActiveChanged(): void {
    this.primaryItem?.notify('name');
    this.sync();
  }

  protected updateChecked(): void {
    const [firstActive] = this.activeItems();
    this.checked = !!firstActive;
  }

  private resortItem(item: T): void {
    const pos = this.itemSorter.upsert(item);
    this.itemsSection.moveMenuItem(item, pos);
  }

  addItem(key: K, item: T): void {
    item.connectObject(
      'notify::is-active', () => this.itemActiveChanged(),
      'notify::name', () => this.resortItem(item),
      'destroy', () => this.removeItem(key),
      this);

    this.items.set(key, item);
    const pos = this.itemSorter.upsert(item);
    this.itemsSection.addMenuItem(item, pos);
    this.sync();
  }

  removeItem(key: K): void {
    const item = this.items.get(key);
    if (!item) return;

    this.itemSorter.delete(item);
    this.items.delete(key);

    item.destroy();
    this.sync();
  }

  private *activeItems(): Generator<T> {
    for (const item of this.itemSorter) {
      if (item.is_active) yield item;
    }
  }

  protected findPrimaryItem(): T | null {
    const [firstActive] = this.activeItems();
    if (firstActive) return firstActive;

    const [lastUsed] = this.itemSorter.itemsByMru();
    if (lastUsed?.timestamp > 0) return lastUsed;

    for (const item of this.itemSorter) {
      if (item.visible) return item;
    }
    return null;
  }

  protected sync(): void {
    this.visible = !!this.client?.networking_enabled && this.items.size > 0;
    this.updateItemsVisibility();
    this.updateChecked();
    this.itemBinding.set_source(this.findPrimaryItem());
  }
}

export abstract class NMDeviceToggle<D extends NM.Device, T extends DeviceMenuItem> extends NMToggle<D, T> {
  static {
    GObject.registerClass(this as unknown as typeof QuickMenuToggle);
  }

  private readonly nmDevices = new Set<D>();
  private readonly deviceNames = new Map<D, string>();

  constructor(readonly deviceType: NM.DeviceType) {
    super();
  }

  setClient(client: NM.Client | null): void {
    this.nmDevices.clear();

    super.setClient(client);

    this.client?.connectObject(
      'device-added', (_client: NM.Client, device: NM.Device) => {
        this.addDevice(device);
        this.syncDeviceNames();
      },
      'device-removed', (_client: NM.Client, device: NM.Device) => {
        this.removeDevice(device);
        this.syncDeviceNames();
      }, this);
  }

  protected defaultName(): string {
    const [device] = this.nmDevices;
    return deviceKind(device);
  }

  protected refreshLabels(): void {
    this.syncDeviceNames();
    super.refreshLabels();
  }

  protected transformSubtitle(name: string | null): string | null {
    const subtitle = super.transformSubtitle(name);
    return subtitle === this.title ? null : subtitle;
  }

  protected loadInitialItems(client: NM.Client): void {
    for (const device of client.get_devices()) this.addDevice(device);
    this.syncDeviceNames();
  }

  protected shouldShowDevice(device: D): boolean {
    return SHOWN_DEVICE_STATES.has(device.state);
  }

  private syncDeviceNames(): void {
    const devices = [...this.nmDevices];
    const names = deviceNames(devices);
    this.deviceNames.clear();
    devices.forEach((device, i) => {
      this.deviceNames.set(device, names[i]);
      this.items.get(device)?.setDeviceName(names[i]);
    });
  }

  private syncDeviceItem(device: D): void {
    if (this.shouldShowDevice(device)) this.ensureDeviceItem(device);
    else this.removeItem(device);
  }

  private deviceStateChanged(device: D, newState: NM.DeviceState, oldState: NM.DeviceState, reason: NM.DeviceStateReason): void {
    if (newState === oldState) {
      console.info(`${device} emitted state-changed without actually changing state`);
      return;
    }

    if (newState === NM.DeviceState.FAILED && reason !== NM.DeviceStateReason.NO_SECRETS) this.emit('activation-failed');
  }

  abstract createDeviceMenuItem(device: D): T;

  private ensureDeviceItem(device: D): void {
    if (this.items.has(device)) return;

    const item = this.createDeviceMenuItem(device);
    item.setDeviceName(this.deviceNames.get(device) ?? '');
    this.addItem(device, item);
  }

  private addDevice(device: NM.Device): void {
    if (this.nmDevices.has(device as D)) return;
    if (device.get_device_type() !== this.deviceType) return;

    const typed = device as D;
    typed.connectObject(
      'state-changed', (_device: D, newState: NM.DeviceState, oldState: NM.DeviceState, reason: NM.DeviceStateReason) =>
        this.deviceStateChanged(typed, newState, oldState, reason),
      'notify::interface', () => this.syncDeviceNames(),
      'notify::state', () => this.syncDeviceItem(typed),
      this);

    this.nmDevices.add(typed);
    this.syncDeviceItem(typed);
  }

  private removeDevice(device: NM.Device): void {
    if (!this.nmDevices.delete(device as D)) return;

    device.disconnectObject(this);
    this.removeItem(device as D);
  }

  protected sync(): void {
    super.sync();

    const nItems = this.items.size;
    this.items.forEach(item => (item.singleDeviceMode = nItems === 1));
  }
}
