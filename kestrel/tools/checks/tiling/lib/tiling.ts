import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {openBoardWindow} from '../../board/lib/board.js';
import {waitForWindow} from '../../lib/processes.js';
import type {Area} from '../../lib/screenshots.js';
import {settled, waitUntil} from '../../lib/wait.js';

const KEYS = ['window-tiling', 'tiling-layout', 'tiling-gaps', 'tiling-new-windows'];
const GAPS: Record<string, number> = {none: 0, small: 5, medium: 10, large: 20};
const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const mutter = new Gio.Settings({schema_id: 'org.gnome.mutter'});

type Side = 'left' | 'right' | 'up' | 'down';

export function useTiling(mode: string, options: Record<string, string> = {}) {
  for (const [key, value] of Object.entries(options)) settings.set_string(key, value);
  settings.set_string('window-tiling', mode);
}

export function resetTiling() {
  for (const key of KEYS) settings.reset(key);
}

export const gap = () => GAPS[settings.get_string('tiling-gaps')];
export const edgeTiling = () => mutter.get_boolean('edge-tiling');

export async function openWindow(title: string, width = 640, height = 420, state = 'normal') {
  const process = openBoardWindow(title, width, height, state);
  const window = await waitForWindow(candidate => candidate.get_title()?.startsWith(title), `a window titled ${title} opens`);
  return {process, window};
}

export function focus(window: Meta.Window) {
  window.activate(global.get_current_time());
  return waitUntil(() => window.has_focus(), `${window.get_title()} takes focus`);
}

export const frame = (window: Meta.Window) => window.get_frame_rect();
export const near = (a: number, b: number, tolerance = 1) => Math.abs(a - b) <= tolerance;
export const sameRect = (a: Area, b: Area, tolerance = 1) => (['x', 'y', 'width', 'height'] as const).every(side => near(a[side], b[side], tolerance));

export function area(monitor = Main.layoutManager.primaryIndex): Area {
  const rect = Main.layoutManager.getWorkAreaForMonitor(monitor);
  const inset = gap();
  return {x: rect.x + inset, y: rect.y + inset, width: rect.width - 2 * inset, height: rect.height - 2 * inset};
}

const overlap = (a: Area, b: Area) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

function facing(rect: Area, side: Side, other: Area, spacing: number) {
  const across = side === 'left' || side === 'right'
    ? Math.min(rect.y + rect.height, other.y + other.height) - Math.max(rect.y, other.y)
    : Math.min(rect.x + rect.width, other.x + other.width) - Math.max(rect.x, other.x);
  if (across <= 0) return false;
  switch (side) {
  case 'left': return near(other.x + other.width + spacing, rect.x);
  case 'right': return near(rect.x + rect.width + spacing, other.x);
  case 'up': return near(other.y + other.height + spacing, rect.y);
  default: return near(rect.y + rect.height + spacing, other.y);
  }
}

function onBoundary(rect: Area, side: Side, bounds: Area) {
  switch (side) {
  case 'left': return near(rect.x, bounds.x);
  case 'right': return near(rect.x + rect.width, bounds.x + bounds.width);
  case 'up': return near(rect.y, bounds.y);
  default: return near(rect.y + rect.height, bounds.y + bounds.height);
  }
}

export function tiledTightly(windows: Meta.Window[], bounds = area(), spacing = gap()) {
  const rects = windows.map(frame);
  return rects.every((rect, index) =>
    rect.x >= bounds.x - 1 && rect.y >= bounds.y - 1 &&
    rect.x + rect.width <= bounds.x + bounds.width + 1 && rect.y + rect.height <= bounds.y + bounds.height + 1 &&
    rects.every((other, otherIndex) => otherIndex === index || !overlap(rect, other)) &&
    (['left', 'right', 'up', 'down'] as const).every(side => onBoundary(rect, side, bounds) ||
      rects.some((other, otherIndex) => otherIndex !== index && facing(rect, side, other, spacing))));
}

export const actorOf = (window: Meta.Window) => window.get_compositor_private<Meta.WindowActor>();
export const shownX = (window: Meta.Window) => frame(window).x + actorOf(window).translation_x;

export async function restingTiles() {
  await settled();
  await waitUntil(() => global.get_window_actors().every(actor => !actor.get_transition('translation-x') && !actor.get_transition('scale-x')),
    'tiled windows come to rest');
}

export function stateFile() {
  return GLib.build_filenamev([GLib.get_user_state_dir(), 'kestrel', 'tiling.json']);
}
