import type { DesktopPointerEvent } from '@luft/extension-api';

const FOLLOW = 0.45;
const SETTLE_PER_SECOND = 12;
const CLICK_MS = 450;
const CLICK_PIXELS = 12;

/** A mouse or finger: where it is, how fast it goes, and what it's been doing since it was pressed. */
export class Pointer {
  x: number;
  y: number;
  speedX = 0;
  speedY = 0;
  display: number;
  pressed = false;
  private fresh = true;
  private time: number;
  private pressedAt = 0;
  private startX = 0;
  private startY = 0;
  private strayed = 0;

  constructor(readonly id: number, { x, y, display, time }: DesktopPointerEvent) {
    this.x = x;
    this.y = y;
    this.display = display;
    this.time = time;
  }

  get speed(): number {
    return Math.hypot(this.speedX, this.speedY);
  }

  moved({ x, y, display, time }: DesktopPointerEvent): void {
    const gap = (time - this.time) / 1000;
    if (gap > 0 && display === this.display) {
      this.speedX += ((x - this.x) / gap - this.speedX) * FOLLOW;
      this.speedY += ((y - this.y) / gap - this.speedY) * FOLLOW;
    }
    this.x = x;
    this.y = y;
    this.display = display;
    this.time = time;
    this.fresh = true;
    if (this.pressed) this.strayed = Math.max(this.strayed, Math.hypot(x - this.startX, y - this.startY));
  }

  press(): void {
    this.pressed = true;
    this.pressedAt = this.time;
    this.startX = this.x;
    this.startY = this.y;
    this.strayed = 0;
  }

  /** Lets go, and says whether that was a click. */
  release(): boolean {
    this.pressed = false;
    return this.time - this.pressedAt < CLICK_MS && this.strayed < CLICK_PIXELS;
  }

  /** Slows down when no motion arrives, since one that stopped sends nothing more. */
  settle(seconds: number): void {
    if (this.fresh) {
      this.fresh = false;
      return;
    }
    const left = Math.exp(-seconds * SETTLE_PER_SECOND);
    this.speedX *= left;
    this.speedY *= left;
  }
}
