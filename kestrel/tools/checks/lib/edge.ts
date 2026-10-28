import type Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

export type Edge = 'bottom' | 'left' | 'top' | 'right';

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

const shell = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

export const taskbarEdge = () => shell.get_string('taskbar-position') as Edge;
export const vertical = (edge = taskbarEdge()) => edge === 'left' || edge === 'right';
export const outward = (edge = taskbarEdge()) => edge === 'bottom' || edge === 'right' ? 1 : -1;
export const slideProperty = (edge = taskbarEdge()) => vertical(edge) ? 'translation-x' : 'translation-y';

export function boxOf(actor: Clutter.Actor): Box {
  const [x, y] = actor.get_transformed_position();
  const [width, height] = actor.get_transformed_size();
  return {x, y, width, height};
}

export function towardEdge(actor: Clutter.Actor, edge = taskbarEdge()) {
  return (vertical(edge) ? actor.translation_x : actor.translation_y) * outward(edge);
}

export function farSide(box: Box, edge = taskbarEdge()) {
  switch (edge) {
    case 'bottom': return box.y + box.height;
    case 'top': return box.y;
    case 'left': return box.x;
    case 'right': return box.x + box.width;
  }
}

export function nearSide(box: Box, edge = taskbarEdge()) {
  switch (edge) {
    case 'bottom': return box.y;
    case 'top': return box.y + box.height;
    case 'left': return box.x + box.width;
    case 'right': return box.x;
  }
}

export function beyond(position: number, boundary: number, edge = taskbarEdge()) {
  return (position - boundary) * outward(edge) > 0;
}

export function reservedGap(monitor = Main.layoutManager.primaryMonitor!, edge = taskbarEdge()) {
  const area = Main.layoutManager.getWorkAreaForMonitor(monitor.index);
  return Math.abs(farSide(monitor, edge) - farSide(area, edge));
}

const SCREEN_MARGIN = 12;

export function besideItsButton(surface: Clutter.Actor, button: Clutter.Actor) {
  if (!vertical()) return true;
  const monitor = Main.layoutManager.primaryMonitor!;
  const box = boxOf(surface);
  const target = boxOf(button);
  const centered = Math.abs(box.y + box.height / 2 - (target.y + target.height / 2)) <= 1;
  const clamped = Math.abs(box.y - monitor.y - SCREEN_MARGIN) <= 1 || Math.abs(monitor.y + monitor.height - SCREEN_MARGIN - box.y - box.height) <= 1;
  return centered || clamped;
}
