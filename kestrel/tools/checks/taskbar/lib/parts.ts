import type Clutter from 'gi://Clutter';
import St from 'gi://St';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {boxOf} from '../../lib/edge.js';

const TOLERANCE = 0.5;

type Box = ReturnType<typeof boxOf>;

export interface Part {
  name: string;
  box: Box;
}

const shownBox = (actor: Clutter.Actor) => {
  const box = boxOf(actor);
  return actor.mapped && box.width > TOLERANCE && box.height > TOLERANCE ? box : null;
};

const nameOf = (actor: Clutter.Actor) => actor.accessible_name || actor.name || actor.constructor.name;

export const islandsOf = (panel: Clutter.Actor) => panel.get_children().filter(child => child.name?.startsWith('kestrel-island-') && child.visible);

function partsOfElement(element: Clutter.Actor): Clutter.Actor[] {
  if (!(element instanceof St.Widget) || !element.has_style_class_name('kestrel-app-slots')) return [element];
  return element.get_children().filter(slot => shownBox(slot)).map(slot => slot.get_first_child()!);
}

export function taskbarParts(panel: Clutter.Actor): Part[] {
  return islandsOf(panel)
    .flatMap(island => (island as St.Bin).child.get_children())
    .flatMap(partsOfElement)
    .flatMap(actor => {
      const box = shownBox(actor);
      return box ? [{name: nameOf(actor), box}] : [];
    });
}

const intersect = (a: Box, b: Box) =>
  a.x + TOLERANCE < b.x + b.width && b.x + TOLERANCE < a.x + a.width && a.y + TOLERANCE < b.y + b.height && b.y + TOLERANCE < a.y + a.height;

const inside = (box: Box, area: Box) =>
  box.x >= area.x - TOLERANCE && box.y >= area.y - TOLERANCE &&
  box.x + box.width <= area.x + area.width + TOLERANCE && box.y + box.height <= area.y + area.height + TOLERANCE;

function monitorOf(panel: Clutter.Actor): Box {
  const [x, y] = panel.get_transformed_position();
  return Main.layoutManager.monitors.find(monitor => inside({x, y, width: 1, height: 1}, monitor))!;
}

export function crowding(panel: Clutter.Actor): string | null {
  const squeezed = islandsOf(panel).find(island => island.has_clip);
  if (squeezed) return `${squeezed.name} is squeezed below its size`;
  const parts = taskbarParts(panel);
  const monitor = monitorOf(panel);
  const outside = parts.find(({box}) => !inside(box, monitor));
  if (outside) return `${outside.name} reaches off the screen`;
  for (const [index, part] of parts.entries()) {
    const other = parts.slice(index + 1).find(({box}) => intersect(part.box, box));
    if (other) return `${part.name} overlaps ${other.name}`;
  }
  return null;
}
