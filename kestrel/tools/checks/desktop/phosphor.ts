import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {checks} from '../lib/check.js';
import {hold, moveTo, press, release} from '../lib/input/input.js';
import {gjs, stopAll, waitForWindow} from '../lib/processes.js';
import {capture, captureFrame, type Frame} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {lock, unlock} from '../lockScreen/lib/shield.js';
import {listed, request} from '../extensions/lib/extensions.js';
import {installStripedApp} from './phosphor/windows.js';
import {attachedEffects, choose, installProbes, nothingAttached, PHOSPHOR, SHADERS, shaders, shadersRun} from './phosphor/effects.js';

const {require, eventually} = checks('phosphor');
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const magnifier = new Gio.Settings({schema_id: 'org.gnome.desktop.a11y.applications'});
const SETTLE_MS = 400;
const TASKBAR_ROOM = 64;
const SAME = 2;
// About 400 ms a frame on a mid-range GPU, slow enough to notice and far from the seconds that make a driver reset it
const SLOW_STEPS_A_PIXEL = 1.2e11;
const CAPTURED_FILTER_SAME = 8;
const INVERT = 'filter_color.rgb = 1.0 - filter_color.rgb;';
const RED_WINDOW = 'window_color = vec4(window_color.a, 0.0, 0.0, window_color.a);';
const HALF_RED = 'outline_color = vec4(0.5, 0.0, 0.0, 0.5) * outline_inside(outline_position);';
const pixels = (logical: number) => Math.round(logical * global.display.get_monitor_scale(global.display.get_primary_monitor()));
const views = () => global.stage.peek_stage_views().length;
const notified = (title: string) => Main.messageTray.getSources().some(source => source.notifications.some(notification => notification.title === title));

async function open(title: string, x: number, y: number) {
  gjs('clients/windows/stripedWindow.js', [title, '500', '340']);
  const window = await waitForWindow(candidate => candidate.get_title() === title);
  window.move_frame(true, x, y);
  await pause(SETTLE_MS);
  return window;
}

async function frame(): Promise<Frame> {
  for (const source of Main.messageTray.getSources())
    for (const notification of [...source.notifications]) notification.destroy();
  await settled();
  moveTo([4, 4]);
  await pause(SETTLE_MS);
  const {x, y, width, height} = Main.layoutManager.primaryMonitor!;
  return captureFrame({x, y, width, height: height - TASKBAR_ROOM});
}

function areaOf(window: ReturnType<typeof global.display.get_focus_window>) {
  const {x, y, width, height} = window!.get_frame_rect();
  return {x, y, width, height};
}

const inside = (box: {x1: number; y1: number; x2: number; y2: number}, area: {x: number; y: number; width: number; height: number}, slack = 0) =>
  box.x1 >= area.x - slack && box.y1 >= area.y - slack && box.x2 <= area.x + area.width + slack && box.y2 <= area.y + area.height + slack;

async function checkOff(before: Frame) {
  await eventually(async () => (await listed(PHOSPHOR))?.state === 'running', 'Phosphor runs');
  require(nothingAttached(), 'installed with everything off, nothing is attached');
  const after = await frame();
  require(after.pixelsApart(before, SAME) === 0, 'installed with everything off, the screen is what it was');
}

async function checkBorder(before: Frame, area: ReturnType<typeof areaOf>) {
  await choose('border', 'color');
  await choose('border-color', '#ff0000');
  await choose('border-width', 3);
  await eventually(() => attachedEffects().overlays === 2, 'a border goes on both windows');
  const bordered = await frame();
  await capture('phosphor-border');
  const {box} = bordered.differences(before);
  const left = bordered.pixelsApart(before, SAME);
  require(left > 0, 'the border shows');
  require(bordered.near(pixels(area.x + 1), pixels(area.y + 120), '#ff0000', 40), 'along the window\'s left edge');
  require(!bordered.near(pixels(area.x + 40), pixels(area.y + 120), '#ff0000', 40) || before.near(pixels(area.x + 40), pixels(area.y + 120), '#ff0000', 40), 'and not in the window');
  require(box.x2 > box.x1, 'only around windows');
  await choose('border', 'off');
  await eventually(() => attachedEffects().overlays === 0, 'turning the border off takes it away');
  require((await frame()).pixelsApart(before, SAME) === 0, 'and leaves the screen as it was');
}

async function checkRules(before: Frame, striped: ReturnType<typeof areaOf>, other: ReturnType<typeof areaOf>) {
  const crt = shaders().windowShader(RED_WINDOW);
  await eventually(() => attachedEffects().effects === 2, 'a window shader goes on every window');
  const red = await frame();
  require(red.near(pixels(striped.x + 120), pixels(striped.y + 120), '#ff0000', 10), 'it changes a window\'s pixels');
  crt.dispose();
  await eventually(nothingAttached, 'taking it away leaves nothing attached');
  require((await frame()).pixelsApart(before, SAME) === 0, 'and the screen as it was');

  const rulesCheck = await listed(PHOSPHOR);
  require(rulesCheck !== null, 'Phosphor is still here');
  await choose('overlay', 'tint');
  await choose('overlay-strength', 1);
  await eventually(() => attachedEffects().overlays === 2, 'an overlay goes on every app');
  const tinted = await frame();
  await choose('overlay', 'off');
  await eventually(() => attachedEffects().overlays === 0, 'it comes off again');
  require(tinted.pixelsApart(before, SAME) > 0, 'and it showed');
  require(inside(tinted.differences(before).box, {x: pixels(Math.min(striped.x, other.x)), y: pixels(Math.min(striped.y, other.y)), width: pixels(1200), height: pixels(800)}, 4), 'only over windows');
}

async function checkFilter(before: Frame) {
  const filter = shaders().filter(INVERT, {captured: true});
  await eventually(() => attachedEffects().views === views(), 'a filter goes on the display');
  const inverted = await frame();
  await capture('phosphor-invert');
  const sample = [300, 300] as const;
  const [r, g, b] = [0, 1, 2].map(offset => before.pixbuf.get_pixels()[sample[1] * before.pixbuf.get_rowstride() + sample[0] * before.pixbuf.get_n_channels() + offset]);
  const hex = `#${[255 - r, 255 - g, 255 - b].map(channel => channel.toString(16).padStart(2, '0')).join('')}`;
  require(inverted.near(sample[0], sample[1], hex, 3), `the filter inverts what's on the screen (${hex})`);
  filter.dispose();
  await eventually(nothingAttached, 'taking it away leaves the display as it was');
  require((await frame()).pixelsApart(before, SAME) === 0, 'and the screen as it was');

  const hidden = shaders().filter(INVERT);
  await eventually(() => attachedEffects().views === views(), 'a filter that stays out of screenshots goes on too');
  require((await frame()).pixelsApart(before, SAME) === 0, 'and screenshots don\'t show it, like night light');
  hidden.dispose();
  await eventually(nothingAttached, 'it comes off');
}

async function checkFullscreen(window: NonNullable<ReturnType<typeof global.display.get_focus_window>>) {
  const filter = shaders().filter(INVERT);
  await eventually(() => attachedEffects().views === views(), 'the filter is on');
  window.make_fullscreen();
  await eventually(() => attachedEffects().views === views() - 1, 'a fullscreen window takes it off its display, so games go straight to the screen');
  window.unmake_fullscreen();
  await eventually(() => attachedEffects().views === views(), 'and it comes back');
  filter.dispose();

  const kept = shaders().filter(INVERT, {fullscreen: true});
  window.make_fullscreen();
  await settled();
  require(attachedEffects().views === views(), 'a filter that asked to stay on fullscreen stays');
  window.unmake_fullscreen();
  kept.dispose();
  await eventually(nothingAttached, 'and comes off with the rest');
}

async function checkShortcut(before: Frame) {
  const filter = shaders().filter(INVERT, {captured: true});
  const overlay = shaders().overlay(HALF_RED);
  await eventually(() => attachedEffects().views === views() && attachedEffects().overlays === 2, 'effects are on');
  hold(Clutter.KEY_Control_L, Clutter.KEY_Alt_L);
  press(Clutter.KEY_Escape);
  release(Clutter.KEY_Control_L, Clutter.KEY_Alt_L);
  await eventually(nothingAttached, 'the shortcut takes every effect off at once');
  require(shaders().off(), 'and says so');
  require(kestrel.get_boolean('screen-effects-off'), 'which lasts across restarts');
  await eventually(() => notified('Screen effects are off'), 'a notification says so');
  require((await frame()).pixelsApart(before, SAME) === 0, 'the screen is back as it was');
  shaders().filter(INVERT, {captured: true}).dispose();
  require(nothingAttached(), 'effects added meanwhile wait');
  kestrel.set_boolean('screen-effects-off', false);
  await eventually(() => attachedEffects().views === views() && attachedEffects().overlays === 2, 'turning them back on brings them back');
  filter.dispose();
  overlay.dispose();
  await eventually(nothingAttached, 'and they come off');
}

async function checkBrokenShaders(before: Frame) {
  require(shaders().check({kind: 'filter', shader: 'this is not GLSL'}) !== null, 'trying a broken shader says what\'s wrong with it');
  require(shaders().check({kind: 'filter', shader: INVERT}) === null, 'and nothing about one that works');
  for (const [add, label] of [
    [() => shaders().filter('this is not GLSL'), 'Filter'],
    [() => shaders().windowShader('nope('), 'Window'],
    [() => shaders().overlay('outline_color = 1;'), 'Overlay'],
    [() => shaders().surfaces('}', ['taskbar']), 'Surfaces'],
    [() => shaders().transition('x', ['open'], 100), 'Transition'],
  ] as const) {
    const effect = add();
    require(effect.problem === 'shader', `a broken ${label} shader turns that effect off`);
    await eventually(() => shaders().problems.some(problem => problem.label === label && problem.problem === 'shader'), 'and tells the extension');
    await eventually(() => notified(`${label} was turned off`), 'and the person');
    require(nothingAttached(), 'and leaves nothing attached');
  }
  require((await listed(SHADERS))?.state === 'running', 'the extension keeps running');
  require((await frame()).pixelsApart(before, SAME) === 0, 'the screen stays as it was');
}

async function checkSlowShader() {
  const shown = global.stage.peek_stage_views().reduce((total, view) => total + view.get_onscreen().get_width() * view.get_onscreen().get_height(), 0);
  const steps = Math.round(SLOW_STEPS_A_PIXEL / shown);
  const slow = `vec3 sum = vec3(0.0); for (int i = 0; i < ${steps}; i++) sum += sin(filter_color.rgb * float(i)) * 0.00001; filter_color.rgb += sum;`;
  const filter = shaders().filter(slow, {animated: 10});
  let corner = 0;
  await eventually(() => {
    moveTo([10 + 60 * (corner++ % 2), 10]);
    return filter.problem === 'slow';
  }, 'a filter that makes frames very slow turns off by itself', 40000);
  await eventually(() => notified('Filter was turned off'), 'and says so');
  await eventually(nothingAttached, 'nothing stays attached');
}

async function checkLockScreen() {
  const filter = shaders().filter(INVERT);
  await eventually(() => attachedEffects().views === views(), 'the filter is on');
  await lock();
  await eventually(() => attachedEffects().views === 0, 'the lock screen goes without filters, so it can always be read');
  await unlock();
  await eventually(() => attachedEffects().views === views(), 'they come back with the desktop');
  filter.dispose();
  await eventually(nothingAttached, 'and go');
}

async function checkMagnifier(before: Frame) {
  const filter = shaders().filter(INVERT, {captured: true});
  await eventually(() => attachedEffects().views === views(), 'the filter is on');
  const plain = await frame();
  magnifier.set_boolean('screen-magnifier-enabled', true);
  await pause(1000);
  const zoomed = await frame();
  require(zoomed.pixelsApart(plain, 8) > 0, 'the magnifier still works over a filter');
  magnifier.set_boolean('screen-magnifier-enabled', false);
  filter.dispose();
  await eventually(nothingAttached, 'the filter comes off');
  await pause(1000);
  require((await frame()).pixelsApart(before, SAME) === 0, 'the screen is back as it was');
}

const IDENTITY_WINDOW = 'window_color = window_color;';
const IDENTITY_FILTER = 'filter_color = filter_color;';

async function sameThrough(what: string, before: Frame, attach: () => {dispose(): void}, tolerance = SAME) {
  const effect = attach();
  await eventually(() => !nothingAttached(), `${what}: the effect is on`);
  const through = await frame();
  require(through.pixelsApart(before, tolerance) === 0, `${what}: a shader that changes nothing changes no pixels (${through.pixelsApart(before, tolerance)} differ)`);
  effect.dispose();
  await eventually(nothingAttached, `${what}: it comes off`);
}

async function checkShapesKept(window: NonNullable<ReturnType<typeof global.display.get_focus_window>>, other: NonNullable<ReturnType<typeof global.display.get_focus_window>>) {
  const appId = window.get_gtk_application_id()!;
  const passThrough = async (what: string) => {
    const before = await frame();
    await sameThrough(`${what}, on windows`, before, () => shaders().windowShader(IDENTITY_WINDOW));
    await sameThrough(`${what}, on the display`, before, () => shaders().filter(IDENTITY_FILTER, {captured: true}), CAPTURED_FILTER_SAME);
  };
  await passThrough('floating with rounded corners');
  await capture('phosphor-identity-floating');
  kestrel.set_boolean('rounded-window-corners', false);
  await passThrough('with square corners');
  kestrel.reset('rounded-window-corners');
  window.maximize();
  await passThrough('maximized');
  window.unmaximize();
  kestrel.set_strv('see-through-apps', [`${appId}.desktop`]);
  await passThrough('see-through');
  kestrel.reset('see-through-apps');
  other.make_fullscreen();
  await settled();
  other.unmake_fullscreen();
}

function paintsOver(milliseconds: number) {
  let paints = 0;
  const signal = global.stage.connect('after-paint', () => paints++);
  return pause(milliseconds).then(() => {
    global.stage.disconnect(signal);
    return paints;
  });
}

async function checkRest() {
  const still = shaders().filter(INVERT);
  await eventually(() => attachedEffects().views === views(), 'a still filter is on');
  await settled();
  const stillPaints = await paintsOver(1500);
  require(stillPaints <= 1, `a still filter over a still screen draws nothing (${stillPaints} frames)`);
  still.dispose();
  const moving = shaders().filter(`${INVERT} filter_color.r *= 0.9 + 0.1 * sin(filter_time);`, {animated: 20});
  await eventually(() => attachedEffects().views === views(), 'a moving filter is on');
  const movingPaints = await paintsOver(1000);
  require(movingPaints >= 10, `it draws at its own rate (${movingPaints} frames in a second)`);
  const a11y = new Gio.Settings({schema_id: 'org.gnome.desktop.a11y.interface'});
  a11y.set_string('reduced-motion', 'reduce');
  await pause(SETTLE_MS);
  const restingPaints = await paintsOver(1500);
  a11y.reset('reduced-motion');
  require(restingPaints <= 1, `it stops with reduced motion (${restingPaints} frames)`);
  moving.dispose();
  await eventually(nothingAttached, 'and comes off');
}

async function checkDisabling() {
  shaders().filter(INVERT);
  shaders().overlay(HALF_RED);
  shaders().windowShader(RED_WINDOW);
  await eventually(() => !nothingAttached(), 'effects are on');
  await request('Disable', SHADERS);
  await eventually(nothingAttached, 'turning the extension off takes everything it attached away');
  await request('Enable', SHADERS);
  await eventually(async () => (await listed(SHADERS))?.state === 'running', 'it starts again');
}

export async function run() {
  installStripedApp();
  const striped = await open('Striped', 120, 90);
  const other = await open('Other stripes', 700, 300);
  const before = await frame();
  try {
    await installProbes();
    await eventually(shadersRun, 'the shader probe runs');
    await checkOff(before);
    await checkBorder(before, areaOf(striped));
    await checkRules(before, areaOf(striped), areaOf(other));
    await checkFilter(before);
    await checkRest();
    await checkFullscreen(other);
    await settled();
    await checkShapesKept(striped, other);
    await settled();
    const again = await frame();
    await checkShortcut(again);
    await checkBrokenShaders(again);
    await checkLockScreen();
    await checkMagnifier(again);
    await checkDisabling();
    await checkSlowShader();
  } finally {
    await request('Remove', SHADERS);
    await request('Remove', PHOSPHOR);
    await stopAll();
    for (const key of ['extension-settings', 'disabled-extensions', 'screen-effects-off', 'app-lines']) kestrel.reset(key);
    magnifier.reset('screen-magnifier-enabled');
  }
}
