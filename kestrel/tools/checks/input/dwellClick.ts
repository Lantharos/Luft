import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {checks} from '../lib/check.js';
import {moveBy, moveTo, rest, type Point} from '../lib/input/input.js';
import {pause} from '../lib/wait.js';

const {require, eventually} = checks('dwell click');

const DWELL_SECONDS = 0.6;
const LONG_DWELL_SECONDS = 1.5;
const EARLY_SECONDS = 0.9;
const TARGET_SIZE = 240;
const JITTER = 2;
const PAST_THRESHOLD = 40;
const POSITION_TOLERANCE = 1;

const mouse = new Gio.Settings({schema_id: 'org.gnome.desktop.a11y.mouse'});

interface Click {
  button: number;
  at: Point;
  time: number;
}

const now = () => GLib.get_monotonic_time() / 1000;
const pieTimers = () => Main.uiGroup.get_children().filter(actor => actor instanceof St.Widget && actor.has_style_class_name('pie-timer'));

function clickTarget() {
  const target = new St.Widget({reactive: true, width: TARGET_SIZE, height: TARGET_SIZE, style: 'background-color: rgba(128, 128, 128, 0.4);'});
  const [x, y] = [Math.round((global.stage.width - TARGET_SIZE) / 2), Math.round((global.stage.height - TARGET_SIZE) / 2)];
  target.set_position(x, y);
  const clicks: Click[] = [];
  target.connect('button-release-event', (_actor, event: Clutter.Event) => {
    const [x, y] = event.get_coords();
    clicks.push({button: event.get_button(), at: [x, y], time: now()});
    return Clutter.EVENT_STOP;
  });
  Main.uiGroup.add_child(target);
  return {target, clicks, center: [x + TARGET_SIZE / 2, y + TARGET_SIZE / 2] as Point};
}

const near = ([x, y]: Point, [tx, ty]: Point) => Math.abs(x - tx) <= POSITION_TOLERANCE && Math.abs(y - ty) <= POSITION_TOLERANCE;

async function checkRestingClicksOnce(clicks: Click[], spot: Point) {
  const rested = now();
  moveTo(spot);
  await eventually(() => pieTimers().some(pie => pie.visible && pie.opacity > 0), 'a progress circle shows while the pointer rests');
  const [pie] = pieTimers();
  const [pieX, pieY] = [pie.x + pie.width / 2, pie.y + pie.height / 2];
  require(near([pieX, pieY], spot), 'the progress circle sits at the pointer');
  require(clicks.length === 0, 'it waits out the delay before clicking');

  await eventually(() => clicks.length === 1, 'resting clicks once', DWELL_SECONDS * 1000 + 2000);
  const [click] = clicks;
  require(click.button === Clutter.BUTTON_PRIMARY, 'the click is a primary click');
  require(near(click.at, spot), 'the click lands where the pointer rests');
  require(click.time - rested >= DWELL_SECONDS * 1000, `the click comes after the ${DWELL_SECONDS} s delay`);
  await eventually(() => pieTimers().length === 0, 'the progress circle goes away after clicking');

  for (const [dx, dy] of [[JITTER, 0], [0, JITTER], [-JITTER, 0], [0, -JITTER]]) {
    moveBy(dx, dy);
    await pause(DWELL_SECONDS * 1000);
  }
  require(clicks.length === 1, 'a pointer that keeps resting with a little jitter does not click again');
}

async function checkMovingOnArmsAgain(clicks: Click[], spot: Point) {
  const [x, y] = spot;
  moveTo([x + PAST_THRESHOLD, y]);
  await eventually(() => clicks.length === 2, 'moving on and resting again clicks again', DWELL_SECONDS * 1000 + 2000);
  require(near(clicks[1].at, [x + PAST_THRESHOLD, y]), 'the second click lands at the new spot');
  await eventually(() => pieTimers().length === 0, 'the progress circle goes away after the second click');
}

async function checkMovingCancels(clicks: Click[], spot: Point) {
  const [x, y] = spot;
  const before = clicks.length;
  moveTo([x, y + PAST_THRESHOLD]);
  await eventually(() => pieTimers().some(pie => pie.visible), 'a new rest starts the progress circle');
  const steps = Math.ceil(DWELL_SECONDS * 2000 / 50);
  for (let step = 0; step < steps; step++) {
    moveBy(step % 2 ? -PAST_THRESHOLD / 2 : PAST_THRESHOLD / 2, 0);
    await pause(50);
  }
  require(clicks.length === before, 'a pointer that keeps moving never clicks');
  require(pieTimers().length === 0, 'moving away takes the progress circle down');
  await eventually(() => clicks.length === before + 1, 'resting after moving clicks', DWELL_SECONDS * 1000 + 2000);
}

async function checkDelaySetting(clicks: Click[], spot: Point) {
  mouse.set_double('dwell-time', LONG_DWELL_SECONDS);
  const before = clicks.length;
  const [x, y] = spot;
  const rested = now();
  moveTo([x - PAST_THRESHOLD, y - PAST_THRESHOLD]);
  await pause(EARLY_SECONDS * 1000);
  require(clicks.length === before, `with a ${LONG_DWELL_SECONDS} s delay it hasn't clicked after ${EARLY_SECONDS} s`);
  await eventually(() => clicks.length === before + 1, `with a ${LONG_DWELL_SECONDS} s delay it clicks`, LONG_DWELL_SECONDS * 1000 + 2000);
  require(clicks.at(-1)!.time - rested >= LONG_DWELL_SECONDS * 1000, `the click waits the full ${LONG_DWELL_SECONDS} s`);
}

async function checkTurnedOff(clicks: Click[], spot: Point) {
  mouse.set_boolean('dwell-click-enabled', false);
  const before = clicks.length;
  moveTo(spot);
  await pause(LONG_DWELL_SECONDS * 1000 + 1000);
  require(clicks.length === before && pieTimers().length === 0, 'with it turned off, resting neither clicks nor shows progress');
}

export async function run() {
  const {target, clicks, center} = clickTarget();
  mouse.set_double('dwell-time', DWELL_SECONDS);
  mouse.set_boolean('dwell-click-enabled', true);
  try {
    await checkRestingClicksOnce(clicks, center);
    await checkMovingOnArmsAgain(clicks, center);
    await checkMovingCancels(clicks, center);
    await checkDelaySetting(clicks, center);
    await checkTurnedOff(clicks, center);
  } finally {
    mouse.reset('dwell-click-enabled');
    mouse.reset('dwell-time');
    target.destroy();
    rest();
  }
}
