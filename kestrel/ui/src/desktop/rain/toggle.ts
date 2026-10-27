import type Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import type St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';
import * as PopupMenu from '../../shared/popups/popupMenu.js';
import { QuickMenuToggle, SystemIndicator } from '../../system/toggles/quickSettings.js';
import { Slider } from '../../shared/widgets/slider.js';

const INTENSITIES: Record<string, string> = {
  'drizzle': 'rain-drizzle',
  'rain': 'rain-rain',
  'storm': 'rain-storm',
};

class VolumeItem extends PopupMenu.PopupBaseMenuItem {
  static {
    GObject.registerClass(this);
  }

  private readonly slider: Slider;

  constructor(private readonly settings: Gio.Settings) {
    super({ activate: false, style_class: 'keyboard-brightness-item' });

    this.slider = new Slider(settings.get_double('rain-volume'));
    KestrelUi.localized(this.slider, () => (this.slider.accessible_name = KestrelUi.t('rain-volume')));
    this.slider.connect('notify::value', () => {
      if (this.settings.get_double('rain-volume') !== this.slider.value) this.settings.set_double('rain-volume', this.slider.value);
    });
    settings.connectObject('changed::rain-volume', () => {
      this.slider.value = this.settings.get_double('rain-volume');
    }, this);
    this.add_child(this.slider);
  }

  vfunc_navigate_focus(from: Clutter.Actor | null, direction: St.DirectionType): boolean {
    return this.slider.navigate_focus(from, direction, false);
  }
}

const RainToggle = GObject.registerClass(class RainToggle extends QuickMenuToggle {
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private readonly intensityItems = new Map<string, PopupMenu.PopupMenuItem>();
  private readonly visibleItem: PopupMenu.PopupMenuItem;
  private readonly soundItem: PopupMenu.PopupMenuItem;
  private readonly volumeItem: VolumeItem;

  constructor() {
    super({ icon_name: 'weather-showers-symbolic', toggle_mode: true });

    this.settings.bind('rain', this, 'checked', Gio.SettingsBindFlags.DEFAULT);

    for (const [intensity, nameId] of Object.entries(INTENSITIES)) {
      const item = new PopupMenu.PopupMenuItem('');
      KestrelUi.bindText(item.label, nameId);
      item.connect('activate', () => this.settings.set_string('rain-intensity', intensity));
      this.intensityItems.set(intensity, item);
      this.menu.addMenuItem(item);
    }

    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    this.visibleItem = this.checkItem('rain-visible', 'rain-show');
    this.soundItem = this.checkItem('rain-sound', 'rain-sound');
    this.volumeItem = new VolumeItem(this.settings);
    this.menu.addMenuItem(this.volumeItem);

    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    KestrelUi.bindText(this.menu.addSettingsAction('', 'appearance').label, 'rain-settings');

    for (const key of ['rain-intensity', 'rain-visible', 'rain-sound'])
      this.settings.connectObject(`changed::${key}`, () => this.sync(), this);
    this.connect('notify::checked', () => this.sync());
    this.connect('destroy', () => this.settings.run_dispose());

    KestrelUi.localized(this, () => {
      this.title = KestrelUi.t('rain-title');
      this.menu_button_accessible_name = KestrelUi.t('rain-open-menu');
      this.menu.setHeader('weather-showers-symbolic', KestrelUi.t('rain-title'));
      this.sync();
    });
  }

  private checkItem(key: string, nameId: string): PopupMenu.PopupMenuItem {
    const item = new PopupMenu.PopupMenuItem('');
    KestrelUi.bindText(item.label, nameId);
    item.connect('activate', () => this.settings.set_boolean(key, !this.settings.get_boolean(key)));
    this.menu.addMenuItem(item);
    return item;
  }

  private sync(): void {
    const intensity = this.settings.get_string('rain-intensity');
    for (const [value, item] of this.intensityItems)
      item.setOrnament(value === intensity ? PopupMenu.Ornament.CHECK : PopupMenu.Ornament.NONE);

    const visible = this.settings.get_boolean('rain-visible');
    const sound = this.settings.get_boolean('rain-sound');
    this.visibleItem.setOrnament(visible ? PopupMenu.Ornament.CHECK : PopupMenu.Ornament.NONE);
    this.soundItem.setOrnament(sound ? PopupMenu.Ornament.CHECK : PopupMenu.Ornament.NONE);
    this.volumeItem.visible = sound;
    this.subtitle = this.checked ? KestrelUi.t(INTENSITIES[intensity] ?? 'rain-rain') : null;
  }
});

export const Indicator = GObject.registerClass(class Indicator extends SystemIndicator {
  constructor() {
    super();
    this.quickSettingsItems.push(new RainToggle());
  }
});
