import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import {toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {named, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {centerOf} from '../lib/input.js';
import {gjs, stop, waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {clip} from '../../motion/film.js';
import {fold, tap, touchDown, touchMove, touchUp} from './lib/touch.js';

const {require, eventually} = checks('tablet taskbar');
const STRIP = 24;
const EXPANDED = 64;
const IDLE_COLLAPSE = 5000;
const clips = GLib.build_filenamev([GLib.getenv('KESTREL_CAPTURE_DIR'), 'clips']);

const panel = () => named('kestrel-panel');
const strip = () => named('kestrel-tablet-strip');
const monitor = () => Main.layoutManager.primaryMonitor;
const bottom = () => monitor().y + monitor().height;
const visible = () => bottom() - (panel().y + panel().translation_y);
const resting = () => !panel().get_transition('translation-y');
const collapsed = () => resting() && Math.abs(visible() - STRIP) < 0.5 && !panel().get_children()[0].visible;
const expanded = () => resting() && Math.abs(visible() - EXPANDED) < 0.5 && !strip()?.visible;
const geometry = () => [panel().x, panel().y, panel().width, panel().height, panel().translation_y, panel().style_class].join();
const workBottom = () => {
  const area = Main.layoutManager.getWorkAreaForMonitor(monitor().index);
  return area.y + area.height;
};
const edgePoint = (offset = 2) => [monitor().x + monitor().width / 3, bottom() - offset];

async function swipeUp() {
  const start = edgePoint();
  touchDown(start);
  await touchMove(start, [start[0], start[1] - 30], 4);
  await settled(200);
  require(visible() > STRIP + 10 && visible() < EXPANDED, 'the taskbar follows the finger as it swipes up');
  require(strip().opacity < 255 && panel().get_children()[0].opacity < 255, 'the strip and the full taskbar crossfade under the finger');
  await capture('tablet-swipe-mid');
  await touchMove([start[0], start[1] - 30], [start[0], start[1] - 110], 6);
  touchUp();
}

async function enter(normal) {
  await clip(clips, 'tablet-enter', () => fold(true), {notes: 'Folded into a tablet'});
  await eventually(collapsed, 'folding into a tablet collapses the taskbar into a strip');
  require(strip().visible && strip().opacity === 255, 'the strip shows the time and status');
  await eventually(() => workBottom() === bottom() - STRIP, 'windows get the space above the strip');
  require(geometry() !== normal, 'the tablet taskbar replaces the normal one');
  await capture('tablet-strip');
}

async function expandAndCollapse(window) {
  await clip(clips, 'tablet-swipe-expand', swipeUp, {notes: 'Swiped up from the bottom edge'});
  await eventually(expanded, 'swiping up from the bottom edge expands the taskbar');
  await capture('tablet-expanded');

  const app = Shell.WindowTracker.get_default().get_window_app(window);
  window.minimize();
  await eventually(() => window.minimized, 'the window minimizes');
  const button = named(`kestrel-app-${app.id}`, panel());
  require(button.width >= 52 && button.height >= 52, 'app buttons are sized for fingers');
  await clip(clips, 'tablet-collapse-after-switch', () => tap(centerOf(button)), {notes: 'Tapped an app on the expanded taskbar'});
  await eventually(() => !window.minimized && window.has_focus(), 'tapping an app brings its window back');
  await eventually(collapsed, 'switching to an app collapses the taskbar');

  await clip(clips, 'tablet-tap-expand', () => tap(centerOf(strip())), {notes: 'Tapped the strip'});
  await eventually(expanded, 'tapping the strip expands the taskbar');
  const frame = window.get_frame_rect();
  await tap([frame.x + frame.width / 2, frame.y + frame.height / 2]);
  await eventually(collapsed, 'tapping outside collapses the taskbar');

  await tap(centerOf(strip()));
  await eventually(expanded, 'the strip expands the taskbar again');
  await pause(IDLE_COLLAPSE);
  await eventually(collapsed, 'the taskbar collapses by itself after a while', 2000);
}

async function start() {
  await tap(centerOf(strip()));
  await eventually(expanded, 'the taskbar expands before opening Start');
  await tap(centerOf(named('Start', panel())));
  await eventually(() => shown(named('kestrel-start')), 'Start opens from the expanded taskbar');
  await pause(IDLE_COLLAPSE + 500);
  require(expanded(), 'the taskbar stays expanded while Start is open');
  require(!Main.keyboard.visible, 'Start opens without the on-screen keyboard');
  const startTop = named('kestrel-start').get_transformed_position()[1] + named('kestrel-start').height;
  require(startTop <= bottom() - EXPANDED, 'Start sits above the expanded taskbar');
  await capture('tablet-start');
  toggleSurface('start');
  await eventually(collapsed, 'closing Start collapses the taskbar');
}

export async function run() {
  await settled();
  const normal = geometry();
  const normalWorkBottom = workBottom();
  await capture('tablet-normal-before');
  const app = gjs('clients/window.js');
  try {
    const window = await waitForWindow('Kestrel window check');
    window.maximize();
    await settled();
    await enter(normal);
    await eventually(() => window.get_frame_rect().y + window.get_frame_rect().height === bottom() - STRIP, 'maximized windows reach down to the strip');
    await expandAndCollapse(window);
    await start();
    await clip(clips, 'tablet-leave', () => fold(false), {notes: 'Unfolded into a laptop'});
    await eventually(() => resting() && geometry() === normal, 'unfolding restores the normal taskbar exactly');
    require(!strip(), 'the strip goes away');
    await eventually(() => workBottom() === normalWorkBottom, 'windows give the taskbar its space back');
    await capture('tablet-normal-after');
  } finally {
    await fold(false);
    await stop(app);
  }
}
