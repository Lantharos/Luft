import Gio from 'gi://Gio';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {named} from '../../lib/actors.js';
import {checks} from '../../lib/check.js';
import {captureArea} from '../../lib/screenshots.js';

export const {require, eventually} = checks('taskbar option');
export const HEIGHTS = {compact: 40, normal: 48, large: 56};
export const FLOATING_MARGIN = 8;
export const KEYS = ['taskbar-alignment', 'taskbar-look', 'taskbar-style', 'taskbar-size', 'taskbar-auto-hide',
  'taskbar-show-pinned', 'taskbar-displays', 'taskbar-windows-per-display', 'taskbar-windows-per-workspace'];
const CROP_HEIGHT = 120;

export const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
export const panel = () => named('kestrel-panel');
export const primary = () => Main.layoutManager.primaryMonitor;
export const otherMonitor = () => Main.layoutManager.monitors.find(monitor => monitor !== primary()) ?? null;

export function set(key, value) {
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

export function captureBottom(name) {
  const {x, y, width, height} = primary();
  return captureArea(name, {x, y: y + height - CROP_HEIGHT, width, height: CROP_HEIGHT});
}

export function shownOn(taskbar, app) {
  const button = named(`kestrel-app-${app.id}`, taskbar);
  return button && button.get_parent().width > 0 ? button : null;
}

export function dots(button) {
  return button?.child.get_children().filter(actor => actor.has_style_class_name?.('kestrel-running-dot') && actor.visible).length ?? 0;
}
