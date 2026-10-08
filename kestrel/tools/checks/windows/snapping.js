import Mtk from 'gi://Mtk';
import {toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {moveTo, pressButton, releaseButton} from '../lib/input.js';
import {gjs, spawn, stop, waitForWindow, waitForWindows} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {nextFrame, settled, waitUntil} from '../lib/wait.js';

const {eventually} = checks('snap');
const DRAG_STEPS = 16;
const COVER = `
  imports.gi.versions.Gtk = '4.0';
  const {GLib, Gtk} = imports.gi;
  Gtk.init();
  new Gtk.Window({title: 'Kestrel cover window', default_width: 500, default_height: 400}).present();
  new GLib.MainLoop(null, false).run();`;

const near = (a, b) => Math.abs(a - b) <= 1;

async function checkLayouts(window) {
  window.activate(global.get_current_time());
  await waitUntil(() => window.has_focus(), 'the window takes focus');
  toggleSurface('snap');
  const picker = named('kestrel-snap-layouts');
  await eventually(() => picker.visible, 'Super+Z shows snap layouts for the focused window');
  await capture('snap-layouts');
  picker.get_child_at_index(1).get_first_child().get_first_child().emit('clicked', 1);
  const area = Main.layoutManager.getWorkAreaForMonitor(window.get_monitor());
  await eventually(() => {
    const quarter = window.get_frame_rect();
    return quarter.x === area.x && quarter.y === area.y && near(quarter.width, area.width / 2) && near(quarter.height, area.height / 2);
  }, 'snap layouts place the window in the chosen zone');
  await settled();
  return area;
}

async function checkCornerDrag(window, area) {
  const frame = window.get_frame_rect();
  const [fromX, fromY] = [frame.x + frame.width / 2, frame.y + 16];
  const [toX, toY] = [area.x + area.width - 1, area.y + 1];
  moveTo([fromX, fromY]);
  pressButton();
  for (let step = 1; step <= DRAG_STEPS; step++) {
    moveTo([fromX + (toX - fromX) * step / DRAG_STEPS, fromY + (toY - fromY) * step / DRAG_STEPS]);
    await nextFrame();
  }
  await eventually(() => Main.wm._tilePreview?._showing, 'dragging a window into a corner previews where it goes');
  await capture('corner-snap');
  releaseButton();
  await eventually(() => {
    const corner = window.get_frame_rect();
    return corner.y === area.y && near(corner.x, area.x + area.width / 2) && near(corner.width, area.width / 2);
  }, 'dragging a window into a corner snaps it to that quarter');
}

const above = (a, b) => {
  const order = global.display.sort_windows_by_stacking([a, b]);
  return order.indexOf(a) > order.indexOf(b);
};

async function checkGroups(left, right) {
  const area = Main.layoutManager.getWorkAreaForMonitor(left.get_monitor());
  const half = Math.floor(area.width / 2);
  Main.wm.snapWindow(left, new Mtk.Rectangle({x: area.x, y: area.y, width: half, height: area.height}));
  Main.wm.snapWindow(right, new Mtk.Rectangle({x: area.x + half, y: area.y, width: area.width - half, height: area.height}));
  const cover = spawn(['gjs', '-c', COVER]);
  const other = await waitForWindow('Kestrel cover window');
  other.activate(global.get_current_time());
  other.maximize();
  await eventually(() => other.is_maximized() && above(other, left) && above(other, right), 'another window covers the snapped pair');
  Main.wm.activateWithSnapGroup(left);
  await eventually(() => global.display.focus_window === left && above(left, other) && above(right, other), 'activating a snapped window brings its partner along');
  other.activate(global.get_current_time());
  other.unmaximize();
  Main.wm.activateWithSnapGroup(other);
  await eventually(() => global.display.focus_window === other && above(other, left) && above(other, right), 'unsnapped windows activate on their own');
  await stop(cover);
}

export async function run() {
  gjs('clients/window.js', ['--multiple']);
  const [first, second] = await waitForWindows(['Kestrel window check 1', 'Kestrel window check 2']);
  const area = await checkLayouts(first);
  await checkCornerDrag(first, area);
  await checkGroups(first, second);
}
