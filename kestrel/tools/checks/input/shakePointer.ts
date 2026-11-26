import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';

import {checks} from '../lib/check.js';
import {installCursorTheme} from '../lib/input/cursorTheme.js';
import {moveBy, moveTo, press} from '../lib/input/input.js';
import {renderedFrame} from '../lib/screenshots.js';
import {pause} from '../lib/wait.js';

const THEME = 'KestrelShake';
const SIZE = 24;
const PEAK = 4;
const MAGENTA = '#ff00ff';
const START: [number, number] = [400, 300];
const MOTION_STEP_MS = 8;
const TOLERANCE = 1.5;
const {require, eventually} = checks('shake pointer');

const tracker = global.backend.get_cursor_tracker();
const spriteWidth = () => tracker.get_sprite()?.get_width() ?? 0;
const scale = () => global.display.get_monitor_scale(global.display.get_primary_monitor());
const themeWidth = (magnification: number) => SIZE * Math.ceil(scale() * magnification);
const near = (width: number, wanted: number) => Math.abs(width - wanted) <= TOLERANCE;

async function pointerFrame(width: number, height: number) {
  const [x, y] = global.get_pointer();
  return renderedFrame({x, y, width, height});
}

async function shownWidth() {
  const frame = await pointerFrame(SIZE * PEAK * 2, 4);
  let width = 0;
  while (width < frame.pixbuf.get_width() && frame.near(width, 2, MAGENTA, 24)) width++;
  return width / scale();
}

async function sweep(seconds: number, position: (t: number) => number) {
  let last = 0;
  for (let elapsed = MOTION_STEP_MS; elapsed <= seconds * 1000; elapsed += MOTION_STEP_MS) {
    const x = position(elapsed / 1000);
    moveBy(x - last, 0);
    last = x;
    await pause(MOTION_STEP_MS);
  }
}

const shake = () => sweep(1, t => 110 * Math.sin(2 * Math.PI * 3 * t));
const swipe = () => sweep(0.3, t => 1000 * t);

async function enlargesAndSettles(label: string, start: () => Promise<void>, picture: string | null) {
  await start();
  await eventually(() => spriteWidth() === themeWidth(PEAK), `${label}: the pointer loads at ${PEAK}× its size`);
  await eventually(async () => near(await shownWidth(), SIZE * PEAK), `${label}: the pointer is drawn ${PEAK}× larger`, 1000);
  if (picture) (await pointerFrame(SIZE * PEAK * 2, SIZE * PEAK * 2)).save(picture);
  await eventually(async () => near(await shownWidth(), SIZE), `${label}: the pointer eases back to its size`, 3000);
  await eventually(() => spriteWidth() === themeWidth(1), `${label}: the pointer loads at its own size again`);
}

export async function run() {
  const desktop = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  const saved = {theme: desktop.get_string('cursor-theme'), size: desktop.get_int('cursor-size'), locate: desktop.get_boolean('locate-pointer')};
  const removeTheme = installCursorTheme(THEME, [24, 48, 72, 96, 120, 144], 0xffff00ff);
  try {
    desktop.set_string('cursor-theme', THEME);
    desktop.set_int('cursor-size', SIZE);
    moveTo(START);
    await eventually(() => spriteWidth() === themeWidth(1), 'the pointer takes the check theme');
    await eventually(async () => near(await shownWidth(), SIZE), 'the pointer is drawn at its size');

    await enlargesAndSettles('shaking', shake, 'shake-pointer-large');
    (await pointerFrame(SIZE * PEAK * 2, SIZE * PEAK * 2)).save('shake-pointer-settled');

    await swipe();
    await pause(300);
    require(spriteWidth() === themeWidth(1) && near(await shownWidth(), SIZE), 'a fast swipe leaves the pointer at its size');
    moveTo(START);
    if (scale() !== 1) return;

    kestrel.set_boolean('shake-to-find-pointer', false);
    await shake();
    require(spriteWidth() === themeWidth(1) && near(await shownWidth(), SIZE), 'shaking does nothing with the switch off');

    desktop.set_boolean('locate-pointer', true);
    await enlargesAndSettles('Ctrl', async () => press(Clutter.KEY_Control_L), null);
  } finally {
    kestrel.reset('shake-to-find-pointer');
    desktop.set_boolean('locate-pointer', saved.locate);
    desktop.set_string('cursor-theme', saved.theme);
    desktop.set_int('cursor-size', saved.size);
    removeTheme();
  }
}
