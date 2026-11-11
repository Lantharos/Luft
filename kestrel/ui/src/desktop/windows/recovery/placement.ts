import type Meta from 'gi://Meta';

import type { Box } from '../../../shared/layout/placement.js';

export interface Placement {
  frame: Box;
  workspace: number;
  maximized: boolean;
  fullscreen: boolean;
  minimized: boolean;
  above: boolean;
  edges: number;
}

export function place(window: Meta.Window, saved: Placement, config: Meta.WindowConfig | null): void {
  if (saved.workspace < 0) {
    window.stick();
  } else {
    const manager = global.workspace_manager;
    while (manager.n_workspaces <= saved.workspace) manager.append_new_workspace(false, global.get_current_time());
    window.change_workspace_by_index(saved.workspace, false);
  }
  if (saved.maximized || saved.fullscreen) return;
  const { x, y, width, height } = saved.frame;
  if (!config) {
    window.move_resize_frame(true, x, y, width, height);
    return;
  }
  config.set_position(x, y);
  config.set_size(width, height);
}

export function restoreState(window: Meta.Window, saved: Placement): void {
  if (saved.maximized) window.maximize();
  if (saved.fullscreen) window.make_fullscreen();
  if (saved.above) window.make_above();
  if (saved.edges && !saved.maximized && !saved.fullscreen) window.set_tiled_edges(saved.edges);
  if (saved.minimized) window.minimize();
}
