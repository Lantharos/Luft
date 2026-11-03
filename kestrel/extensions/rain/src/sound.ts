import type { Disposable, Extension, HelperProcess } from '@luft/extension-api';

import { type Intensity, WEATHER } from './weather.js';

const RESTART_DELAYS_MS = [1000, 5000, 20000];
const STABLE_AFTER_MS = 2 * 60 * 1000;
const LINGER_MS = 5000;

/** The recorded rain, played by the extension's helper while rain and its sound are on and someone uses the desktop. */
export class RainSound {
  private process: HelperProcess | null = null;
  private failures = 0;
  private startedAt = 0;
  private restartTimer: Disposable | null = null;
  private lingerTimer: Disposable | null = null;
  private sent: string | null = null;

  constructor(private readonly rain: Extension<'helper'>) {
    rain.settings.onChanged(() => this.sync());
    rain.session.onChanged(() => this.sync());
    this.sync();
  }

  private get wanted(): boolean {
    const { settings } = this.rain;
    return this.rain.session.active && settings.get<boolean>('rain') && settings.get<boolean>('sound') && settings.get<number>('volume') > 0;
  }

  private sync(): void {
    if (!this.wanted) {
      this.silence();
      return;
    }
    this.lingerTimer?.dispose();
    this.lingerTimer = null;
    if (!this.process && !this.restartTimer) this.spawn();
    const weather = WEATHER[this.rain.settings.get<Intensity>('intensity')];
    this.send(`${weather.density} ${this.rain.settings.get<number>('volume')}`);
  }

  private spawn(): void {
    this.startedAt = Date.now();
    let process: HelperProcess;
    try {
      process = this.process = this.rain.helper.start();
    } catch (error) {
      console.warn(`Rain sounds can't start: ${error}`);
      this.restart();
      return;
    }
    this.sent = null;
    process.onExit(() => {
      if (this.process !== process) return;
      this.process = null;
      if (this.wanted) this.restart();
    });
  }

  private restart(): void {
    if (Date.now() - this.startedAt >= STABLE_AFTER_MS) this.failures = 0;
    const delay = RESTART_DELAYS_MS[this.failures++];
    if (delay === undefined) {
      console.warn('Rain sounds keep stopping, so they stay off until the next change');
      return;
    }
    this.restartTimer = this.rain.timers.timeout(delay, () => {
      this.restartTimer = null;
      this.sync();
    });
  }

  private send(line: string): void {
    if (!this.process || line === this.sent) return;
    this.sent = line;
    this.process.write(line).catch(() => {});
  }

  private silence(): void {
    this.restartTimer?.dispose();
    this.restartTimer = null;
    this.failures = 0;
    if (!this.process || this.lingerTimer) return;
    this.send('0 0');
    this.lingerTimer = this.rain.timers.timeout(LINGER_MS, () => {
      this.lingerTimer = null;
      this.process?.close();
      this.process = null;
    });
  }
}
