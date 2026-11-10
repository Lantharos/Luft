import GObject from 'gi://GObject';

import { Curve, Duration } from '../../../../shared/motion/motion.js';
import * as Lightbox from '../../../../shared/popups/lightbox.js';
import * as Main from '../../../../core/main.js';


interface FlashspotArea {
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
      duration: Duration.long,
      curve: Curve.gentle,
      onComplete: () => {
        doneCallback();
        this.destroy();
      },
    });
  }
}
