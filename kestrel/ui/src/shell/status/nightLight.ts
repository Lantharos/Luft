import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import type St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';

import { QuickToggle, SystemIndicator } from './quickSettings.js';

import { loadInterfaceXML } from '../runtime/fileUtils.js';

const BUS_NAME = 'com.lantharos.Settings.NightLight';
const OBJECT_PATH = '/com/lantharos/Settings/NightLight';

const colorInfo = Gio.DBusInterfaceInfo.new_for_xml(loadInterfaceXML('com.lantharos.Settings.NightLight')!);

type NightLightProxy = Gio.DBusProxy & { readonly NightLightActive: boolean };

const NightLightToggle = GObject.registerClass(class NightLightToggle extends QuickToggle {
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.night-light' });

  constructor() {
    super({ icon_name: 'night-light-symbolic', toggle_mode: true });
    KestrelUi.localized(this, () => (this.title = KestrelUi.t('night-light-title')));

    global.backend.get_monitor_manager().bind_property('night-light-supported', this, 'visible', GObject.BindingFlags.SYNC_CREATE);

    this.settings.bind('enabled', this, 'checked', Gio.SettingsBindFlags.DEFAULT);
  }
});

export const Indicator = GObject.registerClass(class Indicator extends SystemIndicator {
  private readonly indicator: St.Icon;
  private readonly proxy: NightLightProxy;

  constructor() {
    super();

    this.indicator = this._addIndicator();
    this.indicator.icon_name = 'night-light-symbolic';

    this.quickSettingsItems.push(new NightLightToggle());

    this.proxy = new Gio.DBusProxy({
      g_connection: Gio.DBus.session,
      g_name: BUS_NAME,
      g_object_path: OBJECT_PATH,
      g_interface_name: colorInfo.name,
      g_interface_info: colorInfo,
    }) as NightLightProxy;
    this.proxy.connect('g-properties-changed', (_proxy, properties) => {
      if (properties.lookup_value('NightLightActive', null)) this.sync();
    });
    this.proxy.init_async(GLib.PRIORITY_DEFAULT, null).catch((e: Error) => console.error(e.message));

    this.sync();
  }

  private sync(): void {
    this.indicator.visible = this.proxy.NightLightActive;
  }
});
