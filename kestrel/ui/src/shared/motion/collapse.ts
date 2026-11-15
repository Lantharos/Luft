import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';

import { animateActor, Curve, Duration, Spring, stillMotion } from './motion.js';
import { depart } from './rows.js';

const fullHeights = new WeakMap<Clutter.Actor, number>();
const hiding = new WeakSet<Clutter.Actor>();
const ARRIVING_SCALE = 0.96;
const unchanged = () => {};

function settle(actor: Clutter.Actor): void {
  fullHeights.delete(actor);
  actor.height = -1;
  actor.clip_to_allocation = false;
}

function resize(actor: Clutter.Actor, height: number, resized: () => void, done: () => void): void {
  const id = actor.connect('notify::height', resized);
  animateActor(actor, { height, spring: Spring.snappy, onStopped: () => actor.disconnect(id), onComplete: done });
}

export function collapse(actor: Clutter.Actor, resized: () => void, collapsed: () => void): void {
  depart(actor);
  if (stillMotion()) {
    collapsed();
    return;
  }
  const height = actor.height;
  if (!fullHeights.has(actor)) fullHeights.set(actor, height);
  actor.height = height;
  actor.connect('notify::height', resized);
  animateActor(actor, { height: 0, spring: Spring.snappy, onComplete: collapsed });
}

export function vanish(actor: Clutter.Actor, resized: () => void = unchanged): void {
  if (!depart(actor)) {
    actor.destroy();
    return;
  }
  actor.reactive = false;
  animateActor(actor, { opacity: 0, duration: Duration.quick, curve: Curve.linear });
  collapse(actor, resized, () => actor.destroy());
}

export function grow(actor: Clutter.Actor, width: number, resized: () => void = unchanged): void {
  const returning = hiding.delete(actor);
  if (!returning) actor.opacity = 0;
  animateActor(actor, { opacity: 255, duration: Duration.quick, curve: Curve.decelerate });
  if (stillMotion()) return;
  if (!returning) {
    fullHeights.set(actor, fullHeights.get(actor) ?? Math.round(actor.get_preferred_height(width)[1]));
    actor.height = 0;
    actor.clip_to_allocation = true;
    actor.set_pivot_point(0.5, 0);
    actor.set_scale(ARRIVING_SCALE, ARRIVING_SCALE);
  }
  resize(actor, fullHeights.get(actor)!, resized, () => settle(actor));
  animateActor(actor, { scale_x: 1, scale_y: 1, spring: Spring.arrive });
}

export function leap(actor: Clutter.Actor, width: number, resized: () => void = unchanged): void {
  const gap = new Clutter.Actor({ height: actor.height });
  actor.get_parent()!.insert_child_below(gap, actor);
  collapse(gap, resized, () => gap.destroy());
  grow(actor, width, resized);
}

function shrink(actor: Clutter.Actor, resized: () => void): void {
  hiding.add(actor);
  const hidden = () => {
    hiding.delete(actor);
    actor.visible = false;
    actor.opacity = 255;
    actor.set_scale(1, 1);
    settle(actor);
  };
  const still = stillMotion();
  animateActor(actor, { opacity: 0, duration: Duration.quick, curve: Curve.accelerate, onComplete: still ? hidden : undefined });
  if (still) return;
  const height = actor.height;
  if (!fullHeights.has(actor)) fullHeights.set(actor, height);
  actor.height = height;
  actor.clip_to_allocation = true;
  actor.set_pivot_point(0.5, 0);
  resize(actor, 0, resized, hidden);
  animateActor(actor, { scale_x: ARRIVING_SCALE, scale_y: ARRIVING_SCALE, spring: Spring.snappy });
}

export function reveal(actor: Clutter.Actor, shown: boolean, animate: boolean, width: number, resized: () => void = unchanged): void {
  if (shown === (actor.visible && !hiding.has(actor))) return;
  if (!animate) {
    if (hiding.delete(actor)) {
      actor.remove_all_transitions();
      actor.opacity = 255;
      actor.set_scale(1, 1);
      settle(actor);
    }
    actor.visible = shown;
    return;
  }
  if (!shown) {
    shrink(actor, resized);
    return;
  }
  actor.visible = true;
  grow(actor, width, resized);
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
        const share = presence(child, height);
        const gap = !previous ? 0 : Math.round(this.spacing * (rows.length === 1 ? Math.min(presence(previous.child, previous.height), share) : share));
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
