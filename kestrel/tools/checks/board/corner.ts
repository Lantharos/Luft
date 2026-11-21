import Clutter from 'gi://Clutter';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {click, press} from '../lib/input/input.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {board, boardResting, boardWindows, doubleTapSuper, leaveBoard, openWindows, sameView, showBoard, view, windowNamed} from './lib/board.js';

const {require, eventually} = checks('board');
const EDGE_MARGIN = 12;
const SURFACE_GAP = 10;
const DOUBLE_TAP_TIME = 250;

function gustInCorner(gust: Clutter.Actor, corner: Clutter.Actor) {
  const monitor = Main.layoutManager.primaryMonitor!;
  const [, cornerY] = corner.get_transformed_position();
  return gust.visible && gust.translation_y === 0 &&
    Math.round(gust.x + gust.width) === monitor.x + monitor.width - EDGE_MARGIN &&
    Math.round(gust.y + gust.height) === Math.round(cornerY) - SURFACE_GAP;
}

async function checkGust(gust: Clutter.Actor, corner: Clutter.Actor, dock: Clutter.Actor) {
  click(named('Open Gust', dock)!);
  await eventually(() => gustInCorner(gust, corner), 'the Gust button in the corner opens Gust right above it');
  await capture('board-gust');
  press(Clutter.KEY_Escape);
  await eventually(() => !gust.visible, 'Escape closes Gust on the board');

  global.display.emit('overlay-key');
  await eventually(() => gustInCorner(gust, corner), 'pressing Super once on a board opens Gust in the corner');
  press(Clutter.KEY_Escape);
  await eventually(() => !gust.visible, 'Escape closes Gust again');
  await pause(DOUBLE_TAP_TIME);
}

async function checkApps(dock: Clutter.Actor) {
  const tracker = Shell.WindowTracker.get_default();
  const files = windowNamed('Files');
  const appOf = (window: Meta.Window) => tracker.get_window_app(window).id;
  const ordered = [...new Set(boardWindows().sort((a, b) => a.get_stable_sequence() - b.get_stable_sequence()).map(appOf))];
  const filesButton = () => dock.get_child_at_index(1)!.get_child_at_index(ordered.indexOf(appOf(files)))!;
  click(filesButton());
  await eventually(() => board().enteredWindow() === files && global.display.focus_window === files, 'an app in the corner enters its window');
  await boardResting();
  await capture('board-corner');
  click(filesButton());
  await eventually(() => !board().enteredWindow(), 'choosing the app of the entered window again steps back out');
  await boardResting();
}

async function checkLeaving(gust: Clutter.Actor) {
  const shown = view();
  doubleTapSuper();
  await eventually(() => !board().shown, 'pressing Super twice still leaves the board');
  await settled();
  require(!gust.visible, 'leaving the board leaves Gust closed');
  doubleTapSuper();
  await eventually(() => board().shown && sameView(view(), shown), 'and pressing it twice again comes back to the same view');
}

export async function run() {
  await openWindows();
  try {
    await showBoard();
    board().fitAll();
    await boardResting();
    const corner = named('kestrel-board-corner')!;
    const gust = named('kestrel-gust-panel')!;
    require(corner.visible, 'the corner shows Gust, this desktop\'s apps and the status pill on a board');
    const tracker = Shell.WindowTracker.get_default();
    const apps = new Set(boardWindows().map(window => tracker.get_window_app(window)));
    const dock = named('kestrel-board-dock', corner)!;
    require(dock.get_child_at_index(1)!.get_n_children() === apps.size, `the corner lists the ${apps.size} apps open on this desktop`);
    await checkGust(gust, corner, dock);
    await checkApps(dock);
    await checkLeaving(gust);
  } finally {
    await leaveBoard();
  }
}
