import Clutter from 'gi://Clutter';

import {named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {chord, click, type} from '../lib/input.js';
import {waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {board, boardResting, boardWindows, leaveBoard, openBoardWindow, openWindows, showBoard, view, windowNamed} from './lib/board.js';
import {onScreen} from './lib/pointer.js';
import {touchpad} from './lib/touchpad.js';

const {require, eventually} = checks('board');
const GRID = {Notes: [0, 0], Inbox: [1200, 0], Music: [0, 900], Files: [1200, 900]};

const sameView = (a, b) => Math.abs(a.scale - b.scale) < 1e-6 && Math.abs(a.x - b.x) < 1e-3 && Math.abs(a.y - b.y) < 1e-3;

function enteredFully(window) {
  const {viewport, camera} = board();
  const rect = window.get_frame_rect();
  const scale = Math.min(1, (viewport.width - 48) / rect.width, (viewport.height - 48) / rect.height);
  const [x, y] = onScreen(window);
  return board().enteredWindow() === window && global.display.focus_window === window &&
    Math.abs(camera.view.scale - scale) < 1e-6 &&
    Math.abs(x - viewport.x - viewport.width / 2) < 1 && Math.abs(y - viewport.y - viewport.height / 2) < 1;
}

function dimmedAround(window) {
  return boardWindows().every(other => {
    const opacity = other.get_compositor_private().opacity;
    return other === window ? opacity === 255 : opacity < 255;
  });
}

function gesture(events) {
  for (const event of events) board().input.handle(event);
}

function pinch(scale, [x, y]) {
  gesture([
    touchpad.pinch('begin', 3, 1, x, y),
    touchpad.pinch('update', 3, (1 + scale) / 2, x, y),
    touchpad.pinch('update', 3, scale, x, y),
    touchpad.pinch('end', 3, scale, x, y),
  ]);
}

function swipe(dx, dy) {
  gesture([
    touchpad.swipe('begin', 3),
    touchpad.swipe('update', 3, dx / 2, dy / 2),
    touchpad.swipe('update', 3, dx / 2, dy / 2),
    touchpad.swipe('end', 3),
  ]);
}

async function enters(window, label) {
  await eventually(() => enteredFully(window), label);
  await boardResting();
}

async function overview() {
  for (const [title, [x, y]] of Object.entries(GRID)) windowNamed(title).move_frame(false, x, y);
  board().fitAll();
  await boardResting();
  const shown = view();
  require(shown.scale < 0.6 && !board().enteredWindow(), `the overview shows the windows at ${Math.round(shown.scale * 100)}%`);
  return shown;
}

async function checkEntering(shown) {
  const notes = windowNamed('Notes');
  click(onScreen(notes));
  await enters(notes, 'clicking a window in the overview enters it at 100%, centered and focused');
  require(dimmedAround(notes), 'the other windows dim while one is entered');
  type('hi');
  await eventually(() => notes.get_title() === 'Notes: hi', 'typing reaches the entered window');
  await capture('board-entered');

  for (const [keyval, title, label] of [
    [Clutter.KEY_Right, 'Inbox', 'Super+Right enters the window to the right'],
    [Clutter.KEY_Down, 'Files', 'Super+Down enters the window below'],
    [Clutter.KEY_Left, 'Music', 'Super+Left enters the window to the left'],
    [Clutter.KEY_Up, 'Notes', 'Super+Up enters the window above'],
  ]) {
    await chord(Clutter.KEY_Super_L, keyval);
    await enters(windowNamed(title), label);
  }
  await chord(Clutter.KEY_Super_L, Clutter.KEY_Up);
  await boardResting();
  require(enteredFully(notes), 'Super+Up stays put with nothing above');

  await chord(Clutter.KEY_Super_L, Clutter.KEY_Escape);
  await eventually(() => !board().enteredWindow() && sameView(view(), shown), 'Super+Escape returns to the overview it came from');
  await settled();
  require(!named('kestrel-start').visible, 'Super+Escape leaves Start closed');
  await eventually(() => boardWindows().every(window => window.get_compositor_private().opacity === 255), 'no window stays dimmed in the overview');
}

async function checkGestures(shown) {
  const notes = windowNamed('Notes');
  await chord(Clutter.KEY_Super_L, Clutter.KEY_Return);
  await enters(notes, 'Super+Enter enters the focused window');
  pinch(0.7, onScreen(notes));
  await eventually(() => !board().enteredWindow() && sameView(view(), shown), 'pinching in returns to the overview');
  await boardResting();

  const inbox = windowNamed('Inbox');
  pinch(1.4, onScreen(inbox));
  await enters(inbox, 'spreading three fingers over a window enters it');
  swipe(120, 0);
  await enters(notes, 'a three-finger swipe to the right brings in the window on the left');
  swipe(0, 120);
  await eventually(() => board().shown && !board().enteredWindow() && sameView(view(), shown),
    'a three-finger swipe down returns to the overview and stays on the board');
  await boardResting();
}

async function checkFollowing() {
  const before = global.display.focus_window;
  await chord(Clutter.KEY_Alt_L, Clutter.KEY_Tab);
  await eventually(() => global.display.focus_window !== before && enteredFully(global.display.focus_window), 'Alt+Tab enters the chosen window');
  await boardResting();

  const chosen = global.display.focus_window;
  const rect = chosen.get_frame_rect();
  chosen.move_resize_frame(true, rect.x, rect.y, 1700, 1100);
  await eventually(() => chosen.get_frame_rect().width > rect.width && enteredFully(chosen), 'the view follows the entered window as it grows');
  await boardResting();
  chosen.move_frame(true, rect.x - 400, rect.y);
  await eventually(() => chosen.get_frame_rect().x === rect.x - 400 && enteredFully(chosen), 'the view follows the entered window as it moves');
  await boardResting();

  openBoardWindow('Extra', 480, 360);
  const added = await waitForWindow(window => window.get_title()?.startsWith('Extra'), 'a window titled Extra opens');
  const beside = chosen.get_frame_rect();
  await eventually(() => {
    const placed = added.get_frame_rect();
    return placed.x >= beside.x + beside.width && placed.y < beside.y + beside.height && placed.y + placed.height > beside.y;
  }, 'a window opened while another is entered lands beside it');
  chosen.move_resize_frame(true, rect.x, rect.y, rect.width, rect.height);
  await chord(Clutter.KEY_Super_L, Clutter.KEY_Escape);
  await eventually(() => !board().enteredWindow(), 'Super+Escape steps out of the restored window');
}

export async function run() {
  await openWindows();
  try {
    await showBoard();
    const shown = await overview();
    await checkEntering(shown);
    await checkGestures(shown);
    await checkFollowing();
  } finally {
    await leaveBoard();
  }
}
