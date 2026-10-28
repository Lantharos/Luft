import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

import { rightToLeft } from '../../shared/layout/edge.js';
import { STRIP_HEIGHT, taskbarPreferences } from './preferences/taskbarPreferences.js';

const EASE_DURATION = 260;

interface Span {
  start: number;
  length: number;
}

function naturalSize(child: Clutter.Actor): [number, number] {
  const [, width] = child.get_preferred_width(-1);
  const [, height] = child.get_preferred_height(width);
  return [width, height];
}

export const PanelLayout = GObject.registerClass(
  class PanelLayout extends Clutter.LayoutManager {
    private easeUntil = 0;

    ease(): void {
      this.easeUntil = GLib.get_monotonic_time() + EASE_DURATION * 1000;
      this.layout_changed();
    }

    vfunc_get_preferred_width(): [number, number] { return this.across(true); }

    vfunc_get_preferred_height(): [number, number] { return this.across(false); }

    private across(vertical: boolean): [number, number] {
      const thickness = taskbarPreferences.vertical === vertical ? taskbarPreferences.metrics.thickness : 0;
      return [thickness, thickness];
    }

    vfunc_allocate(container: Clutter.Actor, allocation: Clutter.ActorBox): void {
      const [center, status, peek, ...strips] = container.get_children();
      const width = allocation.get_width();
      const height = allocation.get_height();
      const vertical = taskbarPreferences.vertical;
      const length = vertical ? height : width;
      const across = vertical ? width : height;
      const reversed = !vertical && rightToLeft();
      const { inset } = taskbarPreferences.metrics;
      const atStart = taskbarPreferences.alignment === 'left';
      const easing = GLib.get_monotonic_time() < this.easeUntil;
      const peekLength = !peek.visible ? 0 : vertical ? peek.get_preferred_height(width)[1] : peek.get_preferred_width(height)[1];
      const place = (child: Clutter.Actor, span: Span, crossLength: number, animated: boolean) => {
        const start = Math.round(reversed ? length - span.start - span.length : span.start);
        const cross = Math.round((across - crossLength) / 2);
        const [x, y, boxWidth, boxHeight] = vertical ? [cross, start, crossLength, span.length] : [start, cross, span.length, crossLength];
        if (animated) {
          child.save_easing_state();
          child.set_easing_duration(EASE_DURATION);
          child.set_easing_mode(Clutter.AnimationMode.EASE_OUT_QUART);
        }
        child.allocate(new Clutter.ActorBox({ x1: x, y1: y, x2: x + boxWidth, y2: y + boxHeight }));
        if (animated) child.restore_easing_state();
      };
      place(peek, { start: length - peekLength, length: peekLength }, across, false);
      for (const strip of strips) strip.allocate(new Clutter.ActorBox({ x1: 0, y1: 0, x2: width, y2: STRIP_HEIGHT }));
      for (const child of [center, status]) {
        const [naturalWidth, naturalHeight] = naturalSize(child);
        const [along, crossLength] = vertical ? [naturalHeight, naturalWidth] : [naturalWidth, naturalHeight];
        const start = child === status ? length - peekLength - along - inset : atStart ? inset : (length - along) / 2;
        place(child, { start, length: along }, crossLength, easing);
      }
    }
  },
);
