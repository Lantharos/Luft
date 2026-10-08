import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

import { taskbarPreferences } from './preferences/taskbarPreferences.js';

const EASE_DURATION = 260;

export const PanelLayout = GObject.registerClass(
  class PanelLayout extends Clutter.LayoutManager {
    private easeUntil = 0;

    ease(): void {
      this.easeUntil = GLib.get_monotonic_time() + EASE_DURATION * 1000;
      this.layout_changed();
    }

    vfunc_get_preferred_width(): [number, number] { return [0, 0]; }

    vfunc_get_preferred_height(): [number, number] {
      const { height } = taskbarPreferences.metrics;
      return [height, height];
    }

    vfunc_allocate(container: Clutter.Actor, allocation: Clutter.ActorBox): void {
      const [center, status, peek] = container.get_children();
      const width = allocation.get_width();
      const height = allocation.get_height();
      const { inset } = taskbarPreferences.metrics;
      const left = taskbarPreferences.alignment === 'left';
      const easing = GLib.get_monotonic_time() < this.easeUntil;
      const [, peekWidth] = peek.get_preferred_width(height);
      peek.allocate(new Clutter.ActorBox({ x1: width - peekWidth, y1: 0, x2: width, y2: height }));
      for (const child of [center, status]) {
        const [, naturalWidth] = child.get_preferred_width(-1);
        const [, naturalHeight] = child.get_preferred_height(naturalWidth);
        const x = child === status ? width - peekWidth - naturalWidth - inset : left ? inset : (width - naturalWidth) / 2;
        const y = (height - naturalHeight) / 2;
        if (easing) {
          child.save_easing_state();
          child.set_easing_duration(EASE_DURATION);
          child.set_easing_mode(Clutter.AnimationMode.EASE_OUT_QUART);
        }
        child.allocate(new Clutter.ActorBox({
          x1: Math.round(x), y1: Math.round(y),
          x2: Math.round(x) + naturalWidth, y2: Math.round(y) + naturalHeight,
        }));
        if (easing) child.restore_easing_state();
      }
    }
  },
);
