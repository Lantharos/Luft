import GLib from 'gi://GLib';

import { getLoginManager } from './loginManager.js';

const QUIET_AFTER_WAKING_MS = 3000;

const now = () => GLib.get_monotonic_time() / 1000;

export class WakePress {
  private readonly sleepId: number;
  private quietUntil = 0;

  constructor() {
    this.sleepId = getLoginManager().connect('prepare-for-sleep', (_manager, sleeping) => {
      if (!sleeping) this.quietUntil = now() + QUIET_AFTER_WAKING_MS;
    });
  }

  get heard(): boolean {
    return now() < this.quietUntil;
  }

  destroy(): void {
    getLoginManager().disconnect(this.sleepId);
  }
}
