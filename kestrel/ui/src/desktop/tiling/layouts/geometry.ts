import type { Box } from '../../../shared/placement.js';

export type Direction = 'left' | 'right' | 'up' | 'down';
export type Axis = 'horizontal' | 'vertical';

export const DIRECTIONS: readonly Direction[] = ['left', 'right', 'up', 'down'];
export const MIN_RATIO = 0.1;

export const axisOf = (direction: Direction): Axis => direction === 'left' || direction === 'right' ? 'horizontal' : 'vertical';
export const forward = (direction: Direction): boolean => direction === 'right' || direction === 'down';
export const clampRatio = (ratio: number): number => Math.min(1 - MIN_RATIO, Math.max(MIN_RATIO, ratio));

export function inset(box: Box, amount: number): Box {
  return { x: box.x + amount, y: box.y + amount, width: Math.max(1, box.width - 2 * amount), height: Math.max(1, box.height - 2 * amount) };
}

export function length(box: Box, axis: Axis): number {
  return axis === 'horizontal' ? box.width : box.height;
}

export function start(box: Box, axis: Axis): number {
  return axis === 'horizontal' ? box.x : box.y;
}

export function split(box: Box, axis: Axis, ratio: number, gap: number): [Box, Box] {
  const usable = Math.max(0, length(box, axis) - gap);
  const first = Math.round(usable * ratio);
  if (axis === 'horizontal')
    return [{ ...box, width: first }, { ...box, x: box.x + first + gap, width: usable - first }];
  return [{ ...box, height: first }, { ...box, y: box.y + first + gap, height: usable - first }];
}

export function divide(box: Box, axis: Axis, weights: readonly number[], gap: number): Box[] {
  const usable = Math.max(0, length(box, axis) - gap * (weights.length - 1));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let offset = start(box, axis);
  let used = 0;
  return weights.map((weight, index) => {
    const size = index === weights.length - 1 ? usable - used : Math.round(usable * weight / total);
    const part = axis === 'horizontal' ? { ...box, x: offset, width: size } : { ...box, y: offset, height: size };
    offset += size + gap;
    used += size;
    return part;
  });
}

export function sameBox(a: Box, b: Box): boolean {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}

export function contains(box: Box, x: number, y: number): boolean {
  return x >= box.x && x < box.x + box.width && y >= box.y && y < box.y + box.height;
}

function overlap(a0: number, a1: number, b0: number, b1: number): number {
  return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
}

function score(from: Box, to: Box, direction: Direction): number | null {
  const horizontal = axisOf(direction) === 'horizontal';
  const sign = forward(direction) ? 1 : -1;
  const fromCenter = horizontal ? from.x + from.width / 2 : from.y + from.height / 2;
  const toCenter = horizontal ? to.x + to.width / 2 : to.y + to.height / 2;
  if ((toCenter - fromCenter) * sign <= 0) return null;
  const fromEdge = horizontal ? (sign > 0 ? from.x + from.width : from.x) : (sign > 0 ? from.y + from.height : from.y);
  const toEdge = horizontal ? (sign > 0 ? to.x : to.x + to.width) : (sign > 0 ? to.y : to.y + to.height);
  const distance = Math.max(0, (toEdge - fromEdge) * sign);
  const shared = horizontal
    ? overlap(from.y, from.y + from.height, to.y, to.y + to.height)
    : overlap(from.x, from.x + from.width, to.x, to.x + to.width);
  const across = horizontal
    ? Math.abs(from.y + from.height / 2 - (to.y + to.height / 2))
    : Math.abs(from.x + from.width / 2 - (to.x + to.width / 2));
  return (shared > 0 ? 0 : 1e6) + distance * 4 + across;
}

export function neighbor<T>(from: Box, candidates: Iterable<readonly [T, Box]>, direction: Direction): T | null {
  let best: T | null = null;
  let bestScore = Infinity;
  for (const [item, box] of candidates) {
    const value = score(from, box, direction);
    if (value !== null && value < bestScore) {
      best = item;
      bestScore = value;
    }
  }
  return best;
}
