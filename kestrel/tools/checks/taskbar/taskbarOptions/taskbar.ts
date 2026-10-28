import type Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import type Shell from 'gi://Shell';
import St from 'gi://St';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {named, ofType} from '../../lib/actors.js';
import {checks} from '../../lib/check.js';
import {captureArea} from '../../lib/screenshots.js';
import {reservedGap, taskbarEdge, vertical, type Edge} from '../../lib/edge.js';

export const {require, eventually} = checks('taskbar option');
export const HEIGHTS = {compact: 40, normal: 48, large: 56};
export const FLOATING_MARGIN = 8;
export const KEYS = ['taskbar-alignment', 'taskbar-look', 'taskbar-style', 'taskbar-size', 'taskbar-auto-hide',
  'taskbar-show-pinned', 'taskbar-displays', 'taskbar-windows-per-display', 'taskbar-windows-per-workspace'];
const CROP_DEPTH = 120;

export const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
export const panel = () => ofType(named('kestrel-panel'), St.Widget);
export const primary = () => Main.layoutManager.primaryMonitor!;
export const otherMonitor = () => Main.layoutManager.monitors.find(monitor => monitor !== primary()) ?? null;

export function set(key: string, value: boolean | string) {
  if (typeof value === 'boolean') settings.set_boolean(key, value);
  else settings.set_string(key, value);
}

export const edgeGap = (monitor = primary()) => reservedGap(monitor);

export function panelBox() {
  const [x, y] = panel().get_transformed_position();
  return {x, y, width: panel().width, height: panel().height};
}

export const thickness = (actor: Clutter.Actor) => vertical() ? actor.width : actor.height;
export const length = (actor: Clutter.Actor) => vertical() ? actor.height : actor.width;

export function band(depth: number, inset = 0, edge: Edge = taskbarEdge()) {
  const monitor = primary();
  const area = {x: monitor.x + inset, y: monitor.y + inset, width: monitor.width - 2 * inset, height: monitor.height - 2 * inset};
  switch (edge) {
    case 'bottom': return {...area, y: area.y + area.height - depth, height: depth};
    case 'top': return {...area, height: depth};
    case 'left': return {...area, width: depth};
    case 'right': return {...area, x: area.x + area.width - depth, width: depth};
  }
}

export function captureEdge(name: string) {
  return captureArea(name, band(CROP_DEPTH));
}

export function shownOn(taskbar: Clutter.Actor, app: Shell.App) {
  const button = named(`kestrel-app-${app.id}`, taskbar);
  return button && button.get_parent()!.width > 0 ? button : null;
}

export function dots(button: Clutter.Actor | null) {
  if (!button) return 0;
  return ofType(button, St.Bin).child.get_children().filter(actor => actor instanceof St.Widget && actor.has_style_class_name('kestrel-running-dot') && actor.visible).length;
}
