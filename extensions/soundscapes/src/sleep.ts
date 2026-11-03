import type { Disposable, Extension } from '@luft/extension-api';

import type { Player } from './player.js';

type Granted = 'sounds';

const DEADLINE = 'sleep-at';
const FADE_MS = 60_000;
const MINUTE_MS = 60_000;

/**
 * Stops playing after the minutes the sleep timer is set to, fading out over the last minute. The time it stops at is
 * kept, so pausing and playing again before then keeps counting toward it.
 */
export class SleepTimer {
  private timers: Disposable[] = [];

  constructor(private readonly extension: Extension<Granted>, private readonly player: Player) {}

  get minutes(): number | null {
    const chosen = this.extension.settings.get<string>('sleep-timer');
    return chosen === 'off' ? null : Number(chosen);
  }

  /** When it stops, in milliseconds since 1970, while it counts toward that. */
  get deadline(): number | null {
    return this.timers.length ? this.extension.storage.get<number>(DEADLINE) ?? null : null;
  }

  /** Starts over from now with the minutes just chosen. */
  restart(): void {
    this.extension.storage.delete(DEADLINE);
    this.sync();
  }

  /** Counts toward the deadline while it plays, and stops counting while it doesn't. */
  sync(): void {
    for (const timer of this.timers.splice(0)) timer.dispose();
    const minutes = this.minutes;
    if (!this.player.playing || minutes === null) return;
    const now = Date.now();
    let deadline = this.extension.storage.get<number>(DEADLINE);
    if (!deadline || deadline <= now) {
      deadline = now + minutes * MINUTE_MS;
      this.extension.storage.set(DEADLINE, deadline);
    }
    const left = deadline - now;
    const { timers } = this.extension;
    this.timers = [
      timers.timeout(Math.max(0, left - FADE_MS), () => this.player.fallAsleep(Math.min(FADE_MS, deadline - Date.now()))),
      timers.timeout(left, () => {
        this.extension.storage.delete(DEADLINE);
        this.player.pause(0);
      }),
    ];
  }
}
