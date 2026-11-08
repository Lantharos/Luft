import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import {BTN_TOUCH, hover, leave, pen} from '../../tablet/lib/pen.js';
import {property} from '../dbus.js';
import type {Point} from './input.js';
import {nextFrame, waitUntil} from '../wait.js';

const now = () => GLib.get_monotonic_time();

const listed = () => property<[string, string, string][]>('com.lantharos.Kestrel', '/com/lantharos/Kestrel/Pens', 'com.lantharos.Kestrel.Pens', 'Devices');

/** Connects the virtual pen and waits until Kestrel knows it, since Mutter can't take its events any sooner. */
export async function penReady() {
  pen();
  await waitUntil(async () => (await listed()).some(([, , kind]) => kind === 'screen'), 'Kestrel knows the virtual pen');
}

/** Writes with the virtual pen through the points given, pressing hardest in the middle, one point a frame. */
export async function penStroke(points: Point[]) {
  hover(points[0]);
  await nextFrame();
  pen().notify_tablet_button(now(), BTN_TOUCH, Clutter.ButtonState.PRESSED);
  for (const [i, [x, y]] of points.entries()) {
    pen().notify_tablet_motion(now(), x, y, 0.2 + 0.7 * Math.sin(Math.PI * i / Math.max(1, points.length - 1)));
    await nextFrame();
  }
  pen().notify_tablet_button(now(), BTN_TOUCH, Clutter.ButtonState.RELEASED);
  await nextFrame();
  leave();
}

export async function penTap(point: Point) {
  await penStroke([point]);
}
