import type { Sprite } from '@luft/extension-api';

import type { Pointer } from '../playground/pointers.js';
import { Particles } from './particles.js';
import { between, clamp, nearness, shuffled, Spring, Stepper } from './physics.js';
import { type Box, expanded, type Point, type Stand, Thing } from './thing.js';

const LOGS = 120;
const FLAME = 118;
const GLOW = 420;
const REACH = 240;
const FLAME_FRAMES = 6;
const FLICKER_SECONDS = 0.09;
const LEAN_MOST = 0.75;
const LEAN_AWAY = 0.62;
const WIND = 0.0006;
const FAN_RISE = 0.00125;
const FAN_FALL = 0.7;
const FAN_MOST = 1;
const SPARK_FAN = 14;
const SPARK_BURST = 12;
const SPARKS = 18;
const STILL = 0.002;
const TO_DEGREES = 180 / Math.PI;
const IDLE_WOBBLE = 0.05;

interface Tongue {
  sprite: Sprite;
  offset: number;
  height: number;
  frame: number;
  turn: number;
  lean: Spring;
  deep: boolean;
}

/** A small fire: tongues of flame that lean away from the pointer on springs, and catch when it's fanned or clicked. */
export class Campfire extends Thing {
  private readonly glow: Sprite;
  private readonly logs: Sprite;
  private readonly tongues: Tongue[];
  private readonly sparks: Particles;
  private readonly heat = new Spring(0, 16, 5);
  private readonly clock = new Stepper();
  private readonly seed: number;
  private readonly unit: number;
  private x = 0;
  private y = 0;
  private fan = 0;
  private flicker = 0;
  private wobble = 0;
  private owed = 0;
  private glowFit = 1;

  constructor(id: string, stand: Stand, slot: number) {
    super(id, 'campfire', stand);
    const { sheets, size, display } = stand;
    this.seed = slot + 1;
    this.unit = size;
    this.glow = this.part(sheets.glow, GLOW * size, { pivot: [0.5, 0.5] });
    const tongue = (offset: number, height: number, deep: boolean, stiffness: number, frame: number): Tongue => ({
      sprite: this.part(sheets.flame, height * size, { pivot: [0.5, 1], pressable: true }),
      offset: offset * size, height, frame, turn: 0, deep, lean: new Spring(0, stiffness, 4.2),
    });
    this.tongues = [
      tongue(0, FLAME * 1.24, true, 15, 0), tongue(-22, FLAME * 0.86, true, 22, 3), tongue(22, FLAME * 0.9, true, 19, 2),
      tongue(-8, FLAME * 0.78, false, 24, 4), tongue(10, FLAME * 0.66, false, 28, 1),
    ];
    this.logs = this.part(sheets.logs, LOGS * size, { pivot: [0.5, 0.86], pressable: true });
    this.sparks = new Particles(() => this.part(sheets.small, 14 * size, { pivot: [0.5, 0.5] }), SPARKS, display, 0, { gravity: -60, drag: 1.6 });
  }

  get bounds(): Box {
    const half = GLOW * this.unit / 2;
    return { x: this.x - half, y: this.y - half * 1.4, width: half * 2, height: half * 1.4 };
  }

  get reach(): Box {
    return expanded({ x: this.x, y: this.y - FLAME * this.unit / 2, width: 0, height: 0 }, REACH * this.unit);
  }

  get home(): Point {
    return { x: this.x, y: this.y };
  }

  private get glowY(): number {
    return this.y - GLOW * this.unit * 0.14;
  }

  get grip(): Point {
    return { x: this.x, y: this.y - 50 * this.unit };
  }

  moveTo(point: Point): void {
    const { x, y } = this.kept(point, LOGS * this.unit * 0.6, 0);
    this.x = x;
    this.y = y;
    this.glowFit = this.fitted({ x, y: this.glowY }, GLOW * this.unit / 2);
    this.rest();
  }

  step(seconds: number, time: number, pointers: readonly Pointer[]): boolean {
    if (this.stand.calm()) {
      this.draw();
      return false;
    }
    this.clock.run(seconds, dt => this.advance(dt, pointers));
    this.flicker = time / FLICKER_SECONDS;
    this.draw();
    return this.moving;
  }

  private advance(dt: number, pointers: readonly Pointer[]): void {
    let [lean, wind, fanned] = [0, 0, 0];
    const flameY = this.y - FLAME * this.unit * 0.4;
    for (const pointer of pointers) {
      const [awayX, awayY] = [this.x - pointer.x, flameY - pointer.y];
      const distance = Math.hypot(awayX, awayY) || 1;
      const near = nearness(distance, REACH * this.unit);
      lean += near * LEAN_AWAY * (awayX / distance);
      wind += near * pointer.speedX * WIND * 2;
      fanned += near ** 0.5 * pointer.speed * FAN_RISE;
    }
    this.fan = clamp(this.fan + (fanned - this.fan * FAN_FALL) * dt, 0, FAN_MOST);
    this.heat.target = this.fan;
    this.heat.step(dt);
    const leaning = clamp(lean + wind, -LEAN_MOST, LEAN_MOST);
    for (const tongue of this.tongues) {
      tongue.lean.target = leaning * (tongue.deep ? 1 : 0.8);
      tongue.lean.step(dt);
    }
    this.owed += this.fan * SPARK_FAN * dt;
    for (; this.owed >= 1; this.owed--) this.throwSpark(160);
    this.sparks.step(dt, leaning * 240);
  }

  private throwSpark(speed: number): void {
    this.sparks.emit(this.x + between(-26, 26) * this.unit, this.y - between(20, 60) * this.unit, between(-40, 40), -between(speed * 0.7, speed * 1.4), between(0.7, 1.5));
  }

  private get moving(): boolean {
    return this.sparks.busy || this.fan > 0.01 || !this.heat.still(0.004, 0.02) || this.tongues.some(({ lean }) => !lean.still(STILL, STILL * 4));
  }

  breathe(time: number): void {
    this.flicker = time / FLICKER_SECONDS;
    this.wobble = Math.sin(time * 1.3 + shuffled(this.seed) * 6) * IDLE_WOBBLE;
  }

  rest(): void {
    this.fan = this.flicker = this.wobble = 0;
    this.heat.value = this.heat.velocity = this.heat.target = 0;
    this.sparks.clear();
    for (const tongue of this.tongues) {
      tongue.lean.target = 0;
      tongue.lean.snap();
    }
    this.draw();
  }

  grabbed(): void {}

  released(_pointer: Pointer, clicked: boolean): void {
    if (!clicked) return;
    this.heat.velocity += 5;
    this.fan = Math.max(this.fan, 0.3);
    for (let spark = 0; spark < SPARK_BURST; spark++) this.throwSpark(between(180, 320));
  }

  draw(): void {
    const { display } = this.stand;
    const heat = this.heat.value;
    const step = Math.floor(this.flicker);
    this.glow.place({ display, x: this.x, y: this.glowY, frame: 3, opacity: clamp(0.55 + heat * 0.35 + Math.sin(step * 1.7) * 0.03, 0, 1), scaleX: this.glowFit, scaleY: this.glowFit });
    this.logs.place({ display, x: this.x, y: this.y, frame: 0 });
    this.tongues.forEach((tongue, index) => {
      const frame = (tongue.frame + step + index) % FLAME_FRAMES + (tongue.deep ? FLAME_FRAMES : 0);
      const grow = 1 + heat * 0.42 + Math.sin(step * 2.1 + index) * 0.03;
      const rotation = (tongue.lean.value + this.wobble * (index % 2 ? 1 : -1)) * TO_DEGREES;
      tongue.sprite.place({ display, x: this.x + tongue.offset, y: this.y - LOGS * this.unit * 0.13, frame, rotation, scaleY: grow, scaleX: 1 + heat * 0.18 });
    });
    this.sparks.draw();
  }
}
