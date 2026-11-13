import type Meta from 'gi://Meta';
import {toggleSurface} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {centerOf, moveTo} from '../../lib/input/input.js';
import {pause} from '../../lib/wait.js';
import {gjs, stop, waitForWindow} from '../../lib/processes.js';
import {edgeGap, eventually, FLOATING_MARGIN, HEIGHTS, panel, panelBox, primary, require, set} from './taskbar.js';
import {farSide, outward, vertical} from '../../lib/edge.js';
import {sameRect} from '../../tiling/lib/tiling.js';

const HIDE_DELAY = 450;

const islands = () => panel().get_children().filter(child => child.name?.startsWith('kestrel-island-'));
const revealed = () => panel().visible && [panel(), ...islands()].every(part => part.visible && part.translation_x === 0 && part.translation_y === 0);
const hidden = () => !panel().visible || islands().every(island => !island.visible);

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
  await eventually(hidden, 'the taskbar hides itself');
  pointAtEdge();
  await eventually(revealed, 'pointing at the taskbar\'s edge brings the taskbar back');
  pointAway();
  await eventually(hidden, 'the taskbar hides again once the pointer leaves');
  global.display.emit('overlay-key');
  await eventually(revealed, 'opening Start with Super brings the taskbar back');
  toggleSurface('start');
  await eventually(hidden, 'the taskbar hides once Start closes');

  set('taskbar-style', 'floating');
  await eventually(() => edgeGap() === 0, 'a floating taskbar that hides itself leaves the whole screen to windows');
  pointAtEdge();
  const monitor = primary();
  await eventually(() => {
    const box = panelBox();
    return revealed() && farSide(box) === farSide(monitor) - outward() * FLOATING_MARGIN;
  }, 'the floating taskbar comes back to its place beside the edge');
  pointAway();
  await checkSeparateHover();
  set('taskbar-style', 'bar');
}

async function checkSeparateHover() {
  set('taskbar-style', 'separate');
  await eventually(hidden, 'the separate taskbar hides itself');
  pointAtEdge();
  await eventually(revealed, 'pointing at the edge brings the separate taskbar back');
  const [apps, status] = islands();
  const [appsX, appsY] = centerOf(apps);
  const [statusX] = centerOf(status);
  const appsEnd = apps.get_transformed_position()[0] + apps.width;
  for (const [label, point] of [['its apps', [appsX, appsY]], ['its clock and status', [statusX, appsY]], ['the space between its parts', [(appsEnd + status.get_transformed_position()[0]) / 2, appsY]]] as const) {
    moveTo([point[0], point[1]]);
    await pause(800);
    if (!revealed()) throw new Error(`the separate taskbar stays while the pointer rests on ${label}`);
  }
  pointAway();
  await eventually(hidden, 'the separate taskbar hides once the pointer leaves');
}

function moveTouching(window: Meta.Window, touching: boolean) {
  const monitor = primary();
  const {width, height} = window.get_frame_rect();
  const place = [monitor.x + (monitor.width - width) / 2, monitor.y + (monitor.height - height) / 2];
  if (touching) place[vertical() ? 0 : 1] = outward() > 0 ? farSide(monitor) - (vertical() ? width : height) : farSide(monitor);
  window.move_frame(true, Math.round(place[0]), Math.round(place[1]));
}

export async function checkWindows() {
  set('taskbar-auto-hide', 'windows');
  const app = gjs('clients/windows/window.js');
  const window = await waitForWindow('Kestrel window check');
  const monitor = primary();
  moveTouching(window, false);
  await pause(HIDE_DELAY + 200);
  require(panel().visible && edgeGap() === 0, 'the taskbar stays while no window touches it');
  moveTouching(window, true);
  await eventually(hidden, 'the taskbar hides once a window touches it');
  moveTouching(window, false);
  await eventually(() => panel().visible, 'the taskbar returns once the window moves away');
  const placed = window.get_frame_rect();
  window.maximize();
  await eventually(() => sameRect(window.get_frame_rect(), monitor, 0), 'a maximized window fills the screen');
  await eventually(hidden, 'the taskbar hides while a maximized window covers it');
  window.unmaximize();
  await eventually(() => sameRect(window.get_frame_rect(), placed, 0), 'unmaximizing puts the window back where it was');
  await eventually(() => panel().visible, 'the taskbar returns once the window is unmaximized');
  await stop(app);
  set('taskbar-auto-hide', 'never');
  await eventually(() => panel().visible && edgeGap() === HEIGHTS.normal, 'turning auto-hide off reserves the taskbar again');
}
