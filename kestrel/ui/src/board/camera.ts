import Clutter from 'gi://Clutter';
import type Shell from 'gi://Shell';
import St from 'gi://St';

import type { Box } from '../shared/placement.js';
import { clampScale, copyView, zoomAround, type View } from './geometry.js';

const MOMENTUM_DECAY_MS = 325;
const MOMENTUM_MIN_SPEED = 0.02;

export function animationsEnabled(): boolean {
  return St.Settings.get().enable_animations;
}

export class Camera {
  readonly view: View = { x: 0, y: 0, scale: 1 };
  readonly viewport: Box = { x: 0, y: 0, width: 1, height: 1 };
  private readonly from: View = { x: 0, y: 0, scale: 1 };
  private readonly to: View = { x: 0, y: 0, scale: 1 };
  private readonly tween: Clutter.Timeline;
  private readonly momentum: Clutter.Timeline;
  private velocityX = 0;
  private velocityY = 0;
  private lastMomentumFrame = 0;
  private tweenDone: (() => void) | null = null;
  private engaged = false;

  constructor(private readonly group: Clutter.Actor, private readonly changed: (view: View) => void) {
    const stage = (global as unknown as Shell.Global).stage;
    this.tween = new Clutter.Timeline({ actor: stage, duration: 1 });
    this.tween.set_progress_mode(Clutter.AnimationMode.EASE_OUT_CUBIC);
    this.tween.connect('new-frame', () => this.tweenFrame(this.tween.get_progress()));
    this.tween.connect('completed', () => {
      this.tweenFrame(1);
      const done = this.tweenDone;
      this.tweenDone = null;
      done?.();
    });
    this.momentum = new Clutter.Timeline({ actor: stage, duration: 4000 });
    this.momentum.connect('new-frame', (_timeline, elapsed: number) => this.momentumFrame(elapsed));
  }

  get active(): boolean {
    return this.engaged;
  }

  engage(view: View): void {
    this.engaged = true;
    this.group.set_pivot_point(0, 0);
    copyView(this.view, view);
    this.apply();
  }

  release(): void {
    this.stop();
    this.engaged = false;
    this.group.set_scale(1, 1);
    this.group.set_translation(0, 0, 0);
  }

  stop(): void {
    this.momentum.stop();
    if (this.tween.is_playing()) {
      this.tween.stop();
      this.tweenDone = null;
    }
  }

  apply(): void {
    const { scale } = this.view;
    this.group.set_scale(scale, scale);
    this.group.set_translation(this.viewport.x - this.view.x * scale, this.viewport.y - this.view.y * scale, 0);
    this.changed(this.view);
  }

  panBy(screenDx: number, screenDy: number): void {
    this.stop();
    this.view.x -= screenDx / this.view.scale;
    this.view.y -= screenDy / this.view.scale;
    this.apply();
  }

  zoomAt(scale: number, screenX: number, screenY: number, screenDx = 0, screenDy = 0): void {
    this.stop();
    zoomAround(this.view, this.viewport, scale, screenX, screenY);
    this.view.x -= screenDx / this.view.scale;
    this.view.y -= screenDy / this.view.scale;
    this.apply();
  }

  glide(velocityX: number, velocityY: number): void {
    this.stop();
    if (!animationsEnabled() || Math.hypot(velocityX, velocityY) < MOMENTUM_MIN_SPEED * 4) return;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.lastMomentumFrame = 0;
    this.momentum.start();
  }

  animateTo(target: View, duration: number, done?: () => void): void {
    this.stop();
    copyView(this.to, target);
    this.to.scale = clampScale(this.to.scale);
    if (!animationsEnabled() || duration <= 0) {
      copyView(this.view, this.to);
      this.apply();
      done?.();
      return;
    }
    copyView(this.from, this.view);
    this.tweenDone = done ?? null;
    this.tween.set_duration(duration);
    this.tween.start();
  }

  private tweenFrame(progress: number): void {
    const { from, to, view, viewport } = this;
    const scale = from.scale * Math.pow(to.scale / from.scale, progress);
    const fromCenterX = from.x + viewport.width / 2 / from.scale;
    const fromCenterY = from.y + viewport.height / 2 / from.scale;
    const centerX = fromCenterX + (to.x + viewport.width / 2 / to.scale - fromCenterX) * progress;
    const centerY = fromCenterY + (to.y + viewport.height / 2 / to.scale - fromCenterY) * progress;
    view.scale = scale;
    view.x = centerX - viewport.width / 2 / scale;
    view.y = centerY - viewport.height / 2 / scale;
    this.apply();
  }

  private momentumFrame(elapsed: number): void {
    const delta = elapsed - this.lastMomentumFrame;
    this.lastMomentumFrame = elapsed;
    const decay = Math.exp(-delta / MOMENTUM_DECAY_MS);
    this.velocityX *= decay;
    this.velocityY *= decay;
    this.view.x -= this.velocityX * delta / this.view.scale;
    this.view.y -= this.velocityY * delta / this.view.scale;
    this.apply();
    if (Math.hypot(this.velocityX, this.velocityY) < MOMENTUM_MIN_SPEED) this.momentum.stop();
  }
}
