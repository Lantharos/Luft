import Clutter from 'gi://Clutter';

import type { Scope } from '../../../runtime/scope.js';
import type { Sprite, SpriteOptions, SpritePlace } from '../types.js';
import { type Mirrored, SpriteActor } from './frames.js';
import type { LayerStage } from './stage.js';

const OPAQUE = 255;

/**
 * A sprite of painted art: filtered, at any size, turned and faded. Moving goes through translation rather than
 * position, so it never asks for a layout, and only what differs from the last call touches the actor.
 */
export class SmoothSprite {
  readonly actor: InstanceType<typeof SpriteActor>;
  handle: Sprite | null = null;
  private readonly pivotX: number;
  private readonly pivotY: number;
  private frame = -1;
  private x = NaN;
  private y = NaN;
  private rotation = 0;
  private scaleX = 1;
  private scaleY = 1;
  private opacity = OPAQUE;
  private placed = false;
  private shown = true;

  constructor(private readonly options: SpriteOptions, private readonly frames: readonly Mirrored[], name: string,
    private readonly stage: LayerStage, private readonly scope: Scope, group: Clutter.Actor) {
    const pressable = !!options.pressable;
    this.actor = new SpriteActor({ name, reactive: pressable, visible: false, width: options.height, height: options.height });
    this.actor.set_content_scaling_filters(Clutter.ScalingFilter.TRILINEAR, Clutter.ScalingFilter.LINEAR);
    [this.pivotX, this.pivotY] = options.pivot ?? [0.5, 1];
    this.actor.set_pivot_point(this.pivotX, this.pivotY);
    if (pressable) this.feelPresses();
    group.add_child(this.actor);
  }

  private feelPresses(): void {
    const { pointers } = this.stage;
    const feel = (event: Clutter.Event) => pointers.fromSprite(this.handle!, this.scope, event);
    this.actor.connect('button-press-event', (_actor, event: Clutter.Event) => feel(event));
    this.actor.connect('button-release-event', (_actor, event: Clutter.Event) => feel(event));
    this.actor.connect('motion-event', (_actor, event: Clutter.Event) => feel(event));
    this.actor.connect('touch-event', (_actor, event: Clutter.Event) => feel(event));
    this.actor.connect('leave-event', (_actor, event: Clutter.Event) => feel(event));
  }

  sizeOn(): number {
    return this.options.height;
  }

  place({ x, y, frame, rotation = 0, opacity = 1, scaleX = 1, scaleY = 1, flipped = false }: SpritePlace): void {
    const { actor } = this;
    if (frame !== this.frame) {
      this.frame = frame;
      const { images, covered } = this.frames[frame];
      actor.set_content(images[0]);
      actor.covered = covered[0];
    }
    const size = this.options.height;
    const left = x - size * this.pivotX;
    const top = y - size * this.pivotY;
    if (left !== this.x || top !== this.y) {
      this.x = left;
      this.y = top;
      actor.set_translation(left, top, 0);
    }
    if (rotation !== this.rotation) {
      this.rotation = rotation;
      actor.set_rotation_angle(Clutter.RotateAxis.Z_AXIS, rotation);
    }
    const signedX = flipped ? -scaleX : scaleX;
    if (signedX !== this.scaleX || scaleY !== this.scaleY) {
      this.scaleX = signedX;
      this.scaleY = scaleY;
      actor.set_scale(signedX, scaleY);
    }
    const shade = Math.round(opacity * OPAQUE);
    if (shade !== this.opacity) {
      this.opacity = shade;
      actor.opacity = shade;
    }
    this.placed = true;
    this.sync();
  }

  show(shown: boolean): void {
    this.shown = shown;
    this.sync();
  }

  private sync(): void {
    const visible = this.shown && this.placed && this.opacity > 0;
    if (visible !== this.actor.visible) this.actor.visible = visible;
  }

  destroy(): void {
    this.stage.pointers.forget(this.handle!);
    this.actor.destroy();
  }
}
