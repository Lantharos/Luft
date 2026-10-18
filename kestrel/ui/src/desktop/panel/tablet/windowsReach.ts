import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import { Duration } from '../../../shared/motion.js';
import type { Monitor } from '../panel.js';
import { activeWorkspace } from '../taskbar/workspaceWindows.js';

const bottomOf = (window: Meta.Window) => {
  const frame = window.get_frame_rect();
  return frame.y + frame.height;
};

export function afterWindowsReach(monitor: Monitor, edge: number, reached: () => void): () => void {
  const waiting = new Map<Meta.Window, number>();
  let timer = 0;
  const finish = () => {
    for (const [window, signal] of waiting) window.disconnect(signal);
    waiting.clear();
    if (timer) GLib.Source.remove(timer);
    timer = 0;
  };
  const arrive = (window: Meta.Window) => {
    if (bottomOf(window) < edge) return;
    window.disconnect(waiting.get(window)!);
    waiting.delete(window);
    if (waiting.size) return;
    finish();
    reached();
  };
  for (const window of activeWorkspace().list_windows()) {
    if (window.get_monitor() !== monitor.index || window.minimized || !window.maximized_vertically || bottomOf(window) >= edge) continue;
    waiting.set(window, window.connect('size-changed', arrive));
  }
  if (!waiting.size) {
    reached();
    return () => {};
  }
  timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, Duration.quick, () => {
    timer = 0;
    finish();
    reached();
    return GLib.SOURCE_REMOVE;
  });
  return finish;
}
