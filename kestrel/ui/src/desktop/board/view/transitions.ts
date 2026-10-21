import type Clutter from 'gi://Clutter';
import type Meta from 'gi://Meta';

import { animateActor, Curve, Duration, Spring } from '../../../shared/motion/motion.js';
import type { Box } from '../../../shared/layout/placement.js';
import { banded, type SwipeTrack } from '../../gestures/fourFingers.js';
import { clampUnit } from '../../../shared/math.js';
import type { View } from './geometry.js';

const GLIDE_PROPERTIES = ['scale_x', 'scale_y', 'translation_x', 'translation_y'] as const;

type GlideProperty = typeof GLIDE_PROPERTIES[number];
type Glide = { actor: Meta.WindowActor; from: Record<GlideProperty, number> };
type Fade = { actor: Clutter.Actor; appearing: boolean; hidden?: () => void };

let tracking: GlideTrack | null = null;

type TrackState = 'following' | 'released' | 'finishing';

export class GlideTrack implements SwipeTrack {
  private readonly glides: Glide[] = [];
  private readonly fades: Fade[] = [];
  private progress = 0;
  private state: TrackState = 'following';

  constructor(private readonly cancelled: () => void) {}

  add(actor: Meta.WindowActor): void {
    if (this.state === 'released') {
      glide(actor);
      return;
    }
    const from = Object.fromEntries(GLIDE_PROPERTIES.map(property => [property, actor[property]])) as Record<GlideProperty, number>;
    this.glides.push({ actor, from });
    this.apply();
  }

  fade(fade: Fade): void {
    if (this.state === 'released') {
      fadeNow(fade);
      return;
    }
    this.fades.push(fade);
    this.apply();
  }

  update(progress: number): void {
    this.progress = banded(progress);
    this.apply();
  }

  release(velocity: number, commit: boolean): void {
    this.state = 'released';
    const end = commit ? 1 : 0;
    const settled = () => {
      if (!commit) this.cancelled();
    };
    const living = this.glides.filter(({ actor }) => !actor.is_destroyed());
    living.forEach(({ actor, from }, index) => {
      const targets = Object.fromEntries(GLIDE_PROPERTIES.map(property => [property, from[property] + (identity(property) - from[property]) * end]));
      const speeds = Object.fromEntries(GLIDE_PROPERTIES.map(property => [property, (identity(property) - from[property]) * velocity]));
      animateActor(actor, { ...targets, spring: Spring.snappy, velocity: speeds, onComplete: index === 0 ? settled : undefined });
    });
    for (const { actor, appearing, hidden } of this.fades) {
      animateActor(actor, {
        opacity: 255 * visibility(appearing, end),
        spring: Spring.snappy,
        velocity: (appearing ? 255 : -255) * velocity,
        onComplete: commit ? hidden : undefined,
      });
    }
    if (!living.length) settled();
  }

  finish(): void {
    this.state = 'finishing';
    this.progress = 1;
    this.apply();
    for (const { hidden } of this.fades) hidden?.();
  }

  private apply(): void {
    for (const { actor, from } of this.glides) {
      if (actor.is_destroyed()) continue;
      for (const property of GLIDE_PROPERTIES)
        actor[property] = from[property] + (identity(property) - from[property]) * this.progress;
    }
    for (const { actor, appearing } of this.fades)
      actor.opacity = Math.round(255 * visibility(appearing, clampUnit(this.progress)));
  }
}

const visibility = (appearing: boolean, progress: number) => appearing ? progress : 1 - progress;

function fadeNow({ actor, appearing, hidden }: Fade): void {
  animateActor(actor, {
    opacity: appearing ? 255 : 0,
    duration: appearing ? Duration.standard : Duration.quick,
    curve: Curve.decelerate,
    onComplete: hidden,
  });
}

const identity = (property: GlideProperty) => property.startsWith('scale') ? 1 : 0;

function glide(actor: Meta.WindowActor): void {
  animateActor(actor, { scale_x: 1, scale_y: 1, translation_x: 0, translation_y: 0, spring: Spring.snappy });
}

export function trackGlides(cancelled: () => void): GlideTrack {
  tracking = new GlideTrack(cancelled);
  return tracking;
}

export function endGlideTracking(): void {
  tracking = null;
}

export function fadeIn(actor: Clutter.Actor): void {
  if (tracking) tracking.fade({ actor, appearing: true });
  else fadeNow({ actor, appearing: true });
}

export function fadeOut(actor: Clutter.Actor, hidden: () => void): void {
  if (tracking) tracking.fade({ actor, appearing: false, hidden });
  else fadeNow({ actor, appearing: false, hidden });
}

const IDENTITY: View = { x: 0, y: 0, scale: 1 };

export function settleActor(window: Meta.Window): void {
  const actor = window.get_compositor_private() as Meta.WindowActor | null;
  if (!actor) return;
  actor.remove_transition('scale-x');
  actor.remove_transition('scale-y');
  actor.remove_transition('translation-x');
  actor.remove_transition('translation-y');
  actor.set_scale(1, 1);
  actor.set_translation(0, 0, 0);
}

function placeAt(actor: Meta.WindowActor, window: Meta.Window, screen: Box, view: View | null, viewport: Box): void {
  const { x: viewX, y: viewY, scale } = view ?? IDENTITY;
  const offsetX = view ? viewport.x - viewX * scale : 0;
  const offsetY = view ? viewport.y - viewY * scale : 0;
  const frame = window.get_frame_rect();
  const buffer = window.get_buffer_rect();
  const factor = screen.width / scale / Math.max(1, frame.width);
  actor.set_pivot_point(0, 0);
  actor.set_scale(factor, factor);
  actor.set_translation(
    (screen.x - offsetX) / scale - buffer.x - factor * (frame.x - buffer.x),
    (screen.y - offsetY) / scale - buffer.y - factor * (frame.y - buffer.y),
    0);
}

export function glideFrom(window: Meta.Window, screen: Box, view: View | null, viewport: Box): void {
  const actor = window.get_compositor_private() as Meta.WindowActor | null;
  if (!actor) return;
  placeAt(actor, window, screen, view, viewport);
  if (tracking) tracking.add(actor);
  else glide(actor);
}

export function fadeAway(window: Meta.Window, screen: Box, viewport: Box, done: () => void): void {
  const actor = window.get_compositor_private() as Meta.WindowActor | null;
  if (!actor) {
    done();
    return;
  }
  placeAt(actor, window, screen, null, viewport);
  fadeOut(actor, () => {
    if (actor.is_destroyed()) return;
    done();
    settleActor(window);
    actor.opacity = 255;
  });
}
