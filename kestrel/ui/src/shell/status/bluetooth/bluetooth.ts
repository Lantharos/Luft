import Atk from 'gi://Atk';
import GObject from 'gi://GObject';
import Pango from 'gi://Pango';
import St from 'gi://St';

import { Spinner } from '../../widgets/animation.js';
import * as KestrelUi from '../../../kestrelUi.js';
import * as PopupMenu from '../../popups/popupMenu.js';
import { QuickMenuToggle, SystemIndicator } from '../quickSettings.js';

import { getBluetoothClient, type BluetoothClient } from './client.js';
import type { BluetoothDevice } from './device.js';

const STATE_ICONS = new Map([
  ['on', 'bluetooth-active-symbolic'],
  ['off', 'bluetooth-disabled-symbolic'],
  ['absent', 'bluetooth-disabled-symbolic'],
  ['turning-on', 'bluetooth-acquiring-symbolic'],
  ['turning-off', 'bluetooth-acquiring-symbolic'],
]);

class BluetoothDeviceItem extends PopupMenu.PopupBaseMenuItem {
  static {
    GObject.registerClass(this);
  }

  private readonly subtitle = new St.Label({ style_class: 'device-subtitle' });
  private spinner: Spinner | null = new Spinner(16, { hideOnStop: true });

  constructor(private readonly device: BluetoothDevice, private readonly client: BluetoothClient) {
    super({ style_class: 'bt-device-item' });

    const icon = new St.Icon({ style_class: 'popup-menu-icon' });
    this.add_child(icon);

    const label = new St.Label({ x_expand: true });
    this.add_child(label);

    this.add_child(this.subtitle);
    this.add_child(this.spinner!);

    this.spinner!.bind_property('visible', this.subtitle, 'visible', GObject.BindingFlags.SYNC_CREATE | GObject.BindingFlags.INVERT_BOOLEAN);

    device.bind_property('connectable', this, 'visible', GObject.BindingFlags.SYNC_CREATE);
    device.bind_property('icon', icon, 'icon-name', GObject.BindingFlags.SYNC_CREATE);
    device.bind_property('alias', label, 'text', GObject.BindingFlags.SYNC_CREATE);
    this.connect('destroy', () => (this.spinner = null));
    this.connect('activate', () => this.toggleConnected().catch(logError));
    device.connectObject(
      'notify::alias', () => this.syncLabels(),
      'notify::connected', () => this.syncLabels(),
      this);
    KestrelUi.localized(this, () => this.syncLabels());
  }

  private async toggleConnected(): Promise<void> {
    this.spinner!.play();
    await this.client.toggleDevice(this.device);
    this.spinner?.stop();
  }

  private syncLabels(): void {
    const { connected, alias } = this.device;
    this.subtitle.text = KestrelUi.t(connected ? 'bluetooth-disconnect' : 'bluetooth-connect');
    this.accessible_name = connected
      ? KestrelUi.t('bluetooth-disconnect-device', { deviceName: alias })
      : KestrelUi.t('bluetooth-connect-device', { deviceName: alias });
  }
}

function sortedDevices(client: BluetoothClient): BluetoothDevice[] {
  return [...client.getDevices()].sort((dev1, dev2) => {
    if (dev1.connected !== dev2.connected) return Number(dev2.connected) - Number(dev1.connected);
    return dev1.alias.localeCompare(dev2.alias);
  });
}

class BluetoothToggle extends QuickMenuToggle {
  static {
    GObject.registerClass(this);
  }

  private readonly deviceItems = new Map<string, BluetoothDeviceItem>();
  private readonly deviceSection = new PopupMenu.PopupMenuSection();
  private readonly placeholderItem = new PopupMenu.PopupMenuItem('', {
    style_class: 'bt-menu-placeholder',
    reactive: false,
    can_focus: false,
  });

  constructor(private readonly client: BluetoothClient) {
    super();

    this.menu.addMenuItem(this.deviceSection);

    this.placeholderItem.label.clutter_text.set({ ellipsize: Pango.EllipsizeMode.NONE, line_wrap: true });
    this.menu.addMenuItem(this.placeholderItem);

    this.deviceSection.actor.bind_property('visible', this.placeholderItem, 'visible',
      GObject.BindingFlags.SYNC_CREATE | GObject.BindingFlags.INVERT_BOOLEAN);

    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    KestrelUi.bindText(this.menu.addSettingsAction('', 'bluetooth').label, 'bluetooth-settings');

    client.bind_property('available', this, 'visible', GObject.BindingFlags.SYNC_CREATE);
    client.bind_property('active', this, 'checked', GObject.BindingFlags.SYNC_CREATE);
    client.bind_property_full('adapter-state', this, 'icon-name', GObject.BindingFlags.SYNC_CREATE,
      (_binding, source: string) => [true, STATE_ICONS.get(source)], null);

    client.connectObject(
      'notify::active', () => this.onActiveChanged(),
      'devices-changed', () => this.sync(),
      'device-removed', (_client: BluetoothClient, path: string) => this.removeDevice(path),
      this);

    this.menu.connect('open-state-changed', (_menu, isOpen) => {
      if (isOpen) this.reorderDeviceItems();
    });

    this.connect('clicked', () => client.toggleActive());

    KestrelUi.localized(this, () => {
      this.title = KestrelUi.t('bluetooth-title');
      this.menu_button_accessible_name = KestrelUi.t('bluetooth-open-menu');
      this.menu.setHeader('bluetooth-active-symbolic', KestrelUi.t('bluetooth-title'));
      this.updatePlaceholder();
      this.sync();
    });
  }

  private onActiveChanged(): void {
    this.updatePlaceholder();

    this.deviceItems.forEach(item => item.destroy());
    this.deviceItems.clear();

    this.sync();
  }

  private updatePlaceholder(): void {
    this.placeholderItem.label.text = KestrelUi.t(this.client.active ? 'bluetooth-no-devices' : 'bluetooth-turn-on-hint');
  }

  private updatePlaceholderRelation(): void {
    const accessible = this.get_accessible()!;
    const placeholderAccessible = this.placeholderItem.get_accessible()!;
    if (this.deviceSection.actor.visible) accessible.remove_relationship(Atk.RelationType.DESCRIBED_BY, placeholderAccessible);
    else accessible.add_relationship(Atk.RelationType.DESCRIBED_BY, placeholderAccessible);
  }

  private updateDeviceVisibility(): void {
    this.deviceSection.actor.visible = [...this.deviceItems.values()].some(item => item.visible);
    this.updatePlaceholderRelation();
  }

  private removeDevice(path: string): void {
    this.deviceItems.get(path)?.destroy();
    this.deviceItems.delete(path);

    this.updateDeviceVisibility();
  }

  private reorderDeviceItems(): void {
    for (const [i, dev] of sortedDevices(this.client).entries()) {
      const item = this.deviceItems.get(dev.objectPath);
      if (item) this.deviceSection.moveMenuItem(item, i);
    }
  }

  private sync(): void {
    const devices = sortedDevices(this.client);

    for (const dev of devices) {
      const path = dev.objectPath;
      if (this.deviceItems.has(path)) continue;

      const item = new BluetoothDeviceItem(dev, this.client);
      item.connect('notify::visible', () => this.updateDeviceVisibility());

      this.deviceSection.addMenuItem(item);
      this.deviceItems.set(path, item);
    }

    const connectedDevices = devices.filter(dev => dev.connected);
    const nConnected = connectedDevices.length;

    if (nConnected > 1) this.subtitle = KestrelUi.t('bluetooth-connected-count', { count: nConnected });
    else if (nConnected === 1) this.subtitle = connectedDevices[0].alias;
    else this.subtitle = null;

    this.updateDeviceVisibility();
  }
}

export const Indicator = GObject.registerClass(class Indicator extends SystemIndicator {
  private readonly client = getBluetoothClient();
  private readonly indicator: St.Icon;

  constructor() {
    super();

    this.client.connectObject('devices-changed', () => this.sync(), this);

    this.indicator = this._addIndicator();
    this.indicator.icon_name = 'bluetooth-active-symbolic';

    this.quickSettingsItems.push(new BluetoothToggle(this.client));

    this.sync();
  }

  private sync(): void {
    this.indicator.visible = [...this.client.getDevices()].some(dev => dev.connected);
  }
});
