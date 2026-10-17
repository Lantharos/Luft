import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import {dismissImmediately, switchWorkspace, toggleSurface, touchpad as handleTouchpad} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {leaveBoard, openBoardWindow, openWindows, showBoard} from '../checks/board/lib/board.js';
import {touchpad} from '../checks/board/lib/touchpad.js';
import {chord, rest} from '../checks/lib/input.js';
import {stop, stopAll, waitForWindow} from '../checks/lib/processes.js';
import {nextFrame, pause, settled} from '../checks/lib/wait.js';

const SURFACES = ['start', 'quick', 'notifications', 'emoji', 'snap', 'tasks'];
const a11y = new Gio.Settings({schema_id: 'org.gnome.desktop.a11y.interface'});

async function reset() {
  dismissImmediately();
  rest();
  await settled();
}

const toggledTwice = (surface, delay) => async () => {
  toggleSurface(surface);
  await pause(delay);
  toggleSurface(surface);
};

async function surfaces(clip, suffix = '') {
  const window = openBoardWindow('Clip', '800', '500');
  await waitForWindow(w => w.get_title()?.startsWith('Clip'), 'a window opens for Snap Layouts');
  for (const surface of SURFACES) {
    await reset();
    await clip(`${surface}-open${suffix}`, () => toggleSurface(surface));
    await clip(`${surface}-close${suffix}`, () => toggleSurface(surface));
  }
  for (const surface of ['start', 'quick', 'tasks']) {
    await reset();
    await clip(`${surface}-open-then-close-80ms${suffix}`, toggledTwice(surface, 80), {notes: 'Closed 80 ms into opening'});
    await reset();
    toggleSurface(surface);
    await settled();
    await clip(`${surface}-close-then-reopen-60ms${suffix}`, toggledTwice(surface, 60), {notes: 'Opened again 60 ms into closing'});
  }
  await reset();
  await clip(`start-to-quick-switch${suffix}`, async () => {
    toggleSurface('start');
    await pause(400);
    toggleSurface('quick');
  }, {notes: 'Quick settings opened while Start is showing'});
  await reset();
  await stop(window);
}

async function windows(clip, suffix = '') {
  await reset();
  const client = openBoardWindow('Clip', '800', '500');
  const window = await waitForWindow(w => w.get_title()?.startsWith('Clip'), 'the clip window opens');
  await settled();
  await clip(`window-minimize${suffix}`, () => window.minimize());
  await clip(`window-unminimize${suffix}`, () => window.unminimize());
  await clip(`window-minimize-then-restore-80ms${suffix}`, async () => {
    window.minimize();
    await pause(80);
    window.unminimize();
  }, {notes: 'Restored 80 ms into minimising'});
  window.activate(global.get_current_time());
  await settled();
  const second = openBoardWindow('Second', '700', '460');
  await waitForWindow(w => w.get_title()?.startsWith('Second'), 'the second window opens');
  await settled();
  await clip(`workspace-switch-forward${suffix}`, () => switchWorkspace(1));
  await clip(`workspace-switch-back${suffix}`, () => switchWorkspace(0));
  await clip(`workspace-switch-interrupted${suffix}`, async () => {
    switchWorkspace(1);
    await pause(80);
    switchWorkspace(0);
  }, {notes: 'Switched back 80 ms into a workspace switch'});
  await clip(`workspace-switch-chained${suffix}`, async () => {
    switchWorkspace(1);
    await pause(80);
    switchWorkspace(2);
  }, {notes: 'Switched on to the third workspace 80 ms into a switch to the second'});
  switchWorkspace(0);
  await settled();
  await stop(second);
  await stop(client);
  await reset();
}

async function board(clip) {
  await reset();
  await openWindows();
  await settled();
  await clip('board-enter', () => showBoard(), {timeout: 8000});
  await clip('board-leave', () => leaveBoard(), {timeout: 8000});
  await stopAll();
  await reset();
}

const FINGER_STEP = 24;

async function fourFingers(...moves) {
  handleTouchpad(touchpad.swipe('begin', 4));
  for (const [direction, frames] of moves) {
    for (let i = 0; i < frames; i++) {
      handleTouchpad(touchpad.swipe('update', 4, 0, direction * FINGER_STEP));
      await nextFrame();
    }
  }
  handleTouchpad(touchpad.swipe('end', 4));
}

async function gestures(clip) {
  await reset();
  await openWindows();
  await settled();
  await clip('board-enter-fingers', () => fourFingers([-1, 20]), {timeout: 8000, notes: 'Four fingers up'});
  await clip('board-leave-fingers', () => fourFingers([1, 20]), {timeout: 8000, notes: 'Four fingers down'});
  await showBoard();
  await clip('board-leave-fingers-reversed', () => fourFingers([1, 20], [-1, 20]),
    {timeout: 8000, notes: 'Four fingers down, then back up before letting go'});
  await leaveBoard();
  await clip('tasks-open-fingers', () => fourFingers([1, 20]), {notes: 'Four fingers down'});
  await clip('tasks-close-fingers', () => fourFingers([-1, 20]), {notes: 'Four fingers up'});
  await stopAll();
  await reset();
}

async function reduced(clip) {
  a11y.set_string('reduced-motion', 'reduce');
  try {
    await surfaces(clip, '-reduced');
    await windows(clip, '-reduced');
  } finally {
    a11y.reset('reduced-motion');
  }
}

async function keyboardSnap(clip) {
  await reset();
  const client = openBoardWindow('Clip', '800', '500');
  const window = await waitForWindow(w => w.get_title()?.startsWith('Clip'), 'the clip window opens');
  await settled();
  window.activate(global.get_current_time());
  await clip('window-snap-left', () => chord(Clutter.KEY_Super_L, Clutter.KEY_Left));
  await clip('window-snap-restore', () => chord(Clutter.KEY_Super_L, Clutter.KEY_Down));
  await stop(client);
  await reset();
}

export const groups = {surfaces, windows, board, gestures, reduced, snap: keyboardSnap};
