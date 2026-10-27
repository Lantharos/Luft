import type Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import St from 'gi://St';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {existing, named, ofType, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {centerOf, click, rest} from '../lib/input/input.js';
import {gjs, stopAll, waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {lock, unlock} from '../lockScreen/lib/shield.js';
import {fold} from '../tablet/lib/touch.js';
import {closeStart, rows, start} from '../start/search/results.js';

const {require, eventually} = checks('Hidden taskbar');
const shell = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const WINDOW = 'Lighthouse log';
const PAST_DOUBLE_TAP = 600;

const panel = () => named('kestrel-panel');
const corner = () => named('kestrel-status-corner');
const cornerStart = () => ofType(existing('kestrel-status-corner').get_first_child(), St.Button);
const taskbarStart = () => existing('Start', existing('kestrel-panel'));

function workAreaFillsTheScreen() {
  const monitor = Main.layoutManager.primaryMonitor!;
  const area = Main.layoutManager.getWorkAreaForMonitor(monitor.index);
  return area.height === monitor.height;
}

async function open(target: Clutter.Actor, surface: () => Clutter.Actor | null, label: string) {
  click(centerOf(target));
  const opened = await eventually(() => shown(surface()) && surface(), label);
  rest();
  await settled();
  return opened;
}

async function checkCorner() {
  shell.set_boolean('taskbar-shown', false);
  await eventually(() => !shown(panel()) && shown(corner()), 'hiding the taskbar leaves the clock and status in a corner');
  await eventually(workAreaFillsTheScreen, 'windows get the whole screen');
  await capture('taskbar-hidden');
  await open(existing('kestrel-corner-quick-settings'), () => named('kestrel-quick-settings'), 'the corner opens quick settings');
  await capture('taskbar-hidden-quick-settings');
  closeStart();
  await open(existing('kestrel-corner-clock'), () => named('kestrel-notifications'), 'the corner clock opens notifications');
  closeStart();
  const startMenu = await open(cornerStart(), start, 'the corner opens Start');
  const [, startTop] = startMenu.get_transformed_position();
  const [, cornerTop] = existing('kestrel-status-corner').get_transformed_position();
  require(startTop + startMenu.height <= cornerTop, 'Start stays clear of the corner');
  await capture('taskbar-hidden-start');
  closeStart();
}

async function checkStartButton() {
  shell.set_boolean('taskbar-start-button', false);
  await eventually(() => !cornerStart().visible, 'the Start button can be left out');
  global.display.emit('overlay-key');
  await eventually(() => shown(start()), 'Super still opens Start');
  closeStart();
  shell.set_boolean('taskbar-shown', true);
  await eventually(() => shown(panel()) && !shown(corner()), 'the taskbar comes back');
  require(!taskbarStart().visible, 'the taskbar leaves out the Start button too');
  shell.reset('taskbar-start-button');
  await eventually(() => taskbarStart().visible, 'and shows it again');
  shell.set_boolean('taskbar-shown', false);
  await eventually(() => shown(corner()), 'the corner is back');
}

async function checkWindowSwitching() {
  shell.set_string('start-style', 'palette');
  await eventually(() => !named('kestrel-start'), 'Gust replaces the Start menu');
  await pause(PAST_DOUBLE_TAP);
  global.display.emit('overlay-key');
  await eventually(() => shown(start()) && rows().some(actor => actor.name?.startsWith('kestrel-search-window:')), 'Gust lists the open windows before anything is typed');
  await capture('taskbar-hidden-gust');
  const window = ofType(rows().find(actor => actor.name?.startsWith('kestrel-search-window:')) ?? null, St.Button);
  click(centerOf(window));
  await eventually(() => global.display.focus_window?.get_title() === WINDOW, 'a window is switched to from Gust');
  rest();
  closeStart();
}

async function checkTablet() {
  shell.set_boolean('taskbar-start-button', false);
  await fold(true);
  await eventually(() => shown(panel()) && !shown(corner()), 'tablet mode brings the taskbar back');
  await eventually(() => taskbarStart().visible, 'with its Start button');
  await fold(false);
  await eventually(() => !shown(panel()) && shown(corner()), 'and the corner returns when unfolded');
  shell.reset('taskbar-start-button');
}

async function checkLocking() {
  await lock();
  await eventually(() => !shown(corner()), 'the lock screen hides the corner');
  await unlock();
  await eventually(() => shown(corner()), 'the corner is back after unlocking');
}

export async function run() {
  gjs('clients/windows/boardWindow.js', [WINDOW, '560', '360']);
  try {
    await waitForWindow(WINDOW);
    await checkCorner();
    await checkStartButton();
    await checkWindowSwitching();
    await checkTablet();
    await checkLocking();
  } finally {
    closeStart();
    for (const key of ['taskbar-shown', 'taskbar-start-button', 'start-style']) shell.reset(key);
    await stopAll();
  }
  await eventually(() => shown(panel()), 'the taskbar is back for the next checks');
}
