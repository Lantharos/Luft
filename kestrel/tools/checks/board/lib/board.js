import {board as currentBoard} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {gjs, waitForWindow, windows} from '../../lib/processes.js';
import {nextFrame, settled, waitUntil} from '../../lib/wait.js';
import {touchpad} from './touchpad.js';

const WINDOWS = [['Notes', 720, 460], ['Inbox', 640, 520], ['Music', 560, 380], ['Files', 800, 500]];

const overlap = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

export const board = () => currentBoard();
export const view = () => ({...currentBoard().camera.view});
export const sameView = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export const boardWindows = () => windows().filter(window => WINDOWS.some(([title]) => window.get_title()?.startsWith(title)));
export const windowNamed = title => boardWindows().find(window => window.get_title().startsWith(title));
export const switching = () => !!Main.wm._workspaceAnimation._switchData;

const onDevicePixel = value => {
  const pixels = value * global.display.get_monitor_scale(Main.layoutManager.primaryIndex);
  return Math.abs(pixels - Math.round(pixels)) < 1e-3;
};

export const onWholePixels = () => onDevicePixel(global.window_group.translation_x) && onDevicePixel(global.window_group.translation_y);

export function noOverlap() {
  const rects = boardWindows().filter(window => !window.minimized).map(window => window.get_frame_rect());
  return rects.every((a, i) => rects.every((b, j) => i === j || !overlap(a, b)));
}

export function openBoardWindow(title, width, height) {
  return gjs('clients/boardWindow.js', [title, `${width}`, `${height}`]);
}

export async function openWindows() {
  for (const [title, width, height] of WINDOWS) openBoardWindow(title, width, height);
  await Promise.all(WINDOWS.map(([title]) => waitForWindow(window => window.get_title()?.startsWith(title), `a window titled ${title} opens`)));
}

export async function boardResting() {
  const {camera} = currentBoard();
  await nextFrame();
  await waitUntil(() => !camera.tween.is_playing() && !camera.momentum.is_playing() && !camera.settleTimer, 'the board view comes to rest');
  await settled();
}

export function fourFingerSwipe(dy) {
  for (const event of [touchpad.swipe('begin', 4), touchpad.swipe('update', 4, 0, dy), touchpad.swipe('end', 4)])
    currentBoard().input.handle(event);
}

export function doubleTapSuper() {
  global.display.emit('overlay-key');
  global.display.emit('overlay-key');
}

export async function showBoard() {
  doubleTapSuper();
  await waitUntil(() => currentBoard().shown, 'the board turns on');
  await boardResting();
}

export async function leaveBoard() {
  if (!currentBoard().shown) return;
  currentBoard().toggle();
  await waitUntil(() => !currentBoard().shown, 'the board turns off');
  await settled();
}
