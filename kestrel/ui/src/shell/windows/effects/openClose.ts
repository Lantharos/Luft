import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import type GObject from 'gi://GObject';
import type Meta from 'gi://Meta';

import { Curve, Duration, Spring, holdMotion, reducedMotion } from '../../../kestrelUi.js';

const OPEN = { scale: 0.94, rise: 8 };
const DIALOG_OPEN = { scale: 0.96, rise: 0 };
const CLOSE_SCALE = 0.95;
const CONTENT_TIMEOUT = 1000;
const PAINT_TIMEOUT = 100;
const ANIMATED = ['scale-x', 'scale-y', 'translation-y', 'opacity'];

interface Effect {
  completed: () => void;
  release: (() => void) | null;
  cancel: (() => void) | null;
}

const hasContent = (texture: Meta.ShapedTexture) => texture.get_preferred_size()[1] > 0;

function waitFor(object: GObject.Object, connect: (done: () => void) => number, timeout: number, then: () => void): () => void {
  const cancel = () => {
    object.disconnect(id);
    GLib.source_remove(timer);
  };
  const id = connect(() => {
    cancel();
    then();
  });
  const timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, timeout, () => {
    object.disconnect(id);
    then();
    return GLib.SOURCE_REMOVE;
  });
  return cancel;
}

function afterFirstFrame(actor: Meta.WindowActor, shown: () => void): () => void {
  const texture = actor.get_texture()!;
  let cancel: () => void;
  const afterPaint = () => {
    cancel = waitFor(global.stage, done => global.stage.connect('after-paint', (_stage, view) => {
      if (actor.peek_stage_views().includes(view)) done();
    }), PAINT_TIMEOUT, shown);
    actor.queue_redraw();
  };
  if (hasContent(texture))
    afterPaint();
  else
    cancel = waitFor(texture, done => texture.connect('size-changed', () => {
      if (hasContent(texture)) done();
    }), CONTENT_TIMEOUT, afterPaint);
  return () => cancel();
}

export class OpenCloseEffects {
  private readonly effects = new Map<Meta.WindowActor, Effect>();

  open(actor: Meta.WindowActor, dialog: boolean, completed: () => void): void {
    const { scale, rise } = dialog ? DIALOG_OPEN : OPEN;
    const motion = !reducedMotion();
    actor.set_pivot_point(0.5, 0.5);
    actor.opacity = 0;
    if (motion) {
      actor.set_scale(scale, scale);
      actor.translation_y = rise;
    }
    actor.show();

    const effect = this.start(actor, completed);
    effect.cancel = afterFirstFrame(actor, () => {
      effect.cancel = null;
      effect.release = holdMotion();
      actor.ease({
        opacity: 255, duration: Duration.quick, curve: Curve.decelerate,
        onStopped: motion ? undefined : () => this.finish(actor),
      });
      if (motion) {
        actor.ease({
          scale_x: 1, scale_y: 1, translation_y: 0, spring: Spring.snappy,
          onStopped: () => this.finish(actor),
        });
      }
    });
  }

  close(actor: Meta.WindowActor, completed: () => void): void {
    this.start(actor, completed).release = holdMotion();
    actor.set_pivot_point(0.5, 0.5);
    if (!reducedMotion())
      actor.ease({ scale_x: CLOSE_SCALE, scale_y: CLOSE_SCALE, spring: Spring.snappy });
    actor.ease({
      opacity: 0, duration: Duration.quick, mode: Clutter.AnimationMode.LINEAR,
      onStopped: () => this.finish(actor),
    });
  }

  private start(actor: Meta.WindowActor, completed: () => void): Effect {
    const effect: Effect = { completed, release: null, cancel: null };
    this.effects.set(actor, effect);
    return effect;
  }

  finish(actor: Meta.WindowActor): void {
    const effect = this.effects.get(actor);
    if (!effect) return;
    this.effects.delete(actor);
    effect.cancel?.();
    for (const property of ANIMATED) actor.remove_transition(property);
    actor.set({ opacity: 255, scale_x: 1, scale_y: 1, translation_y: 0 });
    actor.set_pivot_point(0, 0);
    effect.release?.();
    effect.completed();
  }
}
