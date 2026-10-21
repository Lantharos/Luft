import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

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
