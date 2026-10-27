import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {openBoardWindow} from '../checks/board/lib/board.js';
import {moveTo, pressButton, releaseButton, rest} from '../checks/lib/input/input.js';
import {stop, waitForWindow} from '../checks/lib/processes.js';
import {pause, settled, waitUntil} from '../checks/lib/wait.js';
import {eachFrame} from './recorder.js';

const TITLE = 'Frames';
const SIZE = [800, 500];
const MOVE_HANDLE = 12;
const DRAG_STEPS = 60;
const POINTER_SETTLE = 50;

let client = null;

const opens = () => waitForWindow(window => window.get_title()?.startsWith(TITLE), `a window titled ${TITLE} opens`);

async function closeFramesWindow() {
  if (client) await stop(client);
  client = null;
  await settled();
}

async function openClient() {
  client ??= openBoardWindow(TITLE, ...SIZE.map(String));
  const window = await opens();
  const area = Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryIndex);
  window.move_frame(true, area.x + 80, area.y + 80);
  rest();
  await settled();
  return window;
}

async function open(recorder) {
  const mapped = global.window_manager.connect('map', () => {
    global.window_manager.disconnect(mapped);
    recorder.start();
  });
  client = openBoardWindow(TITLE, ...SIZE.map(String));
  await opens();
  await recorder.quiet();
}

async function close(recorder) {
  recorder.start();
  await stop(client);
  client = null;
  await recorder.quiet();
}

async function grab(window, point) {
  let grabbed = null;
  const signal = global.display.connect('grab-op-begin', (_display, target) => (grabbed = target));
  try {
    moveTo(point);
    await pause(POINTER_SETTLE);
    pressButton();
    await waitUntil(() => grabbed === window, 'pressing the move handle starts moving the window');
  } finally {
    global.display.disconnect(signal);
  }
}

async function drag(recorder) {
  const window = await opens();
  const frame = window.get_frame_rect();
  const [fromX, fromY] = [frame.x + frame.width / 2, frame.y + frame.height - MOVE_HANDLE];
  await grab(window, [fromX, fromY]);
  recorder.start();
  await eachFrame(DRAG_STEPS, step => moveTo([fromX + step * 8, fromY + Math.sin(step / 6) * 60]));
  releaseButton();
  await recorder.quiet();
  if (window.get_frame_rect().x === frame.x) throw new Error('The window did not follow the drag');
}

export const windowInteractions = [
  {name: 'window open', prepare: closeFramesWindow, act: open},
  {name: 'window close', prepare: openClient, act: close},
  {name: 'window drag', prepare: openClient, act: drag},
];
