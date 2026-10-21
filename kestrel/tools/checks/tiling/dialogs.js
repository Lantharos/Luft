import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import {checks} from '../lib/check.js';
import {chord, rest} from '../lib/input.js';
import {gjs, stop, stopAll, waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {focus, frame, near, openWindow, resetTiling, restingTiles, stateFile, tiledTightly, useTiling} from './lib/tiling.js';

const {require, eventually} = checks('tiling dialogs');
const APP = 'com.lantharos.Kestrel.TilingWindows';

const tiled = window => window.unconstrained;
const above = (a, b) => {
  const order = global.display.sort_windows_by_stacking([a, b]);
  return order.indexOf(a) > order.indexOf(b);
};

function remembered() {
  try {
    const [, contents] = GLib.file_get_contents(stateFile());
    return JSON.parse(new TextDecoder().decode(contents)).floating.includes(APP);
  } catch {
    return false;
  }
}

async function checkDialogs(notes) {
  const client = gjs('clients/tilingWindows.js', ['--dialog', '--fixed']);
  const [main, dialog, fixed] = await Promise.all(['Tiling main', 'Tiling dialog', 'Tiling fixed'].map(title => waitForWindow(title)));
  await eventually(() => tiled(main) && tiledTightly([notes, main]), 'the app window tiles next to the open window');
  require(!tiled(dialog) && !tiled(fixed), 'the dialog and the fixed-size window float');
  require(near(frame(fixed).width, 320, 2) && near(frame(fixed).height, 240, 2), 'the fixed-size window keeps its size');
  await restingTiles();
  await eventually(() => near(frame(dialog).x + frame(dialog).width / 2, frame(main).x + frame(main).width / 2, 2),
    'the dialog stays centered over its window');
  await capture('tiling-dialogs');
  await focus(notes);
  await eventually(() => above(fixed, notes), 'floating windows stay above tiled ones');
  await stop(client);
}

async function checkRemembered(notes) {
  let client = gjs('clients/tilingWindows.js');
  let main = await waitForWindow('Tiling main');
  await eventually(() => tiled(main) && tiledTightly([notes, main]), 'a plain app window tiles');
  await focus(main);
  await chord(Clutter.KEY_Super_L, Clutter.KEY_f);
  await eventually(() => !tiled(main) && remembered(), 'floating it is remembered for the app');
  await stop(client);

  client = gjs('clients/tilingWindows.js');
  main = await waitForWindow('Tiling main');
  await restingTiles();
  require(!tiled(main) && tiledTightly([notes]), 'the app opens floating the next time');
  await focus(main);
  await chord(Clutter.KEY_Super_L, Clutter.KEY_f);
  await eventually(() => tiled(main) && !remembered(), 'tiling it again forgets that it floats');
  await stop(client);
}

export async function run() {
  useTiling('tiling');
  try {
    const {window: notes} = await openWindow('Notes');
    await checkDialogs(notes);
    await checkRemembered(notes);
  } finally {
    rest();
    await stopAll();
    resetTiling();
  }
}
