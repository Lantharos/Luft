import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import type { Scope } from '../../../runtime/scope.js';
import type { Disposable } from '../types.js';

const LONGEST_STEP_S = 0.1;

type Step = (seconds: number) => boolean;

/** Calls steps before each frame, on one timeline that only exists while there's a step to call. */
export class FrameStepper {
  private readonly steps = new Set<Step>();
  private timeline: Clutter.Timeline | null = null;
  private last = 0;

  constructor(private readonly scope: Scope) {}

  add(step: Step): Disposable {
    this.steps.add(step);
    if (!this.timeline) this.start();
    return { dispose: () => this.remove(step) };
  }

  private remove(step: Step): void {
    this.steps.delete(step);
    if (!this.steps.size) this.stop();
  }

  private start(): void {
    this.timeline = new Clutter.Timeline({ actor: global.stage, duration: 1000, repeat_count: -1 });
    this.timeline.connect('new-frame', () => this.frame());
    this.last = GLib.get_monotonic_time();
    this.timeline.start();
  }

  private stop(): void {
    this.timeline?.stop();
    this.timeline = null;
  }

  private frame(): void {
    const now = GLib.get_monotonic_time();
    const seconds = Math.min(LONGEST_STEP_S, (now - this.last) / GLib.USEC_PER_SEC);
    this.last = now;
    for (const step of [...this.steps]) {
      if (!this.scope.run(() => step(seconds))) this.remove(step);
    }
  }

  destroy(): void {
    this.steps.clear();
    this.stop();
  }
}
