import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import type Mtk from 'gi://Mtk';
import St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';
import * as Main from '../main.js';

export const ResizePopup = GObject.registerClass(
class ResizePopup extends St.Widget {
  private readonly sizeLabel = new St.Label({
    style_class: 'resize-popup',
    x_align: Clutter.ActorAlign.CENTER,
    y_align: Clutter.ActorAlign.CENTER,
    x_expand: true,
    y_expand: true,
  });

  constructor() {
    super({ layout_manager: new Clutter.BinLayout() });
    this.add_child(this.sizeLabel);
    Main.uiGroup.add_child(this);
  }

  update(rect: Mtk.Rectangle, width: number, height: number): void {
    this.sizeLabel.set_text(KestrelUi.t('window-resize-size', { width, height }));
    this.set_position(rect.x, rect.y);
    this.set_size(rect.width, rect.height);
  }
});
export type ResizePopup = InstanceType<typeof ResizePopup>;
