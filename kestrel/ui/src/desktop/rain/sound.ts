import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { helperProgram } from '../../shared/apps/programs.js';
import { WEATHER, type Intensity } from './weather.js';

const SOUND = helperProgram('kestrel-rain', 'rain/kestrel-rain');
const RESTART_DELAYS_MS = [1000, 5000, 20000];
const STABLE_AFTER_US = 2 * 60 * GLib.USEC_PER_SEC;
const LINGER_MS = 5000;

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
  private lingerTimer = 0;
  private pending: string | null = null;
  private sent: string | null = null;
  private writing = false;

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
      this.silence();
      return;
    }
    if (this.lingerTimer) GLib.Source.remove(this.lingerTimer);
    this.lingerTimer = 0;
    if (!this.process && !this.restartTimer) this.spawn();
    const weather = WEATHER[this.settings.get_string('rain-intensity') as Intensity] ?? WEATHER.rain;
    this.send(`${weather.density} ${this.settings.get_double('rain-volume')}`);
  }

  private spawn(): void {
    const launcher = new Gio.SubprocessLauncher({ flags: Gio.SubprocessFlags.STDIN_PIPE });
    this.startedAt = GLib.get_monotonic_time();
    let process: Gio.Subprocess;
    try {
      process = launcher.spawnv([SOUND]);
    } catch (error) {
      console.warn(`Rain sounds can't start: ${error}`);
      this.restart();
      return;
    }
    const running = new Gio.Cancellable();
    this.process = process;
    this.running = running;
    this.commands = process.get_stdin_pipe();
    this.sent = null;
    process.wait_async(running, (_process, result) => {
      try {
        process.wait_finish(result);
      } catch {
        return;
      }
      if (this.process !== process) return;
      this.forget();
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

  private send(line: string): void {
    if (!this.commands || line === (this.pending ?? this.sent)) return;
    this.pending = line;
    this.write();
  }

  private write(): void {
    const commands = this.commands;
    if (this.writing || this.pending === null || !commands) return;
    const line = this.pending;
    this.pending = null;
    this.writing = true;
    commands.write_all_async(new TextEncoder().encode(`${line}\n`), GLib.PRIORITY_DEFAULT, null, (_stream, result) => {
      let written = false;
      try {
        commands.write_all_finish(result);
        written = true;
      } catch {}
      if (commands !== this.commands) return;
      this.writing = false;
      if (written) this.sent = line;
      this.write();
    });
  }

  private silence(): void {
    if (this.restartTimer) GLib.Source.remove(this.restartTimer);
    this.restartTimer = 0;
    this.failures = 0;
    if (!this.process || this.lingerTimer) return;
    this.send('0 0');
    this.lingerTimer = GLib.timeout_add(GLib.PRIORITY_LOW, LINGER_MS, () => {
      this.lingerTimer = 0;
      this.close();
      return GLib.SOURCE_REMOVE;
    });
  }

  private close(): void {
    this.commands?.close_async(GLib.PRIORITY_DEFAULT, null, null);
    this.forget();
  }

  private forget(): void {
    this.running?.cancel();
    this.running = null;
    this.commands = null;
    this.process = null;
    this.pending = null;
    this.sent = null;
    this.writing = false;
  }

  destroy(): void {
    for (const id of this.signals) this.settings.disconnect(id);
    if (this.restartTimer) GLib.Source.remove(this.restartTimer);
    if (this.lingerTimer) GLib.Source.remove(this.lingerTimer);
    this.restartTimer = this.lingerTimer = 0;
    this.close();
  }
}
