import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { helperProgram } from '../../shared/apps/programs.js';
import { WEATHER, type Intensity } from './weather.js';

const SOUND = helperProgram('kestrel-rain', 'rain/kestrel-rain');
const RESTART_DELAYS_MS = [1000, 5000, 20000];
const STABLE_AFTER_US = 2 * 60 * GLib.USEC_PER_SEC;

export class RainSound {
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private readonly signals: number[];
  private process: Gio.Subprocess | null = null;
  private commands: Gio.OutputStream | null = null;
  private running: Gio.Cancellable | null = null;
  private available = false;
  private failures = 0;
  private startedAt = 0;
  private restartTimer = 0;

  constructor() {
    this.signals = ['rain', 'rain-sound', 'rain-volume', 'rain-intensity']
      .map(key => this.settings.connect(`changed::${key}`, () => this.sync()));
  }

  private get wanted(): boolean {
    return this.available && this.settings.get_boolean('rain') && this.settings.get_boolean('rain-sound') &&
      this.settings.get_double('rain-volume') > 0;
  }

  sync(available = this.available): void {
    this.available = available;
    if (!this.wanted) {
      this.stop();
      return;
    }
    if (!this.process && !this.restartTimer) this.spawn();
    this.send();
  }

  private spawn(): void {
    const launcher = new Gio.SubprocessLauncher({ flags: Gio.SubprocessFlags.STDIN_PIPE });
    try {
      this.process = launcher.spawnv([SOUND]);
    } catch (error) {
      console.warn(`Rain sounds can't start: ${error}`);
      return;
    }
    const process = this.process;
    const running = this.running = new Gio.Cancellable();
    this.commands = process.get_stdin_pipe();
    this.startedAt = GLib.get_monotonic_time();
    process.wait_async(running, (_process, result) => {
      try {
        process.wait_finish(result);
      } catch {
        return;
      }
      if (this.process !== process) return;
      this.process = null;
      this.commands = null;
      if (this.wanted) this.restart();
    });
  }

  private restart(): void {
    if (GLib.get_monotonic_time() - this.startedAt >= STABLE_AFTER_US) this.failures = 0;
    const delay = RESTART_DELAYS_MS[this.failures++];
    if (delay === undefined) {
      console.warn('Rain sounds keep stopping, so they stay off until the next change');
      return;
    }
    this.restartTimer = GLib.timeout_add(GLib.PRIORITY_LOW, delay, () => {
      this.restartTimer = 0;
      this.sync();
      return GLib.SOURCE_REMOVE;
    });
  }

  private send(): void {
    const weather = WEATHER[this.settings.get_string('rain-intensity') as Intensity] ?? WEATHER.rain;
    const line = `${weather.density} ${this.settings.get_double('rain-volume')}\n`;
    this.commands?.write_all_async(new TextEncoder().encode(line), GLib.PRIORITY_DEFAULT, null, (stream, result) => {
      try {
        stream!.write_all_finish(result);
      } catch {}
    });
  }

  private stop(): void {
    if (this.restartTimer) GLib.Source.remove(this.restartTimer);
    this.restartTimer = 0;
    this.failures = 0;
    this.running?.cancel();
    this.running = null;
    this.commands?.close_async(GLib.PRIORITY_DEFAULT, null, null);
    this.commands = null;
    this.process = null;
  }

  destroy(): void {
    for (const id of this.signals) this.settings.disconnect(id);
    this.stop();
  }
}
