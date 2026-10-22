import type Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { inBudget, type Work } from './queue.js';

const { util_paint_offscreen: paintOffscreen } = Shell as unknown as { util_paint_offscreen(actor: Clutter.Actor): void };

const PART_SIZE = 16;

interface Visit {
  actor: Clutter.Actor;
  part: boolean;
  shown: boolean;
}

interface Warming {
  focused?: St.Widget;
  place?: () => void;
}

function paintHidden(actor: Clutter.Actor): void {
  if (actor.visible) return;
  const translation = actor.translation_y;
  actor.translation_y = 0;
  paintOffscreen(actor);
  actor.translation_y = translation;
}

function size(actor: Clutter.Actor, limit = PART_SIZE): number {
  let count = 1;
  for (let child = actor.get_first_child(); child && count <= limit; child = child.get_next_sibling())
    count += size(child, limit - count);
  return count;
}

function descendant(root: Clutter.Actor, path: readonly number[]): Clutter.Actor | null {
  let actor: Clutter.Actor | null = root;
  for (const index of path) actor = actor?.get_child_at_index(index) ?? null;
  return actor;
}

function* partition(root: Clutter.Actor): Generator<Visit, void, unknown> {
  const path: number[] = [];
  let hiddenDepth = -1;
  const leave = () => {
    if (hiddenDepth === path.length) hiddenDepth = -1;
  };
  for (;;) {
    const actor = descendant(root, path);
    if (!actor) {
      path.pop();
      leave();
      if (!path.length) return;
      path[path.length - 1]++;
      continue;
    }
    if (hiddenDepth < 0 && actor !== root && !actor.visible) hiddenDepth = path.length;
    const part = actor !== root && size(actor) <= PART_SIZE;
    const descend = !part && actor.get_n_children() > 0;
    yield { actor, part, shown: hiddenDepth < 0 };
    if (descend) {
      path.push(0);
    } else if (path.length) {
      leave();
      path[path.length - 1]++;
    } else {
      return;
    }
  }
}

function prepare({ actor, part, shown }: Visit): void {
  if (!part) {
    if (shown && actor instanceof St.Widget) actor.ensure_style();
    return;
  }
  if (shown) {
    actor.inhibit_culling();
    actor.uninhibit_culling();
  }
  actor.get_preferred_width(-1);
  actor.get_preferred_height(-1);
}

function layOut(root: Clutter.Actor, place?: () => void): void {
  place?.();
  root.show();
  root.get_allocation_box();
  root.hide();
}

function holdsFocus(widget: St.Widget): boolean {
  const focus = global.stage.get_key_focus();
  return !!focus && widget.contains(focus);
}

function* paintParts(root: Clutter.Actor, interrupted: () => boolean): Work {
  const parts = partition(root);
  for (let done = false; !done; yield) {
    if (interrupted()) return;
    root.inhibit_culling();
    do {
      const next = parts.next();
      done = !!next.done;
      if (next.value?.part && next.value.shown) paintOffscreen(next.value.actor);
    } while (!done && inBudget());
    root.uninhibit_culling();
  }
}

export function* warmHidden(root: Clutter.Actor, { focused, place }: Warming = {}): Work {
  let destroyed = false;
  const watch = root.connect('destroy', () => (destroyed = true));
  const interrupted = () => destroyed || root.visible;
  focused?.add_style_pseudo_class('focus');
  try {
    for (const visit of partition(root)) {
      if (interrupted()) return;
      prepare(visit);
      yield;
    }
    if (interrupted()) return;
    layOut(root, place);
    yield;
    yield* paintParts(root, interrupted);
    paintHidden(root);
  } finally {
    if (!destroyed) {
      root.disconnect(watch);
      if (focused && !holdsFocus(focused)) focused.remove_style_pseudo_class('focus');
    }
  }
}
