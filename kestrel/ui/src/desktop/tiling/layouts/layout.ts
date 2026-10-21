import type { Box } from '../../../shared/placement.js';
import type { Direction } from './geometry.js';

export type LayoutName = 'dwindle' | 'master';

export interface TiledLayout<T> {
  readonly windows: readonly T[];
  has(window: T): boolean;
  insert(window: T, beside: T | null): void;
  remove(window: T): void;
  swap(a: T, b: T): void;
  arrange(area: Box, gap: number): Map<T, Box>;
  resize(window: T, direction: Direction, step: number): void;
  moveEdge(window: T, side: Direction, coordinate: number): void;
}
