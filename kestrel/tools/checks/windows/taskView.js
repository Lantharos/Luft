import Clutter from 'gi://Clutter';

import {named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {chord, click, drag} from '../lib/input.js';
import {gjs, waitForWindows} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';

const {eventually} = checks('task view');
const manager = global.workspace_manager;

export async function run() {
  gjs('clients/window.js', ['--multiple']);
  const windows = await waitForWindows(['Kestrel window check 1', 'Kestrel window check 2']);
  const view = named('kestrel-task-view');
  const cards = () => view.get_first_child().get_children();
  const desktops = () => view.get_last_child().get_children();

  await chord(Clutter.KEY_Super_L, Clutter.KEY_Tab);
  await eventually(() => view.visible && cards().length === 2, 'Super+Tab shows every window on the desktop');
  await eventually(() => desktops().length === 2 && desktops()[0].has_style_pseudo_class('checked'), 'desktops appear with the current one marked');
  await capture('task-view');

  const moved = cards()[1];
  const window = windows.find(candidate => candidate.title === moved.accessible_name);
  await drag(moved, desktops()[1], {steps: 16});
  await eventually(() => window.get_workspace().index() === 1 && cards().length === 1 && desktops().length === 3,
    'dragging a window onto a desktop moves it there');

  await settled();
  click(desktops()[1]);
  await eventually(() => manager.get_active_workspace_index() === 1 && view.visible && cards()[0]?.accessible_name === window.title,
    'choosing a desktop switches to it and shows its windows');
  await capture('task-view-desktop');

  await settled();
  click(cards()[0]);
  await eventually(() => !view.visible && global.display.focus_window === window, 'choosing a window focuses it and closes the view');
}
