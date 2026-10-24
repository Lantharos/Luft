import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';

import {checks} from '../lib/check.js';
import {chord, moveTo, pressButton, releaseButton, rest} from '../lib/input/input.js';
import {stopAll} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {nextFrame} from '../lib/wait.js';
import {area, edgeTiling, focus, frame, gap, near, openWindow, resetTiling, restingTiles, tiledTightly, useTiling} from './lib/tiling.js';

const {require, eventually} = checks('tiling');
const SUPER = Clutter.KEY_Super_L;
const DRAG_STEPS = 12;
const GRAB_HEIGHT = 16;

const tiled = window => window.unconstrained;

async function openTiled(titles) {
  const windows = [];
  for (const title of titles) {
    const {window} = await openWindow(title);
    windows.push(window);
    await eventually(() => windows.every(tiled) && tiledTightly(windows), `${windows.length} tiled windows fill the screen without overlapping`);
    await focus(window);
  }
  await restingTiles();
  return windows;
}

async function checkDwindle() {
  const [first, second, third, fourth] = await openTiled(['Notes', 'Inbox', 'Music', 'Files']);
  const bounds = area();
  require(near(frame(first).x, bounds.x) && near(frame(first).height, bounds.height), 'the first window keeps the left side');
  require(frame(second).x > frame(first).x && frame(third).y > frame(second).y, 'the third window splits the second one below it');
  require(near(frame(fourth).y, frame(third).y) && frame(fourth).x > frame(third).x, 'the fourth window splits the third one beside it');
  await capture('tiling-dwindle');
  return [first, second, third, fourth];
}

async function checkKeyboard(windows) {
  const [first, second, third] = windows;
  await focus(first);
  await chord(SUPER, Clutter.KEY_Right);
  await eventually(() => second.has_focus() || third.has_focus(), 'Super+Right focuses a window on the right');
  await focus(second);
  await chord(SUPER, Clutter.KEY_Down);
  await eventually(() => !second.has_focus() && !first.has_focus(), 'Super+Down focuses the window below');
  await focus(first);
  const left = frame(first);
  await chord(SUPER, Clutter.KEY_Shift_L, Clutter.KEY_Right);
  await eventually(() => !near(frame(first).x, left.x, 2) && tiledTightly(windows), 'Super+Shift+Right swaps the window with its neighbour');
  await chord(SUPER, Clutter.KEY_Shift_L, Clutter.KEY_Left);
  await eventually(() => near(frame(first).x, left.x) && near(frame(first).width, left.width), 'Super+Shift+Left swaps it back');
  await chord(SUPER, Clutter.KEY_Control_L, Clutter.KEY_Right);
  await eventually(() => frame(first).width > left.width + 20, 'Super+Ctrl+Right moves the edge to its right outwards');
  await chord(SUPER, Clutter.KEY_Control_L, Clutter.KEY_Left);
  await eventually(() => near(frame(first).width, left.width, 2), 'Super+Ctrl+Left moves the edge back');
}

async function checkFloating(windows) {
  const [first, ...others] = windows;
  await focus(first);
  await chord(SUPER, Clutter.KEY_f);
  await eventually(() => !tiled(first) && first.get_tiled_edges() === 0, 'Super+F lets the focused window float');
  await eventually(() => tiledTightly(others), 'the other windows fill the space it left');
  await capture('tiling-floating');
  await focus(first);
  await chord(SUPER, Clutter.KEY_f);
  await eventually(() => tiled(first) && tiledTightly(windows), 'Super+F tiles the window again');
}

function beginGrab(window, op) {
  const sprite = global.stage.get_context().get_backend().get_pointer_sprite(global.stage);
  window.begin_grab_op(op, sprite, global.get_current_time(), null);
}

async function dragPointer(from, to) {
  for (let step = 1; step <= DRAG_STEPS; step++) {
    moveTo([from[0] + (to[0] - from[0]) * step / DRAG_STEPS, from[1] + (to[1] - from[1]) * step / DRAG_STEPS]);
    await nextFrame();
  }
  pressButton();
  releaseButton();
}

async function checkMouse(windows) {
  const [first, second] = windows;
  const [before, target] = [frame(first), frame(second)];
  const start = [before.x + before.width / 2, before.y + GRAB_HEIGHT];
  moveTo(start);
  await nextFrame();
  beginGrab(first, Meta.GrabOp.MOVING);
  await dragPointer(start, [target.x + target.width / 2, target.y + target.height / 2]);
  await eventually(() => near(frame(first).x, target.x) && near(frame(second).x, before.x), 'dropping a tiled window on another swaps them');
  await restingTiles();
  rest();

  const bounds = area();
  const inner = windows.find(window => frame(window).x + frame(window).width < bounds.x + bounds.width - gap());
  const edge = frame(inner);
  const grip = [edge.x + edge.width - 2, edge.y + edge.height / 2];
  moveTo(grip);
  await nextFrame();
  beginGrab(inner, Meta.GrabOp.RESIZING_E);
  await dragPointer(grip, [grip[0] + 120, grip[1]]);
  await eventually(() => frame(inner).width > edge.width + 60 && tiledTightly(windows), 'resizing a tiled window with the mouse moves its neighbours along');
  rest();
  await restingTiles();
}

async function checkGapsAndMaster(windows) {
  useTiling('tiling', {'tiling-gaps': 'none'});
  await eventually(() => tiledTightly(windows, area(), 0), 'without gaps the windows touch each other and the screen edges');
  require(windows.every(window => window.get_tiled_edges() === (Meta.Direction.LEFT | Meta.Direction.RIGHT | Meta.Direction.TOP | Meta.Direction.BOTTOM)),
    'without gaps every edge of a tiled window is marked tiled');
  await capture('tiling-no-gaps');
  useTiling('tiling', {'tiling-gaps': 'large'});
  await eventually(() => gap() === 20 && tiledTightly(windows), 'large gaps space the windows further apart');
  useTiling('tiling', {'tiling-gaps': 'medium', 'tiling-layout': 'master'});
  const bounds = area();
  await eventually(() => {
    const [master, ...stack] = windows.map(frame);
    return near(master.x, bounds.x) && near(master.height, bounds.height) && master.width > bounds.width / 2 &&
      stack.every(rect => rect.x > master.x + master.width && near(rect.height, stack[0].height, 2));
  }, 'the main and stack layout keeps one large window on the left and stacks the rest');
  await restingTiles();
  await capture('tiling-master');
}

async function checkMaximize(window) {
  window.maximize();
  await eventually(() => window.is_maximized(), 'a tiled window still maximizes');
  window.unmaximize();
  await eventually(() => !window.is_maximized() && tiled(window), 'unmaximizing puts it back in its tile');
}

export async function run() {
  useTiling('tiling');
  try {
    await eventually(() => !edgeTiling(), 'tiling turns off edge snapping');
    const windows = await checkDwindle();
    await checkKeyboard(windows);
    await checkFloating(windows);
    await checkMouse(windows);
    await checkGapsAndMaster(windows);
    await checkMaximize(windows[1]);
    await eventually(() => tiledTightly(windows), 'the layout is whole again');
  } finally {
    rest();
    await stopAll();
    resetTiling();
  }
}
