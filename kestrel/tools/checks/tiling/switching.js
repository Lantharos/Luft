import Clutter from 'gi://Clutter';
import {toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {chord, rest} from '../lib/input.js';
import {stopAll} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {pause} from '../lib/wait.js';
import {actorOf, area, edgeTiling, focus, frame, near, openWindow, resetTiling, restingTiles, sameRect, shownX, tiledTightly, useTiling} from './lib/tiling.js';

const {require, eventually} = checks('tiling modes');
const PLACES = [[60, 60, 560, 380], [420, 200, 620, 420], [800, 120, 520, 360]];
const SNAP_SETTLE = 300;

const tiled = window => window.unconstrained;
const untransformed = window => actorOf(window).translation_x === 0 && actorOf(window).translation_y === 0 && !actorOf(window).has_clip;

async function openFloating() {
  const windows = [];
  for (const [index, [x, y, width, height]] of PLACES.entries()) {
    const {window} = await openWindow(`Window ${index + 1}`, width, height);
    window.move_resize_frame(true, x, y, width, height);
    windows.push(window);
  }
  await eventually(() => windows.every((window, index) => sameRect(frame(window), {x: PLACES[index][0], y: PLACES[index][1], width: PLACES[index][2], height: PLACES[index][3]})),
    'windows float where they were put');
  await restingTiles();
  return windows.map(window => ({window, rect: frame(window)}));
}

async function snapLayoutsShown() {
  toggleSurface('snap');
  await pause(SNAP_SETTLE);
  const shown = !!named('kestrel-snap-layouts')?.visible;
  if (shown) toggleSurface('snap');
  return shown;
}

export async function run() {
  try {
    const placed = await openFloating();
    const windows = placed.map(({window}) => window);
    await focus(windows[0]);
    require(await snapLayoutsShown(), 'snap layouts are offered while windows float');

    useTiling('tiling');
    await eventually(() => windows.every(tiled) && tiledTightly(windows), 'turning tiling on tiles the open windows');
    require(!edgeTiling(), 'tiling turns off snapping windows to the screen edges');
    require(!await snapLayoutsShown(), 'snap layouts are not offered while tiling');
    await restingTiles();

    useTiling('scrolling');
    await eventually(() => windows.every(tiled) && windows.every(window => near(frame(window).height, area().height)) &&
      new Set(windows.map(shownX)).size === windows.length, 'switching to scrolling puts the windows side by side on a strip');
    await restingTiles();
    await capture('tiling-switch-scrolling');

    useTiling('tiling');
    await eventually(() => tiledTightly(windows) && windows.every(untransformed), 'switching back to tiling tiles them again without leftover offsets');
    await restingTiles();
    await focus(windows[1]);
    await chord(Clutter.KEY_Super_L, Clutter.KEY_f);
    await eventually(() => !tiled(windows[1]) && sameRect(frame(windows[1]), placed[1].rect), 'a window let float goes back to where it floated before tiling');
    windows[1].move_frame(true, 300, 260);
    await eventually(() => frame(windows[1]).x === 300, 'the floating window moves where it is put');
    const floated = frame(windows[1]);
    await restingTiles();

    useTiling('off');
    await eventually(() => edgeTiling() && windows.every(window => !tiled(window) && window.get_tiled_edges() === 0), 'turning tiling off lets every window float');
    await eventually(() => placed.every(({window, rect}, index) => index === 1 || sameRect(frame(window), rect)), 'tiled windows go back to where they floated before');
    require(sameRect(frame(windows[1]), floated), 'a window that already floated stays where it is');
    require(windows.every(untransformed), 'no window keeps an offset from the strip');
    await restingTiles();
    await focus(windows[0]);
    require(await snapLayoutsShown(), 'snap layouts are offered again');
    await capture('tiling-switch-off');

    useTiling('tiling');
    await eventually(() => tiled(windows[0]) && tiled(windows[2]) && !tiled(windows[1]), 'turning tiling on again keeps the window floated by hand floating');
    await restingTiles();
    await focus(windows[1]);
    await chord(Clutter.KEY_Super_L, Clutter.KEY_f);
    await eventually(() => windows.every(tiled), 'tiling the floating window again lets its app tile from now on');
  } finally {
    rest();
    await stopAll();
    resetTiling();
  }
}
