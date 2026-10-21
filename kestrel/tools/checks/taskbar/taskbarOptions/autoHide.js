import {toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {moveTo} from '../../lib/input.js';
import {gjs, stop, waitForWindow} from '../../lib/processes.js';
import {bottomGap, eventually, FLOATING_MARGIN, HEIGHTS, panel, panelBox, primary, set} from './taskbar.js';

const revealed = () => panel().visible && panel().translation_y === 0;

function pointAtEdge() {
  const monitor = primary();
  moveTo([monitor.x + monitor.width / 2, monitor.y + monitor.height - 1]);
}

function pointAway() {
  const monitor = primary();
  moveTo([monitor.x + monitor.width / 2, monitor.y + monitor.height / 2]);
}

export async function checkAlways() {
  set('taskbar-auto-hide', 'always');
  await eventually(() => bottomGap() === 0, 'windows can use the whole screen while the taskbar hides itself');
  await eventually(() => !panel().visible, 'the taskbar hides itself');
  pointAtEdge();
  await eventually(revealed, 'pointing at the bottom edge brings the taskbar back');
  pointAway();
  await eventually(() => !panel().visible, 'the taskbar hides again once the pointer leaves');
  global.display.emit('overlay-key');
  await eventually(revealed, 'opening Start with Super brings the taskbar back');
  toggleSurface('start');
  await eventually(() => !panel().visible, 'the taskbar hides once Start closes');

  set('taskbar-style', 'floating');
  await eventually(() => bottomGap() === 0, 'a floating taskbar that hides itself leaves the whole screen to windows');
  pointAtEdge();
  const monitor = primary();
  await eventually(() => {
    const box = panelBox();
    return revealed() && box.y + box.height === monitor.y + monitor.height - FLOATING_MARGIN;
  }, 'the floating taskbar comes back to its place above the edge');
  pointAway();
  set('taskbar-style', 'bar');
}

export async function checkWindows() {
  set('taskbar-auto-hide', 'windows');
  const app = gjs('clients/window.js');
  const window = await waitForWindow('Kestrel window check');
  const monitor = primary();
  await eventually(() => panel().visible && bottomGap() === 0, 'the taskbar stays while no window touches it');
  window.maximize();
  await eventually(() => {
    const frame = window.get_frame_rect();
    return frame.y + frame.height === monitor.y + monitor.height;
  }, 'a maximized window fills the screen down to the bottom edge');
  await eventually(() => !panel().visible, 'the taskbar hides while a window touches it');
  window.unmaximize();
  await eventually(() => panel().visible, 'the taskbar returns once the window moves away');
  await stop(app);
  set('taskbar-auto-hide', 'never');
  await eventually(() => panel().visible && bottomGap() === HEIGHTS.normal, 'turning auto-hide off reserves the taskbar again');
}
