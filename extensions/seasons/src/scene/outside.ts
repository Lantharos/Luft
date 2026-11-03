import type { Disposable, Extension, WeatherReport } from '@luft/extension-api';

import type { Outside } from './scene.js';

const RECHECK_MS = 10 * 60 * 1000;

/** The weather where the computer is, watched only while something follows it. */
export class OutsideWatch {
  private report: WeatherReport | null = null;
  private watches: Disposable[] = [];

  constructor(private readonly seasons: Extension<'weather'>, private readonly changed: () => void) {}

  get current(): Outside {
    return { report: this.report, now: new Date() };
  }

  follow(needed: boolean): void {
    if (needed === this.watches.length > 0) return;
    if (!needed) {
      for (const watch of this.watches.splice(0)) watch.dispose();
      return;
    }
    const { weather, timers } = this.seasons;
    this.watches = [weather.onChanged(report => this.learned(report)), timers.interval(RECHECK_MS, this.changed)];
    void weather.current().then(report => report && this.learned(report));
  }

  private learned(report: WeatherReport): void {
    this.report = report;
    this.changed();
  }
}
