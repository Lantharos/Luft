import Clutter from 'gi://Clutter';
import type Meta from 'gi://Meta';

import { animateActor } from '../../../shared/motion.js';
import type { Box } from '../../../shared/placement.js';
import type { View } from './geometry.js';

const TRANSITION_DURATION = 320;

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
  animateActor(actor, {
    scale_x: 1, scale_y: 1, translation_x: 0, translation_y: 0,
    duration: TRANSITION_DURATION,
    mode: Clutter.AnimationMode.EASE_OUT_QUART,
  });
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
    duration: TRANSITION_DURATION / 2,
    mode: Clutter.AnimationMode.EASE_OUT_QUAD,
    onStopped: () => {
      if (actor.is_destroyed()) return;
      done();
      settleActor(window);
      actor.opacity = 255;
    },
  });
}
