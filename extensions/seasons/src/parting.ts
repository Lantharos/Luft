import type { DesktopPointerEvent, LayerDisplay, PointerArea, PointerFollow, Wallpaper } from '@luft/extension-api';

import { ease } from './density.js';
import { MAX_TOUCHES } from './effects/parted.js';

const MOUSE = 0;
const ARRIVE_S = 0.3;
const LEAVE_S = 0.45;
const FOLLOW_S = 0.07;
const FAST_LAG_PX = 110;
const GONE = 0.004;

/** A mouse or finger over a display, gliding after where it really is and fading in and out. */
export class Touch {
  x: number;
  y: number;
  strength = 0;
  private toX: number;
  private toY: number;
  private here = true;

  constructor(readonly id: number, readonly display: number, x: number, y: number) {
    this.x = this.toX = x;
    this.y = this.toY = y;
  }

  /** From 0 to 1. It trails further behind the faster it goes, so this needs no clock of its own. */
  get speed(): number {
    return Math.min(Math.hypot(this.toX - this.x, this.toY - this.y) / FAST_LAG_PX, 1);
  }

  get gone(): boolean {
    return !this.here && this.strength < GONE;
  }

  moveTo(x: number, y: number): void {
    this.toX = x;
    this.toY = y;
    this.here = true;
  }

  leave(): void {
    this.here = false;
  }

  advance(elapsed: number): void {
    this.strength = ease(this.strength, this.here ? 1 : 0, elapsed, this.here ? ARRIVE_S : LEAVE_S);
    this.x = ease(this.x, this.toX, elapsed, FOLLOW_S);
    this.y = ease(this.y, this.toY, elapsed, FOLLOW_S);
  }
}

/**
 * The touches that part what falls. It follows the pointer from a frame that shows on the wallpaper until it isn't
 * allowed to, and over the displays that frame shows on, so nothing listens while nothing would show it. A motion only
 * notes where the pointer went, and the frames that run anyway do the rest.
 */
export class Parting {
  touches: Touch[] = [];
  private allowed = false;
  private follow: PointerFollow | null = null;
  private areas: readonly PointerArea[] = [];

  constructor(private readonly wallpaper: Wallpaper) {}

  allow(allowed: boolean): void {
    this.allowed = allowed;
    if (allowed) return;
    this.follow?.dispose();
    this.follow = null;
    this.touches.forEach(touch => touch.leave());
  }

  advance(elapsed: number, displays: readonly LayerDisplay[]): void {
    if (this.allowed) this.watch(displays);
    if (!this.touches.length) return;
    this.touches.forEach(touch => touch.advance(elapsed));
    this.touches = this.touches.filter(touch => !touch.gone);
  }

  private watch(displays: readonly LayerDisplay[]): void {
    if (this.follow && this.covers(displays)) return;
    this.areas = displays.map(({ index, width, height }) => ({ display: index, x: 0, y: 0, width, height }));
    if (this.follow) this.follow.setAreas(this.areas);
    else this.follow = this.wallpaper.followPointer({ areas: this.areas, onPointer: event => this.felt(event) });
  }

  private covers(displays: readonly LayerDisplay[]): boolean {
    return displays.length === this.areas.length && displays.every(({ index, width, height }, at) => {
      const area = this.areas[at];
      return area.display === index && area.width === width && area.height === height;
    });
  }

  private felt({ id, kind, phase, display, x, y }: DesktopPointerEvent): void {
    if (kind === 'touch') this.leave(MOUSE);
    if (phase === 'gone' || (phase === 'up' && kind === 'touch')) {
      this.leave(id);
      return;
    }
    this.leave(id, display);
    const touch = this.touches.find(touch => touch.id === id && touch.display === display);
    if (touch) touch.moveTo(x, y);
    else if (this.touches.length < MAX_TOUCHES) this.touches.push(new Touch(id, display, x, y));
  }

  private leave(id: number, staying?: number): void {
    for (const touch of this.touches) {
      if (touch.id === id && touch.display !== staying) touch.leave();
    }
  }
}
