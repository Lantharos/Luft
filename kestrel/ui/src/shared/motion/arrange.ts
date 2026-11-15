import type Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';

import { leap, reveal } from './collapse.js';
import { leapers, moveRows, placeAfter } from './rows.js';

export type Rows = () => [row: Clutter.Actor, shown: boolean][];

const queued = new WeakMap<Clutter.Actor, { rows: Rows; later: number; destroyed: number }>();

function arrangeNow(container: Clutter.Actor, rows: Rows): void {
  const order = rows();
  const animate = container.mapped;
  const width = container.width;
  const leapt = leapers(container, order.map(([row]) => row));
  moveRows(container, () => order.reduce<Clutter.Actor | null>((previous, [row, shown]) => {
    if (shown && leapt.has(row)) leap(row, width);
    placeAfter(container, row, previous);
    reveal(row, shown, animate, width);
    return row;
  }, null), 'y', leapt);
}

function cancel(container: Clutter.Actor): void {
  const pending = queued.get(container);
  if (!pending) return;
  queued.delete(container);
  container.disconnect(pending.destroyed);
  global.compositor.get_laters().remove(pending.later);
}

export function arrange(container: Clutter.Actor, rows: Rows): void {
  if (!container.mapped) {
    cancel(container);
    arrangeNow(container, rows);
    return;
  }
  const pending = queued.get(container);
  if (pending) {
    pending.rows = rows;
    return;
  }
  const later = global.compositor.get_laters().add(Meta.LaterType.BEFORE_REDRAW, () => {
    const latest = queued.get(container)!.rows;
    queued.delete(container);
    container.disconnect(destroyed);
    arrangeNow(container, latest);
    return GLib.SOURCE_REMOVE;
  });
  const destroyed = container.connect('destroy', () => cancel(container));
  queued.set(container, { rows, later, destroyed });
}
