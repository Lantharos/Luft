import type Meta from 'gi://Meta';

import type {Eventually} from '../../lib/check.js';
import {click, type Point} from '../../lib/input/input.js';
import {pause} from '../../lib/wait.js';
import {tap} from './touch.js';

const LONGER_THAN_A_DOUBLE_CLICK = 700;

export const monitor = () => global.display.get_monitor_geometry(global.display.get_primary_monitor());
export const middle = (): Point => [monitor().x + monitor().width / 2, monitor().y + monitor().height / 3];

export function clicksOf(window: Meta.Window): number {
  const title = window.get_title() ?? '';
  return title.includes('{') ? JSON.parse(title.slice(title.indexOf('{'))).clicks as number : 0;
}

export const stacking = () => global.display.sort_windows_by_stacking(global.display.list_all_windows()).map(window => window.get_id()).join();

export function inside(window: Meta.Window, [dx, dy]: Point): Point {
  const frame = window.get_frame_rect();
  return [frame.x + dx, frame.y + dy];
}

export interface Presses {
  require: <T>(condition: T, label: string) => unknown;
  eventually: Eventually;
}

export async function pressesStayWith(front: Meta.Window, behind: Meta.Window, spots: [string, Point][], kind: string, {require, eventually}: Presses) {
  const order = stacking();
  const clicksBehind = clicksOf(behind);
  for (const [spot, point] of spots) {
    for (const [verb, press] of [['clicking', async () => click(point)], ['tapping', () => tap(point)]] as const) {
      const label = `${verb} ${spot} of a ${kind} window`;
      const clicks = clicksOf(front);
      await press();
      await eventually(() => clicksOf(front) === clicks + 1, `${label} reaches it`);
      await pause(LONGER_THAN_A_DOUBLE_CLICK);
      require(global.display.focus_window === front && stacking() === order && clicksOf(behind) === clicksBehind,
        `${label} keeps it focused and in front`);
    }
  }
}
