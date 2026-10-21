import type Meta from 'gi://Meta';

import type { Box } from '../../../shared/layout/placement.js';
import { edgesMoved, place } from '../placement.js';
import type { Space, SpaceHost } from '../space.js';
import { Dwindle } from './dwindle.js';
import { axisOf, inset, length, neighbor, type Direction } from './geometry.js';
import type { LayoutName, TiledLayout } from './layout.js';
import { MasterStack } from './master.js';

const RESIZE_SHARE = 0.05;

export class TiledSpace implements Space {
  private readonly layout: TiledLayout<Meta.Window>;
  private boxes = new Map<Meta.Window, Box>();

  constructor(readonly monitor: number, name: LayoutName, private readonly host: SpaceHost) {
    this.layout = name === 'master' ? new MasterStack() : new Dwindle();
  }

  get windows(): readonly Meta.Window[] {
    return this.layout.windows;
  }

  has(window: Meta.Window): boolean {
    return this.layout.has(window);
  }

  add(window: Meta.Window, focused: Meta.Window | null): void {
    this.layout.insert(window, this.host.besideFocused() && focused && this.layout.has(focused) ? focused : null);
  }

  remove(window: Meta.Window): void {
    this.layout.remove(window);
    this.boxes.delete(window);
  }

  arrange(animate: boolean, held: Meta.Window | null = null): void {
    const gap = this.host.gap();
    this.boxes = this.layout.arrange(inset(this.host.workArea(this.monitor), gap), gap);
    for (const [window, box] of this.boxes) {
      if (window !== held) place(this.host, window, box, animate);
    }
  }

  boxOf(window: Meta.Window): Box | null {
    return this.boxes.get(window) ?? null;
  }

  neighbor(window: Meta.Window, direction: Direction): Meta.Window | null {
    const from = this.boxes.get(window);
    if (!from) return null;
    return neighbor(from, [...this.boxes].filter(([other]) => other !== window), direction);
  }

  move(window: Meta.Window, direction: Direction): boolean {
    const other = this.neighbor(window, direction);
    if (!other) return false;
    this.layout.swap(window, other);
    this.arrange(true);
    return true;
  }

  resize(window: Meta.Window, direction: Direction): void {
    const area = this.host.workArea(this.monitor);
    this.layout.resize(window, direction, Math.round(length(area, axisOf(direction)) * RESIZE_SHARE));
    this.arrange(true);
  }

  resized(window: Meta.Window, frame: Box): void {
    const before = this.boxes.get(window);
    if (!before) return;
    for (const [side, coordinate] of edgesMoved(before, frame)) this.layout.moveEdge(window, side, coordinate);
    this.arrange(false, window);
  }

  drop(window: Meta.Window, onto: Meta.Window): void {
    this.layout.swap(window, onto);
    this.arrange(true);
  }

  focused(): void {}

  release(window: Meta.Window): void {
    this.remove(window);
  }

  suspend(): void {}
}
