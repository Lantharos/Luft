import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { cubicBezier, Curve, Duration, stillMotion } from '../../../shared/motion/motion.js';

const PEAK = 4;
const SMALLEST_PEAK = 1.5;
const LARGEST_POINTER = 128;
const HOLD_MS = 600;
const grow = cubicBezier(Curve.glide);
const settle = cubicBezier(Curve.gentle);

export class PointerEnlarger {
  private readonly tracker = global.backend.get_cursor_tracker();
  private readonly desktop = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  private magnification = 1;
  private target = 1;
  private timeline: Clutter.Timeline | null = null;
  private hold = 0;

  enlarge(): void {
    const peak = Math.min(PEAK, Math.max(SMALLEST_PEAK, LARGEST_POINTER / this.desktop.get_int('cursor-size')));
    if (this.target !== peak) this.easeTo(peak, Duration.moderate, grow);

    if (this.hold) GLib.source_remove(this.hold);
    this.hold = GLib.timeout_add(GLib.PRIORITY_DEFAULT, HOLD_MS, () => {
      this.hold = 0;
      this.easeTo(1, Duration.slow, settle);
      return GLib.SOURCE_REMOVE;
    });
  }

  destroy(): void {
    if (this.hold) GLib.source_remove(this.hold);
    this.hold = 0;
    this.timeline?.stop();
    this.timeline = null;
    this.target = 1;
    this.apply(1);
  }

  private easeTo(target: number, duration: number, curve: (progress: number) => number): void {
    this.timeline?.stop();
    this.timeline = null;
    this.target = target;

    if (stillMotion()) {
      this.apply(target);
      return;
    }

    const from = this.magnification;
    const timeline = new Clutter.Timeline({ actor: global.stage, duration });
    timeline.connect('new-frame', () => this.apply(from + (target - from) * curve(timeline.get_progress())));
    timeline.connect('stopped', (_timeline, finished) => {
      if (finished) this.apply(target);
    });
    this.timeline = timeline;
    timeline.start();
  }

  private apply(magnification: number): void {
    this.magnification = magnification;
    this.tracker.set_magnification(magnification);
  }
}
