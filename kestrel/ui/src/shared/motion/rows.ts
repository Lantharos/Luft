import type Clutter from 'gi://Clutter';

import { animateActor, Spring, stillMotion } from './motion.js';

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

const staying = (container: Clutter.Actor) => container.get_children().filter(child => child.visible && !departing.has(child));

function longestRising(values: number[]): Set<number> {
  const lengths = values.map(() => 1);
  const previous = values.map(() => -1);
  values.forEach((value, i) => {
    for (let j = 0; j < i; j++) {
      if (values[j] < value && lengths[j] + 1 > lengths[i]) {
        lengths[i] = lengths[j] + 1;
        previous[i] = j;
      }
    }
  });
  const kept = new Set<number>();
  for (let i = lengths.lastIndexOf(Math.max(...lengths)); i >= 0; i = previous[i]) kept.add(i);
  return kept;
}

export function leapers(container: Clutter.Actor, order: Clutter.Actor[]): Set<Clutter.Actor> {
  if (stillMotion() || !container.mapped) return new Set();
  const rank = new Map(staying(container).map((child, index) => [child, index]));
  const kept = order.filter(child => rank.has(child));
  const rising = longestRising(kept.map(child => rank.get(child)!));
  return new Set(kept.filter((_, index) => !rising.has(index)));
}

export function moveRows(container: Clutter.Actor, change: () => void, axis: Axis = 'y', leapt: ReadonlySet<Clutter.Actor> = new Set()): void {
  if (stillMotion() || !container.mapped) {
    change();
    return;
  }
  const before = new Map(container.get_children().filter(child => child.visible).map(child => [child, shown(child, axis)]));
  change();
  const property = axis === 'x' ? 'translation_x' : 'translation_y';
  const pending = new Map<Clutter.Actor, number>();
  for (const [child, was] of before) {
    if (leapt.has(child)) continue;
    pending.set(child, child.connect('notify::allocation', () => {
      child.disconnect(pending.get(child)!);
      pending.delete(child);
      const offset = was - start(child, axis);
      if (Math.abs(offset) < 0.5 && !child[property]) return;
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
