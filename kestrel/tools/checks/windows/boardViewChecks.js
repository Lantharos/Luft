import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import {captureFrame} from '../apps/luftApp.js';
import {clickAt, clickOf, screenPoint, zoomWithWheel} from './boardPointer.js';

const SETTLE = 700;
const HEADER_INSET = 64;
const HEADER_HEIGHT = 30;

const scaleOf = window => Number(/ x([\d.]+)$/.exec(window.get_title())?.[1] ?? 1);

export function headerOf(window, view = {x: 0, y: 0, scale: 1}, viewport = {x: 0, y: 0}) {
  const rect = window.get_frame_rect();
  const [x, y] = screenPoint(view, viewport, rect.x + HEADER_INSET, rect.y + 6);
  return {x: Math.round(x), y: Math.round(y), width: rect.width - 2 * HEADER_INSET, height: HEADER_HEIGHT};
}

export async function checkBoardView({board, named, pointer, keyboard, pause, capture, output, require, header}) {
  const time = () => GLib.get_monotonic_time();
  const group = global.window_group;
  const viewport = board.viewport;
  const waitFor = async (condition, label) => {
    for (let tries = 0; !condition() && tries < 40; tries++) await pause(100);
    require(condition(), label);
  };
  const zoom = (direction, point, steps) => zoomWithWheel({pointer, keyboard, pause}, direction, point, steps);
  const click = async (window, x, y) => {
    const rect = window.get_frame_rect();
    const [screenX, screenY] = screenPoint(board.camera.view, viewport, rect.x + x, rect.y + y);
    if (screenX < viewport.x || screenX >= viewport.x + viewport.width || screenY < viewport.y || screenY >= viewport.y + viewport.height)
      throw new Error(`Kestrel board check failed: ${x}, ${y} of the magnified window lies off screen`);
    await clickAt({board, pointer, pause}, rect, x, y);
    return clickOf(window);
  };

  const inbox = named('Inbox');
  board.enterWindow(inbox);
  pointer.notify_absolute_motion(time(), viewport.x + 1, viewport.y + 1);
  await pause(SETTLE);
  require(board.camera.view.scale === 1 && group.scale_x === 1, 'an entered window that fits is shown at exactly 100%');
  const entered = await captureFrame(headerOf(inbox, board.camera.shown, viewport));
  require(entered.looksLike(header), 'a window at 100% on the board looks exactly as it does on the desktop');
  board.camera.panBy(0.37, -0.61);
  require(Number.isInteger(group.translation_x) && Number.isInteger(group.translation_y), 'panning by a fraction of a pixel keeps the board on whole pixels');
  const panned = await captureFrame(headerOf(inbox, board.camera.shown, viewport));
  require(panned.looksLike(header), 'the window stays exactly as sharp after a fractional pan');

  board.fitAll();
  await pause(SETTLE);
  const music = named('Music');
  const center = () => {
    const rect = music.get_frame_rect();
    return screenPoint(board.camera.view, viewport, rect.x + rect.width / 2, rect.y + rect.height / 2).map(Math.round);
  };
  const steps = [];
  while (board.camera.view.scale < 1 && steps.length < 20) {
    await zoom(Clutter.ScrollDirection.UP, center(), 1);
    steps.push(board.camera.view.scale);
  }
  require(board.camera.view.scale === 1, `zooming in stops at exactly 100% on the way (${steps.map(scale => scale.toFixed(3)).join(', ')})`);

  const rect = music.get_frame_rect();
  const filled = 0.9 * Math.min(viewport.width / rect.width, viewport.height / rect.height);
  await zoom(Clutter.ScrollDirection.UP, center(), 8);
  require(Math.abs(board.camera.view.scale - filled) < 1e-6, `zooming in keeps going until the window fills 90% of the screen (${Math.round(filled * 100)}%)`);
  await waitFor(() => Math.abs(music.magnification - filled) < 1e-6 && scaleOf(music) >= filled - 0.01,
    `the magnified window is drawn with ${filled.toFixed(2)}× the detail (${music.magnification}, ${music.get_title()})`);
  const near = await click(music, 300, 150);
  const far = await click(music, 420, 260);
  require(near && far && Math.abs(far[0] - near[0] - 120) <= 1 && Math.abs(far[1] - near[1] - 110) <= 1,
    `clicks reach the magnified window where they land (${near} then ${far})`);
  await capture(`${output}/board-magnified.png`);

  await zoom(Clutter.ScrollDirection.DOWN, center(), 8);
  require(board.camera.view.scale < 1, 'zooming out goes back below 100%');
  await waitFor(() => music.magnification === 1 && scaleOf(music) === 1, 'the window is drawn at its own size again');
  board.fitAll();
  await pause(SETTLE);
}
