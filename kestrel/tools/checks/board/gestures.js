import Clutter from 'gi://Clutter';

import {Spring, touchpad as handleTouchpad} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {checks} from '../lib/check.js';
import {moveTo, pinch, swipe as swipeOver} from '../lib/input/input.js';
import {stopAll} from '../lib/processes.js';
import {nextFrame, pause, settled} from '../lib/wait.js';
import {board, boardResting, boardWindows, leaveBoard, openWindows, showBoard, windowNamed} from './lib/board.js';
import {touchpad} from './lib/touchpad.js';

const {require, eventually} = checks('board gestures');
const STEP = 12;

const moved = window => {
  const actor = window.get_compositor_private();
  return actor.scale_x !== 1 || actor.translation_x !== 0 || actor.translation_y !== 0;
};
const resting = window => !moved(window) && window.get_compositor_private().get_transition('scale-x') === null;
const backdrop = () => board().backdrop;
const fading = () => backdrop().board.opacity > 0 && backdrop().board.opacity < 255;

async function swipe(direction, steps, {thenHold = false} = {}) {
  handleTouchpad(touchpad.swipe('begin', 4));
  for (let i = 0; i < steps; i++) handleTouchpad(touchpad.swipe('update', 4, 0, direction * STEP));
  if (thenHold) {
    for (let i = 0; i < 12; i++) {
      handleTouchpad(touchpad.swipe('update', 4, 0, 0));
      await pause(16);
    }
  }
}

const release = () => handleTouchpad(touchpad.swipe('end', 4));

async function checkFollowing() {
  await swipe(-1, 20, {thenHold: true});
  const windows = boardWindows();
  await eventually(() => board().shown, 'four fingers moving up start the board');
  require(windows.some(moved), 'the windows follow the fingers part of the way');
  require(fading(), 'the board fades in with the fingers');
  release();
  await eventually(() => !board().shown && windows.every(resting) && !backdrop().actor.visible,
    'letting go of a short, slow swipe goes back to the desktop');
  await settled();
}

async function checkCommitting() {
  await swipe(-1, 30);
  release();
  await eventually(() => board().shown, 'a quick swipe up turns the board on');
  const settling = boardWindows().map(window => window.get_compositor_private().get_transition('scale-x')).find(Boolean);
  require(settling && settling.duration < Spring.snappy.duration * 2, 'the board settles on the snappy spring');
  await boardResting();
  require(boardWindows().every(resting) && backdrop().board.opacity === 255, 'the windows settle on the board');
}

async function checkLeaving() {
  const windows = boardWindows();
  await swipe(1, 20, {thenHold: true});
  require(windows.some(moved), 'four fingers moving down carry the windows part of the way back to the desktop');
  require(fading() && !Main.layoutManager.backgroundGroup.visible, 'the board fades out with the fingers over the wallpaper');
  release();
  await eventually(() => board().shown && windows.every(resting) && backdrop().board.opacity === 255,
    'letting go of a short, slow swipe down stays on the board');
  await boardResting();

  await swipe(1, 30);
  release();
  await eventually(() => !board().shown && windows.every(resting) && !backdrop().actor.visible && Main.layoutManager.backgroundGroup.visible,
    'a quick swipe down leaves the board');
  await settled();
}

function onScreen(window) {
  const extents = window.get_compositor_private().get_transformed_extents();
  return [extents.get_x(), extents.get_y(), extents.get_width()];
}

const shift = (from, to) => Math.max(...from.map((value, i) => Math.abs(value - to[i])));

async function checkTurningAround() {
  await swipe(-1, 30);
  release();
  await eventually(() => board().shown, 'the board turns on again');
  await boardResting();
  const starts = new Map(boardWindows().map(window => [window, onScreen(window)]));
  await swipe(1, 20);
  await nextFrame();
  const travel = window => shift(starts.get(window), onScreen(window));
  const window = boardWindows().filter(candidate => !candidate.get_maximize_flags()).sort((a, b) => travel(b) - travel(a))[0];
  const start = starts.get(window);
  const followed = travel(window);
  for (let i = 0; i < 20; i++) handleTouchpad(touchpad.swipe('update', 4, 0, -STEP));
  await nextFrame();
  require(shift(start, onScreen(window)) < 1, 'moving the fingers back up mid-way brings the windows back with them');
  for (let i = 0; i < 20; i++) handleTouchpad(touchpad.swipe('update', 4, 0, -STEP));
  await nextFrame();
  const past = shift(start, onScreen(window));
  require(past > 0 && past < followed * 0.75 && backdrop().board.opacity === 255, 'pulling past where the swipe started resists');
  release();
  await eventually(() => board().shown && boardWindows().every(other => !other.get_compositor_private().get_transition('scale-x')),
    'letting go there stays on the board');
  await boardResting();
  require(shift(start, onScreen(window)) < 1, 'the windows spring back to their places on the board');
}

const {BEGIN, UPDATE, END} = Clutter.TouchpadGesturePhase;
const gesturesOf = window => /~(\S+)/.exec(window.get_title())?.[1].split(',') ?? [];
const middle = window => {
  const extents = window.get_compositor_private().get_transformed_extents();
  return [extents.get_x() + extents.get_width() / 2, extents.get_y() + extents.get_height() / 2];
};
const pinchWith = scales => [[BEGIN, 1], ...scales.map(scale => [UPDATE, scale]), [END, scales.at(-1)]].forEach(([phase, scale]) => pinch(phase, scale));

async function pinchReachesApp(window, label) {
  window.activate(global.get_current_time());
  await settled();
  const before = gesturesOf(window).length;
  moveTo(middle(window));
  await settled();
  pinchWith([1.1, 1.2]);
  await eventually(() => gesturesOf(window).slice(before).join() === 'pb,pu,pe', label);
}

async function checkKeepingGestures() {
  await leaveBoard();
  const notes = windowNamed('Notes');
  await pinchReachesApp(notes, 'a pinch over a window on the desktop reaches its app');

  pinch(BEGIN);
  pinch(UPDATE, 1.1);
  await eventually(() => gesturesOf(notes).at(-1) === 'pu', 'the app follows a pinch that starts on the desktop');
  await showBoard();
  await eventually(() => gesturesOf(notes).at(-1) === 'pc', 'turning the board on cancels the pinch for the app');
  pinch(UPDATE, 1.2);
  pinch(END, 1.2);

  board().enterWindow(notes);
  await boardResting();
  const seen = gesturesOf(notes).length;
  moveTo(middle(notes));
  await settled();
  swipeOver(BEGIN);
  swipeOver(UPDATE, 4, 0);
  swipeOver(END);
  const scale = board().camera.view.scale;
  pinch(BEGIN);
  pinch(UPDATE, 0.8);
  await eventually(() => board().camera.view.scale < scale, 'a pinch over an entered window zooms the board');
  pinch(UPDATE, 0.7);
  pinch(END, 0.7);
  await eventually(() => !board().enteredWindow(), 'pinching in over the window returns to the overview');
  await boardResting();
  require(gesturesOf(notes).length === seen, 'the app under the pointer gets no pinches or swipes while the board is on');

  await leaveBoard();
  await pinchReachesApp(notes, 'after leaving the board, pinches reach the app again');
}

export async function run() {
  await openWindows();
  try {
    await checkFollowing();
    await checkCommitting();
    await checkLeaving();
    await checkTurningAround();
    await checkKeepingGestures();
  } finally {
    await leaveBoard();
    await stopAll();
  }
}
