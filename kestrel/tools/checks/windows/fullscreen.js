import Clutter from 'gi://Clutter';

import {named, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {chord, drag, press} from '../lib/input.js';
import {gjs, stop, waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {pause} from '../lib/wait.js';

const {require, eventually} = checks('fullscreen');
const STAY = 2500;

async function staysShown(actor, label) {
  let hidden = 0;
  const id = global.stage.connect_after('after-paint', () => {
    if (!shown(actor)) hidden++;
  });
  await pause(STAY);
  global.stage.disconnect(id);
  require(hidden === 0, label);
}

async function checkStart(game, panel) {
  const start = named('kestrel-start');
  press(Clutter.KEY_Super_L);
  await eventually(() => shown(start), 'Super opens Start over a fullscreen game');
  await staysShown(start, 'Start stays open over a fullscreen game');
  require(game.is_fullscreen() && global.display.focus_window === game && !panel.visible,
    'the game stays fullscreen and focused, and the taskbar stays hidden, while Start is open');
  await capture(`fullscreen-start-${game.title.split(' ').pop()}`);
  press(Clutter.KEY_Escape);
  await eventually(() => !start.visible, 'Escape closes Start over a fullscreen game');
}

async function checkTaskView(game) {
  const view = named('kestrel-task-view');
  const cards = () => view.get_first_child().get_children();
  const desktops = () => view.get_last_child().get_children();
  await chord(Clutter.KEY_Super_L, Clutter.KEY_Tab);
  await eventually(() => shown(view) && cards().length === 1, 'Super+Tab opens the task view over a fullscreen game');
  await staysShown(view, 'the task view stays open over a fullscreen game');
  await capture(`fullscreen-task-view-${game.title.split(' ').pop()}`);
  await drag(cards()[0], desktops()[1], {steps: 16});
  await eventually(() => game.get_workspace().index() === 1 && shown(view) && cards().length === 0,
    'dragging a fullscreen game onto another desktop moves it there');
  press(Clutter.KEY_Escape);
  await eventually(() => !view.visible, 'Escape closes the task view');
}

async function checkGame(backend, panel) {
  const process = gjs('clients/game.js', [], {env: {GDK_BACKEND: backend}});
  const game = await waitForWindow(`Kestrel game ${backend}`);
  await eventually(() => game.is_fullscreen() && global.display.focus_window === game, `a ${backend} game goes fullscreen with focus`);
  await eventually(() => !panel.visible, `a fullscreen ${backend} game hides the taskbar`);
  await checkStart(game, panel);
  await checkTaskView(game);
  await stop(process);
  global.workspace_manager.get_workspace_by_index(0).activate(global.get_current_time());
}

export async function run() {
  const panel = named('kestrel-panel');
  await checkGame('wayland', panel);
  await checkGame('x11', panel);
}
