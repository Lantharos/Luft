import Clutter from 'gi://Clutter';
import St from 'gi://St';

interface EasingActor extends Clutter.Actor {
  ease(params: Record<string, unknown>): void;
}

export function animateActor(actor: Clutter.Actor, params: Record<string, unknown>): void {
  (actor as EasingActor).ease(params);
}

export function liftIcon(button: St.Button, icon: Clutter.Actor): void {
  icon.set_pivot_point(0.5, 0.5);
  const update = () => animateActor(icon, {
    translation_y: button.hover && !button.pressed ? -4 : 0,
    scale_x: button.pressed ? 0.96 : 1,
    scale_y: button.pressed ? 0.96 : 1,
    duration: 160,
    mode: Clutter.AnimationMode.EASE_OUT_QUAD,
  });
  button.connect('notify::hover', update);
  button.connect('notify::pressed', update);
}
