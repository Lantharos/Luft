import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import {descendants, named} from '../lib/actors.js';
import {call} from '../lib/dbus.js';
import {checks} from '../lib/check.js';
import {click, drag, moveTo, rest} from '../lib/input/input.js';
import {stopAll} from '../lib/processes.js';
import {capture, screenshot} from '../lib/screenshots.js';
import {pause} from '../lib/wait.js';
import {openWindow} from '../tiling/lib/tiling.js';
import {installBuilt, listed, request, setSetting, userFolder} from '../extensions/lib/extensions.js';

const {require, eventually} = checks('strays');
const STRAYS = 'com.lantharos.Strays';
const NAME = 'com.lantharos.Kestrel';
const PATH = '/com/lantharos/Kestrel/Extensions';
const IFACE = 'com.lantharos.Kestrel.Extensions';
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const a11y = new Gio.Settings({schema_id: 'org.gnome.desktop.a11y.interface'});
const MEASURE_MS = 10000;
const FULLSCREEN_SETTLE_MS = 2000;
const FULLSCREEN_PAINT_SLACK = 12;
const IDLE_PAINTS = 0.2;
const CLOSE_ENOUGH = 3;
const SEQUENCE_FRAMES = 24;
const SEQUENCE_STEP_MS = 100;

const sprites = () => descendants(global.stage).filter(actor => actor.name === `extension-sprite:${STRAYS}`);
const sprite = () => sprites()[0];
const foot = (actor: Clutter.Actor = sprite()) => actor.y + actor.height;
const middle = (actor: Clutter.Actor = sprite()) => actor.x + actor.width / 2;
const mood = (actor: Clutter.Actor = sprite()) => actor.accessible_name;
const atRest = () => sprites().length > 0 && sprites().every(actor => /sitting|standing|sleeping|hovering/.test(mood(actor)));
const near = (a: number, b: number, tolerance = CLOSE_ENOUGH) => Math.abs(a - b) <= tolerance;
const taskbarTop = () => {
  const area = global.workspace_manager.get_active_workspace().get_work_area_for_monitor(global.display.get_primary_monitor());
  return area.y + area.height;
};
const surfaceTop = (window: Meta.Window) => window.get_frame_rect().y;

function report(name: string, value: unknown) {
  console.log(`Kestrel strays, ${name}: ${JSON.stringify(value)}`);
}

async function paintsOver(milliseconds: number) {
  let frames = 0;
  const painted = global.stage.connect('after-paint', () => frames++);
  await pause(milliseconds);
  global.stage.disconnect(painted);
  return frames;
}

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
  const paints = await paintsOver(3000);
  report(`paints in full screen over 3 s, ${name}`, paints);
  window.unmake_fullscreen();
  await pause(300);
  window.delete(global.get_current_time());
  await pause(800);
  return paints;
}

async function recordSequence(name: string) {
  const folder = GLib.build_filenamev([GLib.getenv('KESTREL_CAPTURE_DIR')!, 'strays-sequence', name]);
  GLib.mkdir_with_parents(folder, 0o755);
  const {width, height} = global.stage;
  for (let frame = 0; frame < SEQUENCE_FRAMES; frame++) {
    const shot = await screenshot({x: 0, y: Math.max(0, height - 360), width: Math.min(width, 900), height: 360});
    GLib.file_set_contents(GLib.build_filenamev([folder, `${String(frame).padStart(2, '0')}.png`]), shot.toArray());
    await pause(SEQUENCE_STEP_MS);
  }
}

const withRandom = async (value: number, action: () => Promise<void>) => {
  const random = Math.random;
  Math.random = () => value;
  try {
    await action();
  } finally {
    Math.random = random;
  }
};

async function setStrays(values: Record<string, GLib.Variant>) {
  for (const [key, value] of Object.entries(values)) await setSetting(STRAYS, key, value);
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
    await recordSequence('walk');
  });
  require(sprite().x !== start, 'it moves along');
  require(near(foot(), taskbarTop()), 'it stays on the taskbar as it walks');
  await eventually(atRest, 'it settles again', 15000);
  await capture('strays-taskbar');
}

async function checkLandingOnAWindow() {
  const {window} = await openWindow('Under a stray', 640, 360);
  window.move_frame(true, 300, 200);
  await pause(1000);
  await eventually(atRest, 'it stays calm when a window opens');
  const frame = window.get_frame_rect();
  const dropAt: [number, number] = [frame.x + frame.width / 2, frame.y - 90];
  await drag([middle(), foot() - sprite().height / 2], dropAt, {steps: 20, hover: 100});
  await eventually(() => near(foot(), surfaceTop(window), 4), 'picked up and dropped above a window, it lands on top of it', 5000);
  await eventually(atRest, 'it settles on the window', 8000);
  await capture('strays-window');

  window.move_frame(true, 420, 260);
  await eventually(() => near(foot(), surfaceTop(window), 4) && near(middle(), 420 + frame.width / 2, 8), 'it rides along when the window moves');

  window.delete(global.get_current_time());
  await eventually(() => /falling/.test(mood()) || near(foot(), taskbarTop()), 'it falls when the window closes');
  await recordSequence('fall');
  await eventually(() => near(foot(), taskbarTop()) && atRest(), 'and lands on what is below', 8000);
}

async function checkNoticingAWindow() {
  await eventually(atRest, 'it is at rest');
  const {window} = await openWindow('Brought near', 420, 300);
  window.move_frame(true, 10, 10);
  await pause(1200);
  const x = sprite().x;
  await withRandom(0.2, async () => {
    window.move_frame(true, Math.min(x + 110, global.stage.width - 430), taskbarTop() - 100);
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
    await recordSequence('fly');
    await eventually(() => near(foot(), surfaceTop(window), 4), 'and flies straight to it and perches', 10000);
  });
  await capture('strays-pip');
  const perch = sprite();
  await drag([middle(), foot() - perch.height / 2], [1300, 380], {steps: 16, hover: 100});
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

async function checkSleeping(alone: number) {
  await eventually(atRest, 'it is at rest before anything goes full screen');
  const moods: string[] = [];
  const watching = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 200, () => {
    moods.push(mood());
    return GLib.SOURCE_CONTINUE;
  });
  const paints = await fullscreenPaints('with a stray');
  GLib.source_remove(watching);
  require(moods.some(seen => /sleeping/.test(seen)), 'it sleeps while a window is full screen');
  require(paints <= alone + FULLSCREEN_PAINT_SLACK, `it adds no paints in full screen (${paints} over 3 s, ${alone} without it)`);

  a11y.set_string('reduced-motion', 'reduce');
  await eventually(() => /sleeping/.test(mood()), 'it sleeps with reduced motion on');
  await request('Reload', STRAYS);
  await eventually(() => sprites().length === 1 && /sleeping/.test(mood()) && near(foot(), taskbarTop()), 'starting with reduced motion on, it\'s simply there, asleep, without falling');
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
  const folder = GLib.build_filenamev([GLib.get_tmp_dir(), `stray-${name}-${GLib.uuid_string_random()}`]);
  GLib.mkdir_with_parents(folder, 0o755);
  const template = GLib.build_filenamev([userFolder(STRAYS), 'template', 'example']);
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
  await addPack(packFolder('walkless', manifest => delete manifest.states.walk));
  await eventually(async () => (await pageItems()).some(item => item.type === 'text' && /which frames are walk/.test(item.text!)), 'a pack without walk frames says so plainly');
  await addPack(packFolder('oversized', manifest => (manifest.frame as unknown as number) = 25 as never));
  await eventually(async () => (await pageItems()).some(item => item.type === 'text' && /whole number of 25 pixel frames/.test(item.text!)), 'a sheet of the wrong size says so plainly');
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
    rest();
    await pause(2000);
    const before = await measure('without Strays');
    const fullscreenAlone = await fullscreenPaints('alone');
    await installBuilt(STRAYS);
    await eventually(async () => (await listed(STRAYS))?.state === 'running', 'Strays runs once installed');
    await setStrays({count: new GLib.Variant('d', 1)});

    await checkWalkingOnTheTaskbar();
    await checkLandingOnAWindow();
    await checkNoticingAWindow();
    await checkPipFlies();
    await checkIslands();
    await checkPacks();

    await withRandom(0.99, async () => {
      await setStrays({count: new GLib.Variant('d', 2)});
      await eventually(() => sprites().length === 2 && atRest(), 'two strays come down and sit for a good while', 15000);
      const resting = await measure('two strays at rest');
      require(resting.paintsPerSecond <= IDLE_PAINTS, `nothing but the clock paints while they rest (${resting.paintsPerSecond} a second, ${before.paintsPerSecond} without them)`);
      await setStrays({count: new GLib.Variant('d', 6)});
      await eventually(() => sprites().length === 6, 'six strays show when six are asked for');
      await eventually(atRest, 'all six come down and rest', 20000);
      await capture('strays-six');
      await measure('six strays at rest');
    });
    await setStrays({count: new GLib.Variant('d', 1)});
    await eventually(() => sprites().length === 1, 'back to one');
    await checkSleeping(fullscreenAlone);
    moveTo([20, 20]);
  } finally {
    await request('Remove', STRAYS);
    await stopAll();
    for (const key of ['extension-settings', 'disabled-extensions', 'taskbar-style', 'taskbar-arrangement']) kestrel.reset(key);
    a11y.reset('reduced-motion');
    global.force_animations = forced;
  }
}
