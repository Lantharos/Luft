import type Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';
import type Shell from 'gi://Shell';

export interface CaptureArea {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly scale: number;
}

const shell = () => global as unknown as Shell.Global;

export function windowOfActor(actor: Clutter.Actor | null): Meta.Window | null {
  for (let current = actor; current; current = current.get_parent()) {
    if (current instanceof Meta.WindowActor) return current.meta_window;
  }
  return null;
}

export function partOf(window: Meta.Window, target: Meta.Window): boolean {
  if ((window.get_pid() as number) !== (target.get_pid() as number)) return false;
  for (let current: Meta.Window | null = window; current; current = current.get_transient_for()) {
    if (current === target) return true;
  }
  return false;
}

export function family(target: Meta.Window): Meta.Window[] {
  const windows = shell().get_window_actors().map(actor => actor.meta_window)
    .filter((window): window is Meta.Window => !!window && partOf(window, target));
  return shell().display.sort_windows_by_stacking(windows);
}

export function scaleOf(window: Meta.Window): number {
  return (window.get_compositor_private() as Meta.WindowActor).get_resource_scale();
}

export function captureArea(target: Meta.Window): CaptureArea {
  const rects = family(target).map(window => window.get_frame_rect());
  const left = Math.min(...rects.map(rect => rect.x));
  const top = Math.min(...rects.map(rect => rect.y));
  const right = Math.max(...rects.map(rect => rect.x + rect.width));
  const bottom = Math.max(...rects.map(rect => rect.y + rect.height));
  const scale = scaleOf(target);
  return { x: left, y: top, width: Math.round((right - left) * scale), height: Math.round((bottom - top) * scale), scale };
}
