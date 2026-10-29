import Clutter from 'gi://Clutter';
import St from 'gi://St';

import type { EaseOptions, EaseProperties } from '../../environment.js';
import { Spring } from '../../../../../packages/web/motion/src/index';

export { cubicBezier, Curve, Duration, Gesture, projection, rubberband, Spring, type SpringToken } from '../../../../../packages/web/motion/src/index';

export function reducedMotion(): boolean {
  return St.Settings.get().reducedMotion === St.ReducedMotion.REDUCE;
}

export function animateActor(actor: Clutter.Actor, params: EaseProperties): void {
  actor.ease(params);
}

export function animateAdjustment(adjustment: St.Adjustment, target: number, params: EaseOptions): void {
  adjustment.ease(target, params);
}

const LIFT = 4;

export function liftIcon(button: St.Button, icon: Clutter.Actor, away: () => [number, number] = () => [0, -1]): void {
  icon.set_pivot_point(0.5, 0.5);
  const update = () => {
    const lift = button.hover && !button.pressed ? LIFT : 0;
    const [x, y] = away();
    animateActor(icon, {
      translation_x: x * lift,
      translation_y: y * lift,
      scale_x: button.pressed ? 0.96 : 1,
      scale_y: button.pressed ? 0.96 : 1,
      spring: Spring.snappy,
    });
  };
  button.connect('notify::hover', update);
  button.connect('notify::pressed', update);
}
