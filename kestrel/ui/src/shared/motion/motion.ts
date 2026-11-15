import type Clutter from 'gi://Clutter';
import St from 'gi://St';

import type { EaseOptions, EaseProperties } from '../../environment.js';
import { Spring as SharedSpring, type SpringToken } from '../../../../../packages/web/motion/src/index';
import { pressOnPixels } from '../display/graphics.js';

export { cubicBezier, Curve, Duration, Feedback, Gesture, projection, rubberband, type SpringToken } from '../../../../../packages/web/motion/src/index';

export const Spring = {
  ...SharedSpring,
  press: { duration: 140, bounce: 0 },
  release: { duration: 260, bounce: 0.3 },
  arrive: { duration: 320, bounce: 0.35 },
} as const;

export function reducedMotion(): boolean {
  return St.Settings.get().reducedMotion === St.ReducedMotion.REDUCE;
}

export function stillMotion(): boolean {
  return reducedMotion() || !St.Settings.get().enable_animations;
}

export function animateActor(actor: Clutter.Actor, params: EaseProperties): void {
  actor.ease(params);
}

export function glide(actor: Clutter.Actor, properties: EaseProperties, spring: SpringToken = Spring.snappy): void {
  animateActor(actor, stillMotion() ? { ...properties, duration: 0 } : { ...properties, spring });
}

export function animateAdjustment(adjustment: St.Adjustment, target: number, params: EaseOptions): void {
  adjustment.ease(target, params);
}

export function squeeze(actor: Clutter.Actor, pressed: boolean, moves: EaseProperties = {}): void {
  const press = pressed && !stillMotion() ? pressOnPixels(actor) : null;
  if (press) actor.set_pivot_point(...press.pivot);
  animateActor(actor, {
    ...moves,
    scale_x: press?.scale ?? 1,
    scale_y: press?.scale ?? 1,
    spring: press ? Spring.press : actor.scale_x < 1 ? Spring.release : Spring.snappy,
  });
}

export function pressable(button: St.Button, actor: Clutter.Actor = button): void {
  button.connect('notify::pressed', () => squeeze(actor, button.pressed));
}

const LIFT = 4;

export function liftIcon(button: St.Button, icon: Clutter.Actor, away: () => [number, number] = () => [0, -1]): void {
  const update = () => {
    const lift = button.hover && !button.pressed ? LIFT : 0;
    const [x, y] = away();
    squeeze(icon, button.pressed, { translation_x: x * lift, translation_y: y * lift });
  };
  button.connect('notify::hover', update);
  button.connect('notify::pressed', update);
}
