import type { AudioReading } from '@luft/extension-api';

import { BANDS } from './shader.js';

const ATTACK_S = 0.045;
const RELEASE_S = 0.32;
const PEAK_FALL_S = 4;
const QUIET_PEAK = 0.32;
const CONTRAST = 1.35;

const follow = (current: number, target: number, elapsed: number) =>
  current + (target - current) * (1 - Math.exp(-elapsed / (target > current ? ATTACK_S : RELEASE_S)));

/** The bands of what plays, eased so they move smoothly and scaled so quiet music still moves. */
export class Spectrum {
  readonly bands = new Array<number>(BANDS).fill(0);
  level = 0;
  private peak = QUIET_PEAK;

  follow(reading: AudioReading, elapsed: number): void {
    const loudest = Math.max(...reading.bands);
    this.peak = Math.max(loudest, QUIET_PEAK, this.peak * Math.exp(-elapsed / PEAK_FALL_S));
    reading.bands.forEach((band, index) => {
      this.bands[index] = follow(this.bands[index], (band / this.peak) ** CONTRAST, elapsed);
    });
    this.level = follow(this.level, reading.level, elapsed);
  }

  /** How much is still moving, to tell when it has settled after the music stopped. */
  get energy(): number {
    return Math.max(this.level, ...this.bands);
  }
}
