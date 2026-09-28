import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';

import { PANEL_HEIGHT } from '../shared/surface.js';

export const PanelLayout = GObject.registerClass(
  class PanelLayout extends Clutter.LayoutManager {
    vfunc_get_preferred_width(): [number, number] { return [0, 0]; }
    vfunc_get_preferred_height(): [number, number] { return [PANEL_HEIGHT, PANEL_HEIGHT]; }

    vfunc_allocate(container: Clutter.Actor, allocation: Clutter.ActorBox): void {
      const [center, status, peek] = container.get_children();
      const width = allocation.get_width();
      const height = allocation.get_height();
      const [, peekWidth] = peek.get_preferred_width(height);
      peek.allocate(new Clutter.ActorBox({ x1: width - peekWidth, y1: 0, x2: width, y2: height }));
      for (const child of [center, status]) {
        const [, naturalWidth] = child.get_preferred_width(-1);
        const [, naturalHeight] = child.get_preferred_height(naturalWidth);
        const x = child === center ? (width - naturalWidth) / 2 : width - peekWidth - naturalWidth - 4;
        const y = (height - naturalHeight) / 2;
        child.allocate(new Clutter.ActorBox({
          x1: Math.round(x), y1: Math.round(y),
          x2: Math.round(x) + naturalWidth, y2: Math.round(y) + naturalHeight,
        }));
      }
    }
  },
);
