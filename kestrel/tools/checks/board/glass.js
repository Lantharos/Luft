import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import {battery} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {descendants, named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {chord, click, press} from '../lib/input.js';
import {settled} from '../lib/wait.js';
import {board, boardResting, fourFingerSwipe, leaveBoard, openWindows, windowNamed} from './lib/board.js';
import {onScreen, zoomWithWheel} from './lib/pointer.js';
import {touchpad} from './lib/touchpad.js';

const {require, eventually} = checks('board');
const STAGE_MULTIPLE = 4;
const ZOOM_STEPS = 12;
const BATTERY = {percentage: 80, status: 'discharging', secondsLeft: 0};

const blurredBehind = actor => actor.get_effects().some(effect => effect instanceof Shell.BlurEffect && effect.mode === Shell.BlurMode.BACKGROUND);

function describe(actor) {
  const names = [];
  for (let current = actor; current && current !== global.stage; current = current.get_parent())
    names.push(current.name || current.style_class || current.constructor.name);
  return names.join(' < ');
}

class GlassBounds {
  constructor() {
    this.worst = null;
    this.signal = global.stage.connect('before-paint', () => this.measure());
  }

  measure() {
    const limitX = STAGE_MULTIPLE * global.stage.width;
    const limitY = STAGE_MULTIPLE * global.stage.height;
    for (const actor of descendants(global.stage)) {
      if (!actor.mapped || !blurredBehind(actor)) continue;
      const [x, y] = actor.get_transformed_position();
      const [width, height] = actor.get_transformed_size();
      const excess = Math.max(Math.abs(x) + width - limitX, Math.abs(y) + height - limitY);
      if (excess <= 0 || excess <= this.worst?.excess) continue;
      this.worst = {excess, text: `${describe(actor)} is ${width}x${height} at ${x}, ${y}`};
    }
  }

  stop() {
    global.stage.disconnect(this.signal);
  }
}

async function zoomAll(direction) {
  const {viewport} = board();
  await zoomWithWheel(direction, [viewport.x + viewport.width / 2, viewport.y + viewport.height / 2], ZOOM_STEPS);
}

async function pinchAll(scale) {
  const {viewport, input} = board();
  const [x, y] = [viewport.x + viewport.width / 2, viewport.y + viewport.height / 2];
  for (const event of [touchpad.pinch('begin', 2, 1, x, y), touchpad.pinch('update', 2, scale, x, y), touchpad.pinch('end', 2, scale, x, y)])
    input.handle(event);
  await boardResting();
}

async function openFromCorner(name) {
  click(named(name, named('kestrel-board-corner')));
  await settled();
  press(Clutter.KEY_Escape);
  await settled();
}

async function useBoard() {
  fourFingerSwipe(-60);
  await eventually(() => board().shown, 'a four-finger swipe up turns the board on');
  await boardResting();
  await pinchAll(0.01);
  await pinchAll(100);
  await zoomAll(Clutter.ScrollDirection.DOWN);
  await zoomAll(Clutter.ScrollDirection.UP);
  board().fitAll();
  await boardResting();
  await zoomWithWheel(Clutter.ScrollDirection.UP, onScreen(windowNamed('Music')), ZOOM_STEPS);
  board().enterWindow(windowNamed('Notes'));
  await boardResting();
  await chord(Clutter.KEY_Super_L, Clutter.KEY_Right);
  await boardResting();
  await openFromCorner('Quick settings');
  await openFromCorner('Open Start');
  board().overview();
  await boardResting();
  fourFingerSwipe(60);
  await eventually(() => !board().shown, 'a four-finger swipe down leaves the board');
  await settled();
}

export async function run() {
  await openWindows();
  battery.pin(BATTERY);
  const bounds = new GlassBounds();
  try {
    await useBoard();
  } finally {
    bounds.stop();
    battery.pin(undefined);
    await leaveBoard();
  }
  require(!bounds.worst, `glass stays within ${STAGE_MULTIPLE} times the screen on a board with a battery${bounds.worst ? `, but ${bounds.worst.text}` : ''}`);
}
