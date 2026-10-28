import {toggleSurface} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {moveTo} from '../../lib/input/input.js';
import {gjs, stop, waitForWindow} from '../../lib/processes.js';
import {edgeGap, eventually, FLOATING_MARGIN, HEIGHTS, panel, panelBox, primary, set} from './taskbar.js';
import {farSide, outward, vertical} from '../../lib/edge.js';

const revealed = () => panel().visible && panel().translation_x === 0 && panel().translation_y === 0;

function pointAtEdge() {
  const monitor = primary();
  const edge = farSide(monitor) - (outward() > 0 ? 1 : 0);
  moveTo(vertical() ? [edge, monitor.y + monitor.height / 2] : [monitor.x + monitor.width / 2, edge]);
}

function pointAway() {
  const monitor = primary();
  moveTo([monitor.x + monitor.width / 2, monitor.y + monitor.height / 2]);
}

export async function checkAlways() {
  pointAway();
  set('taskbar-auto-hide', 'always');
  await eventually(() => edgeGap() === 0, 'windows can use the whole screen while the taskbar hides itself');
  await eventually(() => !panel().visible, 'the taskbar hides itself');
  pointAtEdge();
  await eventually(revealed, 'pointing at the taskbar\'s edge brings the taskbar back');
  pointAway();
  await eventually(() => !panel().visible, 'the taskbar hides again once the pointer leaves');
  global.display.emit('overlay-key');
  await eventually(revealed, 'opening Start with Super brings the taskbar back');
  toggleSurface('start');
  await eventually(() => !panel().visible, 'the taskbar hides once Start closes');

  set('taskbar-style', 'floating');
  await eventually(() => edgeGap() === 0, 'a floating taskbar that hides itself leaves the whole screen to windows');
  pointAtEdge();
  const monitor = primary();
  await eventually(() => {
    const box = panelBox();
    return revealed() && farSide(box) === farSide(monitor) - outward() * FLOATING_MARGIN;
  }, 'the floating taskbar comes back to its place beside the edge');
  pointAway();
  set('taskbar-style', 'bar');
}

export async function checkWindows() {
  set('taskbar-auto-hide', 'windows');
  const app = gjs('clients/windows/window.js');
  const window = await waitForWindow('Kestrel window check');
  const monitor = primary();
  await eventually(() => panel().visible && edgeGap() === 0, 'the taskbar stays while no window touches it');
  window.maximize();
  await eventually(() => farSide(window.get_frame_rect()) === farSide(monitor), 'a maximized window fills the screen up to the taskbar\'s edge');
  await eventually(() => !panel().visible, 'the taskbar hides while a window touches it');
  window.unmaximize();
  await eventually(() => panel().visible, 'the taskbar returns once the window moves away');
  await stop(app);
  set('taskbar-auto-hide', 'never');
  await eventually(() => panel().visible && edgeGap() === HEIGHTS.normal, 'turning auto-hide off reserves the taskbar again');
}
