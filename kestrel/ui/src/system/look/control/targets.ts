import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Graphene from 'gi://Graphene';
import Meta from 'gi://Meta';
import type Shell from 'gi://Shell';

import { LookError } from '../errors.js';
import { captureArea } from './windows.js';

export type Point = [x: number, y: number];

const SETTLE_TIMEOUT = 1500;
const POLL = 16;

const shell = () => global as unknown as Shell.Global;

export function stagePoint(window: Meta.Window, [x, y]: Point): Point {
  const { width, height, scale } = captureArea(window);
  if (!(x >= 0 && y >= 0 && x < width && y < height))
    throw new LookError('InvalidArgs', `${x}, ${y} is outside the window, which is ${width} × ${height}`);
  const frame = window.get_frame_rect();
  const buffer = window.get_buffer_rect();
  const actor = window.get_compositor_private() as Meta.WindowActor;
  const point = actor.apply_transform_to_point(new Graphene.Point3D({ x: frame.x - buffer.x + x / scale, y: frame.y - buffer.y + y / scale, z: 0 }));
  return [point.x, point.y];
}

function windowAt([x, y]: Point): Meta.Window | null {
  for (let actor: Clutter.Actor | null = shell().stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y); actor; actor = actor.get_parent()) {
    if (actor instanceof Meta.WindowActor) return actor.meta_window;
  }
  return null;
}

function partOf(window: Meta.Window, target: Meta.Window): boolean {
  if ((window.get_pid() as number) !== (target.get_pid() as number)) return false;
  for (let current: Meta.Window | null = window; current; current = current.get_transient_for()) {
    if (current === target) return true;
  }
  return false;
}

export function reaches(target: Meta.Window, point: Point): boolean {
  const window = windowAt(point);
  return !!window && partOf(window, target);
}

function settle(ready: () => boolean): Promise<boolean> {
  const deadline = GLib.get_monotonic_time() + SETTLE_TIMEOUT * 1000;
  return new Promise(resolve => {
    if (ready()) {
      resolve(true);
      return;
    }
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, POLL, () => {
      const settled = ready();
      if (!settled && GLib.get_monotonic_time() < deadline) return GLib.SOURCE_CONTINUE;
      resolve(settled);
      return GLib.SOURCE_REMOVE;
    });
  });
}

export async function bringForward(window: Meta.Window, activate: (window: Meta.Window) => void, points: Point[]): Promise<Point[]> {
  const display = shell().display;
  if (display.focus_window !== window) activate(window);
  if (!await settle(() => display.focus_window === window))
    throw new LookError('Busy', "The window couldn't be brought to the front");
  if (!await settle(() => points.every(point => reaches(window, stagePoint(window, point)))))
    throw new LookError('Busy', 'Something else covers that part of the window');
  return points.map(point => stagePoint(window, point));
}
