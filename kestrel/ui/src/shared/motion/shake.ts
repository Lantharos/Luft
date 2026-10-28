import Clutter from 'gi://Clutter';

import { reducedMotion } from './motion.js';

const DURATION = 380;
const STEPS: readonly [number, number][] = [[0, 0], [0.18, -6], [0.4, 5], [0.62, -3], [0.82, 1.5], [1, 0]];

export function decelerate(t: number): number {
  const s = Math.cbrt(Math.min(1, Math.max(0, t)));
  return 3 * s * s - 2 * s * s * s;
}

function offsetAt(progress: number): number {
  const index = STEPS.findIndex(([at]) => at >= progress);
  if (index <= 0) return 0;
  const [startAt, start] = STEPS[index - 1];
  const [endAt, end] = STEPS[index];
  return start + (end - start) * (progress - startAt) / (endAt - startAt);
}

export function shake(actor: Clutter.Actor): void {
  if (reducedMotion()) return;
  const timeline = new Clutter.Timeline({ actor, duration: DURATION });
  timeline.connect('new-frame', () => (actor.translation_x = offsetAt(decelerate(timeline.get_progress()))));
  timeline.connect('completed', () => (actor.translation_x = 0));
  timeline.start();
}
