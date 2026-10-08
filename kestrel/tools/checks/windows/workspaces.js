import Clutter from 'gi://Clutter';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {hold, moveTo, press, release, scroll} from '../lib/input.js';
import {gjs, stop, waitForWindows} from '../lib/processes.js';
import {captureFrame} from '../lib/screenshots.js';
import {settled, waitUntil} from '../lib/wait.js';

const {require, eventually} = checks('workspace');
const manager = global.workspace_manager;
const SLIDE_PROGRESS = 0.4;

const switchData = () => Main.wm._workspaceAnimation._switchData;
const switchedTo = index => manager.get_active_workspace_index() === index && !switchData();

async function openWindows() {
  const app = gjs('clients/window.js', ['--multiple']);
  const windows = await waitForWindows(['Kestrel window check 1', 'Kestrel window check 2']);
  for (const window of windows) window.move_to_monitor(global.display.get_primary_monitor());
  return [app, windows];
}

async function checkSlide() {
  hold(Clutter.KEY_Super_L);
  press(Clutter.KEY_2);
  const slide = await waitUntil(switchData, 'the workspaces start sliding');
  await waitUntil(() => slide.monitors[0].progress >= SLIDE_PROGRESS, 'the workspaces are halfway through the slide');
  (await captureFrame()).save('workspace-slide');
  release(Clutter.KEY_Super_L);
  await eventually(() => switchedTo(1), 'Super+2 switches to workspace two');
}

async function checkScrolling() {
  const panel = named('kestrel-panel');
  scroll(Clutter.ScrollDirection.DOWN, [120, panel.y + 24]);
  await eventually(() => switchedTo(2), 'scrolling over the taskbar switches workspace');
  moveTo([120, 120]);
  hold(Clutter.KEY_Super_L);
  scroll(Clutter.ScrollDirection.UP);
  await eventually(() => switchedTo(1), 'Super+scroll switches workspace');
  release(Clutter.KEY_Super_L);
  await settled();
  require(!named('kestrel-start').visible, 'releasing Super after scrolling keeps Start closed');
}

export async function run() {
  const [app, [, second]] = await openWindows();
  try {
    await eventually(() => manager.n_workspaces === 2, 'an occupied workspace is followed by one empty workspace');
    second.change_workspace_by_index(1, false);
    await eventually(() => manager.n_workspaces === 3, 'a second occupied workspace adds one empty workspace');
    await checkSlide();
    await checkScrolling();
  } finally {
    await stop(app);
  }
  await eventually(() => manager.n_workspaces === 1, 'empty workspaces collapse after windows close');
}
