import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import type { Monitor } from './panel.js';

const COVERING_TYPES = [Meta.WindowType.NORMAL, Meta.WindowType.DIALOG, Meta.WindowType.MODAL_DIALOG];

function onScreen(window: Meta.Window, workspace: Meta.Workspace): boolean {
  return !window.minimized && window.showing_on_its_workspace() && window.located_on_workspace(workspace) &&
    COVERING_TYPES.includes(window.window_type);
}

function opaque(window: Meta.Window): boolean {
  const actor = window.get_compositor_private() as Meta.WindowActor | null;
  return !!actor && actor.visible && actor.opacity === 255;
}

function covers(window: Meta.Window, monitor: Monitor): boolean {
  const frame = window.get_frame_rect();
  return frame.x <= monitor.x && frame.y <= monitor.y &&
    frame.x + frame.width >= monitor.x + monitor.width && frame.y + frame.height >= monitor.y + monitor.height;
}

export function coveredMonitors(monitors: Monitor[]): Set<number> {
  const shell = global as unknown as Shell.Global;
  const workspace = shell.workspace_manager.get_active_workspace();
  const windows = shell.display.sort_windows_by_stacking(workspace.list_windows().filter(window => onScreen(window, workspace))).reverse();
  const covered = new Set<number>();
  for (const monitor of monitors) {
    const top = windows.find(window => window.get_monitor() === monitor.index);
    if (top && (top.is_fullscreen() || covers(top, monitor)) && opaque(top)) covered.add(monitor.index);
  }
  return covered;
}
