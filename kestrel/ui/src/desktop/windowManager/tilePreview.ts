import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import type Meta from 'gi://Meta';
import Mtk from 'gi://Mtk';
import St from 'gi://St';

import * as Main from '../../core/main.js';
import { blurBackdrop, followWindowCorners } from '../../appearance/kestrelGlass.js';

const TILE_PREVIEW_GAP = 8;
const TILE_PREVIEW_RADIUS = 16;
const WINDOW_ANIMATION_TIME = 250;

export const TilePreview = GObject.registerClass(
class TilePreview extends St.Widget {
  showing = false;
  private rect: Mtk.Rectangle | null = null;
  private monitorIndex = -1;

  constructor() {
    super({ style_class: 'tile-preview' });
    followWindowCorners(this, blurBackdrop(this, TILE_PREVIEW_RADIUS), TILE_PREVIEW_RADIUS);
    global.window_group.add_child(this);
    this.hide();
  }

  open(window: Meta.Window, tileRect: Mtk.Rectangle, monitorIndex: number): void {
    const windowActor = window.get_compositor_private() as Clutter.Actor | null;
    if (!windowActor) return;

    global.window_group.set_child_below_sibling(this, windowActor);

    if (this.rect && this.rect.equal(tileRect)) return;

    const changeMonitor = this.monitorIndex === -1 || this.monitorIndex !== monitorIndex;

    this.monitorIndex = monitorIndex;
    this.rect = tileRect;

    if (!this.showing || changeMonitor) {
      const monitor = Main.layoutManager.monitors[monitorIndex];
      const monitorRect = new Mtk.Rectangle({
        x: monitor.x,
        y: monitor.y,
        width: monitor.width,
        height: monitor.height,
      });
      const [, rect] = window.get_frame_rect().intersect(monitorRect);
      this.set_size(rect.width, rect.height);
      this.set_position(rect.x, rect.y);
      this.opacity = 0;
    }

    this.showing = true;
    this.show();
    this.ease({
      x: tileRect.x + TILE_PREVIEW_GAP,
      y: tileRect.y + TILE_PREVIEW_GAP,
      width: tileRect.width - 2 * TILE_PREVIEW_GAP,
      height: tileRect.height - 2 * TILE_PREVIEW_GAP,
      opacity: 255,
      duration: WINDOW_ANIMATION_TIME,
      mode: Clutter.AnimationMode.EASE_OUT_QUART,
    });
  }

  close(): void {
    if (!this.showing) return;

    this.showing = false;
    this.ease({
      opacity: 0,
      duration: WINDOW_ANIMATION_TIME,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onComplete: () => this.reset(),
    });
  }

  private reset(): void {
    this.hide();
    this.rect = null;
    this.monitorIndex = -1;
  }
});
export type TilePreview = InstanceType<typeof TilePreview>;
