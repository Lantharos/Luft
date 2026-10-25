import type Meta from 'gi://Meta';

import type { Box } from '../../../shared/layout/placement.js';
import { projection, rubberband } from '../../../shared/motion/motion.js';
import { axisOf, forward, type Direction } from '../layouts/geometry.js';
import { edgesMoved } from '../placement.js';
import type { Space, SpaceHost } from '../space.js';
import { StripScene } from './scene.js';
import { Strip } from './strip.js';

const OVERVIEW_MARGIN = 48;

const step = (direction: Direction): -1 | 1 => forward(direction) ? 1 : -1;

export class ScrollingSpace implements Space {
  private readonly strip = new Strip<Meta.Window>();
  private readonly scene: StripScene;
  private boxes = new Map<Meta.Window, Box>();
  private swipeStart: number | null = null;
  private zoomed = false;

  constructor(readonly monitor: number, private readonly host: SpaceHost) {
    this.scene = new StripScene(monitor, host);
  }

  get windows(): readonly Meta.Window[] {
    return this.strip.windows;
  }

  get overview(): boolean {
    return this.zoomed;
  }

  get focusedWindow(): Meta.Window | null {
    return this.strip.focusedWindow;
  }

  has(window: Meta.Window): boolean {
    return this.strip.has(window);
  }

  add(window: Meta.Window, focused: Meta.Window | null): void {
    if (focused) this.strip.focus(focused);
    this.strip.add(window, this.host.besideFocused());
  }

  remove(window: Meta.Window): void {
    this.strip.remove(window);
    this.boxes.delete(window);
    this.scene.release(window);
  }

  arrange(animate: boolean, held: Meta.Window | null = null, velocity = 0): void {
    this.syncView();
    if (this.swipeStart === null) this.strip.reveal();
    this.boxes = this.strip.layout();
    const placed = new Map(this.boxes);
    if (held) {
      placed.delete(held);
      this.scene.hold(held);
    }
    if (this.zoomed) this.scene.zoom(this.overviewBoxes(), this.overviewScale());
    else this.scene.apply(placed, animate, velocity);
  }

  boxOf(window: Meta.Window): Box | null {
    return this.boxes.get(window) ?? null;
  }

  neighbor(window: Meta.Window, direction: Direction): Meta.Window | null {
    if (!this.strip.focus(window)) return null;
    return axisOf(direction) === 'horizontal' ? this.strip.columnAt(step(direction)) : this.strip.rowAt(step(direction));
  }

  move(window: Meta.Window, direction: Direction): boolean {
    if (!this.strip.focus(window)) return false;
    const moved = axisOf(direction) === 'horizontal' ? this.strip.moveColumn(step(direction)) : this.strip.moveRow(step(direction));
    if (moved) this.arrange(true);
    return moved;
  }

  resize(window: Meta.Window, direction: Direction): void {
    if (!this.strip.focus(window)) return;
    if (axisOf(direction) === 'horizontal') this.strip.resizeWidth(step(direction));
    else this.strip.resizeRow(step(direction));
    this.arrange(true);
  }

  resized(window: Meta.Window, frame: Box): void {
    const before = this.boxes.get(window);
    if (!before) return;
    for (const [side, coordinate] of edgesMoved(before, frame)) {
      if (side === 'left' || side === 'right') this.strip.setWidth(window, frame.width);
      else this.strip.moveRowEdge(window, side === 'down', coordinate);
    }
    this.arrange(false, window);
  }

  /** An app that keeps its window wider than its column, as ones with a minimum width do, widens the column
   * instead of covering the next one. */
  widened(window: Meta.Window): void {
    if (this.swipeStart !== null || this.zoomed || !this.widen(window)) return;
    this.arrange(true);
  }

  private widen(window: Meta.Window): boolean {
    const box = this.boxes.get(window);
    const frame = window.get_frame_rect();
    if (!box || frame.width <= box.width + 1) return false;
    this.strip.setWidth(window, frame.width);
    return true;
  }

  // Windows that widened during a swipe or the overview get their columns widened once it ends
  private widenAll(): void {
    if (this.strip.windows.filter(window => this.widen(window)).length) this.arrange(true);
  }

  drop(window: Meta.Window, onto: Meta.Window): void {
    this.strip.remove(window);
    this.strip.focus(onto);
    this.strip.add(window, true);
    this.arrange(true);
  }

  focused(window: Meta.Window): void {
    if (this.strip.focus(window)) this.arrange(true);
  }

  release(window: Meta.Window): void {
    this.remove(window);
  }

  cycleWidth(window: Meta.Window): void {
    if (!this.strip.focus(window)) return;
    this.strip.cycleWidth();
    this.arrange(true);
  }

  maximize(window: Meta.Window): void {
    if (!this.strip.focus(window)) return;
    this.strip.maximize();
    this.arrange(true);
  }

  expand(window: Meta.Window): void {
    if (!this.strip.focus(window)) return;
    this.syncView();
    this.strip.expand();
    this.arrange(true);
  }

  edgeWindow(last: boolean): Meta.Window | null {
    return this.strip.edge(last);
  }

  moveToEdge(window: Meta.Window, last: boolean): void {
    if (this.strip.focus(window) && this.strip.moveColumnToEdge(last)) this.arrange(true);
  }

  center(window: Meta.Window): void {
    if (!this.strip.focus(window)) return;
    this.syncView();
    this.strip.center();
    this.boxes = this.strip.layout();
    this.scene.apply(this.boxes, true);
  }

  stack(window: Meta.Window, direction: -1 | 1): void {
    if (this.strip.focus(window) && this.strip.stack(direction)) this.arrange(true);
  }

  beginSwipe(): void {
    this.syncView();
    this.swipeStart = this.strip.offset;
  }

  swipe(distance: number): void {
    if (this.swipeStart === null) return;
    const wanted = this.swipeStart - distance;
    const furthest = Math.max(0, this.strip.totalWidth - this.strip.viewWidth);
    const overshoot = wanted < 0 ? wanted : wanted > furthest ? wanted - furthest : 0;
    this.strip.offset = wanted - overshoot + rubberband(overshoot, this.strip.viewWidth);
    this.scene.preview(this.strip.layout());
  }

  endSwipe(velocity: number): Meta.Window | null {
    if (this.swipeStart === null) return null;
    this.swipeStart = null;
    const snap = this.strip.snap(this.strip.offset - projection(velocity));
    this.strip.offset = snap.offset;
    this.strip.focused = snap.column;
    this.arrange(true, null, velocity);
    this.widenAll();
    return this.strip.focusedWindow;
  }

  zoom(zoomed: boolean): void {
    if (this.zoomed === zoomed) return;
    this.zoomed = zoomed;
    this.syncView();
    this.boxes = this.strip.layout();
    if (zoomed) this.scene.zoom(this.overviewBoxes(), this.overviewScale());
    else {
      this.scene.unzoom(this.boxes);
      this.widenAll();
    }
  }

  windowAt(x: number, y: number): Meta.Window | null {
    const boxes = this.zoomed ? this.overviewBoxes() : this.boxes;
    for (const [window, box] of boxes) {
      if (x >= box.x && x < box.x + box.width && y >= box.y && y < box.y + box.height) return window;
    }
    return null;
  }

  suspend(): void {
    this.scene.destroy();
  }

  private syncView(): void {
    this.strip.setView(this.host.workArea(this.monitor), this.host.gap());
  }

  private overviewScale(): number {
    const area = this.host.workArea(this.monitor);
    const gap = this.host.gap();
    const whole = this.strip.totalWidth + 2 * gap;
    return Math.min(1, (area.width - 2 * OVERVIEW_MARGIN) / whole, (area.height - 2 * OVERVIEW_MARGIN) / area.height);
  }

  private overviewBoxes(): Map<Meta.Window, Box> {
    const area = this.host.workArea(this.monitor);
    const gap = this.host.gap();
    const scale = this.overviewScale();
    const left = area.x + (area.width - (this.strip.totalWidth + 2 * gap) * scale) / 2;
    const top = area.y + (area.height - area.height * scale) / 2;
    const boxes = new Map<Meta.Window, Box>();
    for (const [window, box] of this.strip.layout(0)) {
      boxes.set(window, {
        x: Math.round(left + (box.x - area.x) * scale), y: Math.round(top + (box.y - area.y) * scale),
        width: Math.round(box.width * scale), height: Math.round(box.height * scale),
      });
    }
    return boxes;
  }
}
