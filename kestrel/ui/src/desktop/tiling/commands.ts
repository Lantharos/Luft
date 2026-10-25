import type Meta from 'gi://Meta';

import type { Box } from '../../shared/layout/placement.js';
import { boxOf } from '../windows/frames.js';
import { neighbor, type Direction } from './layouts/geometry.js';
import { ScrollingSpace } from './scrolling/scrollingSpace.js';
import type { Space } from './space.js';
import type { Tiler } from './tiler.js';

export interface CommandSurroundings {
  monitors(): Box[];
  activate(window: Meta.Window): void;
  boardShown(): boolean;
  boardStep(directionX: number, directionY: number): void;
}

const STEPS: Record<Direction, [number, number]> = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] };

function focusedWindow(): Meta.Window | null {
  return global.display.focus_window;
}

export class TilingCommands {
  constructor(private readonly tiler: Tiler, private readonly surroundings: CommandSurroundings) {}

  focus(direction: Direction): void {
    if (this.surroundings.boardShown()) {
      this.surroundings.boardStep(...STEPS[direction]);
      return;
    }
    const window = focusedWindow();
    const target = (window && this.tiler.spaceOf(window)?.neighbor(window, direction)) ?? this.across(window, direction);
    if (target) this.surroundings.activate(target);
  }

  move(direction: Direction): void {
    const window = focusedWindow();
    const space = this.tiler.spaceOf(window);
    if (!window || !space || this.surroundings.boardShown() || space.move(window, direction)) return;
    const monitors = this.surroundings.monitors();
    const target = neighbor(monitors[space.monitor]!, monitors.map((box, index) => [index, box] as const).filter(([index]) => index !== space.monitor), direction);
    if (target === null) return;
    const destination = this.tiler.spaceOn(target);
    this.tiler.moveTo(window, destination, destination instanceof ScrollingSpace ? destination.focusedWindow : null);
  }

  resize(direction: Direction): void {
    const window = focusedWindow();
    if (window && !this.surroundings.boardShown()) this.tiler.spaceOf(window)?.resize(window, direction);
  }

  toggleFloating(): void {
    const window = focusedWindow();
    if (window && !this.surroundings.boardShown()) this.tiler.toggleFloating(window);
  }

  cycleWidth(): void {
    this.inStrip((space, window) => space.cycleWidth(window));
  }

  center(): void {
    this.inStrip((space, window) => space.center(window));
  }

  maximizeColumn(): void {
    this.inStrip((space, window) => space.maximize(window));
  }

  expandColumn(): void {
    this.inStrip((space, window) => space.expand(window));
  }

  focusEdge(last: boolean): void {
    const space = this.focusedStrip();
    const target = space && !this.surroundings.boardShown() ? space.edgeWindow(last) : null;
    if (target) this.surroundings.activate(target);
  }

  moveToEdge(last: boolean): void {
    this.inStrip((space, window) => space.moveToEdge(window, last));
  }

  stack(direction: -1 | 1): void {
    this.inStrip((space, window) => space.stack(window, direction));
  }

  focusedStrip(): ScrollingSpace | null {
    const space = this.tiler.spaceOf(focusedWindow());
    if (space instanceof ScrollingSpace) return space;
    const [x, y] = global.get_pointer();
    const monitor = this.surroundings.monitors().findIndex(box => x >= box.x && x < box.x + box.width && y >= box.y && y < box.y + box.height);
    const pointed = this.tiler.spaceOn(Math.max(0, monitor));
    return pointed instanceof ScrollingSpace ? pointed : null;
  }

  private inStrip(run: (space: ScrollingSpace, window: Meta.Window) => void): void {
    const window = focusedWindow();
    const space = this.tiler.spaceOf(window);
    if (window && space instanceof ScrollingSpace && !this.surroundings.boardShown()) run(space, window);
  }

  private across(window: Meta.Window | null, direction: Direction): Meta.Window | null {
    const own = this.tiler.spaceOf(window);
    const from = (window && (own?.boxOf(window) ?? boxOf(window.get_frame_rect()))) ?? this.pointerBox();
    const candidates: [Meta.Window, Box][] = [];
    for (const space of this.tiler.visibleSpaces()) {
      if (space !== own) candidates.push(...this.shownIn(space));
    }
    for (const floating of this.tiler.floatingWindows()) {
      if (floating !== window && floating.showing_on_its_workspace()) candidates.push([floating, boxOf(floating.get_frame_rect())]);
    }
    return neighbor(from, candidates, direction);
  }

  private shownIn(space: Space): [Meta.Window, Box][] {
    if (space instanceof ScrollingSpace) {
      const window = space.focusedWindow;
      const box = window && space.boxOf(window);
      return window && box ? [[window, box]] : [];
    }
    return space.windows.flatMap(window => {
      const box = space.boxOf(window);
      return box ? [[window, box] as [Meta.Window, Box]] : [];
    });
  }

  private pointerBox(): Box {
    const [x, y] = global.get_pointer();
    return { x, y, width: 1, height: 1 };
  }
}
