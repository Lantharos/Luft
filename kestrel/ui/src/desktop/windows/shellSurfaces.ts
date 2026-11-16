import type Meta from 'gi://Meta';

import type { Offset } from '../../shared/layout/edge.js';
import { animateActor, Curve, Duration, reducedMotion, Spring } from '../../shared/motion/motion.js';

const QUICK_SETTINGS = 'com.lantharos.kestrel.quicksettings';

export interface Placement {
  position(width: number, height: number): [number, number];
  slide(): Offset;
}

class ShellSurfaces {
  placement: Placement | null = null;
  private adopted: Meta.Window | null = null;

  private get quick(): Meta.Window | null {
    if (this.adopted) return this.adopted;
    const window = global.display.list_all_windows().find(candidate => candidate.is_shell_surface() && candidate.get_wm_class() === QUICK_SETTINGS);
    if (!window) return null;
    this.adopted = window;
    window.connect('unmanaged', () => (this.adopted = null));
    window.connect('size-changed', () => this.place(window));
    return window;
  }

  get available(): boolean {
    return !!this.quick;
  }

  owns(actor: Meta.WindowActor): boolean {
    return !!actor.meta_window?.is_shell_surface();
  }

  toggle(): void {
    const window = this.quick!;
    if (!window.minimized) {
      window.minimize();
      return;
    }
    this.place(window);
    window.unminimize();
    window.activate(global.get_current_time());
  }

  reveal(actor: Meta.WindowActor, done: () => void): void {
    const offset = this.placement!.slide();
    actor.opacity = 0;
    actor.set(reducedMotion() ? { translation_x: 0, translation_y: 0 } : offset);
    animateActor(actor, { translation_x: 0, translation_y: 0, spring: Spring.snappy });
    animateActor(actor, { opacity: 255, duration: Duration.standard, curve: Curve.decelerate, onStopped: done });
  }

  conceal(actor: Meta.WindowActor, done: () => void): void {
    if (!reducedMotion()) animateActor(actor, { ...this.placement!.slide(), spring: Spring.snappy });
    animateActor(actor, { opacity: 0, duration: Duration.tap, curve: Curve.decelerate, onStopped: done });
  }

  private place(window: Meta.Window): void {
    const { width, height } = window.get_frame_rect();
    window.move_frame(true, ...this.placement!.position(width, height));
  }
}

export const shellSurfaces = new ShellSurfaces();
