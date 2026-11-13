import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import {descendants, named} from '../lib/actors.js';
import {call} from '../lib/dbus.js';
import {checks} from '../lib/check.js';
import {click, drag, moveTo, rest} from '../lib/input/input.js';
import {scratch, stopAll} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {pause} from '../lib/wait.js';
import {removeTree} from '../apps/lib/files.js';
import {openWindow} from '../tiling/lib/tiling.js';
import {installBuilt, listed, request, developmentFolder} from '../extensions/lib/extensions.js';
import {atRest, foot, middle, mood, near, paintsOver, report, setStrays, sprite, sprites, STRAYS, surfaceTop, taskbarTop, withRandom} from './lib/strays.js';
import {checkRiding} from './lib/straysRiding.js';
import {litShares, onLiveWallpaper, paintsBetween} from './wallpaper/overlays.js';

const {require, eventually} = checks('strays');
const NAME = 'com.lantharos.Kestrel';
const PATH = '/com/lantharos/Kestrel/Extensions';
const IFACE = 'com.lantharos.Kestrel.Extensions';
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const a11y = new Gio.Settings({schema_id: 'org.gnome.desktop.a11y.interface'});
const MEASURE_MS = 10000;
const LEVEL_MS = 60000;
const ENCOUNTER_MS = 120000;
const FULLSCREEN_SETTLE_MS = 2000;
const IDLE_PAINTS = 0.2;
const GRIP_SHARE = 0.25;
const SETTLE_MS = 12000;
const SEEK_ABOVE_TASKBAR = 380;
const SPRITE_SHARE = 0.1;
const PACKS = scratch('stray-packs');
const TOGETHER = /saying hello|chasing|running away|playing|sneaking up|getting bumped/;

const carry = (to: [number, number], hover = 100) => drag([middle(), foot() - sprite().height * GRIP_SHARE], to, {steps: 20, hover});

export const timeout = 660000;

function threadSwitches() {
  const tasks = Gio.File.new_for_path('/proc/self/task').enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null);
  const switches = new Map<string, number>();
  for (let info: Gio.FileInfo | null; (info = tasks.next_file(null));) {
    const [, status] = GLib.file_get_contents(`/proc/self/task/${info.get_name()}/status`);
    const text = new TextDecoder().decode(status);
    switches.set(info.get_name(), Number(/\nvoluntary_ctxt_switches:\s+(\d+)/.exec(text)![1]) + Number(/nonvoluntary_ctxt_switches:\s+(\d+)/.exec(text)![1]));
  }
  return switches;
}

async function measure(name: string) {
  rest();
  await pause(1000);
  const before = threadSwitches();
  const started = GLib.get_monotonic_time();
  const paints = await paintsOver(MEASURE_MS);
  const woke = [...threadSwitches()].reduce((sum, [thread, count]) => sum + count - (before.get(thread) ?? 0), 0);
  const measured = {paintsPerSecond: paints / (MEASURE_MS / 1000), wakeupsPerSecond: woke / ((GLib.get_monotonic_time() - started) / 1e6)};
  report(name, measured);
  return measured;
}

async function fullscreenPaints(name: string) {
  const {window} = await openWindow(name, 640, 360);
  window.make_fullscreen();
  await pause(FULLSCREEN_SETTLE_MS);
  let changes = 0;
  const watched = sprites().map(actor => [actor, ['notify::x', 'notify::y', 'notify::content'].map(signal => actor.connect(signal as 'notify::x', () => changes++))] as const);
  const paints = await paintsOver(3000);
  for (const [actor, signals] of watched) signals.forEach(signal => actor.disconnect(signal));
  report(`in full screen over 3 s, ${name}`, {paints, spriteChanges: changes});
  window.unmake_fullscreen();
  await pause(300);
  window.delete(global.get_current_time());
  await pause(800);
  return changes;
}

async function checkWalkingOnTheTaskbar() {
  await eventually(() => sprites().length === 1, 'one stray shows when one is asked for');
  await eventually(atRest, 'it comes down and sits', 15000);
  require(near(foot(), taskbarTop()), `it lands on the taskbar (feet at ${foot()}, taskbar at ${taskbarTop()})`);
  const pixels = sprite().width * global.display.get_monitor_scale(global.display.get_primary_monitor());
  require(pixels % 24 === 0, `each pixel of its sheet is a whole number of screen pixels (${pixels} across)`);
  const start = sprite().x;
  await withRandom(0.1, async () => {
    moveTo(sprite());
    await pause(200);
    click(sprite());
    await eventually(() => /walking/.test(mood()), 'a click sends it walking');
  });
  require(sprite().x !== start, 'it moves along');
  require(near(foot(), taskbarTop()), 'it stays on the taskbar as it walks');
  await eventually(atRest, 'it settles again', 15000);
  await capture('strays-taskbar');
}

function spriteArea() {
  const extents = sprite().get_transformed_extents();
  return {x: Math.round(extents.get_x()), y: Math.round(extents.get_y()), width: Math.round(extents.get_width()), height: Math.round(extents.get_height())};
}

async function checkOverLiveWallpaper() {
  await eventually(atRest, 'it rests before a live wallpaper starts');
  await onLiveWallpaper(eventually, async () => {
    const shares = await eventually(async () => {
      const lit = await litShares(spriteArea());
      return Math.min(...lit) > SPRITE_SHARE && lit;
    }, 'a stray shows over a live wallpaper in every frame');
    report('lit share of its box over a live wallpaper', shares);
    await capture('strays-live-wallpaper');
    const {window} = await openWindow('Away from a stray', 360, 240);
    window.move_frame(true, 10, 10);
    require(paintsBetween(sprite(), [window]), 'it draws over the video and under windows');
    await eventually(atRest, 'it stays at rest over the video');
    window.delete(global.get_current_time());
  });
}

async function checkLandingOnAWindow() {
  const {window} = await openWindow('Under a stray', 640, 360);
  window.move_frame(true, 300, 200);
  await pause(1000);
  await eventually(atRest, 'it stays calm when a window opens');
  const frame = window.get_frame_rect();
  const dropAt: [number, number] = [frame.x + frame.width / 2, frame.y - 90];
  await carry(dropAt);
  await eventually(() => near(foot(), surfaceTop(window), 4), 'picked up and dropped above a window, it lands on top of it', 5000);
  await eventually(atRest, 'it settles on the window', 8000);
  await capture('strays-window');

  window.delete(global.get_current_time());
  await eventually(() => /falling/.test(mood()) || near(foot(), taskbarTop()), 'it falls when the window closes');
  await eventually(() => near(foot(), taskbarTop()) && atRest(), 'and lands on what is below', 8000);
}

async function checkNoticingAWindow() {
  await eventually(atRest, 'it is at rest');
  const {window} = await openWindow('Brought near', 420, 300);
  window.move_frame(true, 10, 10);
  await pause(1200);
  const x = sprite().x;
  await withRandom(0.2, async () => {
    window.move_frame(true, x + 110 + 420 < global.stage.width ? x + 110 : x - 110 - 420, taskbarTop() - 100);
    await eventually(() => near(foot(), surfaceTop(window), 4), 'bring a window near and it hops on', 8000);
  });
  await capture('strays-noticed');
  await eventually(atRest, 'and settles there', 8000);
  window.minimize();
  await eventually(() => near(foot(), taskbarTop()) && atRest(), 'it falls when the window under it minimises', 10000);
  window.delete(global.get_current_time());
}

async function turn(name: string, on: boolean) {
  const item = (await pageItems()).find(({title}) => title === name)!;
  await act(item.action!, new GLib.Variant('b', on));
}

async function checkPipFlies() {
  await turn('Tuft', false);
  await turn('Dollop', false);
  await eventually(() => /Pip/.test(mood()) && atRest(), 'with only Pip chosen, Pip comes down', 15000);
  let window: Meta.Window;
  await withRandom(0.2, async () => {
    ({window} = await openWindow('A perch', 420, 300));
    window.move_frame(true, 700, 120);
    await eventually(() => /flying/.test(mood()), 'Pip takes off for a window that appears', 5000);
    await eventually(() => near(foot(), surfaceTop(window), 4), 'and flies straight to it and perches', 10000);
  });
  await eventually(atRest, 'Pip settles on its perch', 8000);
  await capture('strays-pip');
  const perch = sprite();
  await carry([1300, 380]);
  report('let go in mid-air', {mood: mood(), x: middle(), feet: foot()});
  await eventually(() => /hovering/.test(mood()) && near(foot(), 404, 30), 'let go in mid-air, Pip stays there', 3000);
  const clear: [number, number] = [perch.x + 1, perch.y + 1];
  require(global.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, ...clear) !== perch, 'the see-through corners of a sprite stay the desktop\'s');
  await eventually(() => !/hovering/.test(mood()) || !near(foot(), 404, 30), 'and flies off when it likes', 16000);
  window!.delete(global.get_current_time());
  await eventually(() => atRest() && near(foot(), taskbarTop()), 'Pip flutters back down when the perch goes', 15000);
  await turn('Tuft', true);
  await turn('Dollop', true);
  await eventually(() => /Tuft/.test(mood()) && atRest(), 'Tuft is back', 15000);
}

async function checkIslands() {
  kestrel.set_string('taskbar-style', 'separate');
  await pause(2000);
  await eventually(atRest, 'it finds its feet after the taskbar splits into islands', 12000);
  const tops = () => descendants(global.stage).filter(actor => actor.name?.startsWith('kestrel-island') && actor.mapped).map(actor => actor.get_transformed_position()[1]);
  const onIsland = () => tops().some(top => near(foot(), top, 6));
  let sawJump = false;
  await eventually(async () => {
    if (onIsland() && atRest() && sawJump) return true;
    if (atRest()) {
      moveTo(sprite());
      await pause(100);
      click(sprite());
    }
    if (/jumping/.test(mood())) sawJump = true;
    await pause(100);
    return false;
  }, 'wandering, it jumps onto an island', 90000);
  await capture('strays-island');

  kestrel.set_value('taskbar-arrangement', new GLib.Variant('a(sas)', [['bottom-center', ['start', 'dock']], ['right-end', ['tray', 'status', 'clock']]]));
  await pause(2000);
  const sideTop = () => named('kestrel-island-right-end')!.get_transformed_position()[1];
  await eventually(async () => {
    if (near(foot(), sideTop(), 6) && atRest()) return true;
    if (atRest()) {
      moveTo(sprite());
      await pause(100);
      click(sprite());
    }
    await pause(100);
    return false;
  }, 'it also jumps onto an island standing alone on the right edge', 120000);
  await capture('strays-side-island');
  for (const key of ['taskbar-style', 'taskbar-arrangement']) kestrel.reset(key);
  await pause(1500);
}

async function checkSleeping() {
  await eventually(atRest, 'it is at rest before anything goes full screen');
  const moods: string[] = [];
  const watching = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 200, () => {
    moods.push(mood());
    return GLib.SOURCE_CONTINUE;
  });
  const changes = await fullscreenPaints('with a stray');
  GLib.source_remove(watching);
  require(moods.some(seen => /sleeping/.test(seen)), 'it sleeps while a window is full screen');
  require(!changes, `a sleeping stray changes nothing on screen in full screen (${changes} changes)`);

  a11y.set_string('reduced-motion', 'reduce');
  await eventually(() => /sleeping/.test(mood()), 'it sleeps with reduced motion on');
  await request('Reload', STRAYS);
  await eventually(() => sprites().length === 1 && /sleeping/.test(mood()) && near(foot(), taskbarTop()), 'starting with reduced motion on, it\'s simply there, asleep, without falling');
  a11y.reset('reduced-motion');
}

async function checkSeekingWindows() {
  await setActivity('restless');
  const {window} = await openWindow('High up', 420, 300);
  window.move_frame(true, 620, taskbarTop() - 300 - SEEK_ABOVE_TASKBAR);
  await eventually(() => near(foot(), surfaceTop(window), 4), 'left to itself, Tuft makes its way up to a window it can\'t jump to', 60000);
  await capture('strays-sought');
  window.delete(global.get_current_time());
  await pause(800);
}

async function setActivity(level: string) {
  await setStrays({activity: new GLib.Variant('s', level)});
}

async function checkLevels() {
  await setStrays({count: new GLib.Variant('d', 3)});
  await eventually(() => sprites().length === 3, 'three strays show when three are asked for');
  const {window} = await openWindow('Something to climb', 520, 320);
  window.move_frame(true, 460, 330);
  await pause(SETTLE_MS);
  const together = new Set<string>();
  let doing: Record<string, Record<string, number>> = {};
  let [moves, last] = [0, ''];
  const watching = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
    const now = sprites().map(actor => `${mood(actor)}`).join();
    if (now !== last) moves++;
    last = now;
    for (const actor of sprites()) {
      const [name, mode] = mood(actor).split(', ');
      doing[name] ??= {};
      doing[name][mode] = (doing[name][mode] ?? 0) + 1;
      if (TOGETHER.test(mode)) together.add(`${name} ${mode}`);
    }
    return GLib.SOURCE_CONTINUE;
  });
  try {
    for (const level of ['sleepy', 'lively', 'restless']) {
      [moves, doing] = [0, {}];
      await setActivity(level);
      rest();
      await eventually(() => moves >= 4, `they do things at ${level}`, LEVEL_MS);
      report(`three strays, ${level}`, {changes: moves, doing});
    }
    await eventually(() => together.size > 0, 'strays get up to something with each other', ENCOUNTER_MS);
    report('together', [...together]);
  } finally {
    GLib.source_remove(watching);
  }
  await setActivity('lively');
  window.delete(global.get_current_time());
  await pause(800);
}

async function checkAsleep() {
  a11y.set_string('reduced-motion', 'reduce');
  await eventually(() => sprites().every(actor => /sleeping/.test(mood(actor))), 'they all go to sleep', 15000);
  const asleep = await measure('three strays asleep');
  require(asleep.paintsPerSecond <= IDLE_PAINTS, `nothing but the clock paints while they sleep (${asleep.paintsPerSecond} a second)`);
  a11y.reset('reduced-motion');
}

async function act(control: string, value: GLib.Variant) {
  await call(NAME, PATH, IFACE, 'Act', new GLib.Variant('(ssv)', [STRAYS, control, value]));
}

async function page() {
  const reply = await call(NAME, PATH, IFACE, 'Page', new GLib.Variant('(s)', [STRAYS]), '(s)');
  return JSON.parse(reply.deepUnpack<[string]>()[0]) as {items: {type: string; title?: string; text?: string; action?: string; actions?: {action: string}[]}[]}[];
}

async function answerFolder(path: string) {
  await call('org.freedesktop.impl.portal.desktop.rover', '/org/freedesktop/portal/desktop', 'com.lantharos.KestrelChecks.FileChooser', 'Answer', new GLib.Variant('(s)', [Gio.File.new_for_path(path).get_uri()]));
}

function packFolder(name: string, change: (manifest: Record<string, Record<string, unknown>>) => void) {
  const folder = GLib.build_filenamev([PACKS, name]);
  GLib.mkdir_with_parents(folder, 0o755);
  const template = GLib.build_filenamev([developmentFolder(STRAYS), 'template', 'example']);
  Gio.File.new_for_path(`${template}/sheet.png`).copy(Gio.File.new_for_path(`${folder}/sheet.png`), Gio.FileCopyFlags.NONE, null, null);
  const manifest = JSON.parse(new TextDecoder().decode(GLib.file_get_contents(`${template}/pack.json`)[1]));
  change(manifest);
  GLib.file_set_contents(`${folder}/pack.json`, JSON.stringify(manifest));
  return folder;
}

async function addPack(folder: string) {
  await answerFolder(folder);
  const add = (await page()).flatMap(section => section.items).find(item => item.title === 'Add a stray')!;
  await act(add.action!, new GLib.Variant('b', true));
}

const pageItems = async () => (await page()).flatMap(section => section.items);

async function checkPacks() {
  try {
    await checkAddingPacks();
  } finally {
    removeTree(PACKS);
  }
}

async function checkAddingPacks() {
  await addPack(packFolder('walkless', manifest => delete manifest.states.walk));
  await eventually(async () => (await pageItems()).some(item => item.type === 'text' && /which frames are walk/.test(item.text!)), 'a pack without walk frames says so plainly');
  await addPack(packFolder('oversized', manifest => (manifest.frame as unknown as number) = 25 as never));
  await eventually(async () => (await pageItems()).some(item => item.type === 'text' && /whole number of 25 pixel frames/.test(item.text!)), 'a sheet of the wrong size says so plainly');
  await addPack(packFolder('quarrelsome', manifest => (manifest.together = {does: {fight: 1}})));
  await eventually(async () => (await pageItems()).some(item => item.type === 'text' && /together in pack.json/.test(item.text!)), 'an encounter that doesn\'t exist says so plainly');
  await addPack(packFolder('fine', manifest => {
    manifest.name = 'Biscuit' as never;
    delete manifest.states.climb;
    delete manifest.states.land;
    delete manifest.states.held;
  }));
  await eventually(async () => (await pageItems()).some(item => item.type === 'sprite' && item.title === 'Biscuit'), 'a good pack shows up on the page, even without its optional states');
  const biscuit = (await pageItems()).find(item => item.title === 'Biscuit')!;
  await act(biscuit.actions![0].action, new GLib.Variant('b', true));
  await eventually(async () => !(await pageItems()).some(item => item.title === 'Biscuit'), 'it can be removed again');
}

export async function run() {
  const forced = global.force_animations;
  global.force_animations = true;
  try {
    await installBuilt(STRAYS);
    await eventually(async () => (await listed(STRAYS))?.state === 'running', 'Strays runs once installed');
    await setStrays({count: new GLib.Variant('d', 1)});

    await withRandom(0.99, async () => {
      await checkWalkingOnTheTaskbar();
      await checkOverLiveWallpaper();
      await checkLandingOnAWindow();
      await checkNoticingAWindow();
      await checkPipFlies();
    });
    await checkRiding();
    await checkIslands();
    await checkPacks();
    await checkSeekingWindows();
    await checkLevels();
    await checkAsleep();

    await withRandom(0.99, async () => {
      await setStrays({count: new GLib.Variant('d', 6)});
      await eventually(() => sprites().length === 6, 'six strays show when six are asked for');
      await eventually(atRest, 'all six come down and rest', 20000);
      await capture('strays-six');
    });
    await setStrays({count: new GLib.Variant('d', 1)});
    await eventually(() => sprites().length === 1, 'back to one');
    await withRandom(0.99, checkSleeping);
    moveTo([20, 20]);
  } finally {
    await request('Remove', STRAYS);
    await stopAll();
    for (const key of ['extension-settings', 'disabled-extensions', 'taskbar-style', 'taskbar-arrangement']) kestrel.reset(key);
    a11y.reset('reduced-motion');
    global.force_animations = forced;
  }
}
