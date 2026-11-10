import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import {BTN_TOUCH, hover, leave, pen} from '../../tablet/lib/pen.js';
import type {Point} from './input.js';
import {nextFrame} from '../wait.js';

const now = () => GLib.get_monotonic_time();

export async function penStroke(points: Point[], perFrame = 1) {
  hover(points[0]);
  await nextFrame();
  pen().notify_tablet_button(now(), BTN_TOUCH, Clutter.ButtonState.PRESSED);
  for (const [i, [x, y]] of points.entries()) {
    pen().notify_tablet_motion(now(), x, y, 0.2 + 0.7 * Math.sin(Math.PI * i / Math.max(1, points.length - 1)));
    if ((i + 1) % perFrame === 0) await nextFrame();
  }
  pen().notify_tablet_button(now(), BTN_TOUCH, Clutter.ButtonState.RELEASED);
  await nextFrame();
  leave();
}

export async function penTap(point: Point) {
  await penStroke([point]);
}
