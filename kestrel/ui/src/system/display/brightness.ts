import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import { QuickSlider, SystemIndicator } from '../toggles/quickSettings.js';
import * as KestrelUi from '../../kestrelUi.js';
import * as Main from '../../core/main.js';
import * as PopupMenu from '../../shared/popups/popupMenu.js';
import { Slider } from '../../shared/widgets/slider.js';
import type { BrightnessScale } from './brightnessScales.js';

const adjustingSliders = new WeakSet<Slider>();

class BrightnessSliderMenu extends PopupMenu.PopupMenuSection {
  addSlider(scale: BrightnessScale): Slider {
    this.addMenuItem(new PopupMenu.PopupMenuItem(scale.name!, { reactive: false }));

    const slider = new Slider(0);
    slider.accessible_name = scale.name!;

    const sliderBin = new St.Bin({
      style_class: 'slider-bin',
      child: slider,
      reactive: true,
      can_focus: true,
      x_expand: true,
      y_align: Clutter.ActorAlign.CENTER,
    });

    const sliderMenuItem = new PopupMenu.PopupBaseMenuItem({ reactive: false });
    sliderMenuItem.add_child(sliderBin);
    this.addMenuItem(sliderMenuItem);

    return slider;
  }
}

function connectSlider(slider: Slider, scale: BrightnessScale): void {
  slider.disconnectObject(scale);
  slider.connectObject('notify::value', () => {
    if (adjustingSliders.has(slider)) return;
    scale.value = slider.value;
  }, scale);

  const changeBrightness = () => {
    adjustingSliders.add(slider);
    slider.value = scale.value;
    adjustingSliders.delete(slider);
  };
  scale.connectObject('notify::value', changeBrightness, slider);
  changeBrightness();
}

const BrightnessItem = GObject.registerClass(class BrightnessItem extends QuickSlider {
  private readonly monitorBrightnessSection = new BrightnessSliderMenu();
  private readonly manager = Main.brightnessManager;

  constructor() {
    super({ icon_name: 'display-brightness-symbolic' });

    KestrelUi.localized(this, () => {
      this.menu_button_accessible_name = KestrelUi.t('brightness-open-menu');
      this.slider.accessible_name = KestrelUi.t('brightness-title');
      this.menu.setHeader('display-brightness-symbolic', KestrelUi.t('brightness-title'));
    });
    this.menu.addMenuItem(this.monitorBrightnessSection);

    this.manager.connectObject('changed', () => this.sync(), this);
    this.sync();
  }

  private sync(): void {
    const { globalScale } = this.manager;
    this.set({
      visible: !!globalScale,
      menu_enabled: this.manager.scales.length > 1,
    });

    if (!globalScale) return;

    this.monitorBrightnessSection.removeAll();

    connectSlider(this.slider, globalScale);
    for (const scale of this.manager.scales) connectSlider(this.monitorBrightnessSection.addSlider(scale), scale);
  }
});

export const Indicator = GObject.registerClass(class Indicator extends SystemIndicator {
  constructor() {
    super();
    this.quickSettingsItems.push(new BrightnessItem());
  }
});
