import type Meta from 'gi://Meta';

import type { Box } from '../../shared/placement.js';
import { sameBox } from './layouts/geometry.js';
import type { SpaceHost } from './space.js';
import { setEdgesTiled, setUnconstrained, stretched, targetBox } from './windows.js';

export function place(host: SpaceHost, window: Meta.Window, box: Box, animate: boolean): void {
  if (!host.ready(window)) return;
  setUnconstrained(window, true);
  if (stretched(window)) return;
  const moving = !sameBox(targetBox(window), box);
  if (moving && animate && host.shown(window)) host.morph(window);
  setEdgesTiled(window, host.gap() === 0);
  if (moving) window.move_resize_frame(true, box.x, box.y, box.width, box.height);
}

export function edgesMoved(before: Box, after: Box): [side: 'left' | 'right' | 'up' | 'down', coordinate: number][] {
  const moved: [side: 'left' | 'right' | 'up' | 'down', coordinate: number][] = [];
  const near = (a: number, b: number) => Math.abs(a - b) <= 1;
  if (!near(before.x, after.x)) moved.push(['left', after.x]);
  if (!near(before.x + before.width, after.x + after.width)) moved.push(['right', after.x + after.width]);
  if (!near(before.y, after.y)) moved.push(['up', after.y]);
  if (!near(before.y + before.height, after.y + after.height)) moved.push(['down', after.y + after.height]);
  return moved;
}
