import type Meta from 'gi://Meta';
import {touchpad as handleTouchpad} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {touchpad} from '../board/lib/touchpad.js';
import {checks} from '../lib/check.js';
import {gjs, stopAll, waitForWindow} from '../lib/processes.js';
import type {Area} from '../lib/screenshots.js';
import {nextFrame} from '../lib/wait.js';
import {actorOf, area, focus, frame, openWindow, resetTiling, restingTiles, useTiling} from './lib/tiling.js';

const {require, eventually} = checks('scrolling motion');
const SWIPE_STEPS = 24;
const OVERLAP_TOLERANCE = 2;
// A spring may carry the swipe's momentum past its place and come back, but never leaps
const JUMP_LIMIT = 120;

// Where each window shows on screen, which can differ from its frame while the strip moves
function shown(window: Meta.Window): Area {
  const actor = actorOf(window);
  const [x, y] = actor.get_transformed_position();
  const buffer = window.get_buffer_rect();
  const rect = frame(window);
  return {x: x + rect.x - buffer.x, y: y + rect.y - buffer.y, width: rect.width, height: rect.height};
}

const onScreen = (rect: Area) => {
  const bounds = area();
  return rect.x < bounds.x + bounds.width && rect.x + rect.width > bounds.x && rect.y < bounds.y + bounds.height && rect.y + rect.height > bounds.y;
};

function overlapping(rects: Area[]) {
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      const [a, b] = [rects[i], rects[j]];
      const across = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
      const down = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      if (across > OVERLAP_TOLERANCE && down > OVERLAP_TOLERANCE) return [i, j];
    }
  }
  return null;
}

// Records every painted frame from the end of the swipe until the strip comes to rest
async function swipeAndRecord(windows: Meta.Window[], distance: number) {
  const [x, y] = [area().x + area().width / 2, area().y + area().height / 2];
  const frames: Area[][] = [];
  const record = () => frames.push(windows.map(shown));
  const painted = global.stage.connect('after-paint', record);
  try {
    handleTouchpad(touchpad.swipe('begin', 3, 0, 0, x, y));
    for (let step = 0; step < SWIPE_STEPS; step++) {
      handleTouchpad(touchpad.swipe('update', 3, distance / SWIPE_STEPS, 0, x, y));
      await nextFrame();
    }
    const released = frames.length;
    handleTouchpad(touchpad.swipe('end', 3, 0, 0, x, y));
    await restingTiles();
    return {frames, released};
  } finally {
    global.stage.disconnect(painted);
  }
}

export async function run() {
  // The glide only plays with animations, which sessions without a GPU turn off
  const forced = global.force_animations;
  global.force_animations = true;
  useTiling('scrolling');
  try {
    const windows: Meta.Window[] = [];
    // X11 windows move a round trip later than Wayland ones, so the column parked out of view is one
    gjs('clients/windows/boardWindow.js', ['Notes', '640', '420'], {env: {GDK_BACKEND: 'x11'}});
    windows.push(await waitForWindow(candidate => candidate.get_title()?.startsWith('Notes'), 'an X11 window opens'));
    await focus(windows[0]);
    for (const title of ['Inbox', 'Music']) {
      const {window} = await openWindow(title);
      windows.push(window);
      await focus(window);
    }
    const [first] = windows;
    await restingTiles();
    require(!onScreen(shown(first)), 'the first column starts out of view');

    const {frames, released} = await swipeAndRecord(windows, area().width * 0.6);
    await eventually(() => onScreen(shown(first)) && first.has_focus(), 'swiping to the column out of view brings it in and focuses it');

    const xs = frames.slice(released - 1).map(rects => rects[0].x);
    const jump = xs.findIndex((x, index) => index > 0 && Math.abs(x - xs[index - 1]) > JUMP_LIMIT);
    require(jump < 0, `the column glides to its place without jumping (frame ${jump}: ${xs.slice(Math.max(0, jump - 3), jump + 3).map(Math.round)})`);
    const bounds = area();
    require(Math.abs(shown(first).x - bounds.x) <= 2, `the strip comes to rest at its start, with no empty space before the first column (${Math.round(shown(first).x)})`);

    const overlap = frames.map((rects, index) => [index, overlapping(rects.filter(onScreen))]).find(([, pair]) => pair);
    require(!overlap, `no window shows on top of another while the strip moves (frame ${overlap?.[0]} of ${frames.length}, released at ${released})`);
  } finally {
    global.force_animations = forced;
    await stopAll();
    resetTiling();
  }
}
