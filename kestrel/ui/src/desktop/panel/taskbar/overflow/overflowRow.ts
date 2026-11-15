import Clutter from 'gi://Clutter';
import type Meta from 'gi://Meta';
import type Shell from 'gi://Shell';
import St from 'gi://St';

import type { ContextMenus, MenuEntry } from '../../../menus/contextMenus.js';
import type { PixelFrame } from '../../../../shared/display/graphics.js';
import * as DND from '../../../../shared/popups/dnd.js';
import { AppIndicators } from '../appIndicators.js';
import { launcherEntries } from '../launcherEntries.js';
import { taskbarPreferences } from '../../preferences/taskbarPreferences.js';

const DOT_SIZE = 4;
const DOT_GAP = 3;
const DRAG_OPACITY = 220;

export interface OverflowApps {
  readonly apps: Shell.App[];
  readonly frame: PixelFrame;
  icon(app: Shell.App): St.Icon;
  windowsOf(app: Shell.App): Meta.Window[];
  attention(app: Shell.App): boolean;
  pinned(app: Shell.App): boolean;
  activate(app: Shell.App): void;
  entries(app: Shell.App): MenuEntry[];
}

function dots(content: St.Widget, count: number, size: number): void {
  const start = (size - (count * DOT_SIZE + (count - 1) * DOT_GAP)) / 2;
  for (let index = 0; index < count; index++) {
    content.add_child(new St.Widget({
      style_class: 'kestrel-running-dot', width: DOT_SIZE, height: DOT_SIZE, x: start + index * (DOT_SIZE + DOT_GAP), y: size - DOT_SIZE,
    }));
  }
}

function glyph(app: Shell.App, apps: OverflowApps): { content: St.Widget; icon: St.Bin } {
  const { outer, inner, inset } = apps.frame;
  const content = new St.Widget({ width: outer, height: outer, y_align: Clutter.ActorAlign.CENTER });
  const icon = new St.Bin({ child: apps.icon(app), width: inner, height: inner, x: inset, y: inset });
  content.add_child(icon);
  const indicators = new AppIndicators(content, outer, 'bottom');
  indicators.update(launcherEntries.get(app.id), apps.attention(app), taskbarPreferences.badges);
  if (!indicators.showsProgress) dots(content, Math.min(4, apps.windowsOf(app).filter(window => !window.skip_taskbar).length), outer);
  return { content, icon };
}

function makeDraggable(button: St.Button, icon: St.Bin, app: Shell.App, apps: OverflowApps, dismiss: () => void): void {
  (button as St.Button & { _delegate: object })._delegate = {
    id: app.id,
    folder: false,
    getDragActor: () => apps.icon(app),
    getDragActorSource: () => icon,
  };
  const draggable = DND.makeDraggable(button, { dragActorOpacity: DRAG_OPACITY });
  draggable.enabled = apps.pinned(app);
  draggable.connect('drag-begin', dismiss);
}

export function overflowRow(app: Shell.App, apps: OverflowApps, menus: ContextMenus, dismiss: () => void): St.Button {
  const { content, icon } = glyph(app, apps);
  const row = new St.BoxLayout({ style_class: 'kestrel-overflow-row-content', x_expand: true });
  row.add_child(content);
  row.add_child(new St.Label({ text: app.get_name(), x_expand: true, y_align: Clutter.ActorAlign.CENTER }));
  const button = new St.Button({
    name: `kestrel-overflow-${app.id}`, style_class: 'kestrel-overflow-row', child: row,
    accessible_name: app.get_name(), can_focus: true, track_hover: true, x_expand: true,
  });
  button.connect('notify::hover', () => { if (button.hover) button.grab_key_focus(); });
  button.connect('clicked', () => {
    dismiss();
    apps.activate(app);
  });
  menus.bind(button, () => apps.entries(app));
  makeDraggable(button, icon, app, apps, dismiss);
  return button;
}
