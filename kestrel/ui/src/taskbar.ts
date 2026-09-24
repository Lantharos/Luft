import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import St from 'gi://St';
import type { WindowPreviews } from './windowPreviews.js';
import type { ContextMenus } from './contextMenus.js';
import { PANEL_ICON_SIZE } from './surface.js';
import { animateActor, liftIcon } from './motion.js';

interface AppItem {
  app: Shell.App;
  icon: St.Bin;
  slot: St.Widget;
  button: St.Button;
  dot: St.Widget;
  removing: boolean;
}

export class Taskbar {
  readonly actor = new St.BoxLayout({ style_class: 'kestrel-app-slots' });
  private readonly items = new Map<string, AppItem>();
  private initialized = false;

  constructor(private readonly tracker: Shell.WindowTracker, private readonly menus: ContextMenus, private readonly previews: WindowPreviews) {}

  update(apps: Shell.App[]): void {
    const wanted = new Set(apps.map(app => app.id));
    for (const [id, item] of this.items) {
      if (wanted.has(id) || item.removing) continue;
      item.removing = true;
      item.button.reactive = false;
      animateActor(item.button, { opacity: 0, translation_y: 18, duration: 160 });
      animateActor(item.slot, {
        width: 0, duration: 180, mode: Clutter.AnimationMode.EASE_IN_OUT_QUAD,
        onComplete: () => {
          if (!item.removing) return;
          this.items.delete(id);
          item.slot.destroy();
        },
      });
    }
    apps.forEach((app, index) => {
      let item = this.items.get(app.id);
      if (!item) {
        item = this.create(app);
        this.items.set(app.id, item);
        this.actor.add_child(item.slot);
        if (this.initialized) {
          item.slot.width = 0;
          item.button.opacity = 0;
          item.button.translation_y = 18;
        }
      }
      if (item.app !== app) {
        item.app = app;
        item.icon.child = app.create_icon_texture(PANEL_ICON_SIZE);
      }
      item.button.accessible_name = app.get_name();
      item.removing = false;
      item.button.reactive = true;
      this.actor.set_child_at_index(item.slot, index);
      item.dot.visible = app.state === Shell.AppState.RUNNING;
      animateActor(item.slot, { width: 42, duration: this.initialized ? 220 : 0, mode: Clutter.AnimationMode.EASE_OUT_QUART });
      animateActor(item.button, { opacity: 255, translation_y: 0, duration: this.initialized ? 220 : 0, mode: Clutter.AnimationMode.EASE_OUT_QUART });
    });
    this.initialized = true;
    this.updateFocus();
  }

  updateFocus(): void {
    for (const [id, item] of this.items) {
      if (id === this.tracker.focus_app?.id) item.button.add_style_pseudo_class('active');
      else item.button.remove_style_pseudo_class('active');
    }
  }

  private create(app: Shell.App): AppItem {
    const icon = new St.Bin({ width: PANEL_ICON_SIZE, height: PANEL_ICON_SIZE, child: app.create_icon_texture(PANEL_ICON_SIZE) });
    icon.set_position((40 - PANEL_ICON_SIZE) / 2, 5);
    const content = new St.Widget({ width: 40, height: 40 });
    content.add_child(icon);
    const dot = new St.Widget({
      style_class: 'kestrel-running-dot',
      x: 18.5, y: 36, width: 3, height: 3,
    });
    content.add_child(dot);
    const button = new St.Button({
      name: `kestrel-app-${app.id}`, style_class: 'kestrel-task-button', child: content, width: 40, height: 40,
      can_focus: true, track_hover: true, accessible_name: app.get_name(),
    });
    const slot = new St.Widget({ width: 42, height: 40, clip_to_allocation: true });
    slot.add_child(button);
    const item = { app, icon, slot, button, dot, removing: false };
    liftIcon(button, icon);
    this.previews.bind(button, () => item.app);
    this.menus.bind(button, () => this.menus.appEntries(item.app));
    button.connect('clicked', () => {
      const app = item.app;
      const windows = app.get_windows();
      if (windows.length > 1) { this.previews.open(button, app, true); return; }
      this.previews.close();
      if (this.tracker.focus_app === app && windows.length === 1) windows[0].minimize();
      else app.activate();
    });
    return item;
  }
}
