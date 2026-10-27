import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import St from 'gi://St';

import { QuickMenuToggle, SystemIndicator } from '../quickSettings.js';

import * as KestrelUi from '../../../kestrelUi.js';
import * as PopupMenu from '../../popups/popupMenu.js';
import { Slider } from '../../widgets/slider.js';

import { loadInterfaceXML } from '../../runtime/fileUtils.js';

const BUS_NAME = 'com.lantharos.Settings.KeyboardLight';
const OBJECT_PATH = '/com/lantharos/Settings/KeyboardLight';

interface KeyboardLightRemote {
  Brightness: number;
  readonly Steps: number;
}

const BrightnessProxy = Gio.DBusProxy.makeProxyWrapper<KeyboardLightRemote>(loadInterfaceXML('com.lantharos.Settings.KeyboardLight'));

type Level = 'off' | 'low' | 'high';

class SliderItem extends PopupMenu.PopupBaseMenuItem {
  static [GObject.properties] = {
    'value': GObject.ParamSpec.int('value', null, null, GObject.ParamFlags.READWRITE, 0, 100, 0),
  };

  static {
    GObject.registerClass(this);
  }

  readonly slider = new Slider(0);
  private readonly sliderChangedId: number;

  constructor() {
    super({ activate: false, style_class: 'keyboard-brightness-item' });

    this.sliderChangedId = this.slider.connect('notify::value', () => this.notify('value'));
    KestrelUi.localized(this.slider, () => (this.slider.accessible_name = KestrelUi.t('backlight-slider')));

    this.add_child(this.slider);
  }

  get value(): number {
    return this.slider.value * 100;
  }

  set value(value: number) {
    if (this.value === value) return;

    this.slider.block_signal_handler(this.sliderChangedId);
    this.slider.value = value / 100;
    this.slider.unblock_signal_handler(this.sliderChangedId);

    this.notify('value');
  }

  vfunc_navigate_focus(from: Clutter.Actor | null, direction: St.DirectionType): boolean {
    return this.slider.navigate_focus(from, direction, false);
  }
}

interface LevelButton {
  box: St.BoxLayout;
  button: St.Button;
}

class DiscreteItem extends St.BoxLayout {
  static [GObject.properties] = {
    'value': GObject.ParamSpec.int('value', null, null, GObject.ParamFlags.READWRITE, 0, 100, 0),
    'n-levels': GObject.ParamSpec.int('n-levels', null, null, GObject.ParamFlags.READWRITE, 1, 3, 1),
  };

  static {
    GObject.registerClass(this);
  }

  declare value: number;
  declare nLevels: number;

  private readonly levelButtons = new Map<Level, LevelButton>();

  constructor() {
    super({ style_class: 'popup-menu-item', reactive: true });

    this.addLevelButton('off', 'backlight-off', 'keyboard-brightness-off-symbolic');
    this.addLevelButton('low', 'backlight-low', 'keyboard-brightness-medium-symbolic');
    this.addLevelButton('high', 'backlight-high', 'keyboard-brightness-high-symbolic');

    this.connect('notify::n-levels', () => this.syncLevels());
    this.connect('notify::value', () => this.syncChecked());
    this.syncLevels();

    global.focus_manager.add_group(this);
  }

  private valueToLevel(value: number): Level | undefined {
    const checkedIndex = Math.round(value * (this.nLevels - 1) / 100);
    if (checkedIndex === this.nLevels - 1) return 'high';

    return [...this.levelButtons.keys()].at(checkedIndex);
  }

  private levelToValue(level: Level): number {
    const keyIndex = [...this.levelButtons.keys()].indexOf(level);
    return 100 * Math.min(keyIndex, this.nLevels - 1) / (this.nLevels - 1);
  }

  private addLevelButton(key: Level, labelId: string, iconName: string): void {
    const box = new St.BoxLayout({
      style_class: 'keyboard-brightness-level',
      orientation: Clutter.Orientation.VERTICAL,
      x_expand: true,
    });

    const label = new St.Label({ x_align: Clutter.ActorAlign.CENTER });
    KestrelUi.bindText(label, labelId);

    const button = new St.Button({
      style_class: 'icon-button',
      can_focus: true,
      icon_name: iconName,
      label_actor: label,
    });
    box.add_child(button);

    button.connect('clicked', () => {
      this.value = this.levelToValue(key);
    });

    box.add_child(label);

    this.add_child(box);
    this.levelButtons.set(key, { box, button });
  }

  private syncLevels(): void {
    this.levelButtons.get('off')!.box.visible = this.nLevels > 0;
    this.levelButtons.get('high')!.box.visible = this.nLevels > 1;
    this.levelButtons.get('low')!.box.visible = this.nLevels > 2;
    this.syncChecked();
  }

  private syncChecked(): void {
    const checkedKey = this.valueToLevel(this.value);
    for (const [key, { button }] of this.levelButtons) button.checked = key === checkedKey;
  }
}

const KeyboardBrightnessToggle = GObject.registerClass(class KeyboardBrightnessToggle extends QuickMenuToggle {
  private readonly proxy: KeyboardLightRemote & Gio.DBusProxy;
  private readonly sliderItem = new SliderItem();
  private readonly discreteItem = new DiscreteItem();
  private readonly sliderItemChangedId: number;
  private readonly discreteItemChangedId: number;

  constructor() {
    super({ icon_name: 'keyboard-brightness-high-symbolic' });
    KestrelUi.localized(this, () => {
      this.title = KestrelUi.t('backlight-title');
      this.menu_button_accessible_name = KestrelUi.t('backlight-open-menu');
      this.menu.setHeader('keyboard-brightness-high-symbolic', KestrelUi.t('backlight-title'));
    });

    this.proxy = BrightnessProxy(Gio.DBus.session, BUS_NAME, OBJECT_PATH, (_proxy, error) => {
      if (error) console.error((error as Error).message);
      else this.proxy.connect('g-properties-changed', () => this.sync());
      this.sync();
    });

    this.connect('clicked', () => {
      this.proxy.Brightness = this.checked ? 0 : 100;
    });

    this.menu.box.add_child(this.sliderItem);
    const sliderAccessible = this.sliderItem.slider.get_accessible()!;
    sliderAccessible.set_parent(this.menu.box.get_accessible()!);
    this.sliderItem.set_accessible(sliderAccessible);

    this.menu.box.add_child(this.discreteItem);

    this.sliderItem.bind_property('visible', this.discreteItem, 'visible',
      GObject.BindingFlags.INVERT_BOOLEAN | GObject.BindingFlags.SYNC_CREATE);

    this.sliderItem.bind_property('value', this.discreteItem, 'value', GObject.BindingFlags.SYNC_CREATE);

    this.sliderItemChangedId = this.sliderItem.connect('notify::value', () => {
      if (this.sliderItem.visible) this.proxy.Brightness = this.sliderItem.value;
    });

    this.discreteItemChangedId = this.discreteItem.connect('notify::value', () => {
      if (this.discreteItem.visible) this.proxy.Brightness = this.discreteItem.value;
    });
  }

  private sync(): void {
    const brightness = this.proxy.Brightness;
    const visible = Number.isInteger(brightness) && brightness >= 0;
    this.visible = visible;
    if (!visible) return;

    this.checked = brightness > 0;
    const useSlider = this.proxy.Steps >= 4;

    this.sliderItem.block_signal_handler(this.sliderItemChangedId);
    this.discreteItem.block_signal_handler(this.discreteItemChangedId);

    this.sliderItem.set({ visible: useSlider, value: brightness });

    if (!useSlider) this.discreteItem.nLevels = this.proxy.Steps;

    this.sliderItem.unblock_signal_handler(this.sliderItemChangedId);
    this.discreteItem.unblock_signal_handler(this.discreteItemChangedId);
  }
});

export const Indicator = GObject.registerClass(class Indicator extends SystemIndicator {
  constructor() {
    super();
    this.quickSettingsItems.push(new KeyboardBrightnessToggle());
  }
});
