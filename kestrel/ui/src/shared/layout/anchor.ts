import type { Box } from './box.js';
import type { Edge } from './edge.js';

export type Depths = Record<Edge, number>;

export const EDGE_MARGIN = 12;

export const NO_DEPTHS: Depths = { bottom: 0, left: 0, top: 0, right: 0 };

export interface Anchor {
  edge: Edge;
  target: number;
  align: -1 | 0 | 1;
}

export function insetBy({ x, y, width, height }: Box, depths: Depths): Box {
  return {
    x: x + depths.left,
    y: y + depths.top,
    width: width - depths.left - depths.right,
    height: height - depths.top - depths.bottom,
  };
}

export function middleAt({ target, align }: Anchor, size: number): number {
  return target - align * size / 2;
}
