import Gio from 'gi://Gio';
import GObject from 'gi://GObject';

import * as KestrelUi from '../../kestrelUi.js';

import { QuickToggle, SystemIndicator } from '../toggles/quickSettings.js';

const RotationToggle = GObject.registerClass(class RotationToggle extends QuickToggle {
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.touchscreen' });

  constructor() {
    super();
    KestrelUi.localized(this, () => (this.title = KestrelUi.t('auto-rotate-title')));

    this.settings.bind('orientation-lock', this, 'checked', Gio.SettingsBindFlags.GET | Gio.SettingsBindFlags.INVERT_BOOLEAN);
    this.connect('notify::checked', () => this.syncIcon());
    this.syncIcon();

    this.connect('clicked', () => this.settings.set_boolean('orientation-lock', this.checked));

    const unwatch = KestrelUi.accelerometer.watch(present => (this.visible = present));
    this.connect('destroy', unwatch);
  }

  private syncIcon(): void {
    this.icon_name = this.checked ? 'rotation-allowed-symbolic' : 'rotation-locked-symbolic';
  }
});

export const Indicator = GObject.registerClass(class Indicator extends SystemIndicator {
  constructor() {
    super();
    this.quickSettingsItems.push(new RotationToggle());
  }
});
