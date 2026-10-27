import Clutter from 'gi://Clutter';
import type Meta from 'gi://Meta';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {checks} from '../lib/check.js';
import {chord, rest} from '../lib/input/input.js';
import {stopAll} from '../lib/processes.js';
import {capture, type Area} from '../lib/screenshots.js';
import {actorOf, area, focus, frame, near, openWindow, resetTiling, restingTiles, shownX, tiledTightly, useTiling} from './lib/tiling.js';

const {require, eventually} = checks('tiling monitors');
const SUPER = Clutter.KEY_Super_L;

const overlaps = (a: Area, b: Area) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

async function checkTiling(primary: number, secondary: number): Promise<[Meta.Window, Meta.Window]> {
  const {window: notes} = await openWindow('Notes');
  const {window: inbox} = await openWindow('Inbox');
  await eventually(() => tiledTightly([notes, inbox], area(primary)), 'windows tile on the display they open on');
  await focus(inbox);
  await chord(SUPER, Clutter.KEY_Shift_L, Clutter.KEY_Right);
  await eventually(() => inbox.get_monitor() === secondary && tiledTightly([inbox], area(secondary)), 'Super+Shift+Right at the edge moves the window to the next display');
  await eventually(() => tiledTightly([notes], area(primary)), 'the window left behind fills its display');
  await chord(SUPER, Clutter.KEY_Left);
  await eventually(() => notes.has_focus(), 'Super+Left crosses back to the other display');
  await restingTiles();
  await capture('tiling-monitors');
  return [notes, inbox];
}

async function checkScrolling(primary: number, secondary: number, [notes, inbox]: [Meta.Window, Meta.Window]) {
  useTiling('scrolling');
  await eventually(() => notes.get_monitor() === primary && inbox.get_monitor() === secondary && near(frame(inbox).x, area(secondary).x),
    'each display gets its own strip');
  await focus(inbox);
  await restingTiles();
  await chord(SUPER, Clutter.KEY_Shift_L, Clutter.KEY_Left);
  await eventually(() => inbox.get_monitor() === primary, 'Super+Shift+Left at the start of a strip moves the column to the next display');
  const {window: music} = await openWindow('Music');
  const columns = [notes, inbox, music];
  await focus(notes);
  await chord(SUPER, Clutter.KEY_r);
  await restingTiles();
  const other = Main.layoutManager.monitors[secondary];
  const bounds = area(primary);
  await eventually(() => columns.every(window => window.get_monitor() === primary && !overlaps(frame(window), other)),
    'columns that reach past the display edge never land on the next display');
  const peeks = (window: Meta.Window) => shownX(window) < bounds.x + bounds.width && shownX(window) + frame(window).width > bounds.x + bounds.width;
  await eventually(() => columns.some(window => peeks(window) && actorOf(window).has_clip), 'a column that peeks over the shared edge is cut off at the display edge');
  await capture('scrolling-monitors');
}

export async function run() {
  const monitors = Main.layoutManager.monitors;
  require(monitors.length === 2, 'the session has a second display');
  const primary = Main.layoutManager.primaryIndex;
  const secondary = monitors.findIndex(monitor => monitor.index !== primary);
  require(monitors[secondary].x >= monitors[primary].x + monitors[primary].width, 'the second display is to the right');
  useTiling('tiling');
  try {
    const windows = await checkTiling(primary, secondary);
    await checkScrolling(primary, secondary, windows);
  } finally {
    rest();
    await stopAll();
    resetTiling();
  }
}
