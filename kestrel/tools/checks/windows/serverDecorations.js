import Clutter from 'gi://Clutter';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {withPalette, useScheme} from '../apps/lib/palette.js';
import {checks} from '../lib/check.js';
import {click, drag, moveTo, press, pressButton, releaseButton, rest} from '../lib/input/input.js';
import {fixture, spawn, waitForWindow} from '../lib/processes.js';
import {capture, captureFrame} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';

const {require, eventually} = checks('server decorations');
const TOLERANCE = 3;
const TITLEBAR_HEIGHT = 40;
const CLIENT_SIZE = [320, 240];
const TITLEBAR = {light: 'surfaceContainer', dark: 'surfaceDim'};
const DECORATED = [['server', 'Field notes', 'e8e4da', 520, 300], ['unset', 'Sketchbook', '2e3a46', 120, 140]];
const UNDECORATED = [['client', 'Drawn by the app', '6b8f71', 900, 120], ['none', 'Without the protocol', '8f6b6b', 900, 460]];
const MOVE = [60, 40];
const RESIZE = [50, 30];
const DOUBLE_CLICK_GAP = 60;

async function open([mode, title, color, x, y]) {
  const process = spawn(['python3', fixture('clients', 'wayland', 'decorationClient.py'), mode, title, color]);
  const window = await waitForWindow(title, `the ${mode} decoration client ${title} opens`);
  window.move_frame(true, x, y);
  return {process, window, mode};
}

async function pixelAt(window, x, y, color) {
  const frame = window.get_frame_rect();
  const shot = await captureFrame({x: frame.x, y: frame.y, width: frame.width, height: frame.height});
  const scale = shot.pixbuf.get_width() / frame.width;
  return shot.near(Math.round(x * scale), Math.round(y * scale), color, TOLERANCE);
}

function titlebarPoint(window, x = 100) {
  const frame = window.get_frame_rect();
  return [frame.x + x, frame.y + TITLEBAR_HEIGHT / 2];
}

function buttonOf(window, name) {
  const actor = window.get_compositor_private();
  const find = parent => parent.get_children().flatMap(child => child.has_style_class_name?.(`kestrel-titlebar-${name}`) ? [child] : find(child));
  return find(actor)[0];
}

function checkGeometry({window, mode}, decorated) {
  const frame = window.get_frame_rect();
  const buffer = window.get_buffer_rect();
  const titlebar = decorated ? TITLEBAR_HEIGHT : 0;
  require(window.get_titlebar_height() === titlebar, `the ${mode} client gets a ${titlebar} px title bar`);
  require(frame.width === CLIENT_SIZE[0] && frame.height === CLIENT_SIZE[1] + titlebar,
    `the ${mode} client's frame is ${frame.width} × ${frame.height}`);
  require(buffer.y === frame.y, `the ${mode} client's title bar sits inside its window`);
  const extra = window.get_compositor_private().get_n_children();
  require(decorated ? extra > 1 : extra === 1, `the ${mode} client has ${decorated ? 'one' : 'no'} title bar from Kestrel`);
}

async function checkScheme(decorated, palette, scheme) {
  const [focused, behind] = decorated.map(client => client.window);
  const color = palette[scheme][TITLEBAR[scheme]];
  useScheme(scheme);
  focused.activate(global.get_current_time());
  await eventually(async () => await pixelAt(behind, behind.get_frame_rect().width / 2, 8, color),
    `the title bar takes the ${scheme} ${TITLEBAR[scheme]} color`);
  require(!await pixelAt(focused, 1, 1, color), `a floating title bar keeps its rounded corner in the ${scheme} style`);
  await capture(`server-decorations-${scheme}`);

  focused.maximize();
  await eventually(() => focused.is_maximized(), `the ${scheme} decorated window maximizes`);
  await settled();
  require(focused.get_frame_rect().height - focused.get_titlebar_height() > CLIENT_SIZE[1], 'the client fills the maximized frame below the title bar');
  require(await pixelAt(focused, 1, 1, color), `a maximized title bar squares its corner in the ${scheme} style`);
  await capture(`server-decorations-${scheme}-maximized`);
  focused.unmaximize();
  await eventually(() => !focused.is_maximized(), `the ${scheme} decorated window restores`);
}

async function checkMove(window) {
  const before = window.get_frame_rect();
  const from = titlebarPoint(window);
  await drag(from, [from[0] + MOVE[0], from[1] + MOVE[1]]);
  await settled();
  const after = window.get_frame_rect();
  require(after.x - before.x === MOVE[0] && after.y - before.y === MOVE[1], 'dragging the title bar moves the window with the pointer');
}

async function checkResize(window) {
  const before = window.get_frame_rect();
  const corner = [before.x + before.width + 3, before.y + before.height + 3];
  await drag(corner, [corner[0] + RESIZE[0], corner[1] + RESIZE[1]]);
  await eventually(() => window.get_frame_rect().width === before.width + RESIZE[0] &&
    window.get_frame_rect().height === before.height + RESIZE[1], 'dragging just outside the corner resizes the window');
}

async function doubleClick(target) {
  click(target);
  await pause(DOUBLE_CLICK_GAP);
  click(target);
}

async function checkInput({window, process}) {
  window.activate(global.get_current_time());
  await settled();
  await checkMove(window);
  await checkResize(window);

  await doubleClick(titlebarPoint(window));
  await eventually(() => window.is_maximized(), 'double-clicking the title bar maximizes the window');
  await settled();
  await doubleClick(titlebarPoint(window));
  await eventually(() => !window.is_maximized(), 'double-clicking it again restores the window');
  await settled();

  moveTo(titlebarPoint(window));
  pressButton(Clutter.BUTTON_SECONDARY);
  releaseButton(Clutter.BUTTON_SECONDARY);
  await eventually(() => !!Main.wm.windowMenuManager.manager.activeMenu?.isOpen, 'right-clicking the title bar opens the window menu');
  press(Clutter.KEY_Escape);
  await eventually(() => !Main.wm.windowMenuManager.manager.activeMenu?.isOpen, 'Escape closes the window menu');
  await settled();

  click(buttonOf(window, 'maximize'));
  await eventually(() => window.is_maximized(), 'the maximize button maximizes the window');
  await settled();
  click(buttonOf(window, 'maximize'));
  await eventually(() => !window.is_maximized(), 'the maximize button restores the window');
  click(buttonOf(window, 'minimize'));
  await eventually(() => window.minimized, 'the minimize button minimizes the window');
  window.unminimize();
  window.activate(global.get_current_time());
  await settled();
  let closed = false;
  process.exited.then(() => { closed = true; });
  click(buttonOf(window, 'close'));
  await eventually(() => closed, 'the close button closes the window');
  rest();
}

export async function run() {
  const decorated = await Promise.all(DECORATED.map(open));
  const undecorated = await Promise.all(UNDECORATED.map(open));
  await settled();
  for (const client of decorated) checkGeometry(client, true);
  for (const client of undecorated) checkGeometry(client, false);
  await withPalette(async palette => {
    await checkScheme(decorated, palette, 'light');
    await checkScheme(decorated, palette, 'dark');
  });
  await checkInput(decorated[0]);
}
