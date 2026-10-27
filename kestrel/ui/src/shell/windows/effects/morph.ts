import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import type GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Mtk from 'gi://Mtk';

import { Duration, Spring, holdMotion, reducedMotion } from '../../../kestrelUi.js';
import { type Rect, WindowSnapshot } from './snapshot.js';
import { transitionVelocity } from './velocity.js';

const CLIENT_DEADLINE = 400;
const GEOMETRY = ['x', 'y', 'width', 'height'] as const;
const LIVE_TRANSFORM = ['scale-x', 'scale-y', 'translation-x', 'translation-y'];

type Velocity = Record<typeof GEOMETRY[number], number>;
type Connection = [GObject.Object, number];

interface HandOver {
  snapshot: WindowSnapshot | null;
  velocity: Velocity | undefined;
}

const near = (a: number, b: number) => Math.abs(a - b) <= 1;
const sameRect = (a: Rect, b: Rect) => GEOMETRY.every(side => near(a[side], b[side]));
const laters = () => global.compositor.get_laters();

function geometryVelocity(actor: Clutter.Actor): Velocity {
  return Object.fromEntries(GEOMETRY.map(side => [side, transitionVelocity(actor, side)])) as Velocity;
}

function drawnAtTarget(actor: Meta.WindowActor): boolean {
  const window = actor.meta_window!;
  if (!sameRect(window.get_frame_rect(), window.get_target_frame_rect())) return false;
  const [, width, height] = actor.get_texture()!.get_preferred_size();
  const buffer = window.get_buffer_rect();
  return near(width, buffer.width) && near(height, buffer.height - window.get_titlebar_height());
}

function snapshotOf(actor: Meta.WindowActor, rect: Rect): WindowSnapshot | null {
  const clip = new Mtk.Rectangle({
    x: Math.round(rect.x), y: Math.round(rect.y),
    width: Math.round(rect.width), height: Math.round(rect.height),
  });
  const content = actor.paint_to_content(clip);
  return content ? new WindowSnapshot(content as Clutter.TextureContent, clip) : null;
}

class Morph {
  private readonly release = holdMotion();
  private live = false;
  private drawing = false;
  private readonly signals: Connection[];
  private readonly waiting: Connection[];
  private aimLater: number;
  private deadline: number;

  constructor(readonly actor: Meta.WindowActor, readonly snapshot: WindowSnapshot, velocity: Velocity | undefined, private readonly completed: () => void) {
    const parent = actor.get_parent()!;
    if (snapshot.actor.get_parent() !== parent) {
      snapshot.actor.get_parent()?.remove_child(snapshot.actor);
      parent.add_child(snapshot.actor);
    }
    this.keepAbove();
    actor.opacity = 0;

    const window = actor.meta_window!;
    const texture = actor.get_texture()!;
    const check = () => this.check();
    this.signals = [
      [global.display, global.display.connect('restacked', () => this.keepAbove())],
      [actor, actor.connect('destroy', () => this.finish())],
    ];
    this.waiting = [
      [texture, texture.connect('size-changed', check)],
      [window, window.connect('size-changed', check)],
      [window, window.connect('position-changed', check)],
    ];
    this.aimLater = laters().add(Meta.LaterType.BEFORE_REDRAW, () => {
      this.aimLater = 0;
      this.aim(velocity);
      return GLib.SOURCE_REMOVE;
    });
    this.deadline = GLib.timeout_add(GLib.PRIORITY_DEFAULT, CLIENT_DEADLINE, () => {
      this.deadline = 0;
      this.reveal();
      return GLib.SOURCE_REMOVE;
    });
  }

  private keepAbove(): void {
    this.actor.get_parent()?.set_child_above_sibling(this.snapshot.actor, this.actor);
  }

  private aim(velocity: Velocity | undefined): void {
    const target = this.actor.meta_window!.get_target_frame_rect();
    this.snapshot.actor.ease({
      x: target.x, y: target.y, width: target.width, height: target.height,
      spring: Spring.smooth, velocity,
    });
    this.check();
  }

  private check(): void {
    if (!this.live && !this.aimLater && !this.drawing && drawnAtTarget(this.actor))
      this.awaitDrawing();
  }

  private awaitDrawing(): void {
    let drawing = true;
    this.drawing = true;
    this.waiting.push(
      [this.actor, this.actor.connect('damaged', () => (drawing = true))],
      [global.stage, global.stage.connect_after('after-paint', () => {
        if (!drawing) this.reveal();
        drawing = false;
      })]);
  }

  private reveal(): void {
    if (this.live) return;
    this.live = true;
    this.stopWaiting();

    const { actor, snapshot } = this;
    const window = actor.meta_window!;
    const frame = window.get_frame_rect();
    const buffer = window.get_buffer_rect();
    const shown = snapshot.rect;
    const speed = geometryVelocity(snapshot.actor);
    const scaleX = shown.width / frame.width;
    const scaleY = shown.height / frame.height;
    const insetX = frame.x - buffer.x;
    const insetY = frame.y - buffer.y;
    const scaleSpeedX = speed.width / frame.width;
    const scaleSpeedY = speed.height / frame.height;

    snapshot.actor.ease({
      x: frame.x, y: frame.y, width: frame.width, height: frame.height,
      spring: Spring.smooth,
    });
    snapshot.actor.ease({
      opacity: 0,
      duration: Duration.quick,
      mode: Clutter.AnimationMode.LINEAR,
    });

    actor.set_pivot_point(0, 0);
    actor.set({
      scale_x: scaleX,
      scale_y: scaleY,
      translation_x: shown.x - buffer.x - insetX * scaleX,
      translation_y: shown.y - buffer.y - insetY * scaleY,
      opacity: 255,
    });
    actor.ease({
      scale_x: 1, scale_y: 1, translation_x: 0, translation_y: 0,
      spring: Spring.smooth,
      velocity: {
        scale_x: scaleSpeedX,
        scale_y: scaleSpeedY,
        translation_x: speed.x - insetX * scaleSpeedX,
        translation_y: speed.y - insetY * scaleSpeedY,
      },
      onStopped: () => this.finish(),
    });
  }

  private stopWaiting(): void {
    for (const [object, id] of this.waiting.splice(0)) object.disconnect(id);
    if (this.aimLater) laters().remove(this.aimLater);
    this.aimLater = 0;
    if (this.deadline) GLib.source_remove(this.deadline);
    this.deadline = 0;
  }

  private detach(): void {
    this.stopWaiting();
    for (const [object, id] of this.signals.splice(0)) object.disconnect(id);
    const { actor } = this;
    for (const property of LIVE_TRANSFORM) actor.remove_transition(property);
    actor.set({ scale_x: 1, scale_y: 1, translation_x: 0, translation_y: 0, opacity: 255 });
    this.release();
    this.completed();
  }

  handOver(): HandOver {
    if (!this.live) {
      this.detach();
      return { snapshot: this.snapshot, velocity: undefined };
    }
    const velocity = geometryVelocity(this.snapshot.actor);
    const snapshot = snapshotOf(this.actor, this.snapshot.rect);
    this.snapshot.destroy();
    this.detach();
    return { snapshot, velocity };
  }

  finish(): void {
    if (!this.signals.length) return;
    this.detach();
    this.snapshot.destroy();
  }
}

export class WindowMorphs {
  private readonly morphs = new Map<Meta.WindowActor, Morph>();
  private readonly handedOver = new Map<Meta.WindowActor, HandOver & { snapshot: WindowSnapshot }>();
  private dropLater = 0;

  begin(actor: Meta.WindowActor, from: Rect, completed: () => void): boolean {
    this.interrupt(actor);
    if (reducedMotion() || from.width <= 0 || from.height <= 0) return false;

    const handedOver = this.handedOver.get(actor);
    this.handedOver.delete(actor);
    const snapshot = handedOver?.snapshot ?? snapshotOf(actor, from);
    if (!snapshot) return false;
    const morph = new Morph(actor, snapshot, handedOver?.velocity, () => {
      if (this.morphs.get(actor) === morph) this.morphs.delete(actor);
      completed();
    });
    this.morphs.set(actor, morph);
    return true;
  }

  interrupt(actor: Meta.WindowActor): void {
    const morph = this.morphs.get(actor);
    if (!morph) return;
    this.morphs.delete(actor);
    const { snapshot, velocity } = morph.handOver();
    if (!snapshot) return;
    this.handedOver.set(actor, { snapshot, velocity });
    this.dropLater ||= laters().add(Meta.LaterType.BEFORE_REDRAW, () => {
      this.dropLater = 0;
      for (const { snapshot } of this.handedOver.values()) snapshot.destroy();
      this.handedOver.clear();
      return GLib.SOURCE_REMOVE;
    });
  }
}
