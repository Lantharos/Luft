import Clutter from 'gi://Clutter';
import type Meta from 'gi://Meta';

import { animateActor, rubberband, Spring } from '../../../shared/motion.js';
import type { Box } from '../../../shared/placement.js';
import type { View } from './geometry.js';

const FADE_DURATION = 160;
const GLIDE_PROPERTIES = ['scale_x', 'scale_y', 'translation_x', 'translation_y'] as const;

type GlideProperty = typeof GLIDE_PROPERTIES[number];
type Glide = { actor: Meta.WindowActor; from: Record<GlideProperty, number> };

let tracking: GlideTrack | null = null;

type TrackState = 'following' | 'released' | 'finishing';

export class GlideTrack {
  private readonly glides: Glide[] = [];
  private readonly fades: Clutter.Actor[] = [];
  private progress = 0;
  private state: TrackState = 'following';

  add(actor: Meta.WindowActor): void {
    if (this.state === 'released') {
      glide(actor);
      return;
    }
    const from = Object.fromEntries(GLIDE_PROPERTIES.map(property => [property, actor[property]])) as Record<GlideProperty, number>;
    this.glides.push({ actor, from });
    this.apply();
  }

  fade(actor: Clutter.Actor): void {
    if (this.state === 'released') {
      animateActor(actor, { opacity: 255, duration: FADE_DURATION, mode: Clutter.AnimationMode.EASE_OUT_QUAD });
      return;
    }
    this.fades.push(actor);
    this.apply();
  }

  update(progress: number): void {
    this.progress = progress > 1 ? 1 + rubberband(progress - 1, 1) : progress < 0 ? rubberband(progress, 1) : progress;
    this.apply();
  }

  release(velocity: number, commit: boolean, settled: () => void): void {
    this.state = 'released';
    const end = commit ? 1 : 0;
    const living = this.glides.filter(({ actor }) => !actor.is_destroyed());
    living.forEach(({ actor, from }, index) => {
      const targets = Object.fromEntries(GLIDE_PROPERTIES.map(property => [property, from[property] + (identity(property) - from[property]) * end]));
      const speeds = Object.fromEntries(GLIDE_PROPERTIES.map(property => [property, (identity(property) - from[property]) * velocity]));
      animateActor(actor, { ...targets, spring: Spring.smooth, velocity: speeds, onComplete: index === 0 ? settled : undefined });
    });
    for (const actor of this.fades) animateActor(actor, { opacity: 255 * end, spring: Spring.smooth, velocity: 255 * velocity });
    if (!living.length) settled();
  }

  finish(): void {
    this.state = 'finishing';
    this.progress = 1;
    this.apply();
  }

  private apply(): void {
    for (const { actor, from } of this.glides) {
      if (actor.is_destroyed()) continue;
      for (const property of GLIDE_PROPERTIES)
        actor[property] = from[property] + (identity(property) - from[property]) * this.progress;
    }
    for (const actor of this.fades) actor.opacity = Math.round(255 * Math.min(1, Math.max(0, this.progress)));
  }
}

const identity = (property: GlideProperty) => property.startsWith('scale') ? 1 : 0;

function glide(actor: Meta.WindowActor): void {
  animateActor(actor, { scale_x: 1, scale_y: 1, translation_x: 0, translation_y: 0, spring: Spring.smooth });
}

export function trackGlides(): GlideTrack {
  tracking = new GlideTrack();
  return tracking;
}

export function endGlideTracking(): void {
  tracking = null;
}

export function fadeIn(actor: Clutter.Actor): void {
  actor.opacity = 0;
  if (tracking) tracking.fade(actor);
  else animateActor(actor, { opacity: 255, duration: FADE_DURATION, mode: Clutter.AnimationMode.EASE_OUT_QUAD });
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
  animateActor(actor, {
    opacity: 0,
    duration: FADE_DURATION,
    mode: Clutter.AnimationMode.EASE_OUT_QUAD,
    onStopped: () => {
      if (actor.is_destroyed()) return;
      done();
      settleActor(window);
      actor.opacity = 255;
    },
  });
}
