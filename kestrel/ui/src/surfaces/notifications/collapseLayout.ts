import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';

import { animateActor, Curve, Duration, Spring, stillMotion } from '../../shared/motion/motion.js';
import { depart } from '../../shared/motion/rows.js';

const fullHeights = new WeakMap<Clutter.Actor, number>();
const ARRIVING_SCALE = 0.96;

export function collapse(actor: Clutter.Actor, resized: () => void, collapsed: () => void): void {
  depart(actor);
  if (stillMotion()) {
    collapsed();
    return;
  }
  const height = actor.height;
  fullHeights.set(actor, height);
  actor.height = height;
  actor.connect('notify::height', resized);
  animateActor(actor, { height: 0, spring: Spring.snappy, onComplete: collapsed });
}

export function vanish(actor: Clutter.Actor, resized: () => void): void {
  if (!depart(actor)) {
    actor.destroy();
    return;
  }
  actor.reactive = false;
  animateActor(actor, { opacity: 0, duration: Duration.quick, curve: Curve.linear });
  collapse(actor, resized, () => actor.destroy());
}

export function grow(actor: Clutter.Actor, width: number, resized: () => void): void {
  actor.opacity = 0;
  animateActor(actor, { opacity: 255, duration: Duration.quick, curve: Curve.decelerate });
  if (stillMotion()) return;
  const height = Math.round(actor.get_preferred_height(width)[1]);
  fullHeights.set(actor, height);
  actor.height = 0;
  actor.clip_to_allocation = true;
  const id = actor.connect('notify::height', resized);
  animateActor(actor, {
    height, spring: Spring.snappy,
    onStopped: () => actor.disconnect(id),
    onComplete: () => {
      fullHeights.delete(actor);
      actor.height = -1;
      actor.clip_to_allocation = false;
    },
  });
  actor.set_pivot_point(0.5, 0);
  actor.set_scale(ARRIVING_SCALE, ARRIVING_SCALE);
  animateActor(actor, { scale_x: 1, scale_y: 1, spring: Spring.arrive });
}

function presence(child: Clutter.Actor, height: number): number {
  const full = fullHeights.get(child);
  return full ? height / full : 1;
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
