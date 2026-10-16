import Clutter from 'gi://Clutter';

import {board, boardResting, leaveBoard, showBoard} from '../checks/board/lib/board.js';
import {touchpad} from '../checks/board/lib/touchpad.js';
import {hold, moveTo, release, scroll} from '../checks/lib/input.js';
import {eachFrame, measured} from './recorder.js';

const PAN_STEPS = 60;
const PINCH_STEPS = 40;
const WHEEL_STEPS = 10;

const center = () => {
  const {viewport} = board();
  return [viewport.x + viewport.width / 2, viewport.y + viewport.height / 2];
};

function canvasPoint() {
  const {viewport} = board();
  const inset = 24;
  const xs = [viewport.x + inset, viewport.x + viewport.width / 2, viewport.x + viewport.width - inset];
  const ys = [viewport.y + inset, viewport.y + viewport.height / 2, viewport.y + viewport.height - inset];
  const point = xs.flatMap(x => ys.map(y => [x, y])).find(([x, y]) => board().onCanvas(x, y));
  if (!point) throw new Error('The board shows no empty canvas to pinch on');
  return point;
}

async function restingBoard() {
  if (!board().shown) await showBoard();
  board().fitAll();
  await boardResting();
}

const feed = events => eachFrame(events.length, index => board().input.handle(events[index]));

async function pan() {
  const [x, y] = center();
  const there = Array.from({length: PAN_STEPS}, (_, step) => touchpad.swipe('update', 3, step < PAN_STEPS / 2 ? 8 : -8, 3, x, y));
  await feed([touchpad.swipe('begin', 3, 0, 0, x, y), ...there, touchpad.swipe('end', 3, 0, 0, x, y)]);
}

async function pinch() {
  const [x, y] = canvasPoint();
  const scales = Array.from({length: PINCH_STEPS}, (_, step) => 1 + Math.sin(Math.PI * (step + 1) / PINCH_STEPS) * 0.8);
  await feed([touchpad.pinch('begin', 2, 1, x, y), ...scales.map(scale => touchpad.pinch('update', 2, scale, x, y)), touchpad.pinch('end', 2, 1, x, y)]);
}

async function wheelZoom() {
  moveTo(center());
  hold(Clutter.KEY_Super_L, Clutter.KEY_Control_L);
  await eachFrame(WHEEL_STEPS * 2, step => scroll(step < WHEEL_STEPS ? Clutter.ScrollDirection.UP : Clutter.ScrollDirection.DOWN));
  release(Clutter.KEY_Super_L, Clutter.KEY_Control_L);
}

export const boardInteractions = [
  {name: 'board enter', prepare: leaveBoard, act: measured(() => board().toggle())},
  {name: 'board pan', prepare: restingBoard, act: measured(pan)},
  {name: 'board pinch', prepare: restingBoard, act: measured(pinch)},
  {name: 'board wheel zoom', prepare: restingBoard, act: measured(wheelZoom)},
  {name: 'board leave', prepare: restingBoard, act: measured(() => board().toggle())},
];
