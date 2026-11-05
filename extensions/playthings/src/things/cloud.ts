import type { Sprite } from '@luft/extension-api';

import type { Pointer } from '../playground/pointers.js';
import { Particles } from './particles.js';
import { between, nearness, shuffled, Spring, Stepper } from './physics.js';
import { type Box, expanded, type Point, type Stand, Thing } from './thing.js';

const PUFF_HEIGHT = 170;
const PUFF_REACH = 0.62;
const WIDTH = 300;
const CLOUD_HEIGHT = 120;
const REACH = 110;
const PUSH = 5200;
const CARRY = 0.9;
const FAST = 700;
const DRIFT = 46;
const DRIFT_SECONDS = 90;
const RAIN_SECONDS = 1.7;
const RAIN_PER_SECOND = 20;
const RAIN_FALL = 340;
const RAIN_DROPS = 26;
const SHAKE = 240;
const STILL = 0.15;

interface Puff {
  sprite: Sprite;
  frame: number;
  homeX: number;
  homeY: number;
  scale: number;
  offsetX: Spring;
  offsetY: Spring;
}

/** A cloud of soft puffs, each on its own spring, that part around the pointer and come back together. */
export class Cloud extends Thing {
  private readonly puffs: Puff[];
  private readonly rain: Particles;
  private readonly clock = new Stepper();
  private readonly seed: number;
  private readonly width: number;
  private readonly height: number;
  private x = 0;
  private y = 0;
  private drift = 0;
  private raining = 0;
  private owed = 0;

  constructor(id: string, stand: Stand, slot: number) {
    super(id, 'cloud', stand);
    const { sheets, size, display } = stand;
    this.seed = slot + 1;
    this.width = WIDTH * size;
    this.height = CLOUD_HEIGHT * size;
    const count = 7 + Math.floor(shuffled(this.seed) * 3);
    this.puffs = Array.from({ length: count }, (_, index) => {
      const upper = index % 2 === 1;
      const share = (index + 0.5) / count - 0.5;
      const wobble = shuffled(this.seed * 2 + index) - 0.5;
      return {
        sprite: this.part(sheets.cloud, PUFF_HEIGHT * size, { pivot: [0.5, 0.5], pressable: true }),
        frame: Math.floor(shuffled(this.seed + index * 3) * 6),
        homeX: share * this.width * (upper ? 0.62 : 1),
        homeY: this.height * (upper ? -0.34 + wobble * 0.3 : 0.2 + wobble * 0.1),
        scale: (upper ? 1.08 : 0.94) + shuffled(this.seed + index) * 0.16,
        offsetX: new Spring(0, 11, 3.4),
        offsetY: new Spring(0, 11, 3.4),
      };
    });
    this.rain = new Particles(() => this.part(sheets.small, 26 * size, { pivot: [0.5, 0.5] }), RAIN_DROPS, display, 1, { gravity: 900, drag: 2.5 });
  }

  get bounds(): Box {
    const roomX = this.width / 2 + DRIFT + 90 * this.stand.size;
    return { x: this.x - roomX, y: this.y - this.height, width: roomX * 2, height: this.height * 2.4 };
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
    const { x, y } = this.kept(point, this.width / 2 + DRIFT + PUFF_HEIGHT * this.stand.size * PUFF_REACH, this.height / 2 + PUFF_HEIGHT * this.stand.size * PUFF_REACH);
    this.x = x;
    this.y = y;
    this.rest();
  }

  step(seconds: number, _time: number, pointers: readonly Pointer[]): boolean {
    if (this.stand.calm()) {
      this.draw();
      return false;
    }
    this.clock.run(seconds, dt => this.advance(dt, pointers));
    this.draw();
    return this.moving(pointers.length > 0);
  }

  private advance(dt: number, pointers: readonly Pointer[]): void {
    for (const puff of this.puffs) {
      let [pushX, pushY] = [0, 0];
      const [puffX, puffY] = [this.x + this.drift + puff.homeX + puff.offsetX.value, this.y + puff.homeY + puff.offsetY.value];
      for (const pointer of pointers) {
        const [awayX, awayY] = [puffX - pointer.x, puffY - pointer.y];
        const distance = Math.hypot(awayX, awayY) || 1;
        const near = nearness(distance, PUFF_HEIGHT * this.stand.size * puff.scale * 0.9);
        const strength = near * PUSH * (1 + pointer.speed / FAST);
        pushX += awayX / distance * strength + pointer.speedX * near * CARRY;
        pushY += awayY / distance * strength * 0.6 + pointer.speedY * near * CARRY;
      }
      puff.offsetX.step(dt, pushX);
      puff.offsetY.step(dt, pushY);
    }
    this.raining = Math.max(0, this.raining - dt);
    if (this.raining > 0) {
      this.owed += RAIN_PER_SECOND * dt;
      for (; this.owed >= 1; this.owed--) {
        const x = this.x + this.drift + between(-0.42, 0.42) * this.width;
        this.rain.emit(x, this.y + this.height * 0.42, between(-14, 14), between(120, 200), between(0.55, 0.9));
      }
    }
    this.rain.step(dt, 0, Math.min(this.y + RAIN_FALL, this.stand.room.y + this.stand.room.height));
  }

  /** With a pointer holding puffs apart they rest where it pushed them, not at home. */
  private moving(pushed: boolean): boolean {
    const away = pushed ? Infinity : STILL;
    return this.raining > 0 || this.rain.busy || this.puffs.some(({ offsetX, offsetY }) => !offsetX.still(away, STILL * 3) || !offsetY.still(away, STILL * 3));
  }

  breathe(time: number): void {
    this.drift = Math.sin((time / DRIFT_SECONDS + shuffled(this.seed)) * 2 * Math.PI) * DRIFT;
  }

  rest(): void {
    this.drift = 0;
    this.raining = 0;
    this.rain.clear();
    for (const { offsetX, offsetY } of this.puffs) {
      offsetX.snap();
      offsetY.snap();
    }
    this.draw();
  }

  grabbed(): void {}

  released(_pointer: Pointer, clicked: boolean): void {
    if (clicked) this.poke();
  }

  /** The pointer parts the puffs, so a click on a cloud often lands in the gap it opened. */
  tappedNear({ x, y }: Pointer): void {
    const middle = this.x + this.drift;
    if (Math.abs(x - middle) < this.width / 2 && Math.abs(y - this.y) < this.height) this.poke();
  }

  private poke(): void {
    this.raining = RAIN_SECONDS;
    for (const { offsetX, offsetY } of this.puffs) {
      offsetX.velocity += between(-SHAKE, SHAKE) * 0.4;
      offsetY.velocity += between(0, SHAKE);
    }
  }

  draw(): void {
    const { display } = this.stand;
    for (const { sprite, frame, homeX, homeY, scale, offsetX, offsetY } of this.puffs) {
      sprite.place({ display, x: this.x + this.drift + homeX + offsetX.value, y: this.y + homeY + offsetY.value, frame, scaleX: scale, scaleY: scale * 0.92, opacity: 0.92 });
    }
    this.rain.draw();
  }
}
