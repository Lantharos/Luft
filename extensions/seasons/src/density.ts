const BUILD_UP_S = 1.6;
const WIND_DOWN_S = 1.2;
const DRY = 0.002;
const FULL = 0.98;
const AIRBORNE_S = 120;
const NEVER = 1e9;

export const ease = (from: number, to: number, elapsed: number, seconds: number) => from + (to - from) * (1 - Math.exp(-elapsed / seconds));

/**
 * How much of an effect shows, easing towards what it should be, and how it got there: whatever is already in the air
 * keeps falling, so an effect that gets lighter only starts fewer new things. An effect starting from nothing has
 * nothing in the air and fills the whole sky at once.
 */
export class Density {
  value = 0;
  private goal = 0;
  private from = 0;
  private since = NEVER;
  private seconds = WIND_DOWN_S;
  private filling = false;

  get dry(): boolean {
    return this.value <= DRY;
  }

  /** What the shader needs to tell the density at any earlier moment: where it came from, its goal, since when, and how fast. */
  get history(): readonly [number, number, number, number] {
    return [this.from, this.goal, this.since, 1 / this.seconds];
  }

  advance(goal: number, time: number, elapsed: number): void {
    if (goal !== this.goal) this.head(goal, time);
    this.value = this.goal + (this.value - this.goal) * Math.exp(-elapsed / this.seconds);
    if (this.filling) {
      this.forget(time);
      this.filling = this.value < this.goal * FULL;
    } else if (time - this.since > AIRBORNE_S) {
      this.from = this.goal;
      this.since = NEVER;
    }
  }

  /** Counts every earlier moment as now, because nothing from before it can still be seen. */
  forget(time: number): void {
    this.from = this.value;
    this.since = time;
  }

  stop(): void {
    this.value = this.from = 0;
    this.since = NEVER;
  }

  private head(goal: number, time: number): void {
    this.filling = this.dry;
    this.seconds = goal > this.value ? BUILD_UP_S : WIND_DOWN_S;
    this.goal = goal;
    this.forget(time);
  }
}
