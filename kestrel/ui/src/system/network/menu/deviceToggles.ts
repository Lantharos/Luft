import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import NM from 'gi://NM';

import * as KestrelUi from '../../../kestrelUi.js';
import { Spinner } from '../../../shared/widgets/animation.js';
import { NMBluetoothDeviceItem, NMModemDeviceItem, NMWiredDeviceItem } from './deviceItems.js';
import { NMDeviceToggle } from './toggle.js';
import { NMWirelessDeviceItem } from './wirelessDeviceItem.js';

Gio._promisify(NM.Client.prototype, 'dbus_set_property');
Gio._promisify(NM.DeviceWifi.prototype, 'request_scan_async');

const WIFI_SCAN_FREQUENCY = 15;

async function scanDevice(device: NM.DeviceWifi): Promise<void> {
  const { lastScan } = device;
  await device.request_scan_async(null);

  return new Promise(resolve => {
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1500, () => {
      if (device.lastScan === lastScan) return GLib.SOURCE_CONTINUE;

      resolve();
      return GLib.SOURCE_REMOVE;
    });
  });
}

export class NMWirelessToggle extends NMDeviceToggle<NM.DeviceWifi, NMWirelessDeviceItem> {
  static {
    GObject.registerClass(this);
  }

  private readonly scanningSpinner = new Spinner(16);
  private scanTimeoutId = 0;

  constructor() {
    super(NM.DeviceType.WIFI);

    this.itemBinding.bind('is-hotspot', this, 'menu-enabled', GObject.BindingFlags.INVERT_BOOLEAN);

    this.menu.connectObject('open-state-changed', (_menu: unknown, isOpen: boolean) => {
      if (isOpen) this.startScanning();
      else this.stopScanning();
    }, this);

    this.menu.addHeaderSuffix(this.scanningSpinner);
    KestrelUi.bindText(this.menu.addSettingsAction('', 'network/wifi').label, 'network-menu-wifi-settings');
    KestrelUi.localized(this, () => {
      this.menu.setHeader('network-wireless-symbolic', KestrelUi.t('network-menu-wifi'));
      this.menuButtonAccessibleName = KestrelUi.t('network-menu-wifi-open-menu');
      this.refreshLabels();
    });
  }

  setClient(client: NM.Client | null): void {
    super.setClient(client);

    this.client?.bind_property('wireless-enabled', this, 'checked', GObject.BindingFlags.SYNC_CREATE);
    this.client?.bind_property('wireless-hardware-enabled', this, 'reactive', GObject.BindingFlags.SYNC_CREATE);
  }

  activate(): void {
    const primaryItem = this.primaryItem;
    if (primaryItem?.is_hotspot) primaryItem.activate();
    else this.toggleWirelessEnabled().catch(logError);
  }

  private async toggleWirelessEnabled(): Promise<void> {
    await this.client!.dbus_set_property(
      NM.DBUS_PATH,
      NM.DBUS_INTERFACE,
      'WirelessEnabled',
      new GLib.Variant('b', !this.client!.wireless_enabled),
      2000,
      null);
  }

  private async scanDevices(): Promise<void> {
    if (!this.client!.wireless_enabled) return;

    this.scanningSpinner.play();
    await Promise.all([...this.items.keys()].map(scanDevice));
    this.scanningSpinner.stop();
  }

  private startScanning(): void {
    this.scanTimeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, WIFI_SCAN_FREQUENCY, () => {
      this.scanDevices().catch(logError);
      return GLib.SOURCE_CONTINUE;
    });
    this.scanDevices().catch(logError);
  }

  private stopScanning(): void {
    if (this.scanTimeoutId) GLib.source_remove(this.scanTimeoutId);
    this.scanTimeoutId = 0;
  }

  createDeviceMenuItem(device: NM.DeviceWifi): NMWirelessDeviceItem {
    return new NMWirelessDeviceItem(this.client!, device);
  }

  protected updateChecked(): void {}

  protected findPrimaryItem(): NMWirelessDeviceItem | null {
    return [...this.items.values()].find(i => i.is_hotspot) ?? super.findPrimaryItem();
  }

  protected shouldShowDevice(device: NM.DeviceWifi): boolean {
    return device.state === NM.DeviceState.UNAVAILABLE || super.shouldShowDevice(device);
  }
}

export class NMWiredToggle extends NMDeviceToggle<NM.Device, NMWiredDeviceItem> {
  static {
    GObject.registerClass(this);
  }

  constructor() {
    super(NM.DeviceType.ETHERNET);

    KestrelUi.bindText(this.menu.addSettingsAction('', 'network/ethernet').label, 'network-menu-wired-settings');
    KestrelUi.localized(this, () => {
      this.menu.setHeader('network-wired-symbolic', KestrelUi.t('network-menu-wired'));
      this.menuButtonAccessibleName = KestrelUi.t('network-menu-wired-open-menu');
      this.refreshLabels();
    });
  }

  createDeviceMenuItem(device: NM.Device): NMWiredDeviceItem {
    return new NMWiredDeviceItem(this.client!, device);
  }
}

export class NMBluetoothToggle extends NMDeviceToggle<NM.DeviceBt, NMBluetoothDeviceItem> {
  static {
    GObject.registerClass(this);
  }

  constructor() {
    super(NM.DeviceType.BT);

    KestrelUi.bindText(this.menu.addSettingsAction('', 'network').label, 'network-menu-tether-settings');
    KestrelUi.localized(this, () => {
      this.menu.setHeader('network-cellular-symbolic', KestrelUi.t('network-menu-tethers'));
      this.menuButtonAccessibleName = KestrelUi.t('network-menu-tethers-open-menu');
      this.refreshLabels();
    });
  }

  protected defaultName(): string {
    return KestrelUi.t('network-menu-tether');
  }

  createDeviceMenuItem(device: NM.DeviceBt): NMBluetoothDeviceItem {
    return new NMBluetoothDeviceItem(this.client!, device);
  }
}

export class NMModemToggle extends NMDeviceToggle<NM.DeviceModem, NMModemDeviceItem> {
  static {
    GObject.registerClass(this);
  }

  constructor() {
    super(NM.DeviceType.MODEM);

    KestrelUi.bindText(this.menu.addSettingsAction('', 'network').label, 'network-menu-mobile-settings');
    KestrelUi.localized(this, () => {
      this.menu.setHeader('network-cellular-symbolic', KestrelUi.t('network-menu-mobile-connections'));
      this.menuButtonAccessibleName = KestrelUi.t('network-menu-mobile-open-menu');
      this.refreshLabels();
    });
  }

  protected defaultName(): string {
    return KestrelUi.t('network-menu-mobile');
  }

  createDeviceMenuItem(device: NM.DeviceModem): NMModemDeviceItem {
    return new NMModemDeviceItem(this.client!, device);
  }
}
