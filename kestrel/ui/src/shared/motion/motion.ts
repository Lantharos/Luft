import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { Spring } from '../../../../../packages/web/motion/src/index';

export { Curve, Duration, Gesture, projection, rubberband, Spring, type SpringToken } from '../../../../../packages/web/motion/src/index';

interface EasingActor extends Clutter.Actor {
  ease(params: Record<string, unknown>): void;
}

interface EasingAdjustment extends St.Adjustment {
  ease(target: number, params: Record<string, unknown>): void;
}

export function reducedMotion(): boolean {
  return St.Settings.get().reducedMotion === St.ReducedMotion.REDUCE;
}

export function animateActor(actor: Clutter.Actor, params: Record<string, unknown>): void {
  (actor as EasingActor).ease(params);
}

export function animateAdjustment(adjustment: St.Adjustment, target: number, params: Record<string, unknown>): void {
  (adjustment as EasingAdjustment).ease(target, params);
}

export function liftIcon(button: St.Button, icon: Clutter.Actor): void {
  icon.set_pivot_point(0.5, 0.5);
  const update = () => animateActor(icon, {
    translation_y: button.hover && !button.pressed ? -4 : 0,
    scale_x: button.pressed ? 0.96 : 1,
    scale_y: button.pressed ? 0.96 : 1,
    spring: Spring.snappy,
  });
  button.connect('notify::hover', update);
  button.connect('notify::pressed', update);
}
