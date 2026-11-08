import GObject from 'gi://GObject';
import St from 'gi://St';

import type { InkSample } from './sample.js';
import type { Stroke } from './stroke.js';

const GROW_BY = 96;

/**
 * Draws one stroke in an area just around it, growing in steps as the stroke
 * leaves it, so a new point repaints only this stroke and never the others.
 */
export class StrokeActor extends St.DrawingArea {
  static {
    GObject.registerClass(this);
  }

  private left = Infinity;
  private top = Infinity;
  private right = -Infinity;
  private bottom = -Infinity;

  constructor(readonly stroke: Stroke) {
    super({ opacity: Math.round(stroke.style.opacity * 255) });
    this.fit();
    this.connect('repaint', () => {
      const cr = this.get_context();
      cr.translate(-this.left, -this.top);
      this.stroke.paint(cr);
      cr.$dispose();
    });
  }

  add(sample: InkSample): void {
    this.stroke.add(sample);
    this.fit();
    this.queue_repaint();
  }

  private fit(): void {
    const { x1, y1, x2, y2 } = this.stroke.bounds;
    if (x1 >= this.left && y1 >= this.top && x2 <= this.right && y2 <= this.bottom) return;
    this.left = Math.floor(Math.min(x1, this.left) - GROW_BY);
    this.top = Math.floor(Math.min(y1, this.top) - GROW_BY);
    this.right = Math.ceil(Math.max(x2, this.right) + GROW_BY);
    this.bottom = Math.ceil(Math.max(y2, this.bottom) + GROW_BY);
    this.set_position(this.left, this.top);
    this.set_size(this.right - this.left, this.bottom - this.top);
  }
}
