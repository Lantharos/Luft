import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';

import {existing, named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {alongEdge, arrange} from '../lib/edge.js';
import {click, moveTo, type Point, press, pressButton as pressMouse, releaseButton, rest, rightClick} from '../lib/input/input.js';
import {stopAll} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {nextFrame, pause} from '../lib/wait.js';
import {openWindow} from '../tiling/lib/tiling.js';
import {installBuilt, listed, request} from '../extensions/lib/extensions.js';
import {ambient, choose, group, hasPart, labelled, measure, middleOf, nextPart, only, parts, PLAYTHINGS, pressButton, setPowerProfile, topAt, turned} from './lib/playthings.js';

const {require, eventually} = checks('playthings');
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const a11y = new Gio.Settings({schema_id: 'org.gnome.desktop.a11y.interface'});
const seat = global.stage.context.get_backend().get_default_seat();
const touchscreen = seat.create_virtual_device(Clutter.InputDeviceType.TOUCHSCREEN_DEVICE);
const now = () => GLib.get_monotonic_time();
const QUIET_PAINTS = 0.5;
const FULL_SCREEN_SLACK = 2;
const COMET_AT_LEAST = 150;
const FAR_FROM_CLOUDS: Point = [700, 640];
const SETTLE_MS = 15000;
const count = (value: number) => new GLib.Variant('d', value);

const showing = () => parts().filter(part => part.visible).length;
const near = (a: number, b: number, tolerance = 2) => Math.abs(a - b) <= tolerance;
const lanterns = () => labelled('Lantern');
const body = (index = 0) => lanterns()[index];
const lit = (index = 0) => nextPart(body(index));
const still = (actor: Clutter.Actor) => near(turned(actor), 0, 0.2) || near(turned(actor), 360, 0.2);
const swing = (actor: Clutter.Actor) => Math.abs(((turned(actor) + 180) % 360) - 180);

async function sweep(from: Point, to: Point, frames: number) {
  for (let frame = 0; frame <= frames; frame++) {
    moveTo([from[0] + (to[0] - from[0]) * frame / frames, from[1] + (to[1] - from[1]) * frame / frames]);
    await nextFrame();
  }
}

/** Follows how far `actor` swings during `action`. */
async function furthest(actor: Clutter.Actor, action: () => Promise<void>) {
  let most = 0;
  const watch = global.stage.connect('after-paint', () => { most = Math.max(most, swing(actor)); });
  await action();
  await pause(600);
  global.stage.disconnect(watch);
  return most;
}

const across = (actor: Clutter.Actor, reach: number): [Point, Point] => {
  const [x, y] = middleOf(actor);
  return [[x - reach, y], [x + reach, y]];
};

async function settled(actor: Clutter.Actor) {
  await eventually(async () => {
    for (let look = 0; look < 12 && still(actor); look++) await pause(30);
    return still(actor);
  }, 'it settles', SETTLE_MS);
}

async function checkLanterns() {
  await only('lanterns');
  await ambient(false);
  await eventually(() => lanterns().length === 3, 'three lanterns hang', 8000);
  const lantern = body();
  rest();
  await settled(lantern);

  const slow = await furthest(lantern, () => sweep(...across(lantern, 90), 50));
  require(slow > 0.3, `it sways when the pointer brushes it (${slow}°)`);
  await settled(lantern);
  const fast = await furthest(lantern, () => sweep(...across(lantern, 90), 8));
  require(fast > slow * 1.4, `a faster pass swings it further (${fast}° against ${slow}°)`);
  await capture('playthings-lantern-swinging');
  rest();
  await settled(lantern);
  await pause(1200);
  require((await measure('a settled lantern', 3000)).paints <= QUIET_PAINTS, 'once settled it paints nothing');

  const middle = middleOf(lantern);
  require(topAt(middle) === lantern, 'a click on a lantern lands on it');
  const beside: Point = [middle[0] + lantern.width, middle[1]];
  require(!hasPart(topAt(beside)), 'just beside a lantern is the desktop');
  require(topAt(beside) instanceof Meta.BackgroundActor, 'and clicks there reach the wallpaper');
  click(middle);
  await eventually(() => lit().visible && lit().opacity > 200, 'clicking it lights it up');
  await capture('playthings-lantern-lit');
  await pause(800);
  click(middleOf(body()));
  await eventually(() => !lit().visible, 'clicking again lets it go dim');
  rest();
  await settled(lantern);

  moveTo(beside);
  await pause(150);
  pressMouse();
  releaseButton();
  await pause(300);
  require(!lit().visible, 'a click beside a lantern leaves it alone');
  const menu = existing('kestrel-context-menu');
  rightClick(middleOf(body()));
  await eventually(() => menu.visible && named('Change wallpaper', menu), 'right-clicking a lantern gives the desktop menu');
  press(Clutter.KEY_Escape);
  await eventually(() => !menu.visible, 'which closes as usual');
  rightClick(beside);
  await eventually(() => menu.visible && named('Change wallpaper', menu), 'right-clicking the desktop beside it still does too');
  press(Clutter.KEY_Escape);
  await eventually(() => !menu.visible, 'and closes');

  rest();
  await settled(lantern);
  const held = middleOf(lantern);
  moveTo(held);
  await nextFrame();
  pressMouse();
  await sweep(held, [held[0] + 120, held[1] - 30], 20);
  await pause(250);
  require(swing(lantern) > 10, `a lantern can be pulled along (${swing(lantern)}°)`);
  releaseButton();
  rest();
  await pause(300);
  require(!lit().visible, 'pulling it doesn\'t count as a click');
  require(swing(lantern) > 2, 'and keeps swinging when let go');
  await settled(lantern);
}

async function checkBehindWindows() {
  const lantern = body();
  const [x, y] = middleOf(lantern);
  const {window} = await openWindow('In front of a lantern', 500, 400);
  window.move_frame(true, Math.max(0, x - 250), Math.max(0, y - 200));
  await pause(500);
  require(!hasPart(topAt([x, y])), 'a window in front takes the pointer');
  const moved = await furthest(lantern, () => sweep([x - 120, y], [x + 120, y], 8));
  require(moved < 0.1, `moving over the window leaves the lantern behind it alone (${moved}°)`);
  click([x, y]);
  await pause(300);
  require(!lit().visible, 'clicks stay with the window');
  window.delete(global.get_current_time());
  rest();
  await pause(800);
}

async function checkFingers() {
  const [first, second] = [body(0), body(1)];
  const start = [middleOf(first), middleOf(second)];
  start.forEach(([x, y], slot) => touchscreen.notify_touch_down(now(), slot, x, y));
  await nextFrame();
  for (let step = 1; step <= 20; step++) {
    start.forEach(([x, y], slot) => touchscreen.notify_touch_motion(now(), slot, x + step * (slot ? -5 : 5), y));
    await nextFrame();
  }
  await pause(250);
  require(swing(first) > 6 && swing(second) > 6, `two fingers pull two lanterns at once (${swing(first)}°, ${swing(second)}°)`);
  await capture('playthings-two-fingers');
  start.forEach((_point, slot) => touchscreen.notify_touch_up(now(), slot));
  await pause(300);
  require(swing(first) > 1 && swing(second) > 1, 'both swing on when let go');
  await settled(first);
  await settled(second);

  const [x, y] = middleOf(second);
  touchscreen.notify_touch_down(now(), 0, x, y);
  await pause(40);
  touchscreen.notify_touch_up(now(), 0);
  await eventually(() => lit(1).visible && lit(1).opacity > 200, 'a tap lights a lantern like a click');
  await pause(500);
  await settled(second);

  const [fromX, fromY] = [x - 200, y];
  const quiet = topAt([fromX, fromY]);
  require(quiet instanceof Meta.BackgroundActor, 'a finger can start on the bare desktop');
  const brushed = await furthest(second, async () => {
    touchscreen.notify_touch_down(now(), 0, fromX, fromY);
    await nextFrame();
    for (let step = 1; step <= 12; step++) {
      touchscreen.notify_touch_motion(now(), 0, fromX + step * 34, fromY);
      await nextFrame();
    }
    touchscreen.notify_touch_up(now(), 0);
  });
  require(brushed > 0.3, `a finger sliding across the desktop brushes it too (${brushed}°)`);
  await settled(second);
}

async function checkClouds() {
  await only('clouds');
  await eventually(() => labelled('Cloud').length > 3, 'clouds show', 8000);
  moveTo(FAR_FROM_CLOUDS);
  await pause(500);
  const puffs = labelled('Cloud');
  const middles = puffs.map(middleOf);
  const center = middles[Math.floor(puffs.length / 2)];
  await capture('playthings-clouds');
  await sweep([center[0] - 200, center[1]], center, 12);
  await pause(500);
  const pushed = Math.max(...puffs.map((puff, index) => Math.hypot(middleOf(puff)[0] - middles[index][0], middleOf(puff)[1] - middles[index][1])));
  require(pushed > 12, `puffs part around the pointer (${pushed} pixels)`);
  await capture('playthings-clouds-parted');
  await pause(2500);
  const parked = await measure('a pointer parked in a cloud', 2000, () => pause(2000));
  require(parked.paints <= QUIET_PAINTS, `puffs held apart by a still pointer rest too (${parked.paints} paints a second)`);
  const before = showing();
  click(center);
  await eventually(() => showing() > before, 'poking a cloud makes it rain');
  await pause(700);
  await capture('playthings-rain');
  moveTo(FAR_FROM_CLOUDS);
  await eventually(() => showing() === before, 'the rain stops by itself', 6000);
  await eventually(() => puffs.every((puff, index) => near(middleOf(puff)[0], middles[index][0], 1)), 'and the puffs come back together', SETTLE_MS);
}

async function checkCampfire() {
  await only('campfire');
  await eventually(() => labelled('Campfire').length > 3, 'the fire burns', 8000);
  rest();
  await pause(500);
  await capture('playthings-campfire');
  const flames = labelled('Campfire');
  const flame = flames[0];
  const [x, y] = middleOf(flame);
  const leanFrom = (pointX: number) => sweep([pointX, y + 150], [pointX, y], 6);
  const lean = () => turned(flame) > 180 ? turned(flame) - 360 : turned(flame);
  await leanFrom(x + 90);
  await eventually(() => lean() < -5, 'flames lean away from the pointer on the right');
  await capture('playthings-campfire-lean');
  await sweep([x + 90, y], [x - 90, y], 20);
  await eventually(() => lean() > 5, 'and from the left');
  rest();
  await settled(flame);

  const before = showing();
  click([x, y + 20]);
  await eventually(() => showing() > before, 'clicking throws sparks');
  await capture('playthings-sparks');
  rest();
  await eventually(() => showing() === before, 'the sparks burn out', 8000);
  const [restingX, restingY] = [flame.scale_x, flame.scale_y];
  let fanned = false;
  for (let stroke = 0; stroke < 8 && !fanned; stroke++) {
    await sweep([x - 110, y], [x + 110, y], 6);
    await sweep([x + 110, y], [x - 110, y], 6);
    fanned = flame.scale_y > restingY * 1.12;
  }
  require(fanned, `fanning makes the fire catch (${restingX} × ${restingY}, now ${flame.scale_x} × ${flame.scale_y})`);
  await capture('playthings-fanned');
  rest();
  await eventually(() => near(flame.scale_y, restingY, 0.08), 'and it dies down', SETTLE_MS);
}

async function checkStars() {
  await only('stars');
  await eventually(() => labelled('Star').length > 3, 'the stars come out', 8000);
  rest();
  await pause(500);
  await capture('playthings-stars');
  const stars = labelled('Star');
  const [x, y] = middleOf(stars[2]);
  const lines = parts().filter(part => !stars.includes(part));
  const resting = stars[2].opacity;
  await sweep([x + 300, y], [x, y], 20);
  await pause(600);
  require(stars[2].opacity > resting + 30, `stars brighten near the pointer (${resting}, now ${stars[2].opacity})`);
  await eventually(() => lines.some(line => line.visible), 'and join up');
  await capture('playthings-stars-near');
  click([x, y]);
  await eventually(() => stars[2].scale_x > 1.3, 'clicking a star makes it twinkle');
  await pause(500);
  const comet = () => parts().some(part => part.visible && part.height > COMET_AT_LEAST);
  await sweep([x - 60, y - 60], [x + 240, y + 120], 3);
  await eventually(comet, 'a flick sends a shooting star');
  await capture('playthings-shooting-star');
  rest();
  await eventually(() => parts().every(part => stars.includes(part) || !part.visible), 'which burns out, and the lines let go', 8000);
}

async function fullScreen(check: () => Promise<void>) {
  const {window} = await openWindow('Over everything', 640, 360);
  window.make_fullscreen();
  await pause(1500);
  await check();
  window.unmake_fullscreen();
  window.delete(global.get_current_time());
  await pause(1000);
}

async function checkSleeping(fullScreenAlone: number) {
  await only('lanterns', 'clouds', 'campfire', 'stars');
  await ambient(true);
  await eventually(() => labelled('Lantern').length && labelled('Star').length, 'everything shows');
  rest();
  await pause(600);
  const breathing = await measure('all four, ambient', 6000);
  require(breathing.paints > 4 && breathing.paints < 22, `ambient motion runs at a low rate (${breathing.paints} paints a second)`);

  await fullScreen(async () => {
    const puff = labelled('Cloud')[0];
    const drifted = puff.translation_x;
    const {paints} = await measure('a window full screen', 3000);
    require(puff.translation_x === drifted, 'nothing drifts behind a window that runs full screen');
    require(paints <= fullScreenAlone + FULL_SCREEN_SLACK, `it adds no paints in full screen (${paints} a second, ${fullScreenAlone} without it)`);
  });

  a11y.set_string('reduced-motion', 'reduce');
  await pause(800);
  const reduced = await measure('reduced motion', 3000);
  require(reduced.paints <= QUIET_PAINTS, `it stays still with reduced motion (${reduced.paints} paints a second)`);
  a11y.reset('reduced-motion');
  await setPowerProfile('power-saver');
  await pause(800);
  const saver = await measure('battery saver', 3000);
  require(saver.paints <= QUIET_PAINTS, `it stays still with battery saver on (${saver.paints} paints a second)`);
  await setPowerProfile('balanced');
  await pause(500);
  require((await measure('back to normal', 2000)).paints > 4, 'ambient motion comes back after');
  await choose({'lantern-count': count(7), 'cloud-count': count(6), 'campfire-count': count(3), 'star-count': count(4)});
  await eventually(() => lanterns().length === 7, 'the most of everything shows');
  rest();
  await pause(800);
  await capture('playthings-most');
  await measure('the most of everything, ambient', 6000);
  await ambient(false);
  await pause(800);
  require((await measure('the most of everything, still', 5000)).paints <= QUIET_PAINTS, 'with ambient motion off, the most of everything still paints nothing');
  await choose({'lantern-count': count(3), 'cloud-count': count(2), 'campfire-count': count(1), 'star-count': count(1)});
  await eventually(() => lanterns().length === 3, 'back to the default amounts');
  await pause(500);
  const lantern = body();
  const [from, to] = across(lantern, 110);
  const back = () => sweep(to, from, 18);
  const forth = () => sweep(from, to, 18);
  await measure('brushing a lantern', 5000, async () => {
    for (let pass = 0; pass < 7; pass++) {
      await forth();
      await back();
    }
  });
  rest();
  await settled(lantern);
}

async function checkArranging() {
  await only('lanterns', 'clouds', 'campfire', 'stars');
  await pause(500);
  await pressButton('Arrange');
  await eventually(() => named('Done') || named('Put everything back'), 'arranging opens its small window');
  await pause(300);
  const fire = labelled('Campfire').at(-1)!;
  const start = middleOf(fire);
  const {window} = await openWindow('Under the fire', 500, 400);
  window.move_frame(true, start[0] - 250, start[1] - 300);
  await pause(600);
  require(hasPart(topAt(start)), 'things come out above the windows to be moved');
  await capture('playthings-arranging');
  const target: Point = [420, 560];
  moveTo(start);
  await nextFrame();
  pressMouse();
  await sweep(start, target, 14);
  releaseButton();
  await pause(200);
  require(near(middleOf(fire)[0], target[0], 12), `a thing follows the pointer (${middleOf(fire)[0]}, wanted ${target[0]})`);
  const done = named('Done')!;
  click(done);
  await eventually(() => !named('Done'), 'done closes it');
  window.delete(global.get_current_time());
  await pause(600);
  const placed = middleOf(labelled('Campfire').at(-1)!);
  await request('Reload', PLAYTHINGS);
  await eventually(() => labelled('Campfire').length > 3, 'it comes back after a restart');
  await pause(500);
  const back = middleOf(labelled('Campfire').at(-1)!);
  require(near(back[0], placed[0], 3) && near(back[1], placed[1], 3), `what people moved stays where they put it (${back}, was ${placed})`);
}

async function checkDisplaysAndTaskbar() {
  const primary = global.display.get_primary_monitor();
  const area = () => global.workspace_manager.get_active_workspace().get_work_area_for_monitor(primary);
  arrange(alongEdge('left'));
  await eventually(() => area().x > 0, 'the taskbar moves to the left', 8000);
  await pause(1000);
  const leftmost = Math.min(...labelled('Lantern').map(actor => middleOf(actor)[0]));
  require(leftmost >= area().x, `things stay clear of a taskbar on the left (${leftmost}, area from ${area().x})`);
  await capture('playthings-taskbar-left');
  arrange(alongEdge('top'));
  await eventually(() => area().y > 0, 'the taskbar moves to the top', 8000);
  await pause(1000);
  const highest = Math.min(...labelled('Lantern').map(actor => middleOf(actor)[1]));
  require(highest > area().y, 'lanterns hang from below a taskbar on top');
  await capture('playthings-taskbar-top');
  kestrel.reset('taskbar-arrangement');
  await pause(1000);

  await choose({displays: new GLib.Variant('s', 'every')});
  const secondLeft = global.display.get_monitor_geometry(1).x;
  await eventually(() => labelled('Lantern').some(actor => middleOf(actor)[0] > secondLeft), 'every display gets its own', 8000);
  await capture('playthings-both-displays');
  await pressButton('Arrange');
  await eventually(() => named('Done'), 'arranging works with every display');
  await pause(300);
  const elsewhere = labelled('Lantern').find(actor => middleOf(actor)[0] > secondLeft)!;
  const home = labelled('Lantern')[0];
  const [homeX, homeY] = middleOf(home);
  const from = middleOf(elsewhere);
  moveTo(from);
  await nextFrame();
  await pause(100);
  pressMouse();
  await sweep(from, [from[0] + 200, from[1] + 90], 12);
  releaseButton();
  await pause(150);
  click(existing('Done'));
  await eventually(() => !named('Done'), 'done closes it again');
  await request('Reload', PLAYTHINGS);
  await eventually(() => labelled('Lantern').length === 6, 'both displays come back');
  await pause(500);
  const moved = labelled('Lantern').find(actor => middleOf(actor)[0] > secondLeft)!;
  require(!near(middleOf(moved)[0], from[0], 8), 'what was moved on one display stays moved');
  require(near(middleOf(labelled('Lantern')[0])[0], homeX) && near(middleOf(labelled('Lantern')[0])[1], homeY), 'and the same lantern on the other display stays put');
  await pressButton('Put everything back');
  await eventually(() => labelled('Campfire').length > 3, 'putting everything back rebuilds them');
}

async function takeBaseline() {
  await pause(1500);
  rest();
  await pause(1500);
  console.log(`Kestrel playthings, display scale: ${global.display.get_monitor_scale(global.display.get_primary_monitor())}`);
  await measure('without Playthings', 5000);
  let paints = 0;
  await fullScreen(async () => {
    ({paints} = await measure('full screen without Playthings', 3000));
  });
  return paints;
}

export async function run() {
  const forced = global.force_animations;
  global.force_animations = true;
  try {
    const fullScreenAlone = await takeBaseline();
    await installBuilt(PLAYTHINGS);
    await eventually(async () => (await listed(PLAYTHINGS))?.state === 'running', 'Playthings runs once installed');
    await eventually(() => !!group(), 'things show');
    rest();
    await pause(1000);
    await capture('playthings-desktop');
    await checkLanterns();
    await checkBehindWindows();
    await checkFingers();
    await checkClouds();
    await checkCampfire();
    await checkStars();
    await checkSleeping(fullScreenAlone);
    await checkArranging();
    await checkDisplaysAndTaskbar();
  } finally {
    await request('Remove', PLAYTHINGS);
    await stopAll();
    for (const key of ['extension-settings', 'taskbar-arrangement']) kestrel.reset(key);
    a11y.reset('reduced-motion');
    global.force_animations = forced;
  }
}
