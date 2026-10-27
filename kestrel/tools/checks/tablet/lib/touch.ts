import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import type {Point} from '../../lib/input/input.js';
import {pause, waitUntil} from '../../lib/wait.js';

const STEP = 16;
const seat = global.stage.context.get_backend().get_default_seat();
const now = () => GLib.get_monotonic_time();
let screen: Clutter.VirtualInputDevice | null = null;

const touchscreen = () => (screen ??= seat.create_virtual_device(Clutter.InputDeviceType.TOUCHSCREEN_DEVICE));

export async function fold(tablet: boolean) {
  touchscreen().notify_tablet_mode(tablet);
  await waitUntil(() => seat.touch_mode === tablet, `touch mode turns ${tablet ? 'on' : 'off'}`);
}

export async function tap([x, y]: Point) {
  touchscreen().notify_touch_down(now(), 0, x, y);
  await pause(60);
  touchscreen().notify_touch_up(now(), 0);
}

export function touchDown([x, y]: Point) {
  touchscreen().notify_touch_down(now(), 0, x, y);
}

export async function touchMove(from: Point, to: Point, steps = 8) {
  const [fromX, fromY] = from;
  const [toX, toY] = to;
  for (let step = 1; step <= steps; step++) {
    touchscreen().notify_touch_motion(now(), 0, fromX + (toX - fromX) * step / steps, fromY + (toY - fromY) * step / steps);
    await pause(STEP);
  }
}

export function touchUp() {
  touchscreen().notify_touch_up(now(), 0);
}
