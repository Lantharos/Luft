import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import type St from 'gi://St';

import * as KestrelUi from '../../../kestrelUi.js';

import { QuickToggle, SystemIndicator } from '../quickSettings.js';

import { loadInterfaceXML } from '../../runtime/fileUtils.js';

const BUS_NAME = 'com.lantharos.Settings.Rfkill';
const OBJECT_PATH = '/com/lantharos/Settings/Rfkill';

const rfkillManagerInfo = Gio.DBusInterfaceInfo.new_for_xml(loadInterfaceXML('com.lantharos.Settings.Rfkill')!);

type RfkillProxy = Gio.DBusProxy & {
  AirplaneMode: boolean;
  readonly HasAirplaneMode: boolean;
  readonly ShouldShowAirplaneMode: boolean;
};

class RfkillManager extends GObject.Object {
  static [GObject.properties] = {
    'airplane-mode': GObject.ParamSpec.boolean('airplane-mode', null, null, GObject.ParamFlags.READWRITE, false),
    'show-airplane-mode': GObject.ParamSpec.boolean('show-airplane-mode', null, null, GObject.ParamFlags.READABLE, false),
  };

  static {
    GObject.registerClass(this);
  }

  private readonly proxy = new Gio.DBusProxy({
    g_connection: Gio.DBus.session,
    g_name: BUS_NAME,
    g_object_path: OBJECT_PATH,
    g_interface_name: rfkillManagerInfo.name,
    g_interface_info: rfkillManagerInfo,
  }) as RfkillProxy;

  constructor() {
    super();

    this.proxy.connect('g-properties-changed', (_proxy, properties) => this.changed(properties));
    this.proxy.init_async(GLib.PRIORITY_DEFAULT, null).catch((e: Error) => console.error(e.message));
  }

  get airplaneMode(): boolean {
    return this.proxy.AirplaneMode;
  }

  set airplaneMode(value: boolean) {
    this.proxy.AirplaneMode = value;
  }

  get showAirplaneMode(): boolean {
    return this.proxy.HasAirplaneMode && this.proxy.ShouldShowAirplaneMode;
  }

  private changed(properties: GLib.Variant): void {
    for (const prop in properties.deepUnpack<Record<string, GLib.Variant>>()) {
      switch (prop) {
        case 'AirplaneMode':
          this.notify('airplane-mode');
          break;
        case 'HasAirplaneMode':
        case 'ShouldShowAirplaneMode':
          this.notify('show-airplane-mode');
          break;
      }
    }
  }
}

let manager: RfkillManager | null = null;

const RfkillToggle = GObject.registerClass(class RfkillToggle extends QuickToggle {
  private readonly manager = (manager ??= new RfkillManager());

  constructor() {
    super({ icon_name: 'airplane-mode-symbolic' });
    KestrelUi.localized(this, () => (this.title = KestrelUi.t('airplane-mode-title')));

    this.manager.bind_property('show-airplane-mode', this, 'visible', GObject.BindingFlags.SYNC_CREATE);
    this.manager.bind_property('airplane-mode', this, 'checked', GObject.BindingFlags.SYNC_CREATE);

    this.connect('clicked', () => (this.manager.airplaneMode = !this.manager.airplaneMode));
  }
});

export const Indicator = GObject.registerClass(class Indicator extends SystemIndicator {
  private readonly indicator: St.Icon;
  private readonly rfkillToggle = new RfkillToggle();

  constructor() {
    super();

    this.indicator = this._addIndicator();
    this.indicator.icon_name = 'airplane-mode-symbolic';

    this.rfkillToggle.connectObject(
      'notify::visible', () => this.sync(),
      'notify::checked', () => this.sync(),
      this);
    this.quickSettingsItems.push(this.rfkillToggle);

    this.sync();
  }

  private sync(): void {
    const { visible, checked } = this.rfkillToggle;
    this.indicator.visible = visible && checked;
  }
});
