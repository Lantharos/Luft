import Clutter from 'gi://Clutter';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {checks} from '../lib/check.js';
import {moveTo} from '../lib/input/input.js';
import {capture, renderedFrame} from '../lib/screenshots.js';
import {settled, waitUntil} from '../lib/wait.js';
import {board, boardResting, leaveBoard, onWholePixels, openWindows, showBoard, windowNamed} from './lib/board.js';
import {clickAt, onScreen, screenPoint, zoomWithWheel} from './lib/pointer.js';

const {require, eventually} = checks('board');
const HEADER_INSET = 64;
const HEADER_TOP = 6;
const HEADER_HEIGHT = 30;
const MAGNIFIED_STEPS = 8;
const group = global.window_group;

const monitorScale = () => global.display.get_monitor_scale(Main.layoutManager.primaryIndex);
const scaleOf = window => Number(/ x([\d.]+)$/.exec(window.get_title())?.[1] ?? 1) / monitorScale();

function headerOf(window) {
  const scale = monitorScale();
  const onPixels = value => Math.round(value * scale) / scale;
  const [surfaceX, surfaceY] = window.get_compositor_private().get_first_child().get_transformed_position();
  const frame = window.get_frame_rect();
  const buffer = window.get_buffer_rect();
  return {
    x: onPixels(surfaceX) + onPixels(frame.x + HEADER_INSET - buffer.x),
    y: onPixels(surfaceY) + onPixels(frame.y + HEADER_TOP - buffer.y),
    width: frame.width - 2 * HEADER_INSET,
    height: HEADER_HEIGHT,
  };
}

async function desktopHeader(inbox) {
  inbox.activate(global.get_current_time());
  moveTo([1, 1]);
  await waitUntil(() => global.display.focus_window === inbox, 'Inbox takes focus');
  await settled();
  return renderedFrame(headerOf(inbox));
}

async function checkFullSize(inbox, header) {
  const {viewport, camera} = board();
  board().enterWindow(inbox);
  moveTo([viewport.x + 1, viewport.y + 1]);
  await boardResting();
  require(camera.view.scale === 1 && group.scale_x === 1, 'an entered window that fits is shown at exactly 100%');
  const entered = await renderedFrame(headerOf(inbox));
  require(entered.looksLike(header), 'a window at 100% on the board looks exactly as it does on the desktop');
  camera.panBy(0.37, -0.61);
  require(onWholePixels(), 'panning by a fraction of a pixel keeps the board on whole pixels');
  const panned = await renderedFrame(headerOf(inbox));
  require(panned.looksLike(header), 'the window stays exactly as sharp after a fractional pan');
}

async function clickMagnified(window, x, y) {
  const {viewport} = board();
  const rect = window.get_frame_rect();
  const [screenX, screenY] = screenPoint(board().camera.view, viewport, rect.x + x, rect.y + y);
  require(screenX >= viewport.x && screenX < viewport.x + viewport.width && screenY >= viewport.y && screenY < viewport.y + viewport.height,
    `${x}, ${y} of the magnified window lies on screen`);
  return clickAt(window, rect, x, y);
}

async function checkMagnifying(music) {
  const {camera, viewport} = board();
  board().fitAll();
  await boardResting();
  const steps = [];
  while (camera.view.scale < 1 && steps.length < 20) {
    await zoomWithWheel(Clutter.ScrollDirection.UP, onScreen(music), 1);
    steps.push(camera.view.scale);
  }
  require(camera.view.scale === 1, `zooming in stops at exactly 100% on the way (${steps.map(scale => scale.toFixed(3)).join(', ')})`);

  const rect = music.get_frame_rect();
  const filled = 0.9 * Math.min(viewport.width / rect.width, viewport.height / rect.height);
  await zoomWithWheel(Clutter.ScrollDirection.UP, onScreen(music), MAGNIFIED_STEPS);
  require(Math.abs(camera.view.scale - filled) < 1e-6, `zooming in keeps going until the window fills 90% of the screen (${Math.round(filled * 100)}%)`);
  await eventually(() => Math.abs(music.magnification - filled) < 1e-6 && scaleOf(music) >= filled - 0.01,
    `the magnified window is drawn with ${filled.toFixed(2)}× the detail`);
  const near = await clickMagnified(music, 300, 150);
  const far = await clickMagnified(music, 420, 260);
  require(Math.abs(far[0] - near[0] - 120) <= 1 && Math.abs(far[1] - near[1] - 110) <= 1,
    `clicks reach the magnified window where they land (${near} then ${far})`);
  await capture('board-magnified');

  await zoomWithWheel(Clutter.ScrollDirection.DOWN, onScreen(music), MAGNIFIED_STEPS);
  require(camera.view.scale < 1, 'zooming out goes back below 100%');
  await eventually(() => music.magnification === 1 && scaleOf(music) === 1, 'the window is drawn at its own size again');
}

export async function run() {
  await openWindows();
  try {
    const header = await desktopHeader(windowNamed('Inbox'));
    await showBoard();
    await checkFullSize(windowNamed('Inbox'), header);
    await checkMagnifying(windowNamed('Music'));
  } finally {
    await leaveBoard();
  }
}
