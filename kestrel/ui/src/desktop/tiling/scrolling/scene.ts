import type Clutter from 'gi://Clutter';
import type Meta from 'gi://Meta';

import type { Box } from '../../../shared/layout/placement.js';
import { animateActor, Spring } from '../../../shared/motion/motion.js';
import { setEdgesTiled, setUnconstrained, targetBox } from '../../windows/frames.js';
import { sameBox } from '../layouts/geometry.js';
import type { SpaceHost } from '../space.js';
import { stretched } from '../windows.js';
import { parkingSpot } from './parking.js';

const TRANSFORM = ['translation-x', 'translation-y', 'scale-x', 'scale-y'];

interface Shown {
  actor: Meta.WindowActor;
  actorSignals: number[];
  windowSignals: number[];
  intended: Box | null;
  frameX: number;
  frameY: number;
}

function actorOf(window: Meta.Window): Meta.WindowActor | null {
  return window.get_compositor_private() as Meta.WindowActor | null;
}

function speedOf(actor: Meta.WindowActor, property: string): number {
  const transition = actor.get_transition(property) as (Clutter.Transition & { get_velocity?(): number }) | null;
  return transition?.get_velocity?.() ?? 0;
}

function stopTransforms(actor: Meta.WindowActor): void {
  for (const property of TRANSFORM) actor.remove_transition(property);
}

function glide(actor: Meta.WindowActor, x: number, y: number, velocityX: number, velocityY: number): void {
  actor.remove_transition('translation-x');
  actor.remove_transition('translation-y');
  animateActor(actor, { translation_x: x, translation_y: y, spring: Spring.smooth, velocity: { translation_x: velocityX, translation_y: velocityY } });
}

export class StripScene {
  private readonly shown = new Map<Meta.Window, Shown>();

  constructor(private readonly monitor: number, private readonly host: SpaceHost) {}

  apply(boxes: Map<Meta.Window, Box>, animate: boolean, velocity = 0): void {
    const home = this.host.monitorBox(this.monitor);
    const view = this.host.workArea(this.monitor);
    const others = this.others();
    for (const [window, box] of boxes) {
      if (!this.host.ready(window)) continue;
      setUnconstrained(window, true);
      setEdgesTiled(window, this.host.gap() === 0);
      if (stretched(window)) continue;
      const actor = actorOf(window);
      const real = parkingSpot(box, view, home, others);
      const frame = window.get_frame_rect();
      const visualX = frame.x + (actor?.translation_x ?? 0);
      const visualY = frame.y + (actor?.translation_y ?? 0);
      const target = targetBox(window);
      const resizes = target.width !== box.width || target.height !== box.height;
      const glides = animate && !!actor && this.host.shown(window);
      if (resizes && glides && real === box && sameBox(frame, target) && !actor!.translation_x && !actor!.translation_y) {
        stopTransforms(actor!);
        this.entry(window, actor!).intended = null;
        this.host.morph(window);
        window.move_resize_frame(true, box.x, box.y, box.width, box.height);
        continue;
      }
      if (!sameBox(target, real)) window.move_resize_frame(true, real.x, real.y, real.width, real.height);
      if (!actor) continue;
      const entry = this.entry(window, actor);
      const placed = window.get_frame_rect();
      entry.intended = box;
      entry.frameX = placed.x;
      entry.frameY = placed.y;
      if (glides && !resizes) {
        const momentumX = velocity || speedOf(actor, 'translation-x');
        const momentumY = speedOf(actor, 'translation-y');
        actor.remove_transition('translation-x');
        actor.remove_transition('translation-y');
        actor.set_translation(visualX - placed.x, visualY - placed.y, 0);
        glide(actor, box.x - placed.x, box.y - placed.y, momentumX, momentumY);
      } else {
        stopTransforms(actor);
        actor.set_scale(1, 1);
        actor.set_translation(box.x - placed.x, box.y - placed.y, 0);
      }
      this.clip(actor);
    }
  }

  hold(window: Meta.Window): void {
    const entry = this.shown.get(window);
    if (entry) entry.intended = null;
  }

  preview(boxes: Map<Meta.Window, Box>): void {
    for (const [window, box] of boxes) {
      const actor = actorOf(window);
      if (!actor || stretched(window)) continue;
      const frame = window.get_frame_rect();
      const entry = this.entry(window, actor);
      entry.intended = box;
      entry.frameX = frame.x;
      entry.frameY = frame.y;
      stopTransforms(actor);
      actor.set_translation(box.x - frame.x, box.y - frame.y, 0);
      this.clip(actor);
    }
  }

  zoom(boxes: Map<Meta.Window, Box>, scale: number): void {
    for (const [window, box] of boxes) {
      const actor = actorOf(window);
      if (!actor || stretched(window)) continue;
      const frame = window.get_frame_rect();
      const buffer = window.get_buffer_rect();
      this.entry(window, actor).intended = null;
      actor.set_pivot_point(0, 0);
      animateActor(actor, {
        scale_x: scale, scale_y: scale,
        translation_x: box.x - (frame.x - buffer.x) * scale - buffer.x,
        translation_y: box.y - (frame.y - buffer.y) * scale - buffer.y,
        spring: Spring.smooth,
      });
    }
  }

  unzoom(boxes: Map<Meta.Window, Box>): void {
    for (const window of boxes.keys()) {
      const actor = actorOf(window);
      if (actor) animateActor(actor, { scale_x: 1, scale_y: 1, spring: Spring.smooth });
    }
    this.apply(boxes, true);
  }

  release(window: Meta.Window): void {
    const entry = this.shown.get(window);
    if (!entry) return;
    this.shown.delete(window);
    for (const id of entry.actorSignals) entry.actor.disconnect(id);
    for (const id of entry.windowSignals) window.disconnect(id);
    stopTransforms(entry.actor);
    entry.actor.set_translation(0, 0, 0);
    entry.actor.set_scale(1, 1);
    entry.actor.remove_clip();
  }

  destroy(): void {
    for (const window of [...this.shown.keys()]) this.release(window);
  }

  private entry(window: Meta.Window, actor: Meta.WindowActor): Shown {
    const existing = this.shown.get(window);
    if (existing) return existing;
    const clip = () => this.clip(actor);
    const frame = window.get_frame_rect();
    const entry: Shown = {
      actor,
      intended: null,
      frameX: frame.x,
      frameY: frame.y,
      actorSignals: [
        actor.connect('notify::translation-x', clip),
        actor.connect('notify::translation-y', clip),
        actor.connect('notify::scale-x', clip),
        actor.connect('notify::allocation', clip),
        actor.connect('destroy', () => this.shown.delete(window)),
      ],
      windowSignals: [],
    };
    entry.windowSignals.push(window.connect('position-changed', () => this.follow(window, entry)));
    this.shown.set(window, entry);
    return entry;
  }

  private follow(window: Meta.Window, entry: Shown): void {
    const frame = window.get_frame_rect();
    const dx = frame.x - entry.frameX;
    const dy = frame.y - entry.frameY;
    entry.frameX = frame.x;
    entry.frameY = frame.y;
    const { actor, intended } = entry;
    if (!intended || (!dx && !dy)) return;
    if (!actor.get_transition('translation-x') && !actor.get_transition('translation-y')) {
      actor.set_translation(intended.x - frame.x, intended.y - frame.y, 0);
      return;
    }
    const velocityX = speedOf(actor, 'translation-x');
    const velocityY = speedOf(actor, 'translation-y');
    const [x, y] = [actor.translation_x - dx, actor.translation_y - dy];
    actor.remove_transition('translation-x');
    actor.remove_transition('translation-y');
    actor.set_translation(x, y, 0);
    glide(actor, intended.x - frame.x, intended.y - frame.y, velocityX, velocityY);
  }

  private clip(actor: Meta.WindowActor): void {
    if (this.host.monitorCount() < 2) {
      if (actor.has_clip) actor.remove_clip();
      return;
    }
    const home = this.host.monitorBox(this.monitor);
    const scale = actor.scale_x;
    const left = actor.x + actor.translation_x;
    const top = actor.y + actor.translation_y;
    const inside = left >= home.x && top >= home.y &&
      left + actor.width * scale <= home.x + home.width && top + actor.height * scale <= home.y + home.height;
    if (inside) {
      if (actor.has_clip) actor.remove_clip();
      return;
    }
    actor.set_clip((home.x - left) / scale, (home.y - top) / scale, home.width / scale, home.height / scale);
  }

  private others(): Box[] {
    const others: Box[] = [];
    for (let index = 0; index < this.host.monitorCount(); index++) {
      if (index !== this.monitor) others.push(this.host.monitorBox(index));
    }
    return others;
  }
}
