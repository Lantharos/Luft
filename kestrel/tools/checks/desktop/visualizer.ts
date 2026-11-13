import Gio from 'gi://Gio';
import type Meta from 'gi://Meta';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {playMusic} from '../lib/audio/music.js';
import {checks} from '../lib/check.js';
import {stop, stopAll} from '../lib/processes.js';
import {capture, captureFrame, type Area, type Frame} from '../lib/screenshots.js';
import {nextFrame, pause} from '../lib/wait.js';
import {openWindow} from '../tiling/lib/tiling.js';
import {eachFrame, FrameRecorder, summarize, summarizeGpu} from '../../frames/recorder.js';
import {installBuilt, layerSheets, listed, request, setSetting} from '../extensions/lib/extensions.js';

const {require, eventually} = checks('visualizer');
const VISUALIZER = 'com.lantharos.Visualizer';
const STYLES = ['glow', 'wave', 'bars'];
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const monitor = Shell.AudioMonitor.get_default();

const SWEEP_FRAMES = 120;
const ROUNDS = 3;
const MUSIC_S = 180;

type Edge = 'bottom' | 'top' | 'left' | 'right';
type Resting = Record<Edge, Frame>;

const EDGES: Edge[] = ['bottom', 'top', 'left', 'right'];
const ONE_EDGE: Edge[][] = EDGES.map(edge => [edge]);
const SIDES: Edge[] = ['left', 'right'];
const WITHOUT_ONE: Edge[] = ['top', 'bottom', 'right'];
const BESIDE_EDGE = 12;
const PROBE_DEPTH = 24;
const PROBE_LENGTH = 320;
const LIT = 8;
const FADED_IN_MS = 900;
const DEFAULT_REACH = 0.5;
const PROBED_REACH = 0.3;
const SHEET_END_DEPTH = 2;
const SHEET_END_LENGTH = 400;
const FADED_AWAY = 2;
const OVER_THE_BAND = 360;
const WINDOW_INSET = 48;

const showing = () => layerSheets(VISUALIZER).some(sheet => sheet.visible && sheet.opacity === 255);

async function sweep(window: Meta.Window) {
  const start = window.get_frame_rect();
  const runs: FrameRecorder[] = [];
  for (let round = 0; round < ROUNDS; round++) {
    const recorder = new FrameRecorder({gpu: true});
    recorder.start();
    await eachFrame(SWEEP_FRAMES, step => window.move_frame(true, start.x + Math.round(Math.sin(step / 12) * 240), start.y));
    recorder.stop();
    runs.push(recorder);
  }
  window.move_frame(true, start.x, start.y);
  const [view] = global.stage.peek_stage_views();
  return {...summarize(runs, view.get_refresh_rate()), gpu: summarizeGpu(runs)};
}

function probes(): Record<Edge, Area> {
  const {x, y, width, height} = Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryIndex);
  const middleX = Math.round(x + width / 2 - PROBE_LENGTH / 2);
  const middleY = Math.round(y + height / 2 - PROBE_LENGTH / 2);
  return {
    bottom: {x: middleX, y: y + height - BESIDE_EDGE - PROBE_DEPTH, width: PROBE_LENGTH, height: PROBE_DEPTH},
    top: {x: middleX, y: y + BESIDE_EDGE, width: PROBE_LENGTH, height: PROBE_DEPTH},
    left: {x: x + BESIDE_EDGE, y: middleY, width: PROBE_DEPTH, height: PROBE_LENGTH},
    right: {x: x + width - BESIDE_EDGE - PROBE_DEPTH, y: middleY, width: PROBE_DEPTH, height: PROBE_LENGTH},
  };
}

function farEnd({x, y, width, height}: Area, edge: Edge): Area {
  const middle = edge === 'left' || edge === 'right'
    ? {x, width, y: y + Math.round((height - SHEET_END_LENGTH) / 2), height: SHEET_END_LENGTH}
    : {x: x + Math.round((width - SHEET_END_LENGTH) / 2), width: SHEET_END_LENGTH, y, height};
  return {
    bottom: {...middle, height: SHEET_END_DEPTH},
    top: {...middle, y: y + height - SHEET_END_DEPTH, height: SHEET_END_DEPTH},
    left: {...middle, x: x + width - SHEET_END_DEPTH, width: SHEET_END_DEPTH},
    right: {...middle, width: SHEET_END_DEPTH},
  }[edge];
}

async function withAndWithoutBands(area: Area) {
  const sheets = layerSheets(VISUALIZER);
  const shown = await captureFrame(area);
  for (const sheet of sheets) sheet.hide();
  await nextFrame();
  await nextFrame();
  const hidden = await captureFrame(area);
  for (const sheet of sheets) sheet.show();
  return {shown, hidden};
}

function edgeOf({x, y, width, height}: Area): Edge {
  const {width: displayWidth, height: displayHeight} = Main.layoutManager.primaryMonitor!;
  if (width === displayWidth) return y === 0 && height < displayHeight ? 'top' : 'bottom';
  return height === displayHeight && x === 0 ? 'left' : 'right';
}

async function requireFadedBandEnds(label: string) {
  for (const sheet of layerSheets(VISUALIZER)) {
    const edge = edgeOf(sheet);
    const {shown, hidden} = await withAndWithoutBands(farEnd(sheet, edge));
    require(shown.pixelsApart(hidden, FADED_AWAY) === 0, `${label}: the ${edge} band fades away before it ends`);
  }
}

async function restingEdges(): Promise<Resting> {
  const areas = probes();
  const frames = {} as Resting;
  for (const edge of EDGES) frames[edge] = await captureFrame(areas[edge]);
  return frames;
}

async function requireLitEdges(resting: Resting, lit: readonly Edge[], label: string) {
  const areas = probes();
  for (const edge of EDGES) {
    const glows = lit.includes(edge);
    await eventually(async () => (await captureFrame(areas[edge])).pixelsApart(resting[edge], LIT) > 0 === glows, `${label}: the ${edge} edge ${glows ? 'glows' : 'stays dark'}`);
  }
}

const place = (edges: readonly Edge[]) => setSetting(VISUALIZER, 'edges', new GLib.Variant('as', [...edges]));

async function settledOn(edges: readonly Edge[]) {
  await place(edges);
  const bands = edges.length * global.display.get_n_monitors();
  await eventually(() => showing() && layerSheets(VISUALIZER).length === bands, `${edges.join(', ')} draws one band for each of those edges on every display and none for the others`);
  await pause(FADED_IN_MS);
}

function requireBandsAlong(edges: readonly Edge[]) {
  for (const {index, x, y, width, height} of Main.layoutManager.monitors) {
    const along: Record<Edge, (sheet: Area) => boolean> = {
      bottom: sheet => sheet.x === x && sheet.width === width && sheet.y + sheet.height === y + height,
      top: sheet => sheet.x === x && sheet.width === width && sheet.y === y,
      left: sheet => sheet.y === y && sheet.height === height && sheet.x === x,
      right: sheet => sheet.y === y && sheet.height === height && sheet.x + sheet.width === x + width,
    };
    for (const edge of edges) require(layerSheets(VISUALIZER).some(along[edge]), `a band runs along the ${edge} edge of display ${index}`);
  }
}

async function arrange(edge: Edge) {
  kestrel.set_value('taskbar-arrangement', new GLib.Variant('a(sas)', [[`${edge}-center`, ['start', 'dock']], [`${edge}-end`, ['tray', 'status', 'clock']]]));
  await pause(FADED_IN_MS);
}

async function restingWithTaskbars() {
  const resting = {} as Record<Edge, Resting>;
  for (const edge of EDGES) {
    await arrange(edge);
    resting[edge] = await restingEdges();
  }
  kestrel.reset('taskbar-arrangement');
  await pause(FADED_IN_MS);
  return resting;
}

async function checkEdges(resting: Resting) {
  await setSetting(VISUALIZER, 'reach', new GLib.Variant('d', PROBED_REACH));
  for (const edges of [...ONE_EDGE, SIDES, ['top', 'bottom'] as Edge[], WITHOUT_ONE, EDGES]) {
    const name = edges.join('-');
    await settledOn(edges);
    requireBandsAlong(edges);
    await capture(`visualizer-edges-${name}`);
    await requireLitEdges(resting, edges, name);
    await requireFadedBandEnds(name);
  }
  require(await place([]).then(() => false, () => true), 'it can’t be left with no edges at all');
  for (const style of ['wave', 'bars']) {
    await setSetting(VISUALIZER, 'style', new GLib.Variant('s', style));
    await pause(FADED_IN_MS);
    await capture(`visualizer-edges-all-${style}`);
  }
  await setSetting(VISUALIZER, 'style', new GLib.Variant('s', 'glow'));
  kestrel.set_string('taskbar-style', 'separate');
  await pause(FADED_IN_MS);
  await capture('visualizer-edges-all-islands');
  kestrel.reset('taskbar-style');
  await setSetting(VISUALIZER, 'reach', new GLib.Variant('d', DEFAULT_REACH));
}

function overBand(edge: Edge): {x: number; y: number} {
  const {x, y, width, height} = Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryIndex);
  const middle = {x: Math.round(x + (width - OVER_THE_BAND) / 2), y: Math.round(y + (height - OVER_THE_BAND) / 2)};
  return {
    bottom: {x: middle.x, y: y + height - OVER_THE_BAND - BESIDE_EDGE},
    top: {x: middle.x, y: y + BESIDE_EDGE},
    left: {x: x + BESIDE_EDGE, y: middle.y},
    right: {x: x + width - OVER_THE_BAND - BESIDE_EDGE, y: middle.y},
  }[edge];
}

async function checkBehindWindows() {
  const {window: above} = await openWindow('Over the band', OVER_THE_BAND, OVER_THE_BAND);
  const {window: below} = await openWindow('Under the other', OVER_THE_BAND, OVER_THE_BAND);
  for (const edge of EDGES) {
    await settledOn([edge]);
    below.raise();
    above.raise();
    await pause(FADED_IN_MS);
    const {x, y} = overBand(edge);
    above.move_frame(true, x, y);
    below.move_frame(true, x, y);
    const {x: left, y: top, width, height} = above.get_frame_rect();
    const inside = {x: left + WINDOW_INSET, y: top + WINDOW_INSET, width: width - 2 * WINDOW_INSET, height: height - 2 * WINDOW_INSET};
    for (const style of STYLES) {
      await setSetting(VISUALIZER, 'style', new GLib.Variant('s', style));
      await pause(FADED_IN_MS);
      await capture(`visualizer-behind-window-${edge}-${style}`);
      const {shown, hidden} = await withAndWithoutBands(inside);
      require(shown.pixelsApart(hidden, 0) === 0, `the ${style} style on the ${edge} edge stays behind a window`);
    }
  }
  await setSetting(VISUALIZER, 'style', new GLib.Variant('s', 'glow'));
  await settledOn(['bottom']);
  for (const window of [above, below]) window.delete(global.get_current_time());
  await eventually(() => !above.get_compositor_private() && !below.get_compositor_private(), 'the windows over the band close');
}

async function checkReach() {
  for (const reach of [0.2, 1]) {
    await setSetting(VISUALIZER, 'reach', new GLib.Variant('d', reach));
    await pause(FADED_IN_MS);
    for (const style of STYLES) {
      await setSetting(VISUALIZER, 'style', new GLib.Variant('s', style));
      await pause(FADED_IN_MS);
      await capture(`visualizer-reach-${reach * 100}-${style}`);
      await requireFadedBandEnds(`reaching ${reach * 100}% of the short side in the ${style} style`);
    }
  }
  await setSetting(VISUALIZER, 'style', new GLib.Variant('s', 'glow'));
  await setSetting(VISUALIZER, 'reach', new GLib.Variant('d', DEFAULT_REACH));
}

async function checkFollowsTaskbar(resting: Record<Edge, Resting>) {
  for (const edge of ['left', 'top', 'right'] as const) {
    await arrange(edge);
    await settledOn([edge]);
    await capture(`visualizer-taskbar-${edge}-beside`);
    await requireLitEdges(resting[edge], [edge], `beside a taskbar on the ${edge}`);
    await settledOn(EDGES);
    await capture(`visualizer-taskbar-${edge}-around`);
    await requireLitEdges(resting[edge], EDGES, `all around with the taskbar on the ${edge}`);
  }
  kestrel.reset('taskbar-arrangement');
  await pause(FADED_IN_MS);
}

function report<Frames>(name: string, frames: Frames): Frames {
  console.log(`Kestrel visualizer frames, ${name}: ${JSON.stringify(frames)}`);
  return frames;
}

export async function run() {
  const forced = global.force_animations;
  global.force_animations = true;
  await installBuilt(VISUALIZER);
  try {
    await eventually(async () => (await listed(VISUALIZER))?.state === 'running', 'Visualizer runs once installed');
    await pause(500);
    require(!layerSheets(VISUALIZER).length && !monitor.get_listening(), 'while nothing plays it draws nothing and listens to nothing');

    const {window: swept} = await openWindow('Swept', 520, 300);
    swept.move_frame(true, 300, global.stage.height - 420);
    const quiet = report('nothing playing', await sweep(swept));
    swept.minimize();
    await pause(FADED_IN_MS);
    const resting = await restingWithTaskbars();

    const music = await playMusic(MUSIC_S, (condition, label) => eventually(condition, label));
    try {
      await eventually(showing, 'music brings the glow up along the bottom of the desktop');
      await pause(1500);
      for (const style of STYLES) {
        await setSetting(VISUALIZER, 'style', new GLib.Variant('s', style));
        await pause(700);
        await capture(`visualizer-${style}`);
      }
      await setSetting(VISUALIZER, 'style', new GLib.Variant('s', 'glow'));
      await checkEdges(resting.bottom);
      await checkFollowsTaskbar(resting);
      await checkBehindWindows();
      await checkReach();
      await settledOn(['bottom']);
      await openWindow('Above the glow', 720, 420);
      await pause(700);
      require(showing(), 'it stays below a window that leaves the wallpaper showing');
      await capture('visualizer-window');
      await setSetting(VISUALIZER, 'displays', new GLib.Variant('s', 'primary'));
      await eventually(showing, 'it shows again after choosing where');
      swept.unminimize();
      swept.raise();
      await pause(700);
      const playing = report('music playing', await sweep(swept));
      GLib.file_set_contents(GLib.build_filenamev([GLib.getenv('KESTREL_CAPTURE_DIR')!, 'visualizer-frames.json']), JSON.stringify({quiet, playing}, null, 2));
      require(playing.missed <= quiet.missed + 2, `a window slides over the glow without missing frames (${quiet.missed} → ${playing.missed} missed)`);
    } finally {
      await stop(music);
    }
    await eventually(() => !layerSheets(VISUALIZER).length, 'when the music stops the glow settles and its layer goes', 10000);
    require(!monitor.get_listening(), 'and it stops listening');
  } finally {
    await request('Remove', VISUALIZER);
    await stopAll();
    for (const key of ['extension-settings', 'disabled-extensions', 'taskbar-arrangement', 'taskbar-style']) kestrel.reset(key);
    global.force_animations = forced;
  }
}
