import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import type Meta from 'gi://Meta';
import St from 'gi://St';
import {Main, arrangeTaskbar, carryOverEdgeAndAlignment, taskbarEditor, taskbarElements, toggleSurface} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {existing, named, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {alongEdge, arrange, arrangement, boxOf, type Arrangement} from '../lib/edge.js';
import {centerOf, click, moveTo, press, pressButton, releaseButton, rest} from '../lib/input/input.js';
import {fixture, spawn, stopAll, waitForWindow} from '../lib/processes.js';
import {capture, captureFrame} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';

const {require, eventually} = checks('taskbar arrangement');
const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const legacy = new Gio.Settings({schema_id: 'com.lantharos.kestrel.legacy-taskbar'});
const KEYS = ['taskbar-arrangement', 'taskbar-style'];
const SYSTEM = ['tray', 'status', 'clock'];
const THICKNESS = 48;
const MARGIN = 8;
const DRAG_STEPS = 16;
const WINDOW = ['Arranged', '2e3a46'] as const;
// Inside a square corner, but outside a rounded one
const CORNER_INSET = 3;

type Box = {x: number; y: number; width: number; height: number};
type Edge = 'bottom' | 'left' | 'top' | 'right';

const PRESETS: Record<string, {style: string; islands: Arrangement; edges: Edge[]}> = {
  classic: {style: 'bar', islands: [['bottom-start', ['start', 'dock']], ['bottom-end', SYSTEM]], edges: ['bottom']},
  centered: {style: 'separate', islands: [['bottom-center', ['start', 'dock']], ['bottom-end', SYSTEM]], edges: ['bottom']},
  mac: {style: 'separate', islands: [['bottom-center', ['start', 'dock']], ['top-end', SYSTEM]], edges: ['bottom', 'top']},
  side: {style: 'separate', islands: [['left-center', ['start', 'dock']], ['bottom-end', SYSTEM]], edges: ['left', 'bottom']},
};

const primary = () => Main.layoutManager.primaryMonitor!;
const island = (spot: string, root: Clutter.Actor = existing('kestrel-panel')) => named(`kestrel-island-${spot}`, root);
const islands = (root: Clutter.Actor = existing('kestrel-panel')) =>
  root.get_children().filter(child => child.name?.startsWith('kestrel-island-') && child.visible);
const overlaps = (a: Box, b: Box) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
const sameIslands = (a: Arrangement, b: Arrangement) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
const settledIsland = (spot: string) => {
  const actor = island(spot);
  return actor && actor.translation_x === 0 && actor.translation_y === 0 && actor.get_transition('translation-x') === null ? actor : null;
};

function inset(edge: Edge) {
  const monitor = primary();
  const area = Main.layoutManager.getWorkAreaForMonitor(monitor.index);
  switch (edge) {
    case 'bottom': return monitor.y + monitor.height - area.y - area.height;
    case 'top': return area.y - monitor.y;
    case 'left': return area.x - monitor.x;
    case 'right': return monitor.x + monitor.width - area.x - area.width;
  }
}

async function pixel(x: number, y: number) {
  const shot = await captureFrame({x, y, width: 1, height: 1});
  return [...shot.pixbuf.get_pixels().slice(0, 3)];
}

const near = (pixel: number[], color: number[]) => pixel.every((value, channel) => Math.abs(value - color[channel]) <= 2);

/** Whether each corner of a window, top left, top right, bottom right and bottom left, shows what's behind it. */
async function roundedCorners(window: Meta.Window, color: number[]) {
  const frame = window.get_frame_rect();
  const left = frame.x + CORNER_INSET, right = frame.x + frame.width - 1 - CORNER_INSET;
  const top = frame.y + CORNER_INSET, bottom = frame.y + frame.height - 1 - CORNER_INSET;
  const shown = await Promise.all([[left, top], [right, top], [right, bottom], [left, bottom]].map(([x, y]) => pixel(x, y)));
  return shown.map(corner => !near(corner, color));
}

async function show(name: string) {
  const preset = PRESETS[name];
  settings.set_string('taskbar-style', preset.style);
  arrange(preset.islands);
  await eventually(() => preset.islands.every(([spot]) => settledIsland(spot)?.mapped), `the ${name} arrangement shows its islands`);
  await settled();
  return preset;
}

async function checkMigration() {
  settings.reset('taskbar-arrangement');
  legacy.set_string('taskbar-position', 'right');
  legacy.set_string('taskbar-alignment', 'left');
  carryOverEdgeAndAlignment();
  require(sameIslands(arrangement(), alongEdge('right', 'start')), 'a taskbar people had on the right with its apps at the top carries over');
  require(legacy.get_user_value('taskbar-position') === null && legacy.get_user_value('taskbar-alignment') === null,
    'the old edge and alignment are cleared once carried over');
  await eventually(() => settledIsland('right-start') && settledIsland('right-end'), 'the taskbar follows the carried over arrangement');

  legacy.set_string('taskbar-position', 'top');
  carryOverEdgeAndAlignment();
  require(sameIslands(arrangement(), alongEdge('right', 'start')), 'an arrangement people already made stays as it is');
  require(legacy.get_user_value('taskbar-position') === null, 'and the old edge is cleared anyway');
  settings.reset('taskbar-arrangement');
}

async function checkPresets(window: Meta.Window, color: number[]) {
  const expected: Record<string, boolean[]> = {
    classic: [false, false, false, false],
    mac: [true, true, true, true],
    side: [true, false, true, true],
  };
  for (const name of Object.keys(PRESETS)) {
    const {edges, style} = await show(name);
    const reserved = style === 'bar' ? THICKNESS : THICKNESS + 2 * MARGIN;
    await eventually(() => (['bottom', 'left', 'top', 'right'] as const).every(edge => inset(edge) === (edges.includes(edge) ? reserved : 0)),
      `the ${name} arrangement keeps windows clear of each edge with an island, and only those`);
    const shownIslands = islands().map(boxOf);
    require(shownIslands.every((box, index) => shownIslands.every((other, otherIndex) => index === otherIndex || !overlaps(box, other))),
      `the islands of the ${name} arrangement don't overlap`);
    await capture(`taskbar-preset-${name}`);
    if (!(name in expected)) continue;
    window.maximize();
    const area = Main.layoutManager.getWorkAreaForMonitor(primary().index);
    await eventually(() => {
      const frame = window.get_frame_rect();
      return frame.x === area.x && frame.y === area.y && frame.width === area.width && frame.height === area.height;
    }, `a maximized window fills the space the ${name} arrangement leaves`);
    await settled();
    const rounded = await roundedCorners(window, color);
    require(rounded.every((corner, index) => corner === expected[name][index]),
      `with the ${name} arrangement, only the maximized window's corners facing an island are rounded (${rounded.join(', ')})`);
    await capture(`taskbar-preset-${name}-maximized`);
    window.unmaximize();
  }
}

async function opensBeside(surface: 'start' | 'quick' | 'notifications', name: string, spot: string, beside: (shown: Box, island: Box) => boolean) {
  toggleSurface(surface);
  const actor = await eventually(() => {
    const opened = named(name);
    return shown(opened) && opened!.get_transition('translation-y') === null && opened!.get_transition('translation-x') === null && opened;
  }, `${surface} opens`);
  await settled();
  require(beside(boxOf(actor), boxOf(island(spot)!)), `${surface} opens beside its island at ${spot}`);
  toggleSurface(surface);
  await eventually(() => !actor.visible, `${surface} closes`);
}

async function checkAnchors() {
  await show('mac');
  const gap = 10;
  const below = (shown: Box, at: Box) => shown.y >= at.y + at.height && shown.y <= at.y + at.height + gap + 2 && Math.abs(shown.x + shown.width - at.x - at.width) <= 1;
  await opensBeside('quick', 'kestrel-quick-settings', 'top-end', below);
  await opensBeside('notifications', 'kestrel-notifications', 'top-end', below);
  await show('side');
  await opensBeside('start', 'kestrel-start', 'left-center', (shown, at) => shown.x >= at.x + at.width && shown.x <= at.x + at.width + gap + 2);
}

async function checkCorner() {
  settings.set_string('taskbar-style', 'separate');
  arrange([['right-end', ['start', 'dock']], ['bottom-end', SYSTEM]]);
  await eventually(() => settledIsland('right-end') && settledIsland('bottom-end'), 'islands at the right\'s end and the bottom\'s end show');
  await settled();
  const side = boxOf(island('right-end')!);
  const bottom = boxOf(island('bottom-end')!);
  require(!overlaps(side, bottom), 'islands sharing the bottom right corner don\'t overlap');
  require(side.y + side.height <= bottom.y - MARGIN, 'the one on the right moves up out of the bottom\'s corner');
  require(bottom.x + bottom.width === primary().x + primary().width - MARGIN, 'the one at the bottom keeps the corner');
  await capture('taskbar-corner');
}

async function checkStartAlone() {
  settings.set_string('taskbar-style', 'separate');
  arrange([['bottom-start', ['start']], ['bottom-center', ['dock']], ['bottom-end', SYSTEM]]);
  await eventually(() => settledIsland('bottom-start') && settledIsland('bottom-center'), 'Start gets an island of its own');
  await settled();
  const start = boxOf(island('bottom-start')!);
  require(Math.abs(start.width - start.height) <= 1, 'Start alone is a little square');
  await capture('taskbar-start-alone');
  await opensBeside('start', 'kestrel-start', 'bottom-start', (shown, at) => Math.abs(shown.x - at.x) <= 1 && shown.y + shown.height <= at.y);
}

function nowPlaying() {
  return taskbarElements.add({
    id: 'media/now-playing', label: 'Now playing',
    create: () => {
      const actor = new St.BoxLayout({name: 'now-playing-stand-in', style_class: 'kestrel-status-button kestrel-panel-status', y_align: Clutter.ActorAlign.CENTER});
      actor.add_child(new St.Icon({icon_name: 'audio-x-generic-symbolic', icon_size: 16}));
      actor.add_child(new St.Label({text: 'Arrival', y_align: Clutter.ActorAlign.CENTER, style: 'margin-left: 8px;'}));
      return {
        actor,
        relayout: ({vertical}) => (actor.orientation = vertical ? Clutter.Orientation.VERTICAL : Clutter.Orientation.HORIZONTAL),
        destroy: () => actor.destroy(),
      };
    },
    watch: () => () => {},
  });
}

async function checkExtensionElement() {
  settings.set_string('taskbar-style', 'separate');
  settings.reset('taskbar-arrangement');
  const remove = nowPlaying();
  try {
    await eventually(() => arrangement().some(([spot, elements]) => spot === 'bottom-end' && elements.join() === ['media/now-playing', ...SYSTEM].join()),
      'an extension\'s element joins the tray\'s island, in front of it');
    await eventually(() => named('now-playing-stand-in', island('bottom-end')!)?.mapped, 'and shows there');
    arrange([['bottom-center', ['start', 'dock', 'media/now-playing']], ['bottom-end', SYSTEM]]);
    await eventually(() => named('now-playing-stand-in', island('bottom-center')!)?.mapped, 'Now playing can sit in the dock\'s island');
    await settled();
    await capture('taskbar-now-playing-in-dock');
  } finally {
    remove();
  }
  await eventually(() => !named('now-playing-stand-in'), 'the element leaves once its extension stops');
  require(arrangement().some(([, elements]) => elements.includes('media/now-playing')), 'its place is kept for when it comes back');
}

async function dragTo(from: Clutter.Actor, to: Clutter.Actor, capturing: string | null = null) {
  const [fromX, fromY] = centerOf(from);
  const [toX, toY] = centerOf(to);
  moveTo([fromX, fromY]);
  pressButton();
  await pause(60);
  for (let step = 1; step <= DRAG_STEPS; step++) {
    moveTo([fromX + (toX - fromX) * step / DRAG_STEPS, fromY + (toY - fromY) * step / DRAG_STEPS]);
    await pause(30);
    if (capturing && step === DRAG_STEPS) {
      await pause(400);
      await capture(capturing);
    }
  }
  releaseButton();
  await settled();
}

async function checkEditing() {
  settings.set_string('taskbar-style', 'separate');
  settings.reset('taskbar-arrangement');
  const saved = arrangement();
  arrangeTaskbar();
  await eventually(() => taskbarEditor() && shown(named('kestrel-arrange-done')), 'Edit taskbar opens with its Done button');
  await settled();
  await capture('taskbar-edit');

  await dragTo(existing('kestrel-arrange-handle-bottom-center'), existing('kestrel-arrange-target-left-center'), 'taskbar-edit-dragging');
  await eventually(() => settledIsland('left-center'), 'dragging an island\'s handle to a spot on the left moves it there');
  require(sameIslands(arrangement(), saved), 'nothing is saved while editing');

  await dragTo(existing('kestrel-taskbar-start'), existing('kestrel-arrange-target-top-start'));
  await eventually(() => named('kestrel-taskbar-start', island('top-start') ?? new St.Widget()), 'dragging Start to an empty spot makes it an island of its own');
  await dragTo(existing('kestrel-taskbar-start'), existing('kestrel-taskbar-dock'));
  await eventually(() => named('kestrel-taskbar-start', island('left-center') ?? new St.Widget()) && !island('top-start'),
    'dragging it back onto the dock merges them again');

  press(Clutter.KEY_Escape);
  await eventually(() => !taskbarEditor() && settledIsland('bottom-center'), 'Escape puts the taskbar back as it was');
  require(sameIslands(arrangement(), saved), 'and saves nothing');

  arrangeTaskbar();
  await eventually(() => taskbarEditor(), 'Edit taskbar opens again');
  await settled();
  press(Clutter.KEY_Up);
  await eventually(() => settledIsland('top-center'), 'the arrow keys move the picked island to the next spot that way');
  press(Clutter.KEY_Tab);
  press(Clutter.KEY_Left);
  await eventually(() => named('kestrel-taskbar-start', island('top-start') ?? new St.Widget()), 'and move a picked element out of its island');
  press(Clutter.KEY_Return);
  await eventually(() => !taskbarEditor(), 'Return finishes');
  await eventually(() => sameIslands(arrangement(), [['top-start', ['start']], ['top-center', ['dock']], ['bottom-end', SYSTEM]]),
    'and saves the arrangement');
  await capture('taskbar-edited');

  arrangeTaskbar();
  await eventually(() => taskbarEditor(), 'Edit taskbar opens once more');
  await settled();
  click(existing('kestrel-arrange-reset'));
  await eventually(() => settledIsland('bottom-center'), 'Reset to default shows the default arrangement');
  click(existing('kestrel-arrange-done'));
  await eventually(() => !taskbarEditor() && sameIslands(arrangement(), alongEdge('bottom')), 'and Done saves it');
  rest();
}

async function checkSecondDisplay() {
  const other = Main.layoutManager.monitors.find(monitor => monitor !== primary());
  if (!other) return;
  await show('mac');
  const secondary = existing('kestrel-secondary-panel');
  await eventually(() => {
    const parts = islands(secondary).map(boxOf);
    return parts.length === 2 && parts.some(box => box.y + box.height === other.y + other.height - MARGIN) && parts.some(box => box.y === other.y + MARGIN);
  }, 'the taskbar on another display follows the same arrangement');
  await capture('taskbar-preset-mac-two-displays');
}

export async function run() {
  try {
    await checkMigration();
    spawn(['python3', fixture('clients', 'wayland', 'decorationClient.py'), 'client', ...WINDOW]);
    const window = await waitForWindow(WINDOW[0], 'a window to maximize opens');
    const color = [0, 2, 4].map(offset => parseInt(WINDOW[1].slice(offset, offset + 2), 16));
    await checkPresets(window, color);
    await stopAll();
    await checkAnchors();
    await checkCorner();
    await checkStartAlone();
    await checkExtensionElement();
    await checkEditing();
    await checkSecondDisplay();
  } finally {
    taskbarEditor()?.cancel();
    for (const key of KEYS) settings.reset(key);
    for (const key of ['taskbar-position', 'taskbar-alignment']) legacy.reset(key);
    await stopAll();
  }
}
