import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {click, press} from '../lib/input.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {board, boardResting, boardWindows, doubleTapSuper, leaveBoard, openWindows, sameView, showBoard, view, windowNamed} from './lib/board.js';

const {require, eventually} = checks('board');
const EDGE_MARGIN = 12;
const SURFACE_GAP = 10;
const DOUBLE_TAP_TIME = 250;

function startInCorner(start, corner) {
  const monitor = Main.layoutManager.primaryMonitor;
  const [, cornerY] = corner.get_transformed_position();
  return start.visible && start.translation_y === 0 &&
    Math.round(start.x + start.width) === monitor.x + monitor.width - EDGE_MARGIN &&
    Math.round(start.y + start.height) === Math.round(cornerY) - SURFACE_GAP;
}

async function checkStart(start, corner, dock) {
  click(named('Open Start', dock));
  await eventually(() => startInCorner(start, corner), 'the Start button in the corner opens Start right above it');
  await capture('board-start');
  press(Clutter.KEY_Escape);
  await eventually(() => !start.visible, 'Escape closes Start on the board');

  global.display.emit('overlay-key');
  await eventually(() => startInCorner(start, corner), 'pressing Super once on a board opens Start in the corner');
  press(Clutter.KEY_Escape);
  await eventually(() => !start.visible, 'Escape closes Start again');
  await pause(DOUBLE_TAP_TIME);
}

async function checkApps(dock) {
  const tracker = Shell.WindowTracker.get_default();
  const files = windowNamed('Files');
  const appOf = window => tracker.get_window_app(window).id;
  const ordered = [...new Set(boardWindows().sort((a, b) => a.get_stable_sequence() - b.get_stable_sequence()).map(appOf))];
  const filesButton = () => dock.get_child_at_index(1).get_child_at_index(ordered.indexOf(appOf(files)));
  click(filesButton());
  await eventually(() => board().enteredWindow() === files && global.display.focus_window === files, 'an app in the corner enters its window');
  await boardResting();
  await capture('board-corner');
  click(filesButton());
  await eventually(() => !board().enteredWindow(), 'choosing the app of the entered window again steps back out');
  await boardResting();
}

async function checkLeaving(start) {
  const shown = view();
  doubleTapSuper();
  await eventually(() => !board().shown, 'pressing Super twice still leaves the board');
  await settled();
  require(!start.visible, 'leaving the board leaves Start closed');
  doubleTapSuper();
  await eventually(() => board().shown && sameView(view(), shown), 'and pressing it twice again comes back to the same view');
}

export async function run() {
  await openWindows();
  try {
    await showBoard();
    board().fitAll();
    await boardResting();
    const corner = named('kestrel-board-corner');
    const start = named('kestrel-start');
    require(corner.visible, 'the corner shows Start, this desktop\'s apps and the status pill on a board');
    const tracker = Shell.WindowTracker.get_default();
    const apps = new Set(boardWindows().map(window => tracker.get_window_app(window)));
    const dock = named('kestrel-board-dock', corner);
    require(dock.get_child_at_index(1).get_n_children() === apps.size, `the corner lists the ${apps.size} apps open on this desktop`);
    await checkStart(start, corner, dock);
    await checkApps(dock);
    await checkLeaving(start);
  } finally {
    await leaveBoard();
  }
}
