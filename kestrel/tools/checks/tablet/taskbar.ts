import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';
import {toggleSurface, Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {firstStyled, named, ofType, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {centerOf, type Point} from '../lib/input/input.js';
import {gjs, stop, waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {clip} from '../../motion/film.js';
import {fold, tap, touchDown, touchMove, touchUp} from './lib/touch.js';

const {require, eventually} = checks('tablet taskbar');
const STRIP = 24;
const EXPANDED = 64;
const IDLE_COLLAPSE = 5000;
const DRAG_COMPLETES = 80;
const clips = GLib.build_filenamev([GLib.getenv('KESTREL_CAPTURE_DIR')!, 'clips']);

const panel = () => ofType(named('kestrel-panel'), St.Widget);
const strip = () => named('kestrel-tablet-strip');
const handle = () => firstStyled('kestrel-tablet-strip-handle', strip()!)!;
const monitor = () => Main.layoutManager.primaryMonitor!;
const bottom = () => monitor().y + monitor().height;
const visible = () => bottom() - (panel().y + panel().translation_y);
const lifted = () => bottom() - (panel().y + panel().translation_y + panel().height);
const resting = () => !panel().get_transition('translation-y');
const collapsed = () => resting() && Math.abs(visible() - STRIP) < 0.5 && !panel().get_children()[0].visible;
const expanded = () => resting() && Math.abs(visible() - EXPANDED) < 0.5 && !strip()?.visible;
const geometry = () => [panel().x, panel().y, panel().width, panel().height, panel().translation_y, panel().style_class].join();
const workBottom = () => {
  const area = Main.layoutManager.getWorkAreaForMonitor(monitor().index);
  return area.y + area.height;
};
const fullWidth = () => Math.round(monitor().width * global.display.get_monitor_scale(monitor().index));
const edgePoint = (offset = 2): Point => [monitor().x + monitor().width / 3, bottom() - offset];

async function swipeUp() {
  const start = edgePoint();
  touchDown(start);
  await touchMove(start, [start[0], start[1] - 30], 4);
  await settled(200);
  require(visible() > STRIP + 10 && visible() < EXPANDED, 'the taskbar follows the finger as it swipes up');
  require(strip()!.opacity < 255 && panel().get_children()[0].opacity < 255, 'the strip and the full taskbar crossfade under the finger');
  require(handle().scale_x > 1 && handle().opacity < 255, 'the handle stretches and fades as the taskbar comes out');
  await capture('tablet-swipe-mid');
  const stretch: Point = [start[0], bottom() - DRAG_COMPLETES + 2];
  await touchMove([start[0], start[1] - 30], stretch, 4);
  await settled(200);
  require(visible() > EXPANDED + 10, 'the taskbar stretches past fully open under the finger');
  const apps = panel().get_children()[0];
  require(apps.get_transformed_position()[1] < bottom() - (EXPANDED + apps.height) / 2 - 1, 'the apps lift with the stretch');
  await capture('tablet-swipe-overscroll');
  await touchMove(stretch, [start[0], start[1] - 110], 3);
  touchUp();
}

async function widestLift(action: () => Promise<unknown>) {
  let widest = 0;
  const signal = global.stage.connect_after('after-paint', () => {
    widest = Math.max(widest, lifted());
  });
  try {
    await action();
  } finally {
    global.stage.disconnect(signal);
  }
  return widest;
}

async function widestGap(window: Meta.Window, action: () => Promise<unknown>) {
  let widest = 0;
  const signal = global.stage.connect_after('after-paint', () => {
    const frame = window.get_frame_rect();
    widest = Math.max(widest, panel().y + panel().translation_y - (frame.y + frame.height));
  });
  try {
    await action();
  } finally {
    global.stage.disconnect(signal);
  }
  return widest;
}

async function enter(normal: string, window: Meta.Window) {
  const gap = await widestGap(window, () => clip(clips, 'tablet-enter', () => fold(true), {notes: 'Folded into a tablet', width: fullWidth()}));
  require(gap < 0.5, `the maximized window stays under the taskbar as it folds into the strip (gap of ${gap}px)`);
  await eventually(collapsed, 'folding into a tablet collapses the taskbar into a strip');
  require(strip()!.visible && strip()!.opacity === 255, 'the strip shows the time and status');
  const [handleX] = handle().get_transformed_position();
  const [handleWidth] = handle().get_transformed_size();
  require(Math.abs(handleX + handleWidth / 2 - (monitor().x + monitor().width / 2)) < 1 && handle().opacity === 255,
    'the handle sits in the middle of the strip');
  await eventually(() => workBottom() === bottom() - STRIP, 'windows get the space above the strip');
  require(geometry() !== normal, 'the tablet taskbar replaces the normal one');
  await capture('tablet-strip');
}

async function expandAndCollapse(window: Meta.Window) {
  const lift = await widestLift(() => clip(clips, 'tablet-swipe-expand', swipeUp,
    {notes: 'Swiped up from the bottom edge and past fully open', width: fullWidth()}));
  require(lift < 0.5, `the taskbar stays on the bottom edge while it stretches (lifted ${lift}px)`);
  await eventually(expanded, 'swiping up from the bottom edge expands the taskbar');
  await capture('tablet-expanded');

  const app = Shell.WindowTracker.get_default().get_window_app(window);
  window.minimize();
  await eventually(() => window.minimized, 'the window minimizes');
  const button = named(`kestrel-app-${app.id}`, panel())!;
  require(button.width >= 52 && button.height >= 52, 'app buttons are sized for fingers');
  await clip(clips, 'tablet-collapse-after-switch', () => tap(centerOf(button)), {notes: 'Tapped an app on the expanded taskbar'});
  await eventually(() => !window.minimized && window.has_focus(), 'tapping an app brings its window back');
  await eventually(collapsed, 'switching to an app collapses the taskbar');
  await eventually(() => handle().opacity === 255 && handle().scale_x === 1, 'the handle comes back when the taskbar folds away');

  await clip(clips, 'tablet-tap-expand', () => tap(centerOf(strip()!)), {notes: 'Tapped the strip'});
  await eventually(expanded, 'tapping the strip expands the taskbar');
  const frame = window.get_frame_rect();
  await tap([frame.x + frame.width / 2, frame.y + frame.height / 2]);
  await eventually(collapsed, 'tapping outside collapses the taskbar');

  await tap(centerOf(strip()!));
  await eventually(expanded, 'the strip expands the taskbar again');
  await pause(IDLE_COLLAPSE);
  await eventually(collapsed, 'the taskbar collapses by itself after a while', 2000);
}

async function start() {
  await tap(centerOf(strip()!));
  await eventually(expanded, 'the taskbar expands before opening Start');
  await tap(centerOf(named('Start', panel())!));
  await eventually(() => shown(named('kestrel-start')), 'Start opens from the expanded taskbar');
  await pause(IDLE_COLLAPSE + 500);
  require(expanded(), 'the taskbar stays expanded while Start is open');
  require(!Main.keyboard.visible, 'Start opens without the on-screen keyboard');
  const startTop = named('kestrel-start')!.get_transformed_position()[1] + named('kestrel-start')!.height;
  require(startTop <= bottom() - EXPANDED, 'Start sits above the expanded taskbar');
  await capture('tablet-start');
  toggleSurface('start');
  await eventually(collapsed, 'closing Start collapses the taskbar');
}

async function movesWhileShown(action: () => Promise<unknown>) {
  let moved = false;
  let last = geometry();
  const signal = global.stage.connect_after('after-paint', () => {
    if (geometry() !== last && panel().opacity > 0) moved = true;
    last = geometry();
  });
  try {
    await action();
  } finally {
    global.stage.disconnect(signal);
  }
  return moved;
}

async function reducedMotion(normal: string) {
  const a11y = new Gio.Settings({schema_id: 'org.gnome.desktop.a11y.interface'});
  a11y.set_string('reduced-motion', 'reduce');
  try {
    require(!await movesWhileShown(() => clip(clips, 'tablet-enter-reduced', () => fold(true), {notes: 'Folded with reduced motion'})),
      'with reduced motion the taskbar fades into the strip instead of moving');
    await eventually(collapsed, 'with reduced motion folding still collapses the taskbar into a strip');
    require(!await movesWhileShown(() => clip(clips, 'tablet-leave-reduced', () => fold(false), {notes: 'Unfolded with reduced motion'})),
      'with reduced motion the normal taskbar fades back in place');
    await eventually(() => resting() && geometry() === normal && panel().opacity === 255, 'with reduced motion unfolding restores the normal taskbar');
  } finally {
    a11y.reset('reduced-motion');
  }
}

export async function run() {
  await settled();
  const normal = geometry();
  const normalWorkBottom = workBottom();
  await capture('tablet-normal-before');
  const app = gjs('clients/windows/window.js');
  try {
    const window = await waitForWindow('Kestrel window check');
    window.maximize();
    await settled();
    await enter(normal, window);
    await eventually(() => window.get_frame_rect().y + window.get_frame_rect().height === bottom() - STRIP, 'maximized windows reach down to the strip');
    await expandAndCollapse(window);
    await start();
    const gap = await widestGap(window, () => clip(clips, 'tablet-leave', () => fold(false), {notes: 'Unfolded into a laptop', width: fullWidth()}));
    require(gap < 0.5, `the maximized window stays under the taskbar as it unfolds (gap of ${gap}px)`);
    await eventually(() => resting() && geometry() === normal, 'unfolding restores the normal taskbar exactly');
    require(!strip(), 'the strip goes away');
    await eventually(() => workBottom() === normalWorkBottom, 'windows give the taskbar its space back');
    await capture('tablet-normal-after');
    await reducedMotion(normal);
  } finally {
    await fold(false);
    await stop(app);
  }
}
