/** How far apart steps of the physics are: fine enough that springs stay steady, whatever the display's refresh rate. */
export const STEP_S = 1 / 120;
const MOST_STEPS = 12;

/** Runs `step` as many fixed steps as `seconds` covers, keeping the rest for the next frame. */
export class Stepper {
  private left = 0;

  run(seconds: number, step: (dt: number) => void): void {
    this.left = Math.min(this.left + seconds, MOST_STEPS * STEP_S);
    while (this.left >= STEP_S) {
      step(STEP_S);
      this.left -= STEP_S;
    }
  }
}

/** A value on a spring: it heads for `target` with inertia, overshooting a little if `damping` allows. */
export class Spring {
  velocity = 0;
  target: number;

  constructor(public value: number, private readonly stiffness: number, private readonly damping: number) {
    this.target = value;
  }

  step(dt: number, push = 0): void {
    this.velocity += ((this.target - this.value) * this.stiffness - this.velocity * this.damping + push) * dt;
    this.value += this.velocity * dt;
  }

  still(distance: number, speed: number): boolean {
    return Math.abs(this.target - this.value) < distance && Math.abs(this.velocity) < speed;
  }

  snap(): void {
    this.value = this.target;
    this.velocity = 0;
  }
}

/** A small repeatable shuffle, so the same plaything comes back looking the same. */
export function shuffled(seed: number): number {
  const value = Math.sin(seed * 91.17 + 3.3) * 43758.5453;
  return value - Math.floor(value);
}

export const between = (low: number, high: number) => low + (high - low) * Math.random();
export const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
/** 1 at the middle of a reach and 0 at its edge, easing out. */
export const nearness = (distance: number, reach: number) => distance >= reach ? 0 : (1 - distance / reach) ** 2;
