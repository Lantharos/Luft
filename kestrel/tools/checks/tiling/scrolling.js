import Clutter from 'gi://Clutter';
import {touchpad as handleTouchpad} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {touchpad} from '../board/lib/touchpad.js';
import {named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {chord, rest} from '../lib/input/input.js';
import {stopAll} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {nextFrame} from '../lib/wait.js';
import {actorOf, area, focus, frame, gap, near, openWindow, resetTiling, restingTiles, shownX, useTiling} from './lib/tiling.js';

const {require, eventually} = checks('scrolling');
const SUPER = Clutter.KEY_Super_L;
const SWIPE_STEPS = 24;

const columnWidth = share => Math.round(share * (Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryIndex).width - gap())) - gap();
const visible = window => {
  const bounds = area();
  return shownX(window) >= bounds.x - 1 && shownX(window) + frame(window).width <= bounds.x + bounds.width + 1;
};

async function openColumns() {
  const windows = [];
  for (const title of ['Notes', 'Inbox', 'Music']) {
    const {window} = await openWindow(title);
    windows.push(window);
    await eventually(() => window.has_focus() || focus(window), `${title} opens`);
    await focus(window);
  }
  const [first, second, third] = windows;
  await eventually(() => windows.every(window => near(frame(window).width, columnWidth(1 / 2), 2)), 'new windows open as half-width columns');
  await eventually(() => visible(third) && visible(second) && !visible(first), 'the strip scrolls to show the newest column on the right');
  require(shownX(second) < shownX(third) && shownX(first) < shownX(second), 'each window opens as a column to the right of the focused one');
  require(frame(first).y + frame(first).height <= area().y, 'a column scrolled out of view is parked above its display');
  await restingTiles();
  await capture('scrolling-columns');
  return windows;
}

async function checkFocus([first, second, third]) {
  await chord(SUPER, Clutter.KEY_Left);
  await eventually(() => second.has_focus() && visible(second) && visible(third), 'Super+Left focuses the column on the left without scrolling while it is visible');
  await chord(SUPER, Clutter.KEY_Left);
  await eventually(() => first.has_focus() && visible(first) && near(shownX(first), area().x), 'focusing a hidden column scrolls it into view');
  await restingTiles();
  await chord(SUPER, Clutter.KEY_r);
  await eventually(() => near(frame(first).width, columnWidth(2 / 3), 2), 'Super+R widens the column to two thirds');
  await chord(SUPER, Clutter.KEY_r);
  await eventually(() => near(frame(first).width, columnWidth(1), 2), 'Super+R again makes it full width');
  await chord(SUPER, Clutter.KEY_r);
  await eventually(() => near(frame(first).width, columnWidth(1 / 3), 2), 'Super+R wraps around to a third');
  await chord(SUPER, Clutter.KEY_c);
  await restingTiles();
  const bounds = area();
  await eventually(() => near(shownX(first) + frame(first).width / 2, bounds.x + bounds.width / 2, 2), 'Super+C centers the focused column');
  await chord(SUPER, Clutter.KEY_Shift_L, Clutter.KEY_Right);
  await eventually(() => shownX(first) > shownX(second), 'Super+Shift+Right moves the column to the right');
  await chord(SUPER, Clutter.KEY_Shift_L, Clutter.KEY_Left);
  await eventually(() => shownX(first) < shownX(second), 'Super+Shift+Left moves it back');
  await restingTiles();
}

async function checkStacking([first, second, third]) {
  await focus(second);
  await chord(SUPER, Clutter.KEY_Control_L, Clutter.KEY_Shift_L, Clutter.KEY_Left);
  await eventually(() => near(frame(second).x, frame(first).x) && frame(second).y > frame(first).y && near(frame(first).height, frame(second).height, 2),
    'Super+Ctrl+Shift+Left stacks the window into the column on its left');
  await restingTiles();
  await capture('scrolling-stacked');
  await chord(SUPER, Clutter.KEY_Up);
  await eventually(() => first.has_focus(), 'Super+Up focuses the window above in the column');
  await focus(second);
  await chord(SUPER, Clutter.KEY_Control_L, Clutter.KEY_Shift_L, Clutter.KEY_Right);
  await eventually(() => frame(second).x > frame(first).x && near(frame(second).height, frame(third).height), 'Super+Ctrl+Shift+Right takes it out into its own column again');
  await restingTiles();
}

async function swipe(distance) {
  const [x, y] = [area().x + area().width / 2, area().y + area().height / 2];
  handleTouchpad(touchpad.swipe('begin', 3, 0, 0, x, y));
  for (let step = 0; step < SWIPE_STEPS; step++) {
    handleTouchpad(touchpad.swipe('update', 3, distance / SWIPE_STEPS, 0, x, y));
    await nextFrame();
  }
  handleTouchpad(touchpad.swipe('end', 3, 0, 0, x, y));
}

async function checkSwipe([first, , third]) {
  await focus(first);
  await restingTiles();
  await swipe(-area().width);
  await eventually(() => visible(third) && !visible(first), 'a three-finger swipe scrolls the strip');
  await eventually(() => !first.has_focus(), 'the column the swipe lands on takes focus');
  await restingTiles();
  await swipe(area().width);
  await eventually(() => visible(first), 'swiping back scrolls to the start of the strip');
  await restingTiles();
}

async function checkOverview(windows) {
  await chord(SUPER, Clutter.KEY_w);
  await eventually(() => named('kestrel-strip-overview') && windows.every(window => actorOf(window).scale_x < 0.99), 'Super+W zooms out to the whole strip');
  await restingTiles();
  const bounds = area();
  require(windows.every(window => {
    const [x] = actorOf(window).get_transformed_position();
    return x >= bounds.x - 1 && x + actorOf(window).width * actorOf(window).scale_x <= bounds.x + bounds.width + 1;
  }), 'every column fits on the screen in the overview');
  await capture('scrolling-overview');
  await chord(SUPER, Clutter.KEY_w);
  await eventually(() => !named('kestrel-strip-overview') && windows.every(window => near(actorOf(window).scale_x, 1, 0.001)), 'Super+W again zooms back in');
  await restingTiles();
}

async function checkAtEnd([first, , third]) {
  useTiling('scrolling', {'tiling-new-windows': 'at-end'});
  await focus(first);
  const {window: last} = await openWindow('Files');
  await eventually(() => shownX(last) > shownX(third) && visible(last), 'with new windows at the end, a new column opens after the last one');
}

export async function run() {
  useTiling('scrolling');
  try {
    const windows = await openColumns();
    await checkFocus(windows);
    await checkStacking(windows);
    await checkSwipe(windows);
    await checkOverview(windows);
    await checkAtEnd(windows);
  } finally {
    rest();
    await stopAll();
    resetTiling();
  }
}
