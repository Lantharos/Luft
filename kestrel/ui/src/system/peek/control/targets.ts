import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Graphene from 'gi://Graphene';
import type Meta from 'gi://Meta';

import { t } from '../../../shared/i18n/index.js';
import { PeekError } from '../errors.js';
import { captureArea, partOf, windowOfActor } from './family.js';

export type Point = [x: number, y: number];

const SETTLE_TIMEOUT = 1500;
const POLL = 16;

function stagePoint(window: Meta.Window, [x, y]: Point): Point {
  const area = captureArea(window);
  if (!(x >= 0 && y >= 0 && x < area.width && y < area.height))
    throw new PeekError('InvalidArgs', t('peek-error-outside', { x: String(x), y: String(y), width: String(area.width), height: String(area.height) }));
  const buffer = window.get_buffer_rect();
  const actor = window.get_compositor_private() as Meta.WindowActor;
  const point = actor.apply_transform_to_point(new Graphene.Point3D({ x: area.x - buffer.x + x / area.scale, y: area.y - buffer.y + y / area.scale, z: 0 }));
  return [point.x, point.y];
}

function windowAt([x, y]: Point): Meta.Window | null {
  return windowOfActor(global.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y));
}

function reaches(target: Meta.Window, point: Point): boolean {
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
  const display = global.display;
  if (display.focus_window !== window) activate(window);
  if (!await settle(() => display.focus_window === window))
    throw new PeekError('Busy', t('peek-error-not-in-front'));
  if (!await settle(() => points.every(point => reaches(window, stagePoint(window, point)))))
    throw new PeekError('Busy', t('peek-error-covered'));
  return points.map(point => stagePoint(window, point));
}
