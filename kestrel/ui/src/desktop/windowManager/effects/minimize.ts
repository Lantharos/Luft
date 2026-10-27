import type Meta from 'gi://Meta';
import type Shell from 'gi://Shell';

import * as KestrelUi from '../../../kestrelUi.js';
import * as Main from '../../../core/main.js';
import { transitionVelocity } from './velocity.js';

const MINIMIZE_PROPERTIES = ['x', 'y', 'scale_x', 'scale_y', 'opacity'] as const;
const MINIMIZED_WINDOW_SCALE = 0.04;

type Property = typeof MINIMIZE_PROPERTIES[number];
type Velocity = Record<Property, number>;

interface HandedOver {
  values: Record<Property, number>;
  velocity: Velocity;
  destroyId: number;
}

interface Target {
  x: number;
  y: number;
  scale: number;
}

function minimizeTarget(actor: Meta.WindowActor): Target | null {
  const window = actor.meta_window!;
  if (window.is_monitor_sized() || KestrelUi.reducedMotion()) return null;

  const [hasIcon, icon] = window.get_icon_geometry();
  const monitor = Main.layoutManager.monitors[window.get_monitor()];
  if (!hasIcon && !monitor) return null;

  const { x, y, width, height } = hasIcon
    ? icon
    : { x: monitor.x + monitor.width / 2, y: monitor.y + monitor.height, width: 0, height: 0 };
  const rect = window.get_buffer_rect();
  const scale = Math.max(MINIMIZED_WINDOW_SCALE, Math.min(width / rect.width, height / rect.height));
  return {
    x: x + width / 2 - rect.width * scale / 2,
    y: y + height / 2 - rect.height * scale / 2,
    scale,
  };
}

function reset(actor: Meta.WindowActor): void {
  actor.remove_all_transitions();
  actor.set_scale(1.0, 1.0);
  actor.set_opacity(255);
  actor.set_pivot_point(0, 0);
}

export class MinimizeEffects {
  private readonly minimizing = new Set<Meta.WindowActor>();
  private readonly unminimizing = new Set<Meta.WindowActor>();
  private readonly handedOver = new Map<Meta.WindowActor, HandedOver>();

  constructor(private readonly shellwm: Shell.WM, private readonly shouldAnimate: (actor: Meta.WindowActor) => boolean) {}

  minimize(actor: Meta.WindowActor): void {
    const motion = this.resume(actor);
    if (!this.shouldAnimate(actor)) {
      this.shellwm.completed_minimize(actor);
      return;
    }

    this.minimizing.add(actor);
    const target = minimizeTarget(actor);

    if (target) {
      actor.ease({
        x: target.x,
        y: target.y,
        scale_x: target.scale,
        scale_y: target.scale,
        spring: KestrelUi.Spring.smooth,
        velocity: motion ?? undefined,
      });
    }
    actor.ease({
      opacity: 0,
      duration: KestrelUi.Duration.quick,
      delay: target ? KestrelUi.Duration.quick : 0,
      curve: KestrelUi.Curve.decelerate,
      onStopped: () => this.minimizeDone(actor),
    });
  }

  unminimize(actor: Meta.WindowActor): void {
    const motion = this.resume(actor);
    const rect = actor.meta_window!.get_buffer_rect();
    if (!this.shouldAnimate(actor)) {
      actor.set_position(rect.x, rect.y);
      actor.set_scale(1, 1);
      actor.opacity = 255;
      this.shellwm.completed_unminimize(actor);
      return;
    }

    this.unminimizing.add(actor);
    const done = () => this.unminimizeDone(actor);
    const target = minimizeTarget(actor);

    if (!motion) {
      actor.opacity = 0;
      if (target) {
        actor.set_position(target.x, target.y);
        actor.set_scale(target.scale, target.scale);
      }
    }
    const moves = target || motion;
    actor.show();
    actor.ease({
      opacity: 255,
      duration: KestrelUi.Duration.quick,
      curve: KestrelUi.Curve.decelerate,
      onStopped: moves ? undefined : done,
    });
    if (moves) {
      actor.ease({
        x: rect.x,
        y: rect.y,
        scale_x: 1,
        scale_y: 1,
        spring: KestrelUi.Spring.smooth,
        velocity: motion ?? undefined,
        onStopped: done,
      });
    }
  }

  handOver(actor: Meta.WindowActor): void {
    const minimizing = this.minimizing.delete(actor);
    const unminimizing = this.unminimizing.delete(actor);
    if (!minimizing && !unminimizing) return;

    const values = Object.fromEntries(MINIMIZE_PROPERTIES.map(property => [property, actor[property]])) as Record<Property, number>;
    const velocity = Object.fromEntries(MINIMIZE_PROPERTIES.map(property =>
      [property, transitionVelocity(actor, property.replace('_', '-'))])) as Velocity;
    const destroyId = actor.connect('destroy', () => this.handedOver.delete(actor));
    this.handedOver.set(actor, { values, velocity, destroyId });
    actor.remove_all_transitions();
    if (minimizing)
      this.shellwm.completed_minimize(actor);
    else
      this.shellwm.completed_unminimize(actor);
  }

  private resume(actor: Meta.WindowActor): Velocity | null {
    const handedOver = this.handedOver.get(actor);
    this.handedOver.delete(actor);
    actor.set_pivot_point(0, 0);
    if (!handedOver) {
      actor.set_scale(1, 1);
      actor.opacity = 255;
      return null;
    }
    actor.disconnect(handedOver.destroyId);
    const { values } = handedOver;
    actor.set_position(values.x, values.y);
    actor.set_scale(values.scale_x, values.scale_y);
    actor.opacity = values.opacity;
    return handedOver.velocity;
  }

  private minimizeDone(actor: Meta.WindowActor): void {
    if (!this.minimizing.delete(actor)) return;
    reset(actor);
    this.shellwm.completed_minimize(actor);
  }

  private unminimizeDone(actor: Meta.WindowActor): void {
    if (!this.unminimizing.delete(actor)) return;
    reset(actor);
    this.shellwm.completed_unminimize(actor);
  }
}
