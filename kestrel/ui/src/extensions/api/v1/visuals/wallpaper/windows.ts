import Meta from 'gi://Meta';

import type { Outline } from '../../types.js';

const SURFACE_TYPES = [Meta.WindowType.NORMAL, Meta.WindowType.DIALOG, Meta.WindowType.MODAL_DIALOG, Meta.WindowType.UTILITY];

export function isSurface(window: Meta.Window, workspace: Meta.Workspace): boolean {
  return !window.minimized && window.showing_on_its_workspace() && window.located_on_workspace(workspace) && SURFACE_TYPES.includes(window.window_type);
}

function onScreen(window: Meta.Window, workspace: Meta.Workspace): boolean {
  const actor = window.get_compositor_private() as Meta.WindowActor | null;
  return isSurface(window, workspace) && !!actor?.visible && actor.opacity > 0;
}

export function cornerRadii(window: Meta.Window): [topLeft: number, topRight: number, bottomRight: number, bottomLeft: number] {
  const [rounded, radius] = window.get_rounded_corners();
  const corner = (bit: number) => rounded & bit ? radius : 0;
  return [corner(1), corner(2), corner(4), corner(8)];
}

export function outline(window: Meta.Window): Outline {
  const { x, y, width, height } = window.get_frame_rect();
  return { x, y, width, height, radii: cornerRadii(window) };
}

export function stackedWindows(): Outline[] {
  const workspace = global.workspace_manager.get_active_workspace();
  return global.display.sort_windows_by_stacking(workspace.list_windows().filter(window => onScreen(window, workspace)))
    .reverse()
    .map(outline);
}
