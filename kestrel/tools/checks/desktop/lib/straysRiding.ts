import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';

import {checks} from '../../lib/check.js';
import {chord, drag, moveTo, press, pressButton, releaseButton, rest, type Point} from '../../lib/input/input.js';
import {fixture, spawn, stopAll, waitForWindow} from '../../lib/processes.js';
import {nextFrame, pause} from '../../lib/wait.js';
import {resetTiling, restingTiles, useTiling} from '../../tiling/lib/tiling.js';
import {atRest, foot, middle, mood, near, report, sprite, surfaceTop, taskbarTop, withRandom} from './strays.js';

const {require, eventually} = checks('strays riding');
const TITLEBAR_MIDDLE = 20;
const GRIP_SHARE = 0.25;
const EDGE_GRIP = 8;
const STAYS_ON = 4;
const JITTER = 1;
const SMOOTH_SHARE = 0.6;

interface Ride {
  /** How far the sprite strayed from where it sat on the window, over every painted frame. */
  drift: number;
  fell: boolean;
  frames: number;
  /** The most the sprite moved in one frame, against how far it went in all. */
  longestStep: number;
  distance: number;
}

const actorOf = (window: Meta.Window) => window.get_compositor_private<Meta.WindowActor>();

async function openDecorated(title: string, color: string, x: number, y: number) {
  spawn(['python3', fixture('clients', 'wayland', 'decorationClient.py'), 'server', title, color]);
  const window = await waitForWindow(title, `${title} opens`);
  window.move_frame(true, x, y);
  await pause(400);
  return window;
}

function titlebarOf(window: Meta.Window, x = 100): Point {
  const frame = window.get_frame_rect();
  return [frame.x + x, frame.y + TITLEBAR_MIDDLE];
}

const onWindow = (window: Meta.Window) => {
  const {x, width} = window.get_frame_rect();
  return near(foot(), surfaceTop(window), STAYS_ON) && middle() >= x - STAYS_ON && middle() <= x + width + STAYS_ON;
};

async function dropOnto(window: Meta.Window) {
  if (onWindow(window) && atRest()) return;
  await eventually(() => !/walking|jumping|falling|climbing/.test(mood()), 'the stray can be picked up', 8000);
  const {x, y, width} = window.get_frame_rect();
  const [middleX, grip] = [x + width / 2, foot() - sprite().height * GRIP_SHARE];
  await drag([middle(), grip], [middleX, y - sprite().height], {steps: 14, hover: 80});
  await eventually(() => onWindow(window), 'dropped by hand, it lands on the window', 5000);
  await eventually(atRest, 'and settles there', 8000);
}

/** Follows the stray over every painted frame of `action` against where the window shows. */
async function watch(window: Meta.Window, action: () => Promise<void>): Promise<Ride> {
  const shownLeft = () => {
    const actor = actorOf(window);
    const frame = window.get_frame_rect();
    const buffer = window.get_buffer_rect();
    return actor.get_transformed_position()[0] + (frame.x - buffer.x) * actor.scale_x;
  };
  const startOffset = middle() - shownLeft();
  const ride: Ride = {drift: 0, fell: false, frames: 0, longestStep: 0, distance: 0};
  let last: Point = [middle(), foot()];
  const painted = global.stage.connect('after-paint', () => {
    ride.frames++;
    ride.fell ||= /falling/.test(mood());
    if (actorOf(window).opacity === 255 && !actorOf(window).get_transition('scale-x')) ride.drift = Math.max(ride.drift, Math.abs(middle() - shownLeft() - startOffset));
    const step = Math.hypot(middle() - last[0], foot() - last[1]);
    ride.longestStep = Math.max(ride.longestStep, step);
    ride.distance += step;
    last = [middle(), foot()];
  });
  await action();
  await nextFrame();
  global.stage.disconnect(painted);
  return ride;
}

async function dragTitlebar(window: Meta.Window, to: Point, steps: number) {
  const from = titlebarOf(window);
  await drag(from, [to[0] + from[0] - window.get_frame_rect().x, to[1] + from[1] - window.get_frame_rect().y], {steps});
  await pause(150);
}

async function moveByKeyboard(window: Meta.Window, key: number, presses: number) {
  const sprite = global.stage.get_context().get_backend().get_pointer_sprite(global.stage);
  window.begin_grab_op(Meta.GrabOp.KEYBOARD_MOVING, sprite, global.get_current_time(), null);
  await nextFrame();
  for (let time = 0; time < presses; time++) {
    press(key);
    await nextFrame();
  }
  press(Clutter.KEY_Return);
  await pause(200);
}

async function doubleClickTitlebar(window: Meta.Window) {
  moveTo(titlebarOf(window));
  await pause(80);
  for (let click = 0; click < 2; click++) {
    pressButton();
    releaseButton();
    await pause(60);
  }
}

export async function checkRiding() {
  const front = await openDecorated('Under a rider', '6b8f71', 240, 340);
  const behind = await openDecorated('In the way', '2e3a46', 760, 120);
  front.activate(global.get_current_time());
  await pause(300);
  const problems: string[] = [];

  const scenario = async (name: string, action: () => Promise<void>, settled = () => onWindow(front), tracksEveryFrame = true) => {
    await dropOnto(front);
    const ride = await watch(front, action);
    await pause(300);
    report(`riding, ${name}`, ride);
    if (ride.fell) problems.push(`${name}: it fell`);
    if (!settled()) problems.push(`${name}: it isn't on the window (feet at ${foot()}, window top at ${surfaceTop(front)})`);
    if (tracksEveryFrame && ride.drift > JITTER) problems.push(`${name}: it drifted ${ride.drift} px from the window`);
    if (!tracksEveryFrame && ride.longestStep > ride.distance * SMOOTH_SHARE) problems.push(`${name}: it jumped ${ride.longestStep} px of ${ride.distance}`);
  };

  await withRandom(0.99, async () => {
    await scenario('a slow drag by the title bar, across another window', () => dragTitlebar(front, [700, 300], 40));
    await scenario('a fast drag by the title bar', () => dragTitlebar(front, [200, 420], 3));
    await scenario('with another window raised over it and back', async () => {
      behind.activate(global.get_current_time());
      await pause(300);
      front.activate(global.get_current_time());
      await pause(300);
    });
    await scenario('moved by keyboard', () => moveByKeyboard(front, Clutter.KEY_Right, 12));
    await scenario('dragged right up to the top of the screen', async () => {
      await dragTitlebar(front, [320, 2], 20);
      await dragTitlebar(front, [320, 360], 20);
    });
    await scenario('maximized by the title bar and restored', async () => {
      await doubleClickTitlebar(front);
      await eventually(() => front.is_maximized(), 'double-clicking maximizes it');
      await pause(700);
      await doubleClickTitlebar(front);
      await eventually(() => !front.is_maximized(), 'double-clicking restores it');
      await pause(700);
    }, () => onWindow(front), false);
    await scenario('snapped to the side and back', async () => {
      await chord(Clutter.KEY_Super_L, Clutter.KEY_Left);
      await pause(700);
      await chord(Clutter.KEY_Super_L, Clutter.KEY_Down);
      await pause(700);
    }, () => onWindow(front), false);
    await scenario('tiled with another window', async () => {
      useTiling('tiling');
      await restingTiles();
      await pause(400);
      resetTiling();
      await restingTiles();
      await pause(400);
    }, () => onWindow(front), false);
  });

  behind.delete(global.get_current_time());
  await dropOnto(front);
  await withRandom(0.99, async () => {
    const edge = titlebarOf(front, EDGE_GRIP);
    await drag(edge, [global.stage.width - 1, edge[1]], {steps: 24});
    await eventually(() => near(foot(), taskbarTop()), 'pushed off the side of the screen, it falls', 6000);
  });
  await stopAll();
  rest();
  require(!problems.length, `a stray on a window stays on it:\n  ${problems.join('\n  ')}`);
}
