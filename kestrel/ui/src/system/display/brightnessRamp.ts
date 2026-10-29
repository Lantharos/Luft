import GLib from 'gi://GLib';

import { cubicBezier } from '../../shared/motion/motion.js';
import { luminance, perceived, type DimTransition } from './dimming.js';

const STEP_MS = 16;

export class BrightnessRamp {
  private from = 0;
  private to = 0;
  private startedAt = 0;
  private duration = 0;
  private ease = (progress: number) => progress;
  private timerId = 0;

  constructor(private readonly apply: (brightness: number) => void) {}

  get running(): boolean {
    return this.timerId !== 0;
  }

  start(from: number, to: number, { duration, curve }: DimTransition): void {
    this.stop();
    this.from = perceived(from);
    this.to = to;
    this.startedAt = GLib.get_monotonic_time();
    this.duration = duration * 1000;
    this.ease = cubicBezier(curve);
    this.timerId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, STEP_MS, () => this.step());
    GLib.Source.set_name_by_id(this.timerId, '[kestrel] BrightnessRamp.step');
  }

  retarget(to: number): void {
    this.to = to;
  }

  stop(): void {
    if (this.timerId) GLib.source_remove(this.timerId);
    this.timerId = 0;
  }

  private step(): boolean {
    const progress = Math.min(1, (GLib.get_monotonic_time() - this.startedAt) / this.duration);
    if (progress === 1) {
      this.timerId = 0;
      this.apply(this.to);
      return GLib.SOURCE_REMOVE;
    }

    this.apply(luminance(this.from + (perceived(this.to) - this.from) * this.ease(progress)));
    return GLib.SOURCE_CONTINUE;
  }
}
