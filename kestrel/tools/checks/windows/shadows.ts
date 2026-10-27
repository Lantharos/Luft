import type Meta from 'gi://Meta';

import {withScheme} from '../apps/lib/palette.js';
import {checks} from '../lib/check.js';
import {fixture, spawn, waitForWindow} from '../lib/processes.js';
import {capture, captureFrame} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';

const {require, eventually} = checks('window shadows');
const BACKDROP = ['Backdrop', 'f3f3f0', [40, 40, 1100, 700]] as const;
const NOTES = ['Notes', '1b1b1b', [200, 180, 420, 300]] as const;
const FILES = ['Files', '242424', [540, 110, 520, 360]] as const;
const FRAMED = ['Framed', '2e3a46', [700, 500, 360, 200]] as const;
const GLASS = ['Glass', 360, 220, [1000, 160]] as const;
const BELOW = 8;
const INSIDE = 4;
const SHADOW_DEPTH = 12;
const OUTLINE_SHIFT = 10;

type Client = readonly [string, string, readonly [number, number, number, number]];

interface Opened {
  window: Meta.Window;
  color: number[];
}

async function open(mode: string, [title, color, [x, y, width, height]]: Client): Promise<Opened> {
  spawn(['python3', fixture('clients', 'wayland', 'decorationClient.py'), mode, title, color]);
  const window = await waitForWindow(title, `the ${title} client opens`);
  window.move_resize_frame(true, x, y, width, height);
  await eventually(() => window.get_frame_rect().width === width, `the ${title} client takes its size`);
  return {window, color: channels(color)};
}

async function openGlass([title, width, height, [x, y]]: readonly [string, number, number, readonly [number, number]]) {
  spawn(['python3', fixture('clients', 'wayland', 'blurClient.py'), title, `${width}`, `${height}`]);
  const window = await waitForWindow(title, `the ${title} client opens`);
  window.move_frame(true, x, y);
}

function channels(hex: string) {
  return [0, 2, 4].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
}

async function pixel(x: number, y: number) {
  const shot = await captureFrame({x, y, width: 1, height: 1});
  return [...shot.pixbuf.get_pixels().slice(0, 3)];
}

const lighter = (pixel: number[], color: number[]) => pixel.every((value, channel) => value >= color[channel] + OUTLINE_SHIFT);
const darker = (pixel: number[], color: number[], amount: number) => pixel.every((value, channel) => value <= color[channel] - amount);
const same = (pixel: number[], color: number[]) => pixel.every((value, channel) => Math.abs(value - color[channel]) <= 2);

async function topEdge(window: Meta.Window, depth = 0) {
  const frame = window.get_frame_rect();
  return pixel(frame.x + Math.round(frame.width / 2), frame.y + depth);
}

async function checkOutline({window, color}: Opened, label: string, shifted: (edge: number[], color: number[]) => boolean) {
  require(shifted(await topEdge(window), color), `${label} gets an outline along its edge`);
  require(same(await topEdge(window, INSIDE), color), `${label}'s outline stays on its edge`);
}

async function checkShadow({window}: Opened, backdrop: Opened, label: string) {
  const frame = window.get_frame_rect();
  const below = await pixel(frame.x + Math.round(frame.width / 2), frame.y + frame.height + BELOW);
  require(darker(below, backdrop.color, SHADOW_DEPTH), `${label} casts a shadow on the window below`);
}

async function checkSquare({window, color}: Opened, label: string) {
  await settled();
  require(same(await topEdge(window), color), `${label} has no outline`);
}

export async function run() {
  const backdrop = await open('client', BACKDROP);
  const notes = await open('client', NOTES);
  const files = await open('client', FILES);
  const framed = await open('server', FRAMED);
  await openGlass(GLASS);

  notes.window.activate(global.get_current_time());
  await settled();
  await checkOutline(notes, 'a dark window that draws no shadow', lighter);
  await checkOutline(backdrop, 'a light window that draws no shadow', (edge, color) => darker(edge, color, OUTLINE_SHIFT));
  await checkShadow(notes, backdrop, 'a window that draws no shadow');
  framed.window.activate(global.get_current_time());
  await settled();
  await checkShadow(framed, backdrop, 'a window with Kestrel\'s title bar');

  files.window.activate(global.get_current_time());
  await withScheme('dark', () => capture('window-shadows-dark'));
  await withScheme('light', () => capture('window-shadows-light'));

  notes.window.activate(global.get_current_time());
  notes.window.maximize();
  await eventually(() => notes.window.is_maximized(), 'the window maximizes');
  await checkSquare(notes, 'a maximized window');
  notes.window.unmaximize();
  await eventually(() => !notes.window.is_maximized(), 'the window restores');
  notes.window.make_fullscreen();
  await eventually(() => notes.window.is_fullscreen(), 'the window goes fullscreen');
  await checkSquare(notes, 'a fullscreen window');
  await capture('window-shadows-fullscreen');
  notes.window.unmake_fullscreen();
  await eventually(() => !notes.window.is_fullscreen(), 'the window leaves fullscreen');
  await settled();
  await checkOutline(notes, 'a window back from fullscreen', lighter);
  await checkShadow(notes, backdrop, 'a window back from fullscreen');
  require(notes.window.get_compositor_private<Meta.WindowActor>().get_n_children() === 1, 'the shadow and outline add no actors to the window');
}
