import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import {checks} from '../lib/check.js';
import type {Point} from '../lib/input/input.js';
import {stopAll} from '../lib/processes.js';
import {nextFrame, pause, settled} from '../lib/wait.js';
import {board, boardResting, boardWindows, leaveBoard, openWindows, showBoard, switching, view, windowNamed} from './lib/board.js';
import {screenPoint} from './lib/pointer.js';

const {require, eventually} = checks('board touch');
const seat = global.stage.context.get_backend().get_default_seat();
const now = () => GLib.get_monotonic_time();
const STEPS = 12;
let screen: Clutter.VirtualInputDevice | null = null;
const touchscreen = () => (screen ??= seat.create_virtual_device(Clutter.InputDeviceType.TOUCHSCREEN_DEVICE));

// Puts fingers down at the starting points and moves each to its end, together
async function touch(paths: [Point, Point][]) {
  paths.forEach(([[x, y]], slot) => touchscreen().notify_touch_down(now(), slot, x, y));
  await pause(30);
  for (let step = 1; step <= STEPS; step++) {
    paths.forEach(([[fromX, fromY], [toX, toY]], slot) =>
      touchscreen().notify_touch_motion(now(), slot, fromX + (toX - fromX) * step / STEPS, fromY + (toY - fromY) * step / STEPS));
    await nextFrame();
  }
  await pause(30);
  paths.forEach((_path, slot) => touchscreen().notify_touch_up(now(), slot));
  await settled();
}

const fingers = (count: number, [x, y]: Point, [dx, dy]: Point, spacing = 60) =>
  Array.from({length: count}, (_, index): [Point, Point] => {
    const offset = (index - (count - 1) / 2) * spacing;
    return [[x + offset, y], [x + offset + dx, y + dy]];
  });

// An empty spot of the board, away from every window
function emptySpot(): Point | null {
  const {viewport} = board();
  for (let y = viewport.y + 80; y < viewport.y + viewport.height - 80; y += 40) {
    for (let x = viewport.x + 120; x < viewport.x + viewport.width - 120; x += 40) {
      if (board().onCanvas(x, y) && board().onCanvas(x - 90, y) && board().onCanvas(x + 90, y) && board().onCanvas(x, y + 40)) return [x, y];
    }
  }
  return null;
}

const gesturesOf = (window: Meta.Window) => /~(\S+)/.exec(window.get_title())?.[1].split(',') ?? [];

function onScreen(window: Meta.Window) {
  const {x, y, width, height} = window.get_frame_rect();
  return screenPoint(view(), board().viewport, x + width / 2, y + height / 2);
}

async function checkThreeFingers() {
  const before = view();
  const {viewport} = board();
  await touch(fingers(3, [viewport.x + viewport.width / 2, viewport.y + viewport.height / 2], [-200, -100]));
  await boardResting();
  const after = view();
  require(after.x > before.x + 100 / before.scale && after.y > before.y + 50 / before.scale,
    `three fingers on the touchscreen pan the board, like on a touchpad (${Math.round(before.x)},${Math.round(before.y)} → ${Math.round(after.x)},${Math.round(after.y)})`);
}

async function checkTwoFingers() {
  board().fitAll();
  await boardResting();
  const spot = require(emptySpot(), 'the board has empty space to touch');
  const before = view();
  await touch(fingers(2, spot, [0, 120], 120));
  await boardResting();
  const panned = view();
  require(Math.abs(panned.y - (before.y - 120 / before.scale)) < 30 / before.scale && Math.abs(panned.scale - before.scale) < 0.02,
    `two fingers on empty space move the board with them (${Math.round(before.y)} → ${Math.round(panned.y)})`);

  const [x, y] = emptySpot() ?? spot;
  await touch([[[x - 40, y], [x - 160, y]], [[x + 40, y], [x + 160, y]]]);
  await boardResting();
  require(view().scale > panned.scale * 1.2 || board().enteredWindow(), `spreading two fingers zooms in (${panned.scale.toFixed(2)} → ${view().scale.toFixed(2)})`);
}

async function checkApps() {
  const notes = windowNamed('Notes');
  board().enterWindow(notes);
  await boardResting();
  const before = gesturesOf(notes).length;
  const [x, y] = onScreen(notes);
  await touch(fingers(2, [x, y], [0, -150], 80));
  await eventually(() => gesturesOf(notes).slice(before).includes('te'), 'two fingers scrolling over the entered window reach its app');
  require(!gesturesOf(notes).slice(before).includes('tc'), 'the app keeps those touches');
  require(board().enteredWindow() === notes, 'the window stays entered');
  const swipedFrom = gesturesOf(notes).length;
  // Fingers moving left pull in the window on the right, so swipe toward whichever side has one
  const middleX = (window: Meta.Window) => window.get_frame_rect().x + window.get_frame_rect().width / 2;
  const rightward = boardWindows().some(window => window !== notes && middleX(window) > middleX(notes));
  await touch(fingers(3, [x, y], [rightward ? -260 : 260, 0]));
  await eventually(() => board().enteredWindow() && board().enteredWindow() !== notes, 'three fingers sideways move to the next window, like on a touchpad');
  require(gesturesOf(notes).slice(swipedFrom).includes('tc'), `the app under a three-finger swipe has its touches taken away (${gesturesOf(notes).slice(swipedFrom)})`);
}

async function checkDesktop() {
  await leaveBoard();
  const notes = windowNamed('Notes');
  if (notes.minimized) notes.unminimize();
  notes.activate(global.get_current_time());
  await settled();
  const rect = notes.get_frame_rect();
  const from = gesturesOf(notes).length;
  const index = global.workspace_manager.get_active_workspace_index();
  await touch(fingers(3, [rect.x + rect.width / 2, rect.y + rect.height / 2], [-400, 0]));
  await eventually(() => global.workspace_manager.get_active_workspace_index() === index + 1 && !switching(),
    'off the board, three fingers sideways still switch workspaces');
  require(gesturesOf(notes).slice(from).includes('tc'), 'and take the touches away from the app');
  global.workspace_manager.get_workspace_by_index(index)!.activate(global.get_current_time());
  await eventually(() => global.workspace_manager.get_active_workspace_index() === index && !switching(), 'the first workspace comes back');
  // Away from the windows: a finger landing where an app moves its window from starts the move, which ends any gesture
  for (const window of boardWindows()) window.minimize();
  await settled();
  await touch(fingers(4, [global.screen_width / 2, global.screen_height * 0.7], [0, -320]));
  await eventually(() => board().shown, 'four fingers up on the touchscreen turn the workspace into a board');
  await boardResting();
}

export async function run() {
  const forced = global.force_animations;
  global.force_animations = true;
  try {
    await openWindows();
    await showBoard();
    await checkThreeFingers();
    await checkTwoFingers();
    await checkApps();
    await checkDesktop();
    require(boardWindows().length === 4, 'every window is still on the board');
  } finally {
    global.force_animations = forced;
    await leaveBoard();
    await stopAll();
  }
}
