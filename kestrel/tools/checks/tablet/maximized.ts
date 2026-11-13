import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import type Meta from 'gi://Meta';
import {Main, toggleSurface} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {checks} from '../lib/check.js';
import {moveTo, type Point} from '../lib/input/input.js';
import {gjs, stop, waitForWindows} from '../lib/processes.js';
import {pause, settled, waitUntil} from '../lib/wait.js';
import {inside, monitor, pressesStayWith} from './lib/presses.js';
import {fold, plugInTouchscreen} from './lib/touch.js';

const {require, eventually} = checks('maximized');
const SURFACE_SETTLES = 600;
const SURFACES = ['start', 'quick', 'notifications', 'tasks'] as const;

const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const workArea = () => Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryMonitor!.index);

function spots(window: Meta.Window): [string, Point][] {
  const {width, height} = window.get_frame_rect();
  return [
    ['in the middle', inside(window, [width / 2, height / 2])],
    ['in the title bar area', inside(window, [width / 2, 20])],
    ['near the left edge', inside(window, [2, height / 2])],
    ['near the right edge', inside(window, [width - 3, height / 2])],
    ['near the top edge', inside(window, [width / 3, 2])],
    ['just above the taskbar', inside(window, [width / 3, height - 2])],
  ];
}

async function maximizedInFront(front: Meta.Window, condition: string) {
  front.maximize();
  front.activate(global.get_current_time());
  await eventually(() => front.maximized_horizontally && front.maximized_vertically && global.display.focus_window === front,
    `the front window is maximized with focus ${condition}`);
  await settled();
  const area = workArea();
  const frame = front.get_frame_rect();
  await eventually(() => {
    const now = front.get_frame_rect();
    const fits = workArea();
    return now.x === fits.x && now.y === fits.y && now.width === fits.width && now.height === fits.height;
  }, `the maximized window fills the work area ${condition} (${frame.x},${frame.y} ${frame.width}x${frame.height} in ${area.x},${area.y} ${area.width}x${area.height})`);
}

function requireNothingAbove(front: Meta.Window, label: string) {
  const actor = front.get_compositor_private() as Clutter.Actor;
  for (const [spot, [x, y]] of spots(front)) {
    const picked = global.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y);
    require(actor.contains(picked), `${label}, nothing covers the maximized window ${spot} (found ${picked?.name ?? picked?.constructor.name})`);
  }
}

async function surfacesLeaveNothingBehind(front: Meta.Window, behind: Meta.Window) {
  for (const surface of SURFACES) {
    toggleSurface(surface);
    await pause(SURFACE_SETTLES);
    toggleSurface(surface);
    await pause(SURFACE_SETTLES);
    front.activate(global.get_current_time());
    await settled();
    requireNothingAbove(front, `after ${surface} opens and closes`);
    await pressesStayWith(front, behind, spots(front).slice(0, 1), `maximized (after ${surface} closed)`, {require, eventually});
  }
}

async function pressesUnder(front: Meta.Window, behind: Meta.Window, condition: string) {
  await maximizedInFront(front, condition);
  requireNothingAbove(front, condition);
  await pressesStayWith(front, behind, spots(front), `maximized (${condition})`, {require, eventually});
}

export async function run() {
  await settled();
  moveTo([20, 20]);
  plugInTouchscreen();
  const app = gjs('clients/windows/window.js', ['--multiple', '--input']);
  try {
    const [behind, front] = await waitForWindows(['Kestrel window check 1', 'Kestrel window check 2']);
    behind.move_resize_frame(false, monitor().x + 80, monitor().y + 80, 640, 420);
    behind.activate(global.get_current_time());
    await waitUntil(() => global.display.focus_window === behind, 'the window behind had focus last');

    await pressesUnder(front, behind, 'with the taskbar always shown');
    front.unmaximize();
    await eventually(() => !front.maximized_horizontally, 'the window unmaximizes');
    await settled();
    await pressesUnder(front, behind, 'after unmaximizing and maximizing again');
    await surfacesLeaveNothingBehind(front, behind);

    settings.set_string('taskbar-auto-hide', 'always');
    await pressesUnder(front, behind, 'with the taskbar hiding itself');
    settings.reset('taskbar-auto-hide');

    await fold(true);
    await pressesUnder(front, behind, 'folded into a tablet');
    await fold(false);
    await pressesUnder(front, behind, 'back from tablet posture');
  } finally {
    settings.reset('taskbar-auto-hide');
    await fold(false);
    await stop(app);
  }
}
