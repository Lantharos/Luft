import Clutter from 'gi://Clutter';

import {click, hold, moveTo, release, scroll} from '../../lib/input.js';
import {nextFrame, waitUntil} from '../../lib/wait.js';
import {board, boardResting} from './board.js';

export const screenPoint = (view, viewport, x, y) => [viewport.x + (x - view.x) * view.scale, viewport.y + (y - view.y) * view.scale];
export const clickOf = window => /@(-?\d+),(-?\d+)/.exec(window.get_title())?.slice(1).map(Number) ?? null;

export function onScreen(window) {
  const rect = window.get_frame_rect();
  return screenPoint(board().camera.view, board().viewport, rect.x + rect.width / 2, rect.y + rect.height / 2);
}

export async function zoomWithWheel(direction, point, steps) {
  moveTo(point);
  hold(Clutter.KEY_Super_L, Clutter.KEY_Control_L);
  for (let step = 0; step < steps; step++) scroll(direction);
  release(Clutter.KEY_Super_L, Clutter.KEY_Control_L);
  await boardResting();
}

export async function clickAt(window, origin, x, y) {
  const before = `${clickOf(window)}`;
  const [screenX, screenY] = screenPoint(board().camera.view, board().viewport, origin.x + x, origin.y + y);
  const point = [Math.round(screenX), Math.round(screenY)];
  moveTo(point);
  await nextFrame();
  click(point);
  return waitUntil(() => `${clickOf(window)}` !== before && clickOf(window), `a click at ${x}, ${y} reaches ${window.get_title()}`);
}
