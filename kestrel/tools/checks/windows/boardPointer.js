import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

const time = () => GLib.get_monotonic_time();

export const screenPoint = (view, viewport, x, y) => [viewport.x + (x - view.x) * view.scale, viewport.y + (y - view.y) * view.scale];

export async function zoomWithWheel({pointer, keyboard, pause}, direction, [x, y], steps) {
  pointer.notify_absolute_motion(time(), x, y);
  keyboard.notify_keyval(time(), Clutter.KEY_Super_L, Clutter.KeyState.PRESSED);
  keyboard.notify_keyval(time(), Clutter.KEY_Control_L, Clutter.KeyState.PRESSED);
  for (let step = 0; step < steps; step++) {
    pointer.notify_discrete_scroll(time(), direction, Clutter.ScrollSource.WHEEL);
    await pause(40);
  }
  keyboard.notify_keyval(time(), Clutter.KEY_Control_L, Clutter.KeyState.RELEASED);
  keyboard.notify_keyval(time(), Clutter.KEY_Super_L, Clutter.KeyState.RELEASED);
  await pause(700);
}

export async function clickAt({board, pointer, pause}, origin, x, y) {
  const [screenX, screenY] = screenPoint(board.camera.view, board.viewport, origin.x + x, origin.y + y);
  pointer.notify_absolute_motion(time(), Math.round(screenX), Math.round(screenY));
  await pause(60);
  pointer.notify_button(time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
  pointer.notify_button(time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
  await pause(300);
}

export const clickOf = window => /@(-?\d+),(-?\d+)/.exec(window.get_title())?.slice(1).map(Number) ?? null;
