import type Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import type Shell from 'gi://Shell';
import St from 'gi://St';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {named, ofType} from '../../lib/actors.js';
import {checks} from '../../lib/check.js';
import {captureArea} from '../../lib/screenshots.js';

export const {require, eventually} = checks('taskbar option');
export const HEIGHTS = {compact: 40, normal: 48, large: 56};
export const FLOATING_MARGIN = 8;
export const KEYS = ['taskbar-alignment', 'taskbar-look', 'taskbar-style', 'taskbar-size', 'taskbar-auto-hide',
  'taskbar-show-pinned', 'taskbar-displays', 'taskbar-windows-per-display', 'taskbar-windows-per-workspace'];
const CROP_HEIGHT = 120;

export const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
export const panel = () => ofType(named('kestrel-panel'), St.Widget);
export const primary = () => Main.layoutManager.primaryMonitor!;
export const otherMonitor = () => Main.layoutManager.monitors.find(monitor => monitor !== primary()) ?? null;

export function set(key: string, value: boolean | string) {
  if (typeof value === 'boolean') settings.set_boolean(key, value);
  else settings.set_string(key, value);
}

export function bottomGap(monitor = primary()) {
  const area = Main.layoutManager.getWorkAreaForMonitor(monitor.index);
  return monitor.y + monitor.height - area.y - area.height;
}

export function panelBox() {
  const [x, y] = panel().get_transformed_position();
  return {x, y, width: panel().width, height: panel().height};
}

export function captureBottom(name: string) {
  const {x, y, width, height} = primary();
  return captureArea(name, {x, y: y + height - CROP_HEIGHT, width, height: CROP_HEIGHT});
}

export function shownOn(taskbar: Clutter.Actor, app: Shell.App) {
  const button = named(`kestrel-app-${app.id}`, taskbar);
  return button && button.get_parent()!.width > 0 ? button : null;
}

export function dots(button: Clutter.Actor | null) {
  if (!button) return 0;
  return ofType(button, St.Bin).child.get_children().filter(actor => actor instanceof St.Widget && actor.has_style_class_name('kestrel-running-dot') && actor.visible).length;
}
