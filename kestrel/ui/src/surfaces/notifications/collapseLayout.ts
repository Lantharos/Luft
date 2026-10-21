import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';

import { animateActor, Spring } from '../../shared/motion/motion.js';

const collapsing = new WeakMap<Clutter.Actor, number>();

export function collapse(actor: Clutter.Actor, resized: () => void, collapsed: () => void): void {
  const height = actor.height;
  collapsing.set(actor, height);
  actor.height = height;
  actor.connect('notify::height', resized);
  animateActor(actor, { height: 0, spring: Spring.snappy, onComplete: collapsed });
}

function presence(child: Clutter.Actor, height: number): number {
  const start = collapsing.get(child);
  return start ? height / start : 1;
}

export const CollapseLayout = GObject.registerClass(
  class CollapseLayout extends Clutter.BoxLayout {
    private rows(container: Clutter.Actor, width: number): { child: Clutter.Actor; height: number; gap: number }[] {
      const rows: { child: Clutter.Actor; height: number; gap: number }[] = [];
      for (const child of container.get_children()) {
        if (!child.visible) continue;
        const height = Math.round(child.get_preferred_height(width)[1]);
        const previous = rows.at(-1);
        const gap = previous ? Math.round(this.spacing * Math.min(presence(previous.child, previous.height), presence(child, height))) : 0;
        rows.push({ child, height, gap });
      }
      return rows;
    }

    vfunc_get_preferred_height(container: Clutter.Actor, forWidth: number): [number, number] {
      const height = this.rows(container, forWidth).reduce((sum, row) => sum + row.gap + row.height, 0);
      return [height, height];
    }

    vfunc_allocate(container: Clutter.Actor, box: Clutter.ActorBox): void {
      let y = box.y1;
      for (const { child, height, gap } of this.rows(container, box.get_width())) {
        y += gap;
        child.allocate(new Clutter.ActorBox({ x1: box.x1, y1: y, x2: box.x2, y2: y + height }));
        y += height;
      }
    }
  },
);
