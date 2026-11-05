import type { Sprite } from '@luft/extension-api';

export interface Mote {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  age: number;
  life: number;
  sprite: Sprite;
}

interface Physics {
  gravity: number;
  drag: number;
}

/** Short-lived bits such as sparks and raindrops: sprites made when first needed, hidden and reused after. */
export class Particles {
  private readonly free: Sprite[] = [];
  private readonly live: Mote[] = [];
  private made = 0;

  constructor(private readonly make: () => Sprite, private readonly most: number, private readonly display: number, private readonly frame: number, private readonly physics: Physics) {}

  get busy(): boolean {
    return this.live.length > 0;
  }

  emit(x: number, y: number, speedX: number, speedY: number, life: number): void {
    const sprite = this.free.pop() ?? (this.made < this.most ? (this.made++, this.make()) : null);
    if (sprite) this.live.push({ x, y, speedX, speedY, age: 0, life, sprite });
  }

  step(dt: number, wind = 0, floor = Infinity): void {
    const { gravity, drag } = this.physics;
    for (let index = this.live.length - 1; index >= 0; index--) {
      const mote = this.live[index];
      mote.age += dt;
      mote.speedX += (wind - mote.speedX * drag) * dt;
      mote.speedY += (gravity - mote.speedY * drag) * dt;
      mote.x += mote.speedX * dt;
      mote.y += mote.speedY * dt;
      if (mote.age >= mote.life || mote.y >= floor) this.retire(index);
    }
  }

  draw(rotation: (mote: Mote) => number = () => 0): void {
    for (const mote of this.live) {
      const left = 1 - mote.age / mote.life;
      mote.sprite.place({ display: this.display, x: mote.x, y: mote.y, frame: this.frame, opacity: Math.min(1, left * 2.2), rotation: rotation(mote), scaleX: 0.5 + left * 0.5, scaleY: 0.5 + left * 0.5 });
    }
  }

  private retire(index: number): void {
    const [{ sprite }] = this.live.splice(index, 1);
    sprite.place({ display: this.display, x: 0, y: 0, frame: this.frame, opacity: 0 });
    this.free.push(sprite);
  }

  clear(): void {
    while (this.live.length) this.retire(this.live.length - 1);
  }
}

