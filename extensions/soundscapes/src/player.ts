import type { Disposable, Extension, Sound } from '@luft/extension-api';

import { complete, loopFile, SOUNDS, THUNDER_STRIKES, type Levels, type SoundName } from './catalogue.js';
import { FIRST_MIX } from './mixes.js';

type Granted = 'sounds';

const LEVELS = 'levels';
const START_FADE_MS = 2500;
const STOP_FADE_MS = 1500;
const LEVEL_FADE_MS = 200;
const HOLD_FADE_MS = 1200;
const RESUME_FADE_MS = 3000;
const STRIKE_GAP_MS = [14000, 45000] as const;

const between = ([low, high]: readonly [number, number]) => low + Math.random() * (high - low);

/** Plays every sound of the mix as a gapless loop at its level, and fades them in and out as playing starts, pauses or waits. */
export class Player {
  private readonly loops = new Map<SoundName, Sound>();
  private strikes: Disposable | null = null;
  private wanted = false;
  private waiting = false;
  private sleeping = false;
  levels: Record<SoundName, number>;

  constructor(private readonly extension: Extension<Granted>, private readonly changed: () => void) {
    this.levels = complete(extension.storage.get<Levels>(LEVELS) ?? FIRST_MIX.levels);
  }

  /** Whether people turned it on, even while it waits for something else to stop playing. */
  get playing(): boolean {
    return this.wanted;
  }

  /** Whether it's quiet until other media stops. */
  get held(): boolean {
    return this.wanted && this.waiting;
  }

  private get audible(): boolean {
    return this.wanted && !this.waiting && !this.sleeping;
  }

  play(): void {
    if (this.wanted && !this.sleeping) return;
    this.wanted = true;
    this.sleeping = false;
    this.sync(START_FADE_MS);
    this.changed();
  }

  pause(fade = STOP_FADE_MS): void {
    if (!this.wanted) return;
    this.wanted = false;
    this.sleeping = false;
    this.sync(fade);
    this.changed();
  }

  /** Fades everything out over `fade` while it still counts as playing, for the last minute of the sleep timer. */
  fallAsleep(fade: number): void {
    this.sleeping = true;
    this.sync(fade);
  }

  wait(waiting: boolean): void {
    if (this.waiting === waiting) return;
    this.waiting = waiting;
    this.sync(waiting ? HOLD_FADE_MS : RESUME_FADE_MS);
    this.changed();
  }

  setLevel(sound: SoundName, level: number): void {
    this.levels = { ...this.levels, [sound]: level };
    this.store();
  }

  choose(levels: Levels): void {
    this.levels = complete(levels);
    this.store();
  }

  private store(): void {
    this.extension.storage.set(LEVELS, this.levels);
    this.sync(LEVEL_FADE_MS);
    this.changed();
  }

  private sync(fade: number): void {
    for (const sound of SOUNDS) {
      const level = this.audible ? this.levels[sound] : 0;
      const loop = this.loops.get(sound);
      if (level > 0 && loop?.playing) loop.setVolume(level, fade);
      else if (level > 0) this.loops.set(sound, this.extension.sounds.play(loopFile(sound), { loop: true, volume: level, fadeIn: fade }));
      else if (loop) {
        loop.stop(fade);
        this.loops.delete(sound);
      }
    }
    if (this.loops.has('thunder')) this.strikes ??= this.nextStrike();
    else {
      this.strikes?.dispose();
      this.strikes = null;
    }
  }

  private nextStrike(): Disposable {
    return this.extension.timers.timeout(between(STRIKE_GAP_MS), () => {
      const strike = THUNDER_STRIKES[Math.floor(Math.random() * THUNDER_STRIKES.length)]!;
      this.extension.sounds.play(strike, { volume: this.levels.thunder * between([0.5, 1]) });
      this.strikes = this.nextStrike();
    });
  }
}
