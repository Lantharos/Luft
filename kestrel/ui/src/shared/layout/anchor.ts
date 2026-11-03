import type { Box } from './box.js';
import type { Edge } from './edge.js';

/** How deep the taskbar reaches in from each edge of a display, 0 where it has nothing. */
export type Depths = Record<Edge, number>;

/** How far a surface keeps from the end of a display it reaches. */
export const EDGE_MARGIN = 12;

export const NO_DEPTHS: Depths = { bottom: 0, left: 0, top: 0, right: 0 };

/**
 * Where a surface opens: from `edge`, lined up along it with `target`, a coordinate along that edge. With `align` -1
 * the surface starts at the target, with 1 it ends there, and with 0 it's centred on it.
 */
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

/** The middle of a surface of `size` lined up with an anchor, for `dock`. */
export function middleAt({ target, align }: Anchor, size: number): number {
  return target - align * size / 2;
}
