import Meta from 'gi://Meta';

import type { Box } from '../../shared/layout/placement.js';
import { boxOf } from '../windows/frames.js';
import { contains } from './layouts/geometry.js';
import type { Tiler } from './tiler.js';

const MOVES = [Meta.GrabOp.MOVING, Meta.GrabOp.MOVING_UNCONSTRAINED, Meta.GrabOp.KEYBOARD_MOVING];

interface Resize {
  window: Meta.Window;
  signal: number;
  later: number;
}

export class TilingDrag {
  private moving: Meta.Window | null = null;
  private resizing: Resize | null = null;
  private signals: number[] = [];

  constructor(private readonly tiler: Tiler, private readonly monitors: () => Box[]) {}

  engage(on: boolean): void {
    const display = global.display;
    if (on && !this.signals.length) {
      this.signals = [
        display.connect('grab-op-begin', (_display, window: Meta.Window | null, op: Meta.GrabOp) => this.begin(window, op)),
        display.connect('grab-op-end', (_display, window: Meta.Window | null, op: Meta.GrabOp) => this.end(window, op)),
      ];
    } else if (!on) {
      for (const id of this.signals) display.disconnect(id);
      this.signals = [];
      this.stopResizing();
      this.moving = null;
      this.tiler.held = null;
    }
  }

  private begin(window: Meta.Window | null, op: Meta.GrabOp): void {
    if (!window || !this.tiler.isTiled(window)) return;
    if (MOVES.includes(op)) {
      this.moving = window;
      this.tiler.held = window;
      return;
    }
    const signal = window.connect('size-changed', () => this.queueResize());
    this.resizing = { window, signal, later: 0 };
  }

  private end(window: Meta.Window | null, op: Meta.GrabOp): void {
    if (window && window === this.moving) {
      this.moving = null;
      this.tiler.held = null;
      this.drop(window, op === Meta.GrabOp.KEYBOARD_MOVING);
    }
    if (window && window === this.resizing?.window) {
      this.stopResizing();
      const space = this.tiler.spaceOf(window);
      if (space) this.tiler.arrange(space, true);
    }
  }

  private drop(window: Meta.Window, keyboard: boolean): void {
    const space = this.tiler.spaceOf(window);
    if (!space) return;
    const frame = window.get_frame_rect();
    const [x, y] = keyboard ? [frame.x + frame.width / 2, frame.y + frame.height / 2] : global.get_pointer();
    const monitor = this.monitors().findIndex(box => contains(box, x, y));
    const target = monitor < 0 ? space : this.tiler.spaceOn(monitor);
    const onto = target.windows.find(other => other !== window && contains(target.boxOf(other) ?? boxOf(other.get_frame_rect()), x, y)) ?? null;
    if (target !== space) this.tiler.moveTo(window, target, onto);
    else if (onto) space.drop(window, onto);
    else this.tiler.arrange(space, true);
  }

  private queueResize(): void {
    const resizing = this.resizing;
    if (!resizing || resizing.later) return;
    resizing.later = global.compositor.get_laters().add(Meta.LaterType.BEFORE_REDRAW, () => {
      resizing.later = 0;
      this.tiler.spaceOf(resizing.window)?.resized(resizing.window, boxOf(resizing.window.get_frame_rect()));
      return false;
    });
  }

  private stopResizing(): void {
    const resizing = this.resizing;
    if (!resizing) return;
    this.resizing = null;
    resizing.window.disconnect(resizing.signal);
    if (resizing.later) global.compositor.get_laters().remove(resizing.later);
  }
}
