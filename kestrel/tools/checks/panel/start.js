import Clutter from 'gi://Clutter';

import {named, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {moveTo, press, rest, rightClick, type} from '../lib/input.js';
import {capture, captureRenderedFrames} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';

const {require, eventually} = checks('Start');
const HOVERED = [[70, 160], [172, 250], [274, 340], [376, 160], [478, 250]];
const IDLE_SAMPLE = 1000;
const IDLE_FRAMES = 2;

async function countFrames(milliseconds) {
  let frames = 0;
  const signal = global.stage.connect('after-paint', () => frames++);
  await pause(milliseconds);
  global.stage.disconnect(signal);
  return frames;
}

async function checkOpening(start) {
  const entry = start.get_first_child();
  const hintPositions = new Set();
  const hintSignal = global.stage.connect('after-paint', () => {
    if (entry.mapped) hintPositions.add(entry.get_hint_actor().x);
  });
  global.display.emit('overlay-key');
  await eventually(() => start.visible, 'Super opens Start');
  await settled();
  global.stage.disconnect(hintSignal);
  require(hintPositions.size === 1, 'the search placeholder stays put while Start opens');
  await capture('start');

  const launcher = named('Start');
  const [launcherX, launcherY] = launcher.get_transformed_position();
  moveTo([launcherX + 20, launcherY + 20]);
  await eventually(() => launcher.hover, 'the Start button reacts to the pointer');
  await capture('launcher-hover');
  rest();
}

async function checkCaret() {
  const search = global.stage.get_key_focus();
  await eventually(() => search.cursor_visible === false, 'the search caret blinks', 2000);
  return search;
}

async function checkHover(start) {
  global.stage.set_key_focus(null);
  await captureRenderedFrames('start-hover', async () => {
    for (const [x, y] of HOVERED) {
      moveTo([start.x + x, start.y + y]);
      await settled();
    }
    rest();
    await settled();
  });
  require(await countFrames(IDLE_SAMPLE) <= IDLE_FRAMES, 'Start stops repainting once the pointer rests');
}

async function checkContextMenu(start) {
  type('files');
  await eventually(() => named('Rover', start)?.mapped, 'searching finds Rover');
  await capture('search');

  rightClick(named('Rover', start));
  const menu = named('kestrel-context-menu');
  await eventually(() => menu.visible, 'right-clicking an app opens its menu');
  const secondAction = styled('kestrel-context-action', menu)[1];
  const [actionX, actionY] = secondAction.get_transformed_position();
  moveTo([actionX + 20, actionY + secondAction.height / 2]);
  await eventually(() => global.stage.get_key_focus() === secondAction, 'menu focus follows the pointer');
  await capture('app-context-menu');
  press(Clutter.KEY_Escape);
  await eventually(() => !menu.visible && start.visible, 'Escape closes the menu and keeps Start open');
  press(Clutter.KEY_Menu);
  await eventually(() => menu.visible, 'the Menu key opens the app menu');
  press(Clutter.KEY_Escape);
  await eventually(() => !menu.visible, 'Escape closes the keyboard menu');
}

export async function run() {
  await capture('panel');
  const start = named('kestrel-start');
  await checkOpening(start);
  const search = await checkCaret();
  await checkHover(start);
  global.stage.set_key_focus(search);
  await checkContextMenu(start);
}
