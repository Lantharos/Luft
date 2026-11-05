import type { Sprite } from '@luft/extension-api';

import type { Pointer } from '../playground/pointers.js';
import { clamp, nearness, shuffled, Spring, Stepper } from './physics.js';
import { type Box, expanded, type Point, type Stand, Thing } from './thing.js';

const BODY_HEIGHT = 92;
const GLOW_HEIGHT = 300;
const TASSEL_HEIGHT = 46;
const CORD_THICKNESS = 0.62;
const CELL_FILL = 0.84;
const REACH = 90;
const SOFTEST_BRUSH = 1.4;
const BRUSH = 0.0058;
const CORD_BRUSH = 0.008;
const FASTEST_BRUSH = 1600;
const CORD_REACH = 12;
const STILL_PIXELS = 0.2;
const SWAY_RADIANS = 0.014;
const SWAY_SECONDS = 7;
const DIM_GLOW = 0.42;
const FLICKER = 0.07;
const HOLD_PULL = 150;
const HOLD_DAMPING = 18;
const SWING_DAMPING = 0.72;
const SMALL_SWING_DAMPING = 2.4;
const SMALL_SWING_PIXELS = 7;
const TO_DEGREES = 180 / Math.PI;
const EDGE_ROOM = 14;

export const PAPERS = ['amber', 'coral', 'jade'] as const;
export type Paper = typeof PAPERS[number];

/** A paper lantern on a cord: a pendulum that the pointer drags along by how fast it moves, with the body and tassel lagging behind. */
export class Lantern extends Thing {
  private readonly glow: Sprite;
  private readonly cord: Sprite;
  private readonly dim: Sprite;
  private readonly lit: Sprite;
  private readonly tassel: Sprite;
  private readonly bodyHeight: number;
  private readonly glowHeight: number;
  private readonly tasselHeight: number;
  private readonly clock = new Stepper();
  private readonly seed: number;
  private readonly paper: number;
  private anchorX = 0;
  private anchorY = 0;
  private length = 0;
  private angle = 0;
  private speed = 0;
  private readonly tilt = new Spring(0, 34, 5);
  private readonly drape = new Spring(0, 18, 3.6);
  private readonly brightness = new Spring(DIM_GLOW, 26, 6);
  private swayed = 0;
  private flicker = 0;
  private holder: Pointer | null = null;
  private burning = false;
  private glowFit = 1;

  constructor(id: string, stand: Stand, paper: Paper, slot: number) {
    super(id, 'lantern', stand);
    const { sheets, size } = stand;
    this.seed = slot + 1;
    this.paper = PAPERS.indexOf(paper);
    this.bodyHeight = BODY_HEIGHT * size;
    this.glowHeight = GLOW_HEIGHT * size;
    this.tasselHeight = TASSEL_HEIGHT * size;
    const cellHeight = this.bodyHeight / CELL_FILL;
    this.glow = this.part(sheets.glow, this.glowHeight, { pivot: [0.5, 0.5] });
    this.cord = this.part(sheets.small, 32, { pivot: [0.5, 0] });
    this.tassel = this.part(sheets.tassel, this.tasselHeight, { pivot: [0.5, 0.06] });
    this.dim = this.part(sheets.lantern, cellHeight, { pivot: [0.5, 0.08], pressable: true });
    this.lit = this.part(sheets.lantern, cellHeight, { pivot: [0.5, 0.08] });
  }

  get bounds(): Box {
    const half = this.bodyHeight;
    return { x: this.anchorX - half, y: this.anchorY, width: half * 2, height: this.length + this.bodyHeight + this.tasselHeight };
  }

  get reach(): Box {
    return expanded(this.bounds, REACH);
  }

  get home(): Point {
    return { x: this.anchorX, y: this.anchorY + this.length };
  }

  /** Hangs the lantern with its top at `point`, under the ceiling at the same place. */
  moveTo(point: Point): void {
    const { x, y } = this.kept(point, this.bodyHeight * 0.6 + EDGE_ROOM, 0);
    this.anchorX = x;
    this.anchorY = this.stand.room.y;
    this.length = Math.max(24, y - this.anchorY);
    this.glowFit = this.fitted({ x, y: y + this.bodyHeight / 2 }, this.glowHeight / 2 + EDGE_ROOM);
    this.rest();
  }

  get grip(): Point {
    const { x, y } = this.bob;
    return { x, y: y + this.bodyHeight / 2 };
  }

  private get bob(): Point {
    const angle = this.angle + this.swayed;
    return { x: this.anchorX + Math.sin(angle) * this.length, y: this.anchorY + Math.cos(angle) * this.length };
  }

  step(seconds: number, _time: number, pointers: readonly Pointer[]): boolean {
    if (this.stand.calm()) {
      this.brightness.snap();
      this.draw();
      return false;
    }
    this.clock.run(seconds, dt => this.advance(dt, pointers));
    this.draw();
    return this.moving;
  }

  private advance(dt: number, pointers: readonly Pointer[]): void {
    const swing = (2 * Math.PI / (1.4 + this.length / 340)) ** 2;
    const reach = Math.hypot(this.angle, this.speed / Math.sqrt(swing)) * this.length / SMALL_SWING_PIXELS;
    const damping = SWING_DAMPING + SMALL_SWING_DAMPING / (1 + reach * reach);
    let push = -swing * Math.sin(this.angle) - damping * this.speed;
    if (this.holder) {
      const pull = Math.atan2(this.holder.x - this.anchorX, this.holder.y - this.anchorY);
      push = (pull - this.angle) * HOLD_PULL - this.speed * HOLD_DAMPING;
    } else {
      for (const pointer of pointers) push += this.brushedBy(pointer);
    }
    this.speed += push * dt;
    this.angle += this.speed * dt;
    this.tilt.target = -this.speed * 0.09;
    this.tilt.step(dt);
    this.drape.target = -this.speed * 0.2 - this.tilt.value;
    this.drape.step(dt);
    this.brightness.step(dt);
  }

  /** The pull of a pointer passing across the lantern or its cord, by how fast it goes compared with the lantern. */
  private brushedBy(pointer: Pointer): number {
    const { x: bobX, y: bobY } = this.bob;
    const across = Math.cos(this.angle);
    const along = Math.sin(this.angle);
    const passing = clamp(pointer.speedX * across - pointer.speedY * along, -FASTEST_BRUSH, FASTEST_BRUSH);
    const grip = (brush: number) => Math.max(SOFTEST_BRUSH, Math.abs(passing) * brush);
    const centerY = bobY + this.bodyHeight / 2;
    const touch = nearness(Math.hypot(pointer.x - bobX, pointer.y - centerY), this.bodyHeight * 0.75);
    const body = touch * grip(BRUSH) * (passing - this.speed * this.length) / this.length;
    const [lineX, lineY] = [bobX - this.anchorX, bobY - this.anchorY];
    const share = clamp(((pointer.x - this.anchorX) * lineX + (pointer.y - this.anchorY) * lineY) / this.length ** 2, 0, 1);
    const fromCord = Math.hypot(pointer.x - this.anchorX - share * lineX, pointer.y - this.anchorY - share * lineY);
    const cord = nearness(fromCord, CORD_REACH) * grip(CORD_BRUSH) * share * (passing - this.speed * share * this.length) / this.length;
    return body + cord;
  }

  private get moving(): boolean {
    return Math.abs(this.angle) * this.length > STILL_PIXELS || Math.abs(this.speed) * this.length > STILL_PIXELS || !this.tilt.still(0.002, 0.01) ||
      !this.drape.still(0.01, 0.04) || !this.brightness.still(0.004, 0.02) || !!this.holder;
  }

  breathe(time: number): void {
    const phase = (time + shuffled(this.seed) * SWAY_SECONDS) * 2 * Math.PI / (SWAY_SECONDS + shuffled(this.seed + 4) * 3);
    this.swayed = Math.sin(phase) * SWAY_RADIANS * (140 / Math.max(120, this.length) + 0.6);
    this.flicker = Math.sin(time * 5.3 + this.seed) * Math.sin(time * 8.7 + this.seed * 2) * FLICKER;
  }

  rest(): void {
    this.angle = this.speed = this.swayed = this.flicker = 0;
    this.tilt.value = this.tilt.velocity = 0;
    this.drape.value = this.drape.velocity = 0;
    this.brightness.snap();
    this.draw();
  }

  grabbed(pointer: Pointer): void {
    this.holder = pointer;
  }

  released(_pointer: Pointer, clicked: boolean): void {
    this.holder = null;
    if (!clicked) return;
    this.burning = !this.burning;
    this.brightness.target = this.burning ? 1 : DIM_GLOW;
    this.brightness.velocity += this.burning ? 7 : -3;
    this.speed += (this.seed % 2 ? 1 : -1) * 40 / this.length;
  }

  draw(): void {
    const { display } = this.stand;
    const angle = this.angle + this.swayed;
    const { x, y } = this.bob;
    const body = angle + this.tilt.value;
    const glow = clamp(this.brightness.value + this.flicker, 0, 1.2);
    const lit = clamp((this.brightness.value - DIM_GLOW) / (1 - DIM_GLOW), 0, 1);
    const shown = this.paper;
    this.cord.place({ display, x: this.anchorX, y: this.anchorY, frame: 2, rotation: -angle * TO_DEGREES, scaleX: CORD_THICKNESS, scaleY: this.length / 32 });
    this.dim.place({ display, x, y, frame: shown, rotation: -body * TO_DEGREES });
    this.lit.place({ display, x, y, frame: shown + PAPERS.length, rotation: -body * TO_DEGREES, opacity: lit });
    const bottom = this.bodyHeight * 0.98;
    this.tassel.place({ display, x: x + Math.sin(body) * bottom, y: y + Math.cos(body) * bottom, frame: shown, rotation: -(body + this.drape.value) * TO_DEGREES });
    this.glow.place({ display, x: x + Math.sin(body) * this.bodyHeight * 0.5, y: y + Math.cos(body) * this.bodyHeight * 0.5, frame: shown, opacity: clamp(glow * 0.72, 0, 1), scaleX: this.glowFit, scaleY: this.glowFit });
  }
}
