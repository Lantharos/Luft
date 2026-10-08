import Clutter from 'gi://Clutter';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {hold, moveTo, pressButton, release, releaseButton, scroll} from '../lib/input.js';
import {capture} from '../lib/screenshots.js';
import {nextFrame} from '../lib/wait.js';
import {board, boardResting, boardWindows, leaveBoard, noOverlap, openWindows, sameView, showBoard, switching, view, windowNamed} from './lib/board.js';
import {screenPoint} from './lib/pointer.js';
import {touchpad} from './lib/touchpad.js';

const {require, eventually} = checks('board');
const manager = global.workspace_manager;
const group = global.window_group;
const panel = () => named('kestrel-panel');

async function checkEntering() {
  require(boardWindows().length === 4, 'four windows open on the first desktop');
  require(!noOverlap(), 'the desktop starts with stacked windows');
  await showBoard();
  require(!named('kestrel-start').visible, 'double-tapping Super turns the board on without leaving Start open');
  require(boardWindows().every(window => window.unconstrained), 'windows on the board can go anywhere');
  require(noOverlap(), 'no windows overlap on the board');
  await eventually(() => group.scale_x === board().camera.view.scale && group.scale_x <= 1, 'the window group shows the board through one transform');
  await eventually(() => !panel().visible, 'the taskbar steps aside on the board');
  await capture('board');
}

async function checkDesktops() {
  const index = manager.get_active_workspace_index();
  Main.wm.actionMoveWorkspace(manager.get_workspace_by_index(index + 1));
  await eventually(() => !board().shown && group.scale_x === 1 && group.translation_x === 0 && panel().visible && !switching(),
    'the next desktop stays a normal desktop with its taskbar');
  const saved = view();
  Main.wm.actionMoveWorkspace(manager.get_workspace_by_index(index));
  await eventually(() => board().shown && sameView(view(), saved) && !switching(), 'returning to the board keeps its view');

  const superScroll = direction => {
    hold(Clutter.KEY_Super_L);
    scroll(direction);
    release(Clutter.KEY_Super_L);
  };
  superScroll(Clutter.ScrollDirection.DOWN);
  await eventually(() => manager.get_active_workspace_index() === index + 1 && !board().shown && !switching(),
    'Super and scrolling switches to the next desktop from a board');
  superScroll(Clutter.ScrollDirection.UP);
  await eventually(() => manager.get_active_workspace_index() === index && board().shown && sameView(view(), saved) && !switching(),
    'Super and scrolling back returns to the board as it was');
}

function checkGestures() {
  const {viewport, input, camera} = board();
  const before = view();
  for (const event of [touchpad.swipe('begin', 3), touchpad.swipe('update', 3, 120, 60), touchpad.swipe('update', 3, 80, 40)])
    input.handle(event);
  const panned = view();
  input.handle(touchpad.swipe('end', 3));
  camera.stop();
  require(Math.abs(before.x - 200 / before.scale - panned.x) < 1e-6 && Math.abs(before.y - 100 / before.scale - panned.y) < 1e-6,
    'a three-finger swipe pans the board with the fingers');

  const focusX = viewport.x + viewport.width / 3;
  const focusY = viewport.y + viewport.height / 2;
  const anchor = [camera.view.x + (focusX - viewport.x) / camera.view.scale, camera.view.y + (focusY - viewport.y) / camera.view.scale];
  for (const event of [touchpad.pinch('begin', 2, 1, focusX, focusY), touchpad.pinch('update', 2, 1.4, focusX, focusY), touchpad.pinch('end', 2, 1.4, focusX, focusY)])
    input.handle(event);
  const [anchorX, anchorY] = screenPoint(camera.view, viewport, ...anchor);
  require(Math.abs(anchorX - focusX) < 0.5 && Math.abs(anchorY - focusY) < 0.5, 'pinching zooms around the fingers');
  require(Number.isInteger(group.translation_x) && Number.isInteger(group.translation_y), 'the board is drawn on whole pixels after a pinch');
}

async function superDrag(window, screenDx, screenDy) {
  const frame = window.get_frame_rect();
  const [fromX, fromY] = screenPoint(board().camera.view, board().viewport, frame.x + frame.width / 2, frame.y + frame.height / 2);
  hold(Clutter.KEY_Super_L);
  moveTo([fromX, fromY]);
  pressButton();
  for (let step = 1; step <= 12; step++) {
    moveTo([fromX + screenDx * step / 12, fromY + screenDy * step / 12]);
    await nextFrame();
  }
  releaseButton();
  release(Clutter.KEY_Super_L);
  return frame;
}

async function checkMoving() {
  board().fitAll();
  await boardResting();
  const {viewport, input} = board();
  const zoomed = board().camera.view;
  const inbox = windowNamed('Inbox');
  const start = inbox.get_frame_rect();
  const [grabX, grabY] = screenPoint(zoomed, viewport, start.x + start.width / 2, start.y + start.height / 2);
  input.handle(touchpad.hold('begin', 3));
  input.handle(touchpad.hold('end', 3, 80));
  for (const event of [touchpad.swipe('begin', 3, 0, 0, grabX, grabY), touchpad.swipe('update', 3, -60, 0, grabX, grabY),
    touchpad.swipe('update', 3, -60, 0, grabX, grabY), touchpad.swipe('end', 3, 0, 0, grabX, grabY)])
    input.handle(event);
  await eventually(() => inbox.get_frame_rect().x !== start.x, 'tapping with three fingers and swiping moves the window under them');
  await eventually(noOverlap, 'windows pushed aside still never overlap');

  const music = windowNamed('Music');
  const scale = board().camera.view.scale;
  const lifted = await superDrag(music, 0, -90);
  await eventually(() => {
    const after = music.get_frame_rect();
    return Math.abs(after.y - lifted.y + 90 / scale) <= 14 / scale && Math.abs(after.x - lifted.x) <= 14 / scale;
  }, `Super+dragging follows the pointer at ${Math.round(scale * 100)}%`);
  const files = windowNamed('Files');
  const filesBefore = files.get_frame_rect();
  const source = music.get_frame_rect();
  await superDrag(music, (filesBefore.x - source.x) * scale, (filesBefore.y - source.y) * scale);
  await eventually(() => noOverlap() && !files.get_frame_rect().equal(filesBefore), 'dropping a window onto another pushes it aside');
}

function fourFingerSwipe(dy) {
  for (const event of [touchpad.swipe('begin', 4), touchpad.swipe('update', 4, 0, dy), touchpad.swipe('end', 4)])
    board().input.handle(event);
}

async function checkLeavingEntered() {
  await boardResting();
  const layout = new Map(boardWindows().map(window => [window, window.get_frame_rect()]));
  const files = windowNamed('Files');
  board().enterWindow(files);
  require(board().enteredWindow() === files, 'a window can be entered right before leaving the board');
  await boardResting();
  const filling = view();
  fourFingerSwipe(30);
  await eventually(() => !board().shown && group.scale_x === 1, 'a four-finger swipe down leaves the board even with a window entered');
  await eventually(() => files.is_maximized(), 'the entered window is maximized');
  await eventually(() => boardWindows().filter(window => window !== files).every(window => window.minimized), 'windows outside the view are minimized');
  require(boardWindows().every(window => !window.unconstrained), 'windows are kept on screen again');
  await capture('board-exit-maximized');

  fourFingerSwipe(-30);
  await eventually(() => board().shown, 'a four-finger swipe up returns to the board');
  await eventually(() => [...layout].every(([window, rect]) => window.get_frame_rect().equal(rect)), 'the board comes back exactly as it was');
  await eventually(() => sameView(view(), filling), 'the board view comes back too');
}

async function checkLeaving() {
  board().fitAll();
  await boardResting();
  const shown = view();
  const {viewport} = board();
  const placed = new Map(boardWindows().map(window => {
    const rect = window.get_frame_rect();
    return [window, screenPoint(shown, viewport, rect.x + rect.width / 2, rect.y + rect.height / 2)];
  }));
  board().toggle();
  require(boardWindows().every(window => !window.minimized), 'leaving the board with everything in view keeps every window');
  const area = Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryIndex);
  await eventually(() => boardWindows().every(window => {
    const rect = window.get_frame_rect();
    const [x, y] = placed.get(window);
    return rect.width >= area.width || rect.height >= area.height || Math.hypot(rect.x + rect.width / 2 - x, rect.y + rect.height / 2 - y) < 260;
  }), 'windows stay where they were on screen');
  await capture('board-exit');
}

export async function run() {
  await openWindows();
  try {
    await checkEntering();
    await checkDesktops();
    checkGestures();
    await checkMoving();
    await checkLeavingEntered();
    await checkLeaving();
  } finally {
    await leaveBoard();
  }
}
