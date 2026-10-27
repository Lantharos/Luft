import type Meta from 'gi://Meta';

import {withPalette, useScheme, type Palette, type Scheme} from '../apps/lib/palette.js';
import {checks} from '../lib/check.js';
import {gjs, waitForWindow} from '../lib/processes.js';
import {capture, captureFrame} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';

const {require, eventually} = checks('X11 frames');
const TOLERANCE = 3;
const WINDOWS = [['Field notes', '#e8e4da', 520, 300], ['Sketchbook', '#2e3a46', 120, 140]] as const;
const TITLEBAR: Record<Scheme, string> = {light: 'surfaceContainer', dark: 'surfaceDim'};

async function open([title, background, x, y]: readonly [string, string, number, number]) {
  gjs('clients/x11/x11Window.js', [title, background]);
  const window = await waitForWindow(title, `the X11 window ${title} opens`);
  window.move_frame(true, x, y);
  return window;
}

async function titlebarAt(window: Meta.Window, x: number, y: number, color: string) {
  const frame = window.get_frame_rect();
  const shot = await captureFrame({x: frame.x, y: frame.y, width: frame.width, height: frame.height});
  const scale = shot.pixbuf.get_width() / frame.width;
  return shot.near(Math.round(x * scale), Math.round(y * scale), color, TOLERANCE);
}

async function checkScheme(windows: Meta.Window[], palette: Palette, scheme: Scheme) {
  const [focused, behind] = windows;
  const color = palette[scheme][TITLEBAR[scheme]];
  useScheme(scheme);
  focused.activate(global.get_current_time());
  await eventually(async () => await titlebarAt(behind, behind.get_frame_rect().width / 2, 8, color),
    `the X11 title bar takes the ${scheme} ${TITLEBAR[scheme]} color`);
  const decorated = focused.get_frame_rect().height - focused.frame_rect_to_client_rect(focused.get_frame_rect()).height;
  require(decorated >= 36 && decorated <= 44, `the ${scheme} X11 title bar is ${decorated} px tall`);
  require(!await titlebarAt(focused, 1, 1, color), `a floating X11 frame keeps its rounded corner in the ${scheme} style`);
  await capture(`x11-frames-${scheme}`);

  focused.maximize();
  await eventually(() => focused.is_maximized(), `the ${scheme} X11 window maximizes`);
  await settled();
  require(await titlebarAt(focused, 1, 1, color), `a maximized X11 frame squares its corner in the ${scheme} style`);
  await capture(`x11-frames-${scheme}-maximized`);
  focused.unmaximize();
  await eventually(() => !focused.is_maximized(), `the ${scheme} X11 window restores`);
}

export async function run() {
  const windows = await Promise.all(WINDOWS.map(open));
  await settled();
  await withPalette(async palette => {
    await checkScheme(windows, palette, 'light');
    await checkScheme(windows, palette, 'dark');
  });
}
