import Gio from 'gi://Gio';
import GObject from 'gi://GObject';

import * as KestrelUi from '../kestrelUi.js';
import * as PopupMenu from '../popupMenu.js';
import {QuickMenuToggle, SystemIndicator} from '../quickSettings.js';
import {Slider} from '../slider.js';

const INTENSITIES = {
    'drizzle': 'rain-drizzle',
    'rain': 'rain-rain',
    'storm': 'rain-storm',
};

const VolumeItem = GObject.registerClass(
class VolumeItem extends PopupMenu.PopupBaseMenuItem {
    constructor(settings) {
        super({activate: false, style_class: 'keyboard-brightness-item'});

        this._settings = settings;
        this._slider = new Slider(settings.get_double('rain-volume'));
        KestrelUi.localized(this._slider, () => (this._slider.accessible_name = KestrelUi.t('rain-volume')));
        this._slider.connect('notify::value', () => {
            if (this._settings.get_double('rain-volume') !== this._slider.value)
                this._settings.set_double('rain-volume', this._slider.value);
        });
        settings.connectObject('changed::rain-volume', () => {
            this._slider.value = this._settings.get_double('rain-volume');
        }, this);
        this.add_child(this._slider);
    }

    vfunc_navigate_focus(from, direction) {
        return this._slider.navigate_focus(from, direction, false);
    }
});

const RainToggle = GObject.registerClass(
class RainToggle extends QuickMenuToggle {
    _init() {
        super._init({iconName: 'weather-showers-symbolic', toggleMode: true});

        this._settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
        this._settings.bind('rain', this, 'checked', Gio.SettingsBindFlags.DEFAULT);

        this._intensityItems = new Map();
        for (const [intensity, nameId] of Object.entries(INTENSITIES)) {
            const item = new PopupMenu.PopupMenuItem('');
            KestrelUi.bindText(item.label, nameId);
            item.connect('activate', () => this._settings.set_string('rain-intensity', intensity));
            this._intensityItems.set(intensity, item);
            this.menu.addMenuItem(item);
        }

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        this._visibleItem = this._checkItem('rain-visible', 'rain-show');
        this._soundItem = this._checkItem('rain-sound', 'rain-sound');
        this._volumeItem = new VolumeItem(this._settings);
        this.menu.addMenuItem(this._volumeItem);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        KestrelUi.bindText(this.menu.addSettingsAction('', 'appearance').label, 'rain-settings');

        for (const key of ['rain-intensity', 'rain-visible', 'rain-sound'])
            this._settings.connectObject(`changed::${key}`, () => this._sync(), this);
        this.connect('notify::checked', () => this._sync());
        this.connect('destroy', () => this._settings.run_dispose());

        KestrelUi.localized(this, () => {
            this.title = KestrelUi.t('rain-title');
            this.menuButtonAccessibleName = KestrelUi.t('rain-open-menu');
            this.menu.setHeader('weather-showers-symbolic', KestrelUi.t('rain-title'));
            this._sync();
        });
    }

    _checkItem(key, nameId) {
        const item = new PopupMenu.PopupMenuItem('');
        KestrelUi.bindText(item.label, nameId);
        item.connect('activate', () => this._settings.set_boolean(key, !this._settings.get_boolean(key)));
        this.menu.addMenuItem(item);
        return item;
    }

    _sync() {
        const intensity = this._settings.get_string('rain-intensity');
        for (const [value, item] of this._intensityItems)
            item.setOrnament(value === intensity ? PopupMenu.Ornament.CHECK : PopupMenu.Ornament.NONE);

        const visible = this._settings.get_boolean('rain-visible');
        const sound = this._settings.get_boolean('rain-sound');
        this._visibleItem.setOrnament(visible ? PopupMenu.Ornament.CHECK : PopupMenu.Ornament.NONE);
        this._soundItem.setOrnament(sound ? PopupMenu.Ornament.CHECK : PopupMenu.Ornament.NONE);
        this._volumeItem.visible = sound;
        this.subtitle = this.checked ? KestrelUi.t(INTENSITIES[intensity] ?? 'rain-rain') : null;
    }
});

export const Indicator = GObject.registerClass(
class Indicator extends SystemIndicator {
    _init() {
        super._init();

        this.quickSettingsItems.push(new RainToggle());
    }
});
