import Clutter from 'gi://Clutter';

import type { Box } from './box.js';

export type Edge = 'bottom' | 'left' | 'top' | 'right';
export type Along = 'center' | 'end';

export interface Inset {
  edge: Edge;
  depth: number;
}

export interface Offset {
  translation_x: number;
  translation_y: number;
}

export const isVertical = (edge: Edge) => edge === 'left' || edge === 'right';

export const outward = (edge: Edge) => edge === 'bottom' || edge === 'right' ? 1 : -1;

export const rightToLeft = () => Clutter.get_default_text_direction() === Clutter.TextDirection.RTL;

export function band({ x, y, width, height }: Box, edge: Edge, depth: number): Box {
  switch (edge) {
    case 'bottom': return { x, y: y + height - depth, width, height: depth };
    case 'top': return { x, y, width, height: depth };
    case 'left': return { x, y, width: depth, height };
    case 'right': return { x: x + width - depth, y, width: depth, height };
  }
}

export function inset({ x, y, width, height }: Box, edge: Edge, depth: number): Box {
  switch (edge) {
    case 'bottom': return { x, y, width, height: height - depth };
    case 'top': return { x, y: y + depth, width, height: height - depth };
    case 'left': return { x: x + depth, y, width: width - depth, height };
    case 'right': return { x, y, width: width - depth, height };
  }
}

export function gap(outer: Box, inner: Box, edge: Edge): number {
  switch (edge) {
    case 'bottom': return outer.y + outer.height - inner.y - inner.height;
    case 'top': return inner.y - outer.y;
    case 'left': return inner.x - outer.x;
    case 'right': return outer.x + outer.width - inner.x - inner.width;
  }
}

export function direction(edge: Edge): [number, number] {
  return isVertical(edge) ? [outward(edge), 0] : [0, outward(edge)];
}

export function toward(edge: Edge, distance: number): Offset {
  const [x, y] = direction(edge);
  return { translation_x: x * distance, translation_y: y * distance };
}

function alongStart(start: number, length: number, size: number, along: Along | number, margin: number, reversed: boolean): number {
  if (typeof along === 'number') return Math.max(start + margin, Math.min(along - size / 2, start + length - margin - size));
  if (along === 'center') return start + (length - size) / 2;
  return reversed ? start + margin : start + length - margin - size;
}

export function dock(area: Box, edge: Edge, width: number, height: number, along: Along | number, margin = 0): [number, number] {
  if (isVertical(edge)) {
    const x = edge === 'left' ? area.x : area.x + area.width - width;
    return [Math.round(x), Math.round(alongStart(area.y, area.height, height, along, margin, false))];
  }
  const y = edge === 'top' ? area.y : area.y + area.height - height;
  return [Math.round(alongStart(area.x, area.width, width, along, margin, rightToLeft())), Math.round(y)];
}
