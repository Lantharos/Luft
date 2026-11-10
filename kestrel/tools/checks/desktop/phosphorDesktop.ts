import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {descendants} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {moveTo} from '../lib/input/input.js';
import {gjs, stopAll, waitForWindow} from '../lib/processes.js';
import {captureFrame, renderedFrame, shownAndRepainted, type Area, type Frame} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {listed, request} from '../extensions/lib/extensions.js';
import {attachedEffects, choose, installProbes, nothingAttached, PHOSPHOR, SHADERS, shadersRun} from './phosphor/effects.js';
import {installStripedApp} from './phosphor/windows.js';

const {require, eventually} = checks('phosphor on the desktop');
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const SAME = 2;
const BLEND_TOLERANCE = 5;
const CLEARLY_CHANGED = 48;
const WINDOW_MARGIN = 40;
const MOVES = 12;
const TASKBAR_CLOCK_PIXELS = 1500;
const ONE_PICTURE_TOLERANCE = 6;
const ONE_PICTURE_SHARE = 0.005;
const TASKBAR_STYLES = ['bar', 'floating', 'separate'];

const PaintCount = GObject.registerClass(class PaintCount extends Clutter.Effect {
  count = 0;

  vfunc_paint_node(root: Clutter.PaintNode): void {
    this.count++;
    root.add_child(Clutter.ActorNode.new(this.get_actor(), -1));
  }
});

const screen = (): Area => {
  const {x, y, width, height} = Main.layoutManager.primaryMonitor!;
  return {x, y, width, height};
};

async function frame() {
  await settled();
  await pause(250);
  return renderedFrame(screen());
}

async function shownWithFilter() {
  await settled();
  await pause(250);
  return captureFrame(screen());
}

async function pixelsOf(shot: Frame) {
  const {pixbuf} = shot;
  const pixels = pixbuf.get_pixels();
  const [stride, size] = [pixbuf.get_rowstride(), pixbuf.get_n_channels()];
  return (x: number, y: number) => [0, 1, 2].map(channel => pixels[y * stride + x * size + channel]);
}

async function pixelsBroken(area: Area, plain: Frame, filtered: Frame, withWindow: Frame, filteredWithWindow: Frame) {
  const [desktop, desktopFiltered, shown, shownFiltered] = await Promise.all([plain, filtered, withWindow, filteredWithWindow].map(pixelsOf));
  const scale = global.display.get_monitor_scale(global.display.get_primary_monitor());
  let broken = 0;
  for (let y = Math.round(area.y * scale); y < (area.y + area.height) * scale; y++) {
    for (let x = Math.round(area.x * scale); x < (area.x + area.width) * scale; x++) {
      const [was, is] = [desktop(x, y), desktopFiltered(x, y)];
      const change = is.map((value, channel) => value - was[channel]);
      const widest = change.reduce((best, value, channel) => Math.abs(value) > Math.abs(change[best]) ? channel : best, 0);
      if (Math.abs(change[widest]) < CLEARLY_CHANGED) continue;
      const [before, after] = [shown(x, y), shownFiltered(x, y)];
      const through = (after[widest] - before[widest]) / change[widest];
      const fits = through > -0.04 && through < 1.04 &&
        change.every((value, channel) => Math.abs(after[channel] - before[channel] - value * through) <= BLEND_TOLERANCE);
      if (!fits) broken++;
    }
  }
  return broken;
}

async function open(title: string, x: number, y: number) {
  gjs('clients/windows/stripedWindow.js', [title, '520', '360']);
  const window = await waitForWindow(candidate => !!candidate.get_title()?.startsWith(title), `${title} opens`);
  window.move_frame(true, x, y);
  await pause(300);
  return window;
}

const around = ({x, y, width, height}: Area): Area => ({x: x - WINDOW_MARGIN, y: y - WINDOW_MARGIN, width: width + 2 * WINDOW_MARGIN, height: height + 2 * WINDOW_MARGIN});

const taskbarArea = (): Area => {
  const island = descendants(global.stage).find(actor => actor.mapped && actor instanceof St.Widget && actor.has_style_class_name('kestrel-panel'))!;
  const [x, y] = island.get_transformed_position();
  const [width, height] = island.get_transformed_size();
  return {x, y, width, height};
};

async function desktopOnly() {
  await choose('filters-scope', 'desktop');
  await choose('invert', 'colors');
  await eventually(() => attachedEffects().layers > 0, 'the filter goes on the desktop');
  require(attachedEffects().views === 0, 'and not over the display');
}

async function checkWindowsStayTheirOwn() {
  const plain = await frame();
  const taskbar = taskbarArea();
  const plainTaskbar = await renderedFrame(taskbar);
  await desktopOnly();
  const filtered = await frame();
  require(filtered.pixelsApart(plain, 8) > 0.9 * screen().width * screen().height, 'the desktop changes');
  const filteredTaskbar = await renderedFrame(taskbar);
  const scale = global.display.get_monitor_scale(global.display.get_primary_monitor());
  require(filteredTaskbar.pixelsApart(plainTaskbar, 8) > 0.5 * taskbar.width * taskbar.height * scale * scale, 'the taskbar changes');
  await choose('invert', 'off');
  await eventually(nothingAttached, 'and it comes off');

  const window = await open('Striped', 200, 150);
  const area = window.get_frame_rect();
  const withWindow = await frame();
  require(withWindow.pixelsApart(plain, 8) > 0, 'the window shows');
  const inside: Area = {x: area.x + 24, y: area.y + 24, width: area.width - 48, height: area.height - 48};
  const insideWas = await renderedFrame(inside);
  await desktopOnly();
  const filteredWithWindow = await frame();
  filteredWithWindow.save('phosphor-desktop-invert');
  require((await renderedFrame(inside)).looksLike(insideWas, SAME), 'a filtered desktop leaves the window alone');
  require(await pixelsBroken(around(area), plain, filtered, withWindow, filteredWithWindow) === 0,
    'the window\'s corners and shadow show the filtered desktop, with no halo');

  await choose('filters-scope', 'screen');
  await choose('filters-captured', true);
  await eventually(() => attachedEffects().views > 0, 'over the whole screen the filter goes on the display');
  const overEverything = await shownWithFilter();
  overEverything.save('phosphor-desktop-control');
  require(await pixelsBroken(around(area), plain, filtered, withWindow, overEverything) > 0, 'and the same measure sees it on the window');
  await choose('filters-captured', false);
  await choose('invert', 'off');
  await eventually(nothingAttached, 'turning it off leaves nothing attached');
  require((await frame()).pixelsApart(withWindow, SAME) < TASKBAR_CLOCK_PIXELS, 'and the screen is what it was');
  return window;
}

async function repaintsFollowing(label: string, change: (step: number) => void) {
  for (let step = 0; step < MOVES; step++) {
    change(step);
    await pause(40);
  }
  await pause(120);
  const [shown, repainted] = await shownAndRepainted();
  const {count, box} = shown.differences(repainted);
  if (shown.pixelsApart(repainted, SAME)) {
    console.log(`phosphor on the desktop: ${label} left ${count} pixels in ${box.x1},${box.y1} to ${box.x2},${box.y2}`);
    shown.save('phosphor-desktop-stale-shown');
    repainted.save('phosphor-desktop-stale-repainted');
  }
  require(shown.pixelsApart(repainted, SAME) === 0, `${label} leaves nothing behind`);
}

async function checkBentPointer(window: Meta.Window) {
  const standIn = () => descendants(global.stage).find(actor => actor.name === 'kestrel-desktop-pointer')!;
  const {x, y, width, height} = window.get_frame_rect();
  moveTo([x + width / 2, y + height / 2]);
  await eventually(() => !standIn().visible, 'over a window the pointer stays the real one');
  const bottom = screen().height - 12;
  moveTo([screen().width / 2, bottom]);
  await eventually(() => standIn().visible, 'over the taskbar it\'s drawn into the bent picture');
  require(standIn().get_y() < bottom - 8, 'where the taskbar shows');
  moveTo([4, 4]);
}

async function checkMovingWindows(window: Meta.Window) {
  const count = new PaintCount();
  await desktopOnly();
  await frame();
  Main.layoutManager.backgroundGroup.add_effect(count);
  await frame();
  count.count = 0;
  await repaintsFollowing('moving a window', step => window.move_frame(true, 200 + step * 37, 150 + step * 11));
  await repaintsFollowing('resizing a window', step => window.move_resize_frame(true, 300, 200, 520 - step * 20, 360 - step * 12));
  require(count.count === 0, 'and the wallpaper never paints again for it');
  Main.layoutManager.backgroundGroup.remove_effect(count);

  await choose('desktop-crt', true);
  await choose('crt-curvature', 1);
  await eventually(() => attachedEffects().layers > 0, 'a curved tube goes on');
  await repaintsFollowing('moving a window over a curved desktop', step => window.move_frame(true, 200 + step * 31, 150 + step * 9));
  const bare = await frame();
  const sprite = new St.Widget({width: 48, height: 48, x: 1250, y: 60, style: 'background-color: #ff2828;'});
  Main.layoutManager.desktopLayer.add_child(sprite);
  require((await frame()).pixelsApart(bare, 8) > 0, 'something on the wallpaper shows');
  await repaintsFollowing('something moving on a curved wallpaper', step => sprite.set({translation_x: step * 7, translation_y: step * 5}));
  sprite.destroy();
  (await frame()).save('phosphor-desktop-curved');
  await checkBentPointer(window);
  await choose('crt-curvature', 0);
  await choose('desktop-crt', false);
  await choose('invert', 'off');
  await eventually(nothingAttached, 'and it comes off');
}

async function paintsOverOneSecond() {
  const {x, y} = screen();
  let paints = 0;
  const signal = global.stage.connect('after-paint', (_stage, view) => {
    if (view.layout.x === x && view.layout.y === y) paints++;
  });
  await pause(1000);
  global.stage.disconnect(signal);
  return paints;
}

async function checkFlickerCost(window: Meta.Window) {
  await desktopOnly();
  await settled();
  moveTo([4, 4]);
  await pause(500);
  require(await paintsOverOneSecond() === 0, 'a still desktop filter paints nothing');
  await choose('desktop-crt', true);
  await choose('crt-flicker', true);
  await eventually(async () => await paintsOverOneSecond() > 15, 'flicker keeps moving on the desktop');
  window.make_fullscreen();
  await eventually(() => window.is_fullscreen(), 'the window goes fullscreen');
  await settled();
  await pause(500);
  require(await paintsOverOneSecond() <= 1, 'and stops painting behind an opaque fullscreen window');
  window.unmake_fullscreen();
  await settled();
  await choose('crt-flicker', false);
  await choose('desktop-crt', false);
  await choose('invert', 'off');
  await eventually(nothingAttached, 'and it comes off');
}

async function checkSeeThroughWindows(window: Meta.Window) {
  const app = Shell.WindowTracker.get_default().get_window_app(window)!.get_id()!;
  kestrel.set_string('see-through-shows', 'wallpaper');
  kestrel.set_double('see-through-opacity', 0.5);
  kestrel.set_strv('see-through-apps', [app]);
  await settled();
  await pause(500);
  const {x, y, width, height} = window.get_frame_rect();
  const area = {x: x + 40, y: y + 80, width: width - 80, height: height - 120};
  const plain = await renderedFrame(area);
  await desktopOnly();
  const layers = attachedEffects().layers;
  await settled();
  await pause(250);
  const filtered = await renderedFrame(area);
  filtered.save('phosphor-desktop-see-through');
  require(layers >= 3 && filtered.pixelsApart(plain, 8) > 0, 'the frozen wallpaper behind a see-through window is filtered too');
  await choose('invert', 'off');
  await eventually(nothingAttached, 'and it comes off');
  for (const key of ['see-through-apps', 'see-through-shows', 'see-through-opacity']) kestrel.reset(key);
}

async function checkCaptures() {
  const plain = await captureFrame(screen());
  await desktopOnly();
  await settled();
  await pause(250);
  require((await captureFrame(screen())).looksLike(plain, SAME), 'screenshots skip the filter by default');
  await choose('filters-captured', true);
  await settled();
  await pause(250);
  require((await captureFrame(screen())).pixelsApart(plain, 8) > 0, 'and show it when asked');
  await choose('filters-captured', false);
  await choose('invert', 'off');
  await eventually(nothingAttached, 'and it comes off');
}

type Setting = readonly [string, boolean | number | string, boolean | number | string];

const LOOKS: Record<string, readonly Setting[]> = {
  invert: [['invert', 'colors', 'off']],
  noir: [['grade', 'noir', 'off']],
  scanlines: [['desktop-crt', true, false]],
  curved: [['desktop-crt', true, false], ['crt-curvature', 0.7, 0]],
  bloom: [['bloom', 0.6, 0]],
  aberration: [['chromatic-aberration', 0.6, 0]],
};

async function checkOnePicture() {
  await stopAll();
  kestrel.set_string('taskbar-look', 'solid');
  await settled();
  await choose('filters-captured', true);
  const {width, height} = screen();
  const scale = global.display.get_monitor_scale(global.display.get_primary_monitor());
  const allowed = ONE_PICTURE_SHARE * width * height * scale * scale;
  for (const style of TASKBAR_STYLES) {
    kestrel.set_string('taskbar-style', style);
    await settled();
    for (const [look, settings] of Object.entries(LOOKS)) {
      await choose('filters-scope', 'screen');
      for (const [key, value] of settings) await choose(key, value);
      await eventually(() => attachedEffects().views > 0, `${look} goes over the display`);
      const whole = await shownWithFilter();
      await choose('filters-scope', 'desktop');
      await eventually(() => attachedEffects().layers > 0, `${look} goes on the desktop`);
      const desktop = await shownWithFilter();
      desktop.save(`phosphor-desktop-${style}-${look}`);
      const apart = desktop.pixelsApart(whole, ONE_PICTURE_TOLERANCE);
      console.log(`phosphor on the desktop: ${look} on a ${style} taskbar differs from the whole screen in ${apart} pixels`);
      if (apart >= allowed) whole.save(`phosphor-desktop-${style}-${look}-whole`);
      require(apart < allowed, `${look} on a ${style} taskbar reads the same as over the whole screen`);
      for (const [key, , off] of settings) await choose(key, off);
      await eventually(nothingAttached, 'and it comes off');
    }
  }
  await choose('filters-captured', false);
}

export async function run() {
  installStripedApp();
  try {
    await installProbes();
    await eventually(shadersRun, 'the probe runs');
    await eventually(async () => (await listed(PHOSPHOR))?.state === 'running', 'Phosphor runs');
    moveTo([4, 4]);
    const window = await checkWindowsStayTheirOwn();
    await checkMovingWindows(window);
    await checkFlickerCost(window);
    await checkSeeThroughWindows(window);
    await checkCaptures();
    await checkOnePicture();
  } finally {
    await request('Remove', SHADERS);
    await request('Remove', PHOSPHOR);
    await stopAll();
    for (const key of ['extension-settings', 'disabled-extensions', 'taskbar-look', 'taskbar-style']) kestrel.reset(key);
  }
}
