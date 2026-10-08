import Clutter from 'gi://Clutter';

import {checks} from '../lib/check.js';
import {type} from '../lib/input.js';
import {fixture, scratch, spawn, waitForWindow} from '../lib/processes.js';
import {board, boardResting, leaveBoard, openWindows, showBoard} from './lib/board.js';
import {clickAt, screenPoint, zoomWithWheel} from './lib/pointer.js';

const {require, eventually} = checks('board');
const FAR_AWAY = [[9000, 6000], [-7000, -4000]];

async function compile() {
  const binary = scratch('kestrel-x11-clicks');
  const compiler = spawn(['cc', '-O2', '-o', binary, fixture('clients', 'entries', 'x11Clicks.c'), '-lX11']);
  await compiler.exited;
  if (!compiler.get_successful()) throw new Error('The X11 click fixture does not compile');
  return binary;
}

async function clickReaches(window, x, y) {
  const landed = await clickAt(window, window.frame_rect_to_client_rect(window.get_frame_rect()), x, y);
  return Math.abs(landed[0] - x) <= 1 && Math.abs(landed[1] - y) <= 1;
}

export async function run() {
  const binary = await compile();
  await openWindows();
  try {
    await showBoard();
    spawn([binary, '480', '300']);
    const window = await waitForWindow(candidate => candidate.get_title()?.startsWith('Kestrel clicks'), 'an X11 window opens');
    await eventually(() => window.unconstrained, 'an X11 window opens on the board');

    for (const [x, y] of FAR_AWAY) {
      window.move_frame(true, x, y);
      board().enterWindow(window);
      await eventually(() => board().camera.view.scale === 1, `an X11 window placed at ${x}, ${y} is entered at 100%`);
      await boardResting();
      require(await clickReaches(window, 100, 50) && await clickReaches(window, 470, 290),
        `clicks land in an X11 window placed at ${x}, ${y} on the board (${window.get_title()})`);
    }
    type('ok');
    await eventually(() => window.get_title().startsWith('Kestrel clicks: ok@'), 'typing reaches the X11 window on the board');

    const rect = window.frame_rect_to_client_rect(window.get_frame_rect());
    const center = screenPoint(board().camera.view, board().viewport, rect.x + rect.width / 2, rect.y + rect.height / 2);
    await zoomWithWheel(Clutter.ScrollDirection.UP, center, 8);
    require(board().camera.view.scale > 1, `the X11 window can be magnified to ${Math.round(board().camera.view.scale * 100)}%`);
    require(await clickReaches(window, 30, 20) && await clickReaches(window, 240, 150) && await clickReaches(window, 465, 285),
      `clicks land in the magnified X11 window (${window.get_title()})`);
  } finally {
    await leaveBoard();
  }
}
