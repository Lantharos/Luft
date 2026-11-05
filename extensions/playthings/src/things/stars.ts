import type { Sprite } from '@luft/extension-api';

import type { Pointer } from '../playground/pointers.js';
import { Particles } from './particles.js';
import { clamp, nearness, shuffled, Spring, Stepper } from './physics.js';
import { type Shape, SHAPES } from './shapes.js';
import { type Box, expanded, type Point, type Stand, Thing } from './thing.js';

const SPAN = 150;
const STAR = 56;
const NEAR = 220;
const JOINS = 2.6;
const REST = 0.62;
const FLICK_SPEED = 1500;
const FLICK_GAP_S = 0.4;
const COMET_HEIGHT = 220;
const COMETS = 3;
const TWINKLE_SECONDS = 2.6;
const TWINKLE = 0.42;
const REACH = 150;
const STILL = 0.004;
const TO_DEGREES = 180 / Math.PI;
const LINE_THICKNESS = 2;
const LINE_CELL = 32;
const LINE_GONE = 0.01;

interface Star {
  sprite: Sprite;
  x: number;
  y: number;
  size: number;
  frame: number;
  close: number;
  shine: Spring;
  burst: Spring;
  twinkle: number;
}

interface Line {
  sprite: Sprite;
  from: Star;
  to: Star;
  length: number;
  angle: number;
  reach: Spring;
}

/** A constellation that brightens and joins up near the pointer, and sends a shooting star after a flick. */
export class Stars extends Thing {
  private readonly stars: Star[];
  private readonly lines: Line[];
  private readonly comets: Particles;
  private readonly clock = new Stepper();
  private readonly shape: Shape;
  private readonly span: number;
  private readonly seed: number;
  private x = 0;
  private y = 0;
  private sinceFlick = FLICK_GAP_S;
  private flickAngle = 0;

  constructor(id: string, stand: Stand, slot: number) {
    super(id, 'stars', stand);
    const { sheets, size, display } = stand;
    this.seed = slot + 1;
    this.shape = SHAPES[slot % SHAPES.length];
    this.span = SPAN * size;
    const lineSprites = this.shape.lines.map(() => this.part(sheets.small, LINE_CELL, { pivot: [0, 0.5] }));
    this.stars = this.shape.stars.map(([x, y, scale], index): Star => ({
      sprite: this.part(sheets.star, STAR * scale * size, { pivot: [0.5, 0.5], pressable: true }),
      x, y, size: scale,
      frame: Math.floor(shuffled(this.seed * 5 + index) * 3),
      close: 0,
      shine: new Spring(REST, 22, 7),
      burst: new Spring(0, 40, 6),
      twinkle: 0,
    }));
    this.lines = this.shape.lines.map(([from, to], index): Line => {
      const [start, end] = [this.stars[from], this.stars[to]];
      const [dx, dy] = [(end.x - start.x) * this.span, (end.y - start.y) * this.span];
      return { sprite: lineSprites[index], from: start, to: end, length: Math.hypot(dx, dy), angle: Math.atan2(dy, dx), reach: new Spring(0, 20, 7) };
    });
    this.comets = new Particles(() => this.part(sheets.comet, COMET_HEIGHT * size, { pivot: [1, 0.5] }), COMETS, display, 0, { gravity: 30, drag: 0.4 });
  }

  get bounds(): Box {
    const edge = this.span + STAR;
    return { x: this.x - edge, y: this.y - edge, width: edge * 2, height: edge * 2 };
  }

  get reach(): Box {
    return expanded(this.bounds, REACH);
  }

  get home(): Point {
    return { x: this.x, y: this.y };
  }

  get grip(): Point {
    return this.home;
  }

  moveTo(point: Point): void {
    const edge = this.span + STAR * this.stand.size;
    const { x, y } = this.kept(point, edge, edge);
    this.x = x;
    this.y = y;
    this.rest();
  }

  step(seconds: number, _time: number, pointers: readonly Pointer[]): boolean {
    if (this.stand.calm()) {
      for (const { shine, burst } of this.stars) {
        shine.value = Math.max(REST, shine.target);
        burst.snap();
      }
      this.draw();
      return false;
    }
    this.clock.run(seconds, dt => this.advance(dt, pointers));
    this.draw();
    return this.moving;
  }

  private starX(star: Star): number {
    return this.x + star.x * this.span;
  }

  private starY(star: Star): number {
    return this.y + star.y * this.span;
  }

  private advance(dt: number, pointers: readonly Pointer[]): void {
    this.sinceFlick += dt;
    for (const star of this.stars) {
      const [x, y] = [this.starX(star), this.starY(star)];
      const distance = pointers.reduce((least, { x: pointerX, y: pointerY }) => Math.min(least, Math.hypot(x - pointerX, y - pointerY)), Infinity);
      star.close = Math.max(0, 1 - distance / (NEAR * this.stand.size));
      star.shine.target = REST + nearness(distance, NEAR * this.stand.size) * (1 - REST) * 1.1;
      star.shine.step(dt);
      star.burst.step(dt);
    }
    for (const line of this.lines) {
      line.reach.target = clamp(Math.min(line.from.close, line.to.close) * JOINS, 0, 1);
      line.reach.step(dt);
    }
    for (const pointer of pointers) if (pointer.speed > FLICK_SPEED) this.flick(pointer);
    this.comets.step(dt);
  }

  /** Sends a shooting star the way the pointer's going, at most every so often. */
  private flick({ x, y, speedX, speedY, speed }: Pointer): void {
    if (this.sinceFlick < FLICK_GAP_S) return;
    this.sinceFlick = 0;
    this.flickAngle = Math.atan2(speedY, speedX);
    const pace = clamp(speed, 700, 1300) / speed;
    this.comets.emit(x, y, speedX * pace, speedY * pace, 1.1);
  }

  private get moving(): boolean {
    return this.comets.busy || this.stars.some(({ shine, burst }) => !shine.still(STILL, STILL * 4) || !burst.still(STILL, STILL * 4)) ||
      this.lines.some(({ reach }) => !reach.still(STILL, STILL * 4));
  }

  breathe(time: number): void {
    this.stars.forEach((star, index) => {
      const phase = (time / TWINKLE_SECONDS + shuffled(this.seed * 3 + index) * 7) % 7;
      star.twinkle = phase < 1 ? Math.sin(phase * Math.PI) * TWINKLE : 0;
    });
  }

  rest(): void {
    this.comets.clear();
    for (const star of this.stars) {
      star.shine.target = REST;
      star.shine.snap();
      star.burst.snap();
      star.close = star.twinkle = 0;
    }
    for (const { reach } of this.lines) {
      reach.target = 0;
      reach.snap();
    }
    this.draw();
  }

  grabbed(): void {}

  released(pointer: Pointer, clicked: boolean): void {
    if (!clicked) return;
    const pressed = this.stars.reduce((nearest, star) =>
      Math.hypot(this.starX(star) - pointer.x, this.starY(star) - pointer.y) < Math.hypot(this.starX(nearest) - pointer.x, this.starY(nearest) - pointer.y) ? star : nearest);
    pressed.burst.velocity += 16;
    for (const { from, to } of this.lines) {
      if (from === pressed) to.burst.velocity += 7;
      else if (to === pressed) from.burst.velocity += 7;
    }
  }

  draw(): void {
    const { display } = this.stand;
    for (const star of this.stars) {
      const glow = clamp(star.shine.value + star.twinkle + star.burst.value * 0.5, 0, 1);
      const grow = 0.75 + glow * 0.45 + star.burst.value * 0.6;
      star.sprite.place({ display, x: this.starX(star), y: this.starY(star), frame: star.frame, opacity: glow, scaleX: grow, scaleY: grow, rotation: star.burst.value * 40 });
    }
    for (const line of this.lines) {
      const reach = line.reach.value < LINE_GONE ? 0 : clamp(line.reach.value, 0, 1);
      line.sprite.place({
        display, x: this.starX(line.from), y: this.starY(line.from), frame: 3,
        rotation: line.angle * TO_DEGREES, opacity: reach, scaleX: line.length * reach / LINE_CELL, scaleY: LINE_THICKNESS / LINE_CELL * 8,
      });
    }
    this.comets.draw(() => this.flickAngle * TO_DEGREES);
  }
}
