import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import { clamp } from '../../shared/math.js';
import { logErrorUnlessCancelled } from '../runtime/errorUtils.js';

Gio._promisify(Gio.Subprocess.prototype, 'communicate_utf8_async');

const PROGRAM = 'ddcutil';
const BRIGHTNESS = '10';
const DETECT_DELAY_MS = 1500;
const DETECT_RETRY_SECONDS = [10, 60, 300];
const SETTLE_MS = 150;
const QUICK_RETRY_SECONDS = 1;
const ALLOWED_FAILURES = 3;
const FIRST_BACKOFF_SECONDS = 10;
const LONGEST_BACKOFF_SECONDS = 300;

interface DetectedDisplay {
  bus: number;
  connector: string | null;
  monitor: string | null;
  usable: boolean;
}

interface BrightnessReading {
  level: number;
  max: number;
}

async function run(args: string[], cancellable: Gio.Cancellable | null = null): Promise<string> {
  const process = Gio.Subprocess.new([PROGRAM, ...args], Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE);
  const [stdout, stderr] = await process.communicate_utf8_async(null, cancellable);
  if (!process.get_successful()) throw new Error(stderr!.trim() || `${PROGRAM} ${args.join(' ')} failed`);
  return stdout!;
}

function parseDetect(output: string): DetectedDisplay[] {
  const found: DetectedDisplay[] = [];
  let current: DetectedDisplay | null = null;
  for (const line of output.split('\n')) {
    if (!/^\s/.test(line)) {
      const heading = line.trim();
      current = heading.startsWith('Display ') || heading === 'Invalid display'
        ? { bus: -1, connector: null, monitor: null, usable: heading !== 'Invalid display' }
        : null;
      if (current) found.push(current);
      continue;
    }
    const separator = line.indexOf(':');
    if (!current || separator < 0) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key === 'I2C bus') current.bus = Number(value.split('-').pop());
    else if (key === 'DRM connector' || key === 'DRM_connector') current.connector = value.replace(/^card\d+-/, '');
    else if (key === 'Monitor') current.monitor = value;
  }
  return found.filter(display => display.bus >= 0);
}

async function readBrightness(bus: number, cancellable: Gio.Cancellable): Promise<BrightnessReading> {
  const output = await run(['--bus', `${bus}`, 'getvcp', BRIGHTNESS, '--terse'], cancellable);
  const [, current, max] = output.match(/^VCP 10 C (\d+) (\d+)/m) ?? [];
  if (!(Number(max) > 0)) throw new Error(`Unexpected brightness report: ${output.trim()}`);
  return { level: Number(current) / Number(max), max: Number(max) };
}

export class DdcDisplay {
  level: number;
  private readonly max: number;
  private written: number;
  private target: number | null = null;
  private timerId = 0;
  private writing = false;
  private failures = 0;
  private retryAt = 0;

  constructor(readonly bus: number, { level, max }: BrightnessReading) {
    this.level = level;
    this.max = max;
    this.written = Math.round(level * max);
  }

  set(level: number): void {
    this.target = Math.round(clamp(level, 0, 1) * this.max);
    if (this.target === this.written && !this.writing) this.target = null;
    if (this.target === null || this.timerId || this.writing) return;
    const wait = Math.max(SETTLE_MS, Math.ceil((this.retryAt - GLib.get_monotonic_time()) / 1000));
    this.timerId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, wait, () => {
      this.timerId = 0;
      this.write().catch(logError);
      return GLib.SOURCE_REMOVE;
    });
  }

  private async write(): Promise<void> {
    const value = this.target;
    this.target = null;
    if (value === null || value === this.written) return;
    this.writing = true;
    try {
      await run(['--bus', `${this.bus}`, '--noverify', 'setvcp', BRIGHTNESS, `${value}`]);
      this.written = value;
      this.level = value / this.max;
      this.failures = 0;
      this.retryAt = 0;
    } catch (e) {
      if (this.failed(e as Error)) this.target ??= value;
    }
    this.writing = false;
    if (this.target !== null) this.set(this.target / this.max);
  }

  private failed(error: Error): boolean {
    this.failures++;
    const retrying = this.failures < ALLOWED_FAILURES;
    const seconds = retrying
      ? QUICK_RETRY_SECONDS
      : Math.min(FIRST_BACKOFF_SECONDS * 2 ** (this.failures - ALLOWED_FAILURES), LONGEST_BACKOFF_SECONDS);
    this.retryAt = GLib.get_monotonic_time() + seconds * GLib.USEC_PER_SEC;
    if (!retrying) console.warn(`The display on I2C bus ${this.bus} is not answering brightness changes, waiting ${seconds}s: ${error.message}`);
    return retrying;
  }

  destroy(): void {
    if (this.timerId) GLib.source_remove(this.timerId);
    this.timerId = 0;
    this.target = null;
  }
}

function identify(monitor: Meta.Monitor): string {
  return `${monitor.get_vendor()}:${monitor.get_product()}:${monitor.get_serial()}`;
}

export class DdcDisplays {
  private displays = new Map<string, DdcDisplay>();
  private delayId = 0;
  private retry = 0;
  private cancellable: Gio.Cancellable | null = null;

  constructor(private readonly changed: () => void) {}

  displaysFor(logicalMonitor: Meta.LogicalMonitor): DdcDisplay[] {
    return logicalMonitor.get_monitors()
      .filter(monitor => monitor.is_active())
      .map(monitor => this.displays.get(monitor.get_connector()))
      .filter(display => display !== undefined);
  }

  detect(monitors: Meta.Monitor[]): void {
    this.cancel();
    this.retry = 0;
    if (!monitors.length || !GLib.find_program_in_path(PROGRAM)) {
      this.replace(new Map());
      return;
    }
    this.schedule(monitors, DETECT_DELAY_MS);
  }

  private schedule(monitors: Meta.Monitor[], delay: number): void {
    this.delayId = GLib.timeout_add(GLib.PRIORITY_LOW, delay, () => {
      this.delayId = 0;
      this.cancellable = new Gio.Cancellable();
      this.detectIn(monitors, this.cancellable).catch(logErrorUnlessCancelled);
      return GLib.SOURCE_REMOVE;
    });
  }

  private async detectIn(monitors: Meta.Monitor[], cancellable: Gio.Cancellable): Promise<void> {
    const found = parseDetect(await run(['detect', '--terse'], cancellable));
    const displays = new Map<string, DdcDisplay>();
    let unanswered = false;
    for (const monitor of monitors) {
      const connector = monitor.get_connector();
      const match = found.find(display => display.usable && display.connector === connector) ??
        found.find(display => display.usable && display.monitor === identify(monitor));
      if (!match) continue;
      const known = this.displays.get(connector);
      if (known?.bus === match.bus) {
        displays.set(connector, known);
        continue;
      }
      try {
        displays.set(connector, new DdcDisplay(match.bus, await readBrightness(match.bus, cancellable)));
      } catch (e) {
        if (cancellable.is_cancelled()) throw e;
        unanswered = true;
      }
    }
    this.cancellable = null;
    this.replace(displays);
    if (unanswered && this.retry < DETECT_RETRY_SECONDS.length) this.schedule(monitors, DETECT_RETRY_SECONDS[this.retry++] * 1000);
  }

  private replace(displays: Map<string, DdcDisplay>): void {
    const same = displays.size === this.displays.size &&
      [...displays].every(([connector, display]) => this.displays.get(connector) === display);
    for (const [connector, display] of this.displays) {
      if (displays.get(connector) !== display) display.destroy();
    }
    this.displays = displays;
    if (!same) this.changed();
  }

  private cancel(): void {
    if (this.delayId) GLib.source_remove(this.delayId);
    this.delayId = 0;
    this.cancellable?.cancel();
    this.cancellable = null;
  }
}
