import type Meta from 'gi://Meta';

import type { Box } from '../../shared/layout/placement.js';
import type { Direction } from './layouts/geometry.js';

export interface SpaceHost {
  workArea(monitor: number): Box;
  monitorBox(monitor: number): Box;
  monitorCount(): number;
  gap(): number;
  besideFocused(): boolean;
  morph(window: Meta.Window): void;
  ready(window: Meta.Window): boolean;
  shown(window: Meta.Window): boolean;
}

export interface Space {
  readonly monitor: number;
  readonly windows: readonly Meta.Window[];
  has(window: Meta.Window): boolean;
  add(window: Meta.Window, focused: Meta.Window | null): void;
  remove(window: Meta.Window): void;
  arrange(animate: boolean, held?: Meta.Window | null): void;
  boxOf(window: Meta.Window): Box | null;
  neighbor(window: Meta.Window, direction: Direction): Meta.Window | null;
  move(window: Meta.Window, direction: Direction): boolean;
  resize(window: Meta.Window, direction: Direction): void;
  resized(window: Meta.Window, frame: Box): void;
  drop(window: Meta.Window, onto: Meta.Window): void;
  focused(window: Meta.Window): void;
  release(window: Meta.Window): void;
  suspend(): void;
}
