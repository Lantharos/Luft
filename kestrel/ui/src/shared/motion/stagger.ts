import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { animateActor, Curve, Duration, Feedback, Spring, stillMotion } from './motion.js';

const RISE = 12;

function parts(root: Clutter.Actor): Clutter.Actor[] {
  let container = root;
  for (;;) {
    if (container instanceof St.ScrollView && container.child instanceof Clutter.Actor) {
      container = container.child;
      continue;
    }
    const shown = container.get_children().filter(child => child.visible);
    if (shown.length !== 1) return shown;
    container = shown[0];
  }
}

export function stagger(root: Clutter.Actor, [x, y]: [number, number]): void {
  if (stillMotion()) return;
  parts(root).slice(0, Feedback.staggerMost).forEach((part, index) => {
    const delay = Feedback.staggerAfter + index * Feedback.staggerStep;
    part.set({ opacity: 0, translation_x: Math.sign(x) * RISE, translation_y: Math.sign(y) * RISE });
    animateActor(part, { opacity: 255, delay, duration: Duration.quick, curve: Curve.decelerate });
    animateActor(part, { translation_x: 0, translation_y: 0, delay, spring: Spring.snappy });
  });
}
