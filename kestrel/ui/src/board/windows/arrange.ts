import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import type { Box } from '../../shared/placement.js';
import { boundsOf, fitView, freeSpot, intersection, screenBox, settle, type ExitPlan, type View } from '../view/geometry.js';
import { fadeAway, glideFrom } from '../view/transitions.js';
import { FIT_PADDING } from './focus.js';
import { frameBox, setUnconstrained } from './windows.js';

const RESTORE_TIMEOUT = 300;

export interface Layout {
  readonly view: View;
  readonly layout: Map<Meta.Window, Box>;
  readonly normal: Map<Meta.Window, Box>;
  known: boolean;
}

export function restoreSizes(windows: readonly Meta.Window[], done: () => void): (() => void) | null {
  const resizing = windows.filter(window => window.is_fullscreen() || window.get_maximize_flags() !== 0);
  for (const window of windows) {
    if (window.minimized) window.unminimize();
    if (window.is_fullscreen()) window.unmake_fullscreen();
    if (window.get_maximize_flags() !== 0) window.unmaximize();
  }
  if (!resizing.length) {
    done();
    return null;
  }
  let timeout = 0;
  const pending = new Map<Meta.Window, number>();
  const cancel = () => {
    for (const [window, id] of pending) window.disconnect(id);
    pending.clear();
    if (timeout) GLib.Source.remove(timeout);
    timeout = 0;
  };
  const finish = () => {
    cancel();
    done();
  };
  for (const window of resizing) {
    pending.set(window, window.connect('size-changed', () => {
      window.disconnect(pending.get(window)!);
      pending.delete(window);
      if (!pending.size) finish();
    }));
  }
  timeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, RESTORE_TIMEOUT, () => {
    timeout = 0;
    finish();
    return GLib.SOURCE_REMOVE;
  });
  return cancel;
}

export function arrange(windows: readonly Meta.Window[], canvas: Layout, viewport: Box): Box[] {
  const before = windows.map(frameBox);
  if (!canvas.known) {
    const boxes = before.map(box => ({ ...box }));
    settle(boxes);
    const bounds = boundsOf(boxes);
    if (bounds) fitView(canvas.view, bounds, viewport, FIT_PADDING);
    canvas.known = true;
    return boxes;
  }
  const known = windows.flatMap(window => {
    const box = canvas.layout.get(window);
    return box ? [box] : [];
  });
  const centerX = canvas.view.x + viewport.width / 2 / canvas.view.scale;
  const centerY = canvas.view.y + viewport.height / 2 / canvas.view.scale;
  return windows.map((window, index) => {
    const stored = canvas.layout.get(window);
    if (stored) return { ...stored };
    const [x, y] = freeSpot(known, before[index]!.width, before[index]!.height, centerX, centerY);
    const placed = { ...before[index]!, x, y };
    known.push(placed);
    return placed;
  });
}

export function putBack(plan: ExitPlan<Meta.Window>, canvas: Layout, view: View, viewport: Box, workArea: Box): void {
  const screens = new Map([...canvas.layout].map(([window, box]) => [window, screenBox(view, viewport, box)]));
  for (const [window, box] of plan.placed) {
    setUnconstrained(window, false);
    window.move_frame(false, box.x, box.y);
    glideFrom(window, screens.get(window)!, null, viewport);
  }
  if (plan.maximized) {
    setUnconstrained(plan.maximized, false);
    glideFrom(plan.maximized, screens.get(plan.maximized)!, null, viewport);
    plan.maximized.maximize();
  }
  for (const window of plan.minimized) {
    const screen = screens.get(window)!;
    const tuck = () => tuckAway(window, canvas, workArea);
    if (intersection(screen, viewport) > 0) fadeAway(window, screen, viewport, tuck);
    else tuck();
  }
}

function tuckAway(window: Meta.Window, canvas: Layout, workArea: Box): void {
  window.minimize();
  setUnconstrained(window, false);
  const normal = canvas.normal.get(window) ?? frameBox(window);
  const width = Math.min(normal.width, workArea.width);
  const height = Math.min(normal.height, workArea.height);
  const inside = intersection(normal, workArea) >= width * height / 2;
  window.move_frame(false,
    inside ? normal.x : workArea.x + Math.round((workArea.width - width) / 2),
    inside ? normal.y : workArea.y + Math.round((workArea.height - height) / 2));
}
