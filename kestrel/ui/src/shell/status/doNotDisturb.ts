import Gio from 'gi://Gio';
import GObject from 'gi://GObject';

import * as KestrelUi from '../../kestrelUi.js';

import { QuickToggle, SystemIndicator } from './quickSettings.js';

const DoNotDisturbToggle = GObject.registerClass(class DoNotDisturbToggle extends QuickToggle {
  private readonly settings = new Gio.Settings({ schema_id: 'org.gnome.desktop.notifications' });

  constructor() {
    super({ icon_name: 'notifications-disabled-symbolic', toggle_mode: true });
    KestrelUi.localized(this, () => (this.title = KestrelUi.t('do-not-disturb-title')));

    this.settings.bind('show-banners', this, 'checked', Gio.SettingsBindFlags.INVERT_BOOLEAN);
  }
});

export const Indicator = GObject.registerClass(class Indicator extends SystemIndicator {
  constructor() {
    super();
    const indicator = this._addIndicator();
    indicator.icon_name = 'notifications-disabled-symbolic';

    const toggle = new DoNotDisturbToggle();
    toggle.bind_property('checked', indicator, 'visible', GObject.BindingFlags.SYNC_CREATE);

    this.quickSettingsItems.push(toggle);
  }
});
