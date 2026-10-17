import {checks} from '../lib/check.js';
import {stopAll} from '../lib/processes.js';
import {pause, settled} from '../lib/wait.js';
import {board, boardResting, boardWindows, leaveBoard, openWindows} from './lib/board.js';
import {touchpad} from './lib/touchpad.js';

const {require, eventually} = checks('board gestures');
const STEP = 12;

const send = event => board().input.handle(event);
const moved = window => {
  const actor = window.get_compositor_private();
  return actor.scale_x !== 1 || actor.translation_x !== 0 || actor.translation_y !== 0;
};
const resting = window => !moved(window) && window.get_compositor_private().get_transition('scale-x') === null;

async function swipeUp(steps, {thenHold = false} = {}) {
  send(touchpad.swipe('begin', 4));
  for (let i = 0; i < steps; i++) send(touchpad.swipe('update', 4, 0, -STEP));
  if (thenHold) {
    for (let i = 0; i < 12; i++) {
      send(touchpad.swipe('update', 4, 0, 0));
      await pause(16);
    }
  }
}

async function checkFollowing() {
  await swipeUp(20, {thenHold: true});
  const windows = boardWindows();
  await eventually(() => board().shown, 'four fingers moving up start the board');
  require(windows.some(moved), 'the windows follow the fingers part of the way');
  send(touchpad.swipe('end', 4));
  await eventually(() => !board().shown && windows.every(resting), 'letting go of a short, slow swipe goes back to the desktop');
  await settled();
}

async function checkCommitting() {
  await swipeUp(30);
  send(touchpad.swipe('end', 4));
  await eventually(() => board().shown, 'a quick swipe up turns the board on');
  await boardResting();
  require(boardWindows().every(resting), 'the windows settle on the board');
}

export async function run() {
  await openWindows();
  try {
    await checkFollowing();
    await checkCommitting();
  } finally {
    await leaveBoard();
    await stopAll();
  }
}
