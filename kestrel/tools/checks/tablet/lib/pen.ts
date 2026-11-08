import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import type {Point} from '../../lib/input/input.js';
import {pause} from '../../lib/wait.js';

export const BTN_TOUCH = 0x14a;
export const BTN_STYLUS = 0x14b;
export const BTN_STYLUS2 = 0x14c;

const PRESS = 60;
const seat = global.stage.context.get_backend().get_default_seat();
const now = () => GLib.get_monotonic_time();
let device: Clutter.VirtualInputDevice | null = null;

export const pen = () => (device ??= seat.create_virtual_device(Clutter.InputDeviceType.TABLET_DEVICE));

export function hover([x, y]: Point) {
  pen().notify_tablet_proximity(now(), true, Clutter.InputDeviceToolType.PEN);
  pen().notify_tablet_motion(now(), x, y, 0);
}

export function leave() {
  pen().notify_tablet_proximity(now(), false, Clutter.InputDeviceToolType.PEN);
}

export async function pressButton(button: number) {
  pen().notify_tablet_button(now(), button, Clutter.ButtonState.PRESSED);
  await pause(PRESS);
  pen().notify_tablet_button(now(), button, Clutter.ButtonState.RELEASED);
}
