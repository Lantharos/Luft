import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { animateActor, Curve, Duration } from '../../../../../shared/motion/motion.js';

export const GROW = { duration: Duration.large, curve: Curve.settle };
const FADE = { duration: Duration.moderate, curve: Curve.gentle };

type Axis = 'translation_x' | 'translation_y';

interface Part {
  actor: Clutter.Actor;
  start: number;
  size: number;
}

interface Slide {
  actor: Clutter.Actor;
  axis: Axis;
  from: number;
}

interface Plan {
  slides: Slide[];
  replaced: Clutter.Actor[];
  appearing: Clutter.Actor[];
  disappearing: Clutter.Actor[];
}

const axisOf = (vertical: boolean): Axis => (vertical ? 'translation_y' : 'translation_x');
const lengthOf = (actor: Clutter.Actor, vertical: boolean) => (vertical ? actor.get_preferred_height(-1) : actor.get_preferred_width(-1))[1];
const stacks = (actor: Clutter.Actor, vertical: boolean): actor is St.BoxLayout =>
  actor instanceof St.BoxLayout && (actor.orientation === Clutter.Orientation.VERTICAL) === vertical;

function looks(actor: Clutter.Actor): string {
  const own = actor instanceof St.Label ? actor.text : actor instanceof St.Icon ? actor.icon_name : actor instanceof St.Widget ? actor.style : null;
  return `${actor.constructor.name}(${own ?? ''}|${actor.get_children().map(looks).join(',')})`;
}

function stacked(box: St.BoxLayout, vertical: boolean): Part[] {
  const spacing = box.get_theme_node().get_length('spacing');
  let start = 0;
  return box.get_children().map(actor => {
    const part = { actor, start, size: lengthOf(actor, vertical) };
    start += part.size + spacing;
    return part;
  });
}

function parts(view: Clutter.Actor, vertical: boolean): Part[] {
  const root = view.get_first_child();
  if (!root) return [];
  return stacks(root, vertical) ? stacked(root, vertical) : [{ actor: root, start: 0, size: lengthOf(root, vertical) }];
}

const same = (one: Part, other: Part) => Math.abs(one.size - other.size) < 1 && looks(one.actor) === looks(other.actor);

function twinsOf(arriving: Part[], leaving: Part[]): Map<Part, Part> {
  const twins = new Map<Part, Part>();
  const shorter = Math.min(arriving.length, leaving.length);
  let head = 0;
  while (head < shorter && same(arriving[head], leaving[head])) {
    twins.set(arriving[head], leaving[head]);
    head++;
  }
  for (let tail = 1; tail <= shorter - head && same(arriving.at(-tail)!, leaving.at(-tail)!); tail++) twins.set(arriving.at(-tail)!, leaving.at(-tail)!);
  return twins;
}

function follow(plan: Plan, arriving: Part[], leaving: Part[], vertical: boolean, direction: number, offset: number, nests: boolean): void {
  const axis = axisOf(vertical);
  const twins = twinsOf(arriving, leaving);
  const taken = new Set(twins.values());
  const slideFrom = (part: Part, twin: Part) => plan.slides.push({ actor: part.actor, axis, from: direction * (twin.start - part.start) + offset + twin.actor[axis] });
  arriving.forEach((part, index) => {
    const twin = twins.get(part);
    const across = leaving[index];
    if (twin) {
      slideFrom(part, twin);
      plan.replaced.push(twin.actor);
    } else if (nests && across && !taken.has(across) && stacks(part.actor, !vertical) && stacks(across.actor, !vertical)) {
      taken.add(across);
      slideFrom(part, across);
      const centred = (lengthOf(part.actor, !vertical) - lengthOf(across.actor, !vertical)) / 2;
      follow(plan, stacked(part.actor, !vertical), stacked(across.actor, !vertical), !vertical, 1, centred, false);
    } else {
      plan.appearing.push(part.actor);
    }
  });
  plan.disappearing.push(...leaving.filter(part => !taken.has(part)).map(part => part.actor));
}

function settle(actor: Clutter.Actor): void {
  actor.remove_all_transitions();
  actor.opacity = 255;
  actor.translation_x = 0;
  actor.translation_y = 0;
}

export function morph(into: Clutter.Actor, from: Clutter.Actor, vertical: boolean, animate: boolean): void {
  const returning = into.visible;
  into.show();
  into.get_parent()!.set_child_above_sibling(into, null);
  const arriving = parts(into, vertical);
  if (!animate || !returning) for (const { actor } of arriving) [actor, ...actor.get_children()].forEach(settle);
  if (!animate) {
    from.hide();
    return;
  }
  const plan: Plan = { slides: [], replaced: [], appearing: [], disappearing: [] };
  const direction = !vertical && into.get_text_direction() === Clutter.TextDirection.RTL ? -1 : 1;
  follow(plan, arriving, parts(from, vertical), vertical, direction, 0, true);
  for (const { actor, axis, from: start } of plan.slides) {
    actor.opacity = 255;
    actor[axis] = start;
    animateActor(actor, { [axis]: 0, ...GROW });
  }
  for (const actor of plan.replaced) actor.opacity = 0;
  const swapping = plan.appearing.length > 0 && plan.disappearing.length > 0;
  for (const actor of plan.appearing) {
    if (!returning) actor.opacity = 0;
    animateActor(actor, { opacity: 255, ...FADE, delay: swapping || returning ? 0 : FADE.duration / 2 });
  }
  if (!plan.disappearing.length) from.hide();
  plan.disappearing.forEach((actor, index) => animateActor(actor, {
    opacity: 0, ...FADE, duration: swapping ? FADE.duration : FADE.duration / 2,
    onStopped: () => {
      if (index === 0 && from.get_parent()?.get_last_child() !== from) from.hide();
    },
  }));
}
