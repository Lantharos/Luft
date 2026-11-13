import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';

import {descendants} from '../../lib/actors.js';
import {checks} from '../../lib/check.js';
import {moveTo, type Point, press, rest} from '../../lib/input/input.js';
import {type Area, captureFrame, capture, type Frame} from '../../lib/screenshots.js';
import {pause} from '../../lib/wait.js';
import {openWindow} from '../../tiling/lib/tiling.js';
import {SEASONS, setSetting} from '../../extensions/lib/extensions.js';
import {setPowerProfile} from './playthings.js';

const {require, eventually} = checks('seasons');
const a11y = new Gio.Settings({schema_id: 'org.gnome.desktop.a11y.interface'});
const seat = global.stage.context.get_backend().get_default_seat();
const touchscreen = seat.create_virtual_device(Clutter.InputDeviceType.TOUCHSCREEN_DEVICE);
const POINT: Point = [1200, 430];
const CORE = 18;
const SAMPLES = 14;
const SAMPLE_GAP_MS = 110;
const TYPICAL_OF = 3;
const SETTLE_MS = 1400;
const SHOWING = 15;
const STILL_PARTED = 0.35;
const BACK = 0.55;
const RARE_MS = 20000;
const FOREVER_MS = 60000;
const now = () => GLib.get_monotonic_time();

const around = ([x, y]: Point, reach = CORE): Area => ({x: x - reach, y: y - reach, width: reach * 2, height: reach * 2});

async function activity(area: Area) {
  let total = 0;
  let last: Frame | null = null;
  for (let look = 0; look < SAMPLES; look++) {
    const frame = await captureFrame(area);
    if (last) total += frame.pixelsApart(last, 6);
    last = frame;
    await pause(SAMPLE_GAP_MS);
  }
  return total;
}

async function typicalActivity(area: Area) {
  const seen = [];
  for (let sample = 0; sample < TYPICAL_OF; sample++) seen.push(await activity(area));
  return seen.sort((a, b) => a - b)[Math.floor(TYPICAL_OF / 2)];
}

export const listening = () => descendants(global.window_group).some(actor => actor instanceof Meta.BackgroundActor &&
  !!GObject.signal_handler_find(actor, {signalId: 'motion-event'} as GObject.SignalMatch));

async function showing() {
  let seen = 0;
  await eventually(async () => (seen = await activity(around(POINT))) > SHOWING, 'something falls through the spot', RARE_MS);
  return seen;
}

async function partedBy(move: () => void, release: () => void, name: string, shot: string | null) {
  rest();
  await pause(SETTLE_MS);
  const away = await showing();
  move();
  await pause(SETTLE_MS);
  if (shot) await capture(shot);
  const near = await activity(around(POINT));
  require(near < away * STILL_PARTED, `${name} parts around it (${near} changing pixels against ${away})`);
  release();
  await pause(SETTLE_MS);
  await showing();
}

export const partsForPointer = (name: string, shot: string) => partedBy(() => moveTo(POINT), rest, name, shot);

async function checkFinger() {
  const settings = global.stage.context.get_settings();
  const longPress = settings.long_press_duration;
  settings.long_press_duration = FOREVER_MS;
  await partedBy(() => touchscreen.notify_touch_down(now(), 0, ...POINT), () => touchscreen.notify_touch_up(now(), 0), 'rain under a finger', null);
  settings.long_press_duration = longPress;
}

async function checkLongPress() {
  touchscreen.notify_touch_down(now(), 0, ...POINT);
  await pause(SETTLE_MS);
  touchscreen.notify_touch_up(now(), 0);
  press(Clutter.KEY_Escape);
  await pause(SETTLE_MS);
  await showing();
}

async function checkWindowInFront() {
  const under: Point = [POINT[0] + 28, POINT[1]];
  moveTo(under);
  await pause(SETTLE_MS);
  const parted = await activity(around(POINT));
  const {window} = await openWindow('In front', 420, 300);
  window.move_frame(true, under[0] - 400, POINT[1] - 150);
  await eventually(() => window.get_frame_rect().x === under[0] - 400, 'the window moves over the pointer');
  const beside: Point = [under[0] + 40, under[1]];
  await pause(SETTLE_MS);
  const open = await typicalActivity(around(beside));
  moveTo([under[0] - 12, under[1]]);
  await pause(SETTLE_MS);
  const onWindow = await typicalActivity(around(beside));
  require(open > parted, `a window opening under the pointer lets what falls close up (${open} against ${parted})`);
  require(onWindow > open * BACK, `nothing reacts through the window (${onWindow} against ${open})`);
  window.delete(global.get_current_time());
  await eventually(() => !global.display.list_all_windows().includes(window), 'the window closes');
}

async function checkStopsListening() {
  moveTo(POINT);
  await eventually(listening, 'it hears the pointer while rain falls');
  await setSetting(SEASONS, 'part', new GLib.Variant('b', false));
  await eventually(() => !listening(), 'turning it off stops listening to the pointer');
  await setSetting(SEASONS, 'part', new GLib.Variant('b', true));
  await eventually(listening, 'turning it on listens again');
  a11y.set_string('reduced-motion', 'reduce');
  await eventually(() => !listening(), 'reduced motion stops listening to the pointer');
  a11y.reset('reduced-motion');
  await eventually(listening, 'and it listens once motion is back');
  await setPowerProfile('power-saver');
  await eventually(() => !listening(), 'the power saver stops listening to the pointer');
  await setPowerProfile('balanced');
  await eventually(listening, 'and it listens once the power saver is off');
  await setSetting(SEASONS, 'effect', new GLib.Variant('s', 'fog'));
  await eventually(() => !listening(), 'mist, which stays where it is, does not listen');
  await setSetting(SEASONS, 'effect', new GLib.Variant('s', 'rain'));
  await eventually(listening, 'rain listens again');
  await setSetting(SEASONS, 'visible', new GLib.Variant('b', false));
  await eventually(() => !listening(), 'hiding it from the desktop stops listening');
  await setSetting(SEASONS, 'visible', new GLib.Variant('b', true));
  await eventually(listening, 'showing it listens again');
}

export async function checkParting() {
  await partsForPointer('rain', 'seasons-rain-parted');
  await checkFinger();
  await checkLongPress();
  await checkWindowInFront();
  await checkStopsListening();
  rest();
}
