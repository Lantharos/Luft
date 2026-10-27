import Clutter from 'gi://Clutter';
import {touchpad as handleTouchpad} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {openBoardWindow, windowNamed} from '../checks/board/lib/board.js';
import {touchpad} from '../checks/board/lib/touchpad.js';
import {chord} from '../checks/lib/input/input.js';
import {stop, waitForWindow} from '../checks/lib/processes.js';
import {area, focus, resetTiling, restingTiles, useTiling} from '../checks/tiling/lib/tiling.js';
import {eachFrame, measured} from './recorder.js';

const SUPER = Clutter.KEY_Super_L;
const SWIPE_STEPS = 40;
const TITLE = 'Tiled';

let client = null;

async function arranged(mode) {
  useTiling(mode);
  await restingTiles();
  await focus(windowNamed('Notes'));
  await restingTiles();
}

async function closeClient() {
  if (client) await stop(client);
  client = null;
}

async function open(recorder) {
  const mapped = global.window_manager.connect('map', () => {
    global.window_manager.disconnect(mapped);
    recorder.start();
  });
  client = openBoardWindow(TITLE, 640, 420);
  await waitForWindow(window => window.get_title()?.startsWith(TITLE), `a window titled ${TITLE} opens`);
  await recorder.quiet();
}

async function stepThrough() {
  for (const key of [Clutter.KEY_Right, Clutter.KEY_Right, Clutter.KEY_Left, Clutter.KEY_Left]) await chord(SUPER, key);
}

function swipe() {
  const {x, y, width, height} = area();
  const [centerX, centerY] = [x + width / 2, y + height / 2];
  const updates = Array.from({length: SWIPE_STEPS}, (_, step) => touchpad.swipe('update', 3, step < SWIPE_STEPS / 2 ? -24 : 24, 0, centerX, centerY));
  const events = [touchpad.swipe('begin', 3, 0, 0, centerX, centerY), ...updates, touchpad.swipe('end', 3, 0, 0, centerX, centerY)];
  return eachFrame(events.length, index => handleTouchpad(events[index]));
}

async function overview() {
  await chord(SUPER, Clutter.KEY_w);
  await restingTiles();
  await chord(SUPER, Clutter.KEY_w);
}

export const tilingInteractions = [
  {name: 'tiling turn on', prepare: () => arranged('off'), act: measured(() => useTiling('tiling')), finish: resetTiling},
  {name: 'tiling swap', prepare: () => arranged('tiling'), act: measured(() => chord(SUPER, Clutter.KEY_Shift_L, Clutter.KEY_Right)), finish: resetTiling},
  {name: 'tiling window open', prepare: async () => { await closeClient(); await arranged('tiling'); }, act: open, finish: async () => { await closeClient(); resetTiling(); }},
  {name: 'scrolling focus', prepare: () => arranged('scrolling'), act: measured(stepThrough), finish: resetTiling},
  {name: 'scrolling swipe', prepare: () => arranged('scrolling'), act: measured(swipe), finish: resetTiling},
  {name: 'scrolling overview', prepare: () => arranged('scrolling'), act: measured(overview), finish: resetTiling},
];
