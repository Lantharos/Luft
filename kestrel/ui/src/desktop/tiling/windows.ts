import Meta from 'gi://Meta';
import type Mtk from 'gi://Mtk';
import Shell from 'gi://Shell';

import type { Box } from '../../shared/placement.js';

const ALL_EDGES = Meta.Direction.LEFT | Meta.Direction.RIGHT | Meta.Direction.TOP | Meta.Direction.BOTTOM;

export function boxOf(rect: Mtk.Rectangle): Box {
  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
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

export function stretched(window: Meta.Window): boolean {
  return window.maximized_horizontally || window.maximized_vertically || window.fullscreen;
}

export function floatsByNature(window: Meta.Window): boolean {
  return window.window_type !== Meta.WindowType.NORMAL || !!window.get_transient_for() || window.skip_taskbar ||
    !window.allows_resize() || window.is_attached_dialog();
}

export function appKey(window: Meta.Window): string | null {
  const id = Shell.WindowTracker.get_default().get_window_app(window)?.get_id();
  return id && !id.startsWith('window:') ? id : window.get_wm_class();
}
