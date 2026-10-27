import Gio from 'gi://Gio';
import GObject from 'gi://GObject';

import * as KestrelUi from '../../kestrelUi.js';

import {QuickToggle, SystemIndicator} from './quickSettings.js';

const RotationToggle = GObject.registerClass(
class RotationToggle extends QuickToggle {
    _init() {
        super._init();
        KestrelUi.localized(this, () => (this.title = KestrelUi.t('auto-rotate-title')));

        this._settings = new Gio.Settings({
            schema_id: 'com.lantharos.kestrel.touchscreen',
        });
        this._settings.bind('orientation-lock',
            this, 'checked',
            Gio.SettingsBindFlags.GET | Gio.SettingsBindFlags.INVERT_BOOLEAN);
        this.connect('notify::checked', () => this._syncIcon());
        this._syncIcon();

        this.connect('clicked',
            () => this._settings.set_boolean('orientation-lock', this.checked));

        const unwatch = KestrelUi.accelerometer.watch(present => (this.visible = present));
        this.connect('destroy', unwatch);
    }

    _syncIcon() {
        this.iconName = this.checked ? 'rotation-allowed-symbolic' : 'rotation-locked-symbolic';
    }
});

export const Indicator = GObject.registerClass(
class Indicator extends SystemIndicator {
    _init() {
        super._init();

        this.quickSettingsItems.push(new RotationToggle());
    }
});
