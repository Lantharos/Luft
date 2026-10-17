import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import {dismissImmediately} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {withApp} from '../apps/lib/apps.js';
import {show} from '../apps/settings/navigation.js';
import {firstStyled, named, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {centerOf, fingerScroll, liftFingers, moveTo, press, rest} from '../lib/input.js';
import {fixture, gjs, scratch, spawn, stop, waitForWindow} from '../lib/processes.js';
import {settled} from '../lib/wait.js';

const {require, eventually} = checks('scrolling');
const DISTANCE = 120;
const SLOWEST = 0.8;
const FASTEST = 1.3;
const GTK_TOUCHPAD_FACTOR = 2.5;
const HELIUM_OPEN_TIMEOUT = 60000;
const SCHELF_CHROMIUM_FEATURES = '--enable-features=WaylandUnscaledTouchpadScrolling:scroll_scaling_factor/1';
const PAGE_STRIP = {x: 0.45, width: 0.4, top: 140, height: 160, reach: 300};

function requireSane(surface, moved, factor = 1) {
  const ratio = moved / (DISTANCE * factor);
  console.log(`Kestrel scrolling: ${surface} moves ${moved.toFixed(1)} px for ${DISTANCE} px of touchpad travel`);
  require(ratio >= SLOWEST && ratio <= FASTEST, `${surface} follows the fingers on the touchpad`);
}

async function scrollOver(target) {
  moveTo(target);
  await settled();
  await fingerScroll(DISTANCE);
  await settled();
}

async function finish() {
  liftFingers();
  rest();
  await settled();
}

async function checkGtk() {
  const process = gjs('clients/window.js', ['--scroll']);
  const window = await waitForWindow('Kestrel window check');
  window.activate(global.get_current_time());
  await scrollOver(centerOf(window.get_compositor_private()));
  await eventually(() => window.title.startsWith('Kestrel scrolled:'), 'the GTK window scrolls');
  requireSane('a GTK window', Number(window.title.split(': ')[1]), GTK_TOUCHPAD_FACTOR);
  await finish();
  await stop(process);
}

async function checkShell() {
  const process = gjs('clients/window.js', ['--entry']);
  const window = await waitForWindow('Kestrel window check');
  await eventually(() => window.has_focus() && Main.inputMethod.caret, 'the text field takes the keyboard');
  press(Clutter.KEY_Super_L, Clutter.KEY_period);
  await eventually(() => shown(named('kestrel-emoji')), 'Super+. opens the emoji panel');
  await settled();
  const grid = firstStyled('kestrel-emoji-grid');
  await scrollOver(centerOf(grid));
  requireSane('the emoji panel', grid.vadjustment.value);
  await finish();
  dismissImmediately();
  await stop(process);
}

function difference(from, to, {stride, channels, width}, offset, rows) {
  let total = 0;
  for (let row = 0; row < rows; row += 2) {
    const [shifted, current] = [(row + offset) * stride, row * stride];
    for (let column = 0; column < width; column += channels * 2)
      total += Math.abs(from[shifted + column] - to[current + column]);
  }
  return total;
}

function upwardShift(before, after, rows, reach) {
  const [from, to] = [before.pixbuf.get_pixels(), after.pixbuf.get_pixels()];
  const channels = before.pixbuf.get_n_channels();
  const layout = {stride: before.pixbuf.get_rowstride(), channels, width: before.pixbuf.get_width() * channels};
  let best = {offset: 0, difference: Infinity};
  for (let offset = 0; offset <= reach; offset++) {
    const current = difference(from, to, layout, offset, rows);
    if (current < best.difference) best = {offset, difference: current};
  }
  return best.offset;
}

async function checkSabine() {
  await withApp('settings', [], async app => {
    await show(app, 'appearance');
    const frame = app.window.get_frame_rect();
    const strip = app.area({x: Math.round(frame.width * PAGE_STRIP.x), y: PAGE_STRIP.top, width: Math.round(frame.width * PAGE_STRIP.width), height: PAGE_STRIP.height + PAGE_STRIP.reach});
    const before = await app.frame(strip);
    await scrollOver([strip.x + strip.width / 2, strip.y + strip.height / 2]);
    const after = await app.settle(() => true, strip);
    const scale = before.pixbuf.get_width() / strip.width;
    const moved = upwardShift(before, after, Math.round(PAGE_STRIP.height * scale), Math.round(PAGE_STRIP.reach * scale)) / scale;
    require(moved > 0, 'a Sabine app scrolls');
    requireSane('a Sabine app', moved);
    await finish();
  });
}

async function checkHelium(appImage) {
  const page = `file://${fixture('pages', 'scroll.html')}`;
  const process = spawn([appImage, `--user-data-dir=${scratch('kestrel-helium')}`, '--no-first-run', '--no-default-browser-check', '--password-store=basic', SCHELF_CHROMIUM_FEATURES, page],
    {env: {APPIMAGE_EXTRACT_AND_RUN: '1', TMPDIR: scratch()}});
  const window = await waitForWindow(candidate => candidate.get_title()?.startsWith('Kestrel page'), 'Helium opens the page', HELIUM_OPEN_TIMEOUT);
  require(window.get_client_type() === Meta.WindowClientType.WAYLAND, 'Helium runs on Wayland');
  window.activate(global.get_current_time());
  await scrollOver(centerOf(window.get_compositor_private()));
  await eventually(() => window.title.startsWith('Kestrel scrolled:'), 'the page scrolls');
  await settled();
  requireSane('a page in Helium', parseFloat(window.title.split(': ')[1]));
  await finish();
  window.delete(global.get_current_time());
  await process.exited;
}

export async function run() {
  await checkShell();
  await checkGtk();
  await checkSabine();
  const helium = GLib.getenv('KESTREL_HELIUM');
  if (helium) await checkHelium(helium);
  else console.log('Kestrel scrolling: Helium skipped without KESTREL_HELIUM');
}
