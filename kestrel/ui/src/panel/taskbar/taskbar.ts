import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import type Meta from 'gi://Meta';
import Mtk from 'gi://Mtk';
import Shell from 'gi://Shell';
import St from 'gi://St';
import type { WindowPreviews } from '../windowPreviews.js';
import type { ContextMenus } from '../../menus/contextMenus.js';
import { taskbarPreferences, type TaskbarMetrics } from '../preferences/taskbarPreferences.js';
import { appIcon } from '../../appearance/icons/appIcons.js';
import { animateActor, liftIcon } from '../../shared/motion.js';
import { TaskbarDrop } from './taskbarDrop.js';
import { AppIndicators } from './appIndicators.js';
import { launcherEntries } from './launcherEntries.js';
import { appKey, launchHistory } from '../../shared/launchHistory.js';
import * as DND from 'resource:///com/lantharos/kestrel/ui/dnd.js';

const DOT_SIZE = 4;
const DOT_GAP = 3;
const SLOT_GAP = 2;
const RESIZE_DURATION = 220;

interface AppItem {
  app: Shell.App;
  icon: St.Bin;
  slot: St.Widget;
  button: St.Button;
  dots: St.Widget[];
  focused: boolean;
  iconGeometry: Mtk.Rectangle | null;
  removing: boolean;
  windowsChanged: number;
  draggable: { enabled: boolean };
  indicators: AppIndicators;
}

export class Taskbar {
  readonly actor = new St.BoxLayout({ style_class: 'kestrel-app-slots' });
  private readonly items = new Map<string, AppItem>();
  private initialized = false;
  private readonly disconnectors: (() => void)[] = [];
  private metrics: TaskbarMetrics = taskbarPreferences.metrics;

  constructor(private readonly tracker: Shell.WindowTracker, private readonly menus: ContextMenus, private readonly previews: WindowPreviews,
    private readonly favorites: Gio.Settings, private readonly monitorIndex: () => number,
    private readonly windowsOf: (app: Shell.App) => Meta.Window[],
    private readonly activateWindow: (window: Meta.Window) => void) {
    new TaskbarDrop(this.actor, () => {
      const pinned = this.pinned();
      return this.actor.get_children()
        .map(slot => [...this.items.values()].find(item => item.slot === slot && !item.removing))
        .filter((item): item is AppItem => !!item && pinned.has(item.app.id))
        .map(item => ({ id: item.app.id, slot: item.slot, button: item.button }));
    }, favorites);
    const display = (global as unknown as Shell.Global).display;
    const refresh = () => this.updateIndicators();
    const signals = [display.connect('window-demands-attention', refresh), display.connect('window-marked-urgent', refresh)];
    this.disconnectors.push(
      () => signals.forEach(id => display.disconnect(id)),
      launcherEntries.watch(appId => { const item = this.items.get(appId); if (item) this.updateIndicator(item); }),
    );
  }

  shutdown(): void {
    for (const disconnect of this.disconnectors) disconnect();
    this.disconnectors.length = 0;
  }

  private pinned(): Set<string> {
    return new Set(taskbarPreferences.showPinned ? this.favorites.get_strv('favorite-apps') : []);
  }

  resize(metrics: TaskbarMetrics): void {
    this.metrics = metrics;
    for (const item of this.items.values()) {
      this.layoutItem(item);
      if (!item.removing) animateActor(item.slot, { width: this.slotWidth, duration: RESIZE_DURATION, mode: Clutter.AnimationMode.EASE_OUT_QUART });
      this.updateDots(item);
    }
  }

  private get slotWidth(): number {
    return this.metrics.button + SLOT_GAP;
  }

  private layoutItem(item: AppItem): void {
    const { button, icon } = this.metrics;
    item.slot.height = button;
    item.button.set_size(button, button);
    item.button.child.set_size(button, button);
    item.icon.set_size(icon, icon);
    item.icon.set_position((button - icon) / 2, Math.round((button - icon) / 2) - 1);
    (item.icon.child as St.Icon).icon_size = icon;
    for (const dot of item.dots) dot.y = button - DOT_SIZE;
    item.indicators.resize(button);
  }

  private updateIndicators(): void {
    for (const item of this.items.values()) this.updateIndicator(item);
  }

  private updateIndicator(item: AppItem): void {
    const attention = this.tracker.focus_app !== item.app &&
      this.windowsOf(item.app).some(window => window.demands_attention || window.urgent);
    item.indicators.update(launcherEntries.get(item.app.id), attention);
    this.updateDots(item);
  }

  update(apps: Shell.App[]): void {
    const wanted = new Set(apps.map(app => app.id));
    const pinned = this.pinned();
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
        item.app.disconnect(item.windowsChanged);
        item.app = app;
        const currentItem = item;
        item.windowsChanged = app.connect('windows-changed', () => this.windowsChanged(currentItem));
        item.icon.child.destroy();
        item.icon.child = appIcon(app, this.metrics.icon);
      }
      item.button.accessible_name = app.get_name();
      item.draggable.enabled = pinned.has(app.id);
      item.removing = false;
      item.button.reactive = true;
      this.actor.set_child_at_index(item.slot, index);
      this.windowsChanged(item);
      animateActor(item.slot, { width: this.slotWidth, duration: this.initialized ? 220 : 0, mode: Clutter.AnimationMode.EASE_OUT_QUART });
      animateActor(item.button, { opacity: 255, translation_y: 0, duration: this.initialized ? 220 : 0, mode: Clutter.AnimationMode.EASE_OUT_QUART });
    });
    this.initialized = true;
    this.updateFocus();
  }

  updateFocus(): void {
    this.updateIndicators();
    for (const [id, item] of this.items) {
      const focused = id === this.tracker.focus_app?.id;
      if (focused) item.button.add_style_class_name('kestrel-app-focused');
      else item.button.remove_style_class_name('kestrel-app-focused');
      if (focused === item.focused) continue;
      item.focused = focused;
      this.updateDots(item, true);
    }
  }

  private makeDraggable(item: AppItem): { enabled: boolean } {
    (item.button as St.Button & { _delegate: object })._delegate = {
      get id() { return item.app.id; },
      folder: false,
      getDragActor: () => appIcon(item.app, this.metrics.icon),
      getDragActorSource: () => item.icon,
    };
    const draggable = DND.makeDraggable(item.button, { dragActorOpacity: 220 });
    draggable.connect('drag-begin', () => {
      this.previews.close();
      item.button.opacity = 90;
    });
    draggable.connect('drag-end', () => { item.button.opacity = 255; });
    return draggable;
  }

  private windowsChanged(item: AppItem): void {
    this.updateIndicator(item);
    item.iconGeometry = null;
    this.syncIconGeometry(item);
  }

  private syncIconGeometry(item: AppItem): void {
    if (!item.button.mapped) return;
    const [x, y] = item.button.get_transformed_position();
    const [width, height] = item.button.get_transformed_size();
    const geometry = new Mtk.Rectangle({ x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) });
    if (item.iconGeometry?.equal(geometry)) return;
    item.iconGeometry = geometry;
    const monitor = this.monitorIndex();
    for (const window of item.app.get_windows()) {
      if (window.get_monitor() === monitor) window.set_icon_geometry(geometry);
    }
  }

  private updateDots(item: AppItem, animate = false): void {
    const { button } = this.metrics;
    const count = item.indicators.showsProgress ? 0 : Math.min(4, this.windowsOf(item.app).filter(window => !window.skip_taskbar).length);
    const width = item.focused ? Math.min(DOT_SIZE * 3, Math.floor((button - 8 - (count - 1) * DOT_GAP) / Math.max(1, count))) : DOT_SIZE;
    const start = (button - (count * width + (count - 1) * DOT_GAP)) / 2;
    item.dots.forEach((dot, index) => {
      dot.visible = index < count;
      animateActor(dot, {
        x: start + index * (width + DOT_GAP), width,
        duration: animate && dot.visible ? 180 : 0, mode: Clutter.AnimationMode.EASE_OUT_QUART,
      });
    });
  }

  private create(app: Shell.App): AppItem {
    const icon = new St.Bin({ child: appIcon(app, this.metrics.icon) });
    const content = new St.Widget();
    content.add_child(icon);
    const dots = Array.from({ length: 4 }, () => {
      const dot = new St.Widget({ style_class: 'kestrel-running-dot', width: DOT_SIZE, height: DOT_SIZE, visible: false });
      content.add_child(dot);
      return dot;
    });
    const button = new St.Button({
      name: `kestrel-app-${app.id}`, style_class: 'kestrel-task-button', child: content,
      can_focus: true, track_hover: true, accessible_name: app.get_name(),
    });
    const slot = new St.Widget({ width: this.slotWidth, clip_to_allocation: true });
    slot.add_child(button);
    const item: AppItem = { app, icon, slot, button, dots, focused: false, iconGeometry: null, removing: false, windowsChanged: 0,
      draggable: { enabled: false }, indicators: new AppIndicators(content, this.metrics.button) };
    this.layoutItem(item);
    item.draggable = this.makeDraggable(item);
    item.windowsChanged = app.connect('windows-changed', () => this.windowsChanged(item));
    button.connect('notify::allocation', () => this.syncIconGeometry(item));
    button.connect('destroy', () => item.app.disconnect(item.windowsChanged));
    liftIcon(button, icon);
    this.previews.bind(button, () => item.app, () => this.windowsOf(item.app));
    this.menus.bind(button, () => this.menus.appEntries(item.app, this.windowsOf(item.app)));
    button.connect('clicked', () => {
      const app = item.app;
      const windows = this.windowsOf(app);
      if (windows.length > 1) { this.previews.open(button, app, windows, true); return; }
      this.previews.close();
      if (this.tracker.focus_app === app && windows.length === 1) windows[0].minimize();
      else if (windows.length === 1) this.activateWindow(windows[0]);
      else {
        launchHistory.record(appKey(app.id));
        app.activate();
      }
    });
    return item;
  }
}
