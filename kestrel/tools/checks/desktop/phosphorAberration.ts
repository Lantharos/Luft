import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {checks} from '../lib/check.js';
import {moveTo} from '../lib/input/input.js';
import {gjs, stopAll, waitForWindow} from '../lib/processes.js';
import {capture, captureFrame, type Frame} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {listed, request} from '../extensions/lib/extensions.js';
import {act, attachedEffects, choose, installProbes, nothingAttached, pageItems, PHOSPHOR, SHADERS} from './phosphor/effects.js';
import {installStripedApp, STRIPED_DESKTOP_ID} from './phosphor/windows.js';

const {require, eventually} = checks('phosphor chromatic aberration');
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const FURTHEST_OFFSET = 8;
const SAME = 2;
const SEARCH = 24;
const SPAN = 120;
const SHIFT_TOLERANCE = 1.5;

const scale = () => global.display.get_monitor_scale(global.display.get_primary_monitor());

async function frame(): Promise<Frame> {
  await settled();
  moveTo([4, 4]);
  await pause(400);
  const {x, y, width, height} = Main.layoutManager.primaryMonitor!;
  return captureFrame({x, y, width, height: height - 64});
}

function shift(moved: Frame, still: Frame, channel: number, xStart: number, y: number) {
  const row = (frame: Frame) => {
    const {pixbuf} = frame;
    const pixels = pixbuf.get_pixels();
    const offset = y * pixbuf.get_rowstride();
    return (x: number) => pixels[offset + x * pixbuf.get_n_channels() + channel];
  };
  const [a, b] = [row(moved), row(still)];
  let best = 0;
  let lowest = Infinity;
  for (let by = -SEARCH; by <= SEARCH; by++) {
    let difference = 0;
    for (let x = xStart; x < xStart + SPAN; x++) difference += Math.abs(a(x) - b(x + by));
    if (difference < lowest) [lowest, best] = [difference, by];
  }
  return best;
}

async function checkAtRest(before: Frame) {
  await choose('chromatic-aberration', 0);
  require(nothingAttached(), 'at 0, nothing is attached');
  await choose('chromatic-aberration', 0.5);
  await eventually(() => attachedEffects().views > 0, 'above 0, the filter goes on');
  await settled();
  let paints = 0;
  const signal = global.stage.connect('after-paint', () => paints++);
  await pause(1500);
  global.stage.disconnect(signal);
  require(paints <= 1, `it draws nothing while nothing changes (${paints} frames)`);
  await choose('chromatic-aberration', 0);
  await eventually(nothingAttached, 'back at 0, it comes off');
  require((await frame()).pixelsApart(before, SAME) === 0, 'and the screen is what it was');
}

async function checkFringes(before: Frame, width: number, height: number) {
  await choose('filters-captured', true);
  await choose('chromatic-aberration', 1);
  await eventually(() => attachedEffects().views > 0, 'the filter is on');
  const fringed = await frame();
  await capture('phosphor-aberration');
  const y = Math.round(height / 2);
  const x = Math.round(width * 0.08);
  const from = 1 - (x + SPAN / 2) / (width / 2);
  const expected = FURTHEST_OFFSET * scale() * from * from * 0.5;
  const [red, blue] = [shift(fringed, before, 0, x, y), shift(fringed, before, 2, x, y)];
  require(Math.abs(Math.abs(red) - expected) <= SHIFT_TOLERANCE, `red moves ${expected.toFixed(1)} pixels near the edge at this display scale (${red})`);
  require(Math.abs(Math.abs(blue) - expected) <= SHIFT_TOLERANCE, `and blue as far (${blue})`);
  require(Math.sign(red) === -Math.sign(blue), 'the other way');
  const middle = Math.round(width / 2);
  require(shift(fringed, before, 0, middle - SPAN / 2, y) === 0, 'and nothing moves in the middle of the display');
  require(shift(fringed, before, 1, x, y) === 0, 'and green stays where it was');

  await choose('desktop-crt', true);
  await choose('crt-curvature', 0.5);
  await eventually(async () => (await frame()).pixelsApart(fringed, SAME) > 0, 'it goes with CRT and curvature');
  await capture('phosphor-aberration-crt');
  require(attachedEffects().views > 0, 'and stays on');
  await choose('desktop-crt', false);
  await choose('crt-curvature', 0);
  await choose('chromatic-aberration', 0);
  await choose('filters-captured', false);
  await eventually(nothingAttached, 'and everything comes off');
}

async function checkWindows(before: Frame, stripedWindow: ReturnType<typeof global.display.get_focus_window>) {
  const add = (await pageItems()).find(item => item.options?.some(option => option.value === STRIPED_DESKTOP_ID))!;
  await act(add.action!, new GLib.Variant('s', STRIPED_DESKTOP_ID));
  require(nothingAttached(), 'in windows it starts off, even for an app with a rule');
  const rule = (await pageItems()).find(item => item.type === 'list') as unknown as {items: {actions: {label: string; action: string}[]}[]};
  const toggle = rule.items[0].actions.find(action => action.label.startsWith('Chromatic'))!;
  await act(toggle.action, new GLib.Variant('b', true));
  await eventually(() => attachedEffects().effects === 1, 'a rule puts it on that app only');
  const fringed = await frame();
  await capture('phosphor-aberration-window');
  const {x, y, width, height} = stripedWindow!.get_frame_rect();
  const {box} = fringed.differences(before);
  require(fringed.pixelsApart(before, SAME) > 0, 'it changes that window');
  require(box.x1 >= x * scale() - 2 && box.y1 >= y * scale() - 2 && box.x2 <= (x + width) * scale() + 2 && box.y2 <= (y + height) * scale() + 2, 'and nothing outside it');
  const removed = (await pageItems()).find(item => item.type === 'list') as unknown as {items: {actions: {label: string; action: string}[]}[]};
  await act(removed.items[0].actions.find(action => action.label === 'Remove')!.action, new GLib.Variant('b', true));
  await eventually(nothingAttached, 'taking the rule away leaves nothing attached');
  require((await frame()).pixelsApart(before, SAME) === 0, 'and the window as it was');
}

export async function run() {
  installStripedApp();
  const {width, height} = Main.layoutManager.primaryMonitor!;
  gjs('clients/windows/stripedWindow.js', ['Striped', String(width - 60), String(height - 200)]);
  const striped = await waitForWindow(candidate => candidate.get_title() === 'Striped');
  striped.move_frame(true, 20, 30);
  await pause(500);
  try {
    await installProbes();
    await eventually(async () => (await listed(PHOSPHOR))?.state === 'running', 'Phosphor runs');
    const before = await frame();
    await checkAtRest(before);
    await checkFringes(before, width * scale(), (height - 64) * scale());
    await checkWindows(before, striped);
  } finally {
    await request('Remove', SHADERS);
    await request('Remove', PHOSPHOR);
    await stopAll();
    for (const key of ['extension-settings', 'disabled-extensions']) kestrel.reset(key);
  }
}
