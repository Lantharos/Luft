import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';

import * as Lightbox from '../../../shared/popups/lightbox.js';
import * as Main from '../../../core/main.js';

const FLASHSPOT_ANIMATION_OUT_TIME = 500;

export interface FlashspotArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Flashspot extends Lightbox.Lightbox {
  static {
    GObject.registerClass(this);
  }

  constructor(area: FlashspotArea) {
    super(Main.uiGroup, { inhibitEvents: true, width: area.width, height: area.height });
    this.style_class = 'flashspot';
    this.set_position(area.x, area.y);
  }

  fire(doneCallback: () => void): void {
    this.set({ visible: true, opacity: 255 });
    this.ease({
      opacity: 0,
      duration: FLASHSPOT_ANIMATION_OUT_TIME,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onComplete: () => {
        doneCallback();
        this.destroy();
      },
    });
  }
}
