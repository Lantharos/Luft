import Meta from 'gi://Meta';
import type Mtk from 'gi://Mtk';

import type { Box } from '../../shared/placement.js';

const ALL_EDGES = Meta.Direction.LEFT | Meta.Direction.RIGHT | Meta.Direction.TOP | Meta.Direction.BOTTOM;

export function boxOf(rect: Mtk.Rectangle): Box {
  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
}

export function frameBox(window: Meta.Window): Box {
  return boxOf(window.get_frame_rect());
}

export function targetBox(window: Meta.Window): Box {
  return boxOf(window.get_target_frame_rect());
}

export function setUnconstrained(window: Meta.Window, unconstrained: boolean): void {
  if (window.unconstrained !== unconstrained) window.unconstrained = unconstrained;
}

export function setEdgesTiled(window: Meta.Window, tiled: boolean): void {
  const edges = tiled ? ALL_EDGES : 0;
  if (window.get_tiled_edges() !== edges) window.set_tiled_edges(edges);
}

export function setMagnification(window: Meta.Window, magnification: number): void {
  if (window.magnification !== magnification) window.magnification = magnification;
}
