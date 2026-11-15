import type Clutter from 'gi://Clutter';

import { animateActor, Curve, Duration, Spring, stillMotion } from './motion.js';

type Axis = 'x' | 'y';

const departing = new WeakSet<Clutter.Actor>();

export function depart(actor: Clutter.Actor): boolean {
  if (departing.has(actor)) return false;
  departing.add(actor);
  return true;
}

const start = (actor: Clutter.Actor, axis: Axis) => {
  const box = actor.get_allocation_box();
  return axis === 'x' ? box.x1 : box.y1;
};

const shown = (actor: Clutter.Actor, axis: Axis) => start(actor, axis) + (axis === 'x' ? actor.translation_x : actor.translation_y);

export function moveRows(container: Clutter.Actor, change: () => void, axis: Axis = 'y', fadeLeaps = false): void {
  if (stillMotion() || !container.mapped) {
    change();
    return;
  }
  const visible = () => container.get_children().filter(child => child.visible);
  const before = new Map(visible().map((child, index) => [child, { was: shown(child, axis), index }]));
  change();
  const order = new Map(visible().map((child, index) => [child, index]));
  const property = axis === 'x' ? 'translation_x' : 'translation_y';
  const pending = new Map<Clutter.Actor, number>();
  for (const child of container.get_children()) {
    const earlier = before.get(child);
    if (!earlier) continue;
    const { was, index } = earlier;
    pending.set(child, child.connect('notify::allocation', () => {
      child.disconnect(pending.get(child)!);
      pending.delete(child);
      const offset = was - start(child, axis);
      if (Math.abs(offset) < 0.5 && !child[property]) return;
      if (fadeLeaps && order.get(child)! < index) {
        child.opacity = 0;
        animateActor(child, { [property]: 0, duration: 0 });
        animateActor(child, { opacity: 255, delay: Duration.tap, duration: Duration.quick, curve: Curve.decelerate });
        return;
      }
      child[property] = offset;
      animateActor(child, { [property]: 0, spring: Spring.snappy });
    }));
  }
  const painted = global.stage.connect('after-paint', () => {
    global.stage.disconnect(painted);
    for (const [child, id] of pending) child.disconnect(id);
  });
}

export function placeAfter(container: Clutter.Actor, child: Clutter.Actor, previous: Clutter.Actor | null): void {
  let sibling = child.get_previous_sibling();
  while (sibling && departing.has(sibling)) sibling = sibling.get_previous_sibling();
  if (sibling === previous) return;
  if (previous) container.set_child_above_sibling(child, previous);
  else container.set_child_below_sibling(child, null);
}
