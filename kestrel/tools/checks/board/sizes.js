import {checks} from '../lib/check.js';
import {stopAll, waitForWindow} from '../lib/processes.js';
import {settled} from '../lib/wait.js';
import {area, frame, near, resetTiling, restingTiles, sameRect, useTiling} from '../tiling/lib/tiling.js';
import {board, boardResting, leaveBoard, openBoardWindow, showBoard} from './lib/board.js';

const {require, eventually} = checks('board sizes');
const NARROW = 0.5;

const size = window => {
  const {width, height} = window.get_frame_rect();
  return {width, height};
};
const describe = ({width, height}) => `${width}×${height}`;

async function open(title, width, height, state) {
  openBoardWindow(title, width, height, state);
  const window = await waitForWindow(candidate => candidate.get_title()?.startsWith(title), `a window titled ${title} opens`);
  await settled();
  return window;
}

async function checkEntering() {
  const notes = await open('Notes', 900, 600);
  const opened = size(notes);
  notes.maximize();
  await eventually(() => notes.is_maximized(), 'Notes maximizes');
  const music = await open('Music', 1000, 640, 'maximized');
  await eventually(() => music.is_maximized(), 'Music opens maximized');
  const maximized = size(music);

  await showBoard();
  await eventually(() => !notes.is_maximized() && !music.is_maximized(), 'the board shows windows unmaximized');
  await settled();
  require(Math.abs(size(notes).width - opened.width) <= 2 && Math.abs(size(notes).height - opened.height) <= 2,
    `a window maximized after opening goes back to its own size (${describe(size(notes))}, was ${describe(opened)})`);
  require(size(music).width >= maximized.width * NARROW && size(music).height >= maximized.height * NARROW,
    `a window that opened maximized keeps a usable size (${describe(size(music))}, maximized ${describe(maximized)})`);
  return {notes, music};
}

async function checkFullscreen({notes}) {
  board().enterWindow(notes);
  await boardResting();
  const before = notes.get_frame_rect();
  notes.make_fullscreen();
  await eventually(() => notes.is_fullscreen() && !board().shown, 'a window going full screen sets the board aside');
  notes.unmake_fullscreen();
  await eventually(() => !notes.is_fullscreen() && board().shown, 'leaving full screen brings the board back');
  await boardResting();
  await eventually(() => board().enteredWindow() === notes, 'the window that was full screen is still entered');
  await eventually(() => {
    const rect = notes.get_frame_rect();
    return rect.x === before.x && rect.y === before.y && rect.width === before.width;
  }, 'it goes back to its place on the board');
  require(!notes.is_maximized(), 'it isn\'t left maximized');
}

// Tiled windows show on the board at a size of their own, not squeezed into their tiles
async function checkTiled() {
  useTiling('scrolling');
  try {
    const windows = [];
    for (const [title, width, height] of [['Notes', 900, 600], ['Inbox', 800, 500], ['Music', 700, 450]])
      windows.push(await open(title, width, height));
    await restingTiles();
    const tiles = windows.map(frame);
    require(tiles.every(tile => tile.width < area().width * 0.55), 'the windows tile into columns narrower than their own size');

    await showBoard();
    await settled();
    await eventually(() => windows.every((window, index) => frame(window).width > tiles[index].width + 40),
      `on the board, tiled windows take their own size (${windows.map(window => describe(size(window))).join(', ')})`);
    const [notes] = windows;
    const before = frame(notes);
    const others = windows.slice(1).map(frame);
    notes.move_resize_frame(true, before.x, before.y, before.width + 120, before.height);
    await eventually(() => near(frame(notes).width, before.width + 120), 'a window on the board can be resized');
    await settled();
    require(windows.slice(1).every((window, index) => sameRect(frame(window), others[index])), 'resizing it doesn\'t rearrange the strip behind the board');

    await leaveBoard();
    // Leaving maximizes one window and tucks away the rest, so bring them all back to the strip
    for (const window of windows) {
      if (window.minimized) window.unminimize();
      if (window.get_maximize_flags()) window.unmaximize();
    }
    await restingTiles();
    const state = window => `${describe(size(window))}${window.minimized ? ' minimized' : ''}${window.get_maximize_flags() ? ' maximized' : ''}`;
    require(windows.every((window, index) => near(frame(window).width, tiles[index].width, 2)),
      `leaving the board tiles them again at their column widths (${windows.map(state).join(', ')}; tiles ${tiles.map(describe).join(', ')})`);
  } finally {
    await stopAll();
    resetTiling();
  }
}

export async function run() {
  try {
    const windows = await checkEntering();
    await checkFullscreen(windows);
  } finally {
    await leaveBoard();
    await stopAll();
  }
  await checkTiled();
}
