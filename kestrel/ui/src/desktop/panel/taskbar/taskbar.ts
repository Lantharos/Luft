import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import type Meta from 'gi://Meta';
import Graphene from 'gi://Graphene';
import Mtk from 'gi://Mtk';
import type Shell from 'gi://Shell';
import St from 'gi://St';
import type { WindowPreviews } from '../windowPreviews.js';
import type { OverflowPopup } from './overflow/overflowPopup.js';
import { AppOverflow } from './overflow/appOverflow.js';
import type { ContextMenus } from '../../menus/contextMenus.js';
import { taskbarPreferences, type TaskbarMetrics } from '../preferences/taskbarPreferences.js';
import { direction, isVertical, outward, toward, type Edge } from '../../../shared/layout/edge.js';
import { appIcons, taskbarAppIcon } from '../../../appearance/icons/appIcons.js';
import { animateActor, Curve, Duration, liftIcon, Spring, stillMotion } from '../../../shared/motion/motion.js';
import { moveRows } from '../../../shared/motion/rows.js';
import { transitionVelocity } from '../../windowManager/effects/velocity.js';
import { TaskbarDrop } from './taskbarDrop.js';
import { AppIndicators } from './appIndicators.js';
import { launcherEntries } from './launcherEntries.js';
import { appKey, launchHistory } from '../../../shared/apps/launchHistory.js';
import * as DND from '../../../shared/popups/dnd.js';
import { frameOnPixels, pixelScale, whenPixelScaleChanges, type PixelFrame } from '../../../shared/display/graphics.js';

const DOT_SIZE = 4;
const DOT_GAP = 3;
const ENTRY_OFFSET = 18;
const BOUNCE_SPEED = 360;

interface AppItem {
  app: Shell.App;
  icon: St.Bin;
  slot: St.Widget;
  button: St.Button;
  plate: St.Widget;
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
  readonly overflow: AppOverflow;
  private readonly items = new Map<string, AppItem>();
  private apps: Shell.App[] = [];
  private initialized = false;
  private readonly disconnectors: (() => void)[] = [];
  private metrics: TaskbarMetrics = taskbarPreferences.desktop.metrics;
  private edge: Edge = taskbarPreferences.desktop.edge;

  constructor(private readonly tracker: Shell.WindowTracker, private readonly menus: ContextMenus, private readonly previews: WindowPreviews,
    overflowPopup: OverflowPopup, private readonly favorites: Gio.Settings, private readonly monitorIndex: () => number,
    private readonly windowsOf: (app: Shell.App) => Meta.Window[],
    private readonly activateWindow: (window: Meta.Window) => void, private readonly open: (app: Shell.App) => void) {
    new TaskbarDrop(this.actor, () => {
      const pinned = this.pinned();
      return this.actor.get_children()
        .map(slot => [...this.items.values()].find(item => item.slot === slot && !item.removing))
        .filter((item): item is AppItem => !!item && pinned.has(item.app.id))
        .map(item => ({ id: item.app.id, slot: item.slot, button: item.button }));
    }, favorites, () => isVertical(this.edge));
    this.overflow = new AppOverflow({
      frame: () => this.frame,
      icon: app => taskbarAppIcon(app, this.iconSize, this.artworkFill),
      windowsOf, attention: app => this.attention(app), focused: app => this.tracker.focus_app === app,
      pinned: app => this.pinned().has(app.id), activate: (app, source) => this.activate(app, source),
      entries: app => menus.appEntries(app, windowsOf(app), () => open(app)), monitorIndex,
      changed: () => this.update(this.apps),
    }, overflowPopup, this.metrics, this.edge);
    this.actor.add_child(this.overflow.slot);
    const display = global.display;
    const refresh = () => this.updateIndicators();
    const signals = [display.connect('window-demands-attention', refresh), display.connect('window-marked-urgent', refresh)];
    this.disconnectors.push(
      () => signals.forEach(id => display.disconnect(id)),
      launcherEntries.watch(appId => {
        const item = this.items.get(appId);
        if (item) this.updateIndicator(item);
        else this.overflow.recheck(this.apps);
      }),
      appIcons.watch(() => this.relayout()),
      taskbarPreferences.watch(key => { if (key === 'taskbar-badges') refresh(); }),
    );
    whenPixelScaleChanges(this.actor, () => this.relayout());
  }

  shutdown(): void {
    this.overflow.stop();
    for (const disconnect of this.disconnectors) disconnect();
    this.disconnectors.length = 0;
  }

  private pinned(): Set<string> {
    return new Set(taskbarPreferences.showPinned ? this.favorites.get_strv('favorite-apps') : []);
  }

  resize(metrics: TaskbarMetrics): void {
    this.metrics = metrics;
    this.overflow.layout(metrics, this.edge);
    for (const item of this.items.values()) {
      this.layoutItem(item);
      if (!item.removing) this.resizeSlot(item, this.slotLength, Duration.moderate, Curve.settle);
      this.updateDots(item);
    }
  }

  reorient(edge: Edge): void {
    this.edge = edge;
    this.actor.orientation = this.vertical ? Clutter.Orientation.VERTICAL : Clutter.Orientation.HORIZONTAL;
    this.overflow.layout(this.metrics, edge);
    for (const [id, item] of this.items) {
      item.slot.remove_all_transitions();
      if (item.removing) {
        this.items.delete(id);
        item.slot.destroy();
        continue;
      }
      item.slot.set_size(this.metrics.button, this.metrics.button);
      item.slot[this.lengthKey] = this.slotLength;
      this.layoutItem(item);
      this.updateDots(item);
    }
  }

  private relayout(): void {
    this.overflow.layout(this.metrics, this.edge);
    for (const item of this.items.values()) {
      this.layoutItem(item);
      this.updateDots(item);
    }
  }

  private get vertical(): boolean {
    return isVertical(this.edge);
  }

  private get lengthKey(): 'width' | 'height' {
    return this.vertical ? 'height' : 'width';
  }

  private get slotLength(): number {
    return this.metrics.button + this.metrics.gap;
  }

  private get iconSize(): number {
    return appIcons.style === 'default' ? this.metrics.icon : this.metrics.plate;
  }

  private get artworkFill(): number {
    return this.metrics.artwork / this.metrics.icon;
  }

  private get frame(): PixelFrame {
    return frameOnPixels(this.metrics.button, this.iconSize, pixelScale(this.actor));
  }

  private placeIcon(item: AppItem, { inner, inset }: PixelFrame): void {
    const scale = pixelScale(this.actor);
    const nudge = -outward(this.edge) * Math.floor(scale) / scale;
    item.icon.set_size(inner, inner);
    if (this.vertical) item.icon.set_position(inset + nudge, inset);
    else item.icon.set_position(inset, inset + nudge);
    (item.icon.child as St.Icon).icon_size = this.iconSize;
    appIcons.fit(item.icon.child as St.Icon, this.artworkFill);
  }

  private layoutItem(item: AppItem): void {
    const { button: slot, gap } = this.metrics;
    const frame = this.frame;
    const button = frame.outer;
    const vertical = this.vertical;
    item.slot[vertical ? 'width' : 'height'] = slot;
    item.button.set_position(vertical ? 0 : Math.floor(gap / 2), vertical ? Math.floor(gap / 2) : 0);
    item.button.set_size(button, button);
    item.button.child.set_size(button, button);
    item.plate.set_size(button, button);
    this.placeIcon(item, frame);
    const dotOffset = outward(this.edge) > 0 ? button - DOT_SIZE : 0;
    for (const dot of item.dots) {
      if (vertical) dot.set({ x: dotOffset, width: DOT_SIZE });
      else dot.set({ y: dotOffset, height: DOT_SIZE });
    }
    item.indicators.resize(button, this.edge);
  }

  private updateIndicators(): void {
    for (const item of this.items.values()) this.updateIndicator(item);
    this.overflow.recheck(this.apps);
  }

  private attention(app: Shell.App): boolean {
    return launcherEntries.get(app.id).urgent ||
      (this.tracker.focus_app !== app && this.windowsOf(app).some(window => window.demands_attention || window.urgent));
  }

  private updateIndicator(item: AppItem): void {
    item.indicators.update(launcherEntries.get(item.app.id), this.attention(item.app), taskbarPreferences.badges);
    this.updateDots(item);
  }

  update(all: Shell.App[]): void {
    this.apps = all;
    const apps = this.overflow.split(all);
    const wanted = new Set(apps.map(app => app.id));
    const pinned = this.pinned();
    for (const [id, item] of this.items) {
      if (wanted.has(id) || item.removing) continue;
      item.removing = true;
      item.button.reactive = false;
      animateActor(item.button, { opacity: 0, ...toward(this.edge, ENTRY_OFFSET), duration: Duration.quick });
      this.resizeSlot(item, 0, Duration.quick, Curve.pulse, () => {
        if (!item.removing) return;
        this.items.delete(id);
        item.slot.destroy();
      });
    }
    moveRows(this.actor, () => apps.forEach((app, index) => {
      let item = this.items.get(app.id);
      if (!item) {
        item = this.create(app);
        this.items.set(app.id, item);
        this.actor.add_child(item.slot);
        if (this.initialized) {
          item.slot.clip_to_allocation = true;
          item.slot[this.lengthKey] = 0;
          item.button.opacity = 0;
          item.button.set(toward(this.edge, ENTRY_OFFSET));
        }
      }
      if (item.app !== app) {
        item.app.disconnect(item.windowsChanged);
        item.app = app;
        const currentItem = item;
        item.windowsChanged = app.connect('windows-changed', () => this.windowsChanged(currentItem));
        item.icon.child.destroy();
        item.icon.child = taskbarAppIcon(app, this.iconSize, this.artworkFill);
      }
      item.button.accessible_name = app.get_name();
      item.draggable.enabled = pinned.has(app.id);
      item.removing = false;
      item.button.reactive = true;
      this.actor.set_child_at_index(item.slot, index);
      this.windowsChanged(item);
      this.resizeSlot(item, this.slotLength, this.initialized ? Duration.moderate : 0, Curve.settle);
      animateActor(item.button, { opacity: 255, translation_x: 0, translation_y: 0, duration: this.initialized ? Duration.moderate : 0, curve: Curve.settle });
    }), this.vertical ? 'y' : 'x');
    this.actor.set_child_above_sibling(this.overflow.slot, null);
    this.initialized = true;
    this.updateFocus();
  }

  private resizeSlot(item: AppItem, length: number, duration: number, curve: readonly number[], resized?: () => void): void {
    if (item.slot[this.lengthKey] === length && !item.slot.get_transition(this.lengthKey)) {
      resized?.();
      return;
    }
    item.slot.clip_to_allocation = true;
    animateActor(item.slot, {
      [this.lengthKey]: length, duration, curve,
      onComplete: () => {
        item.slot.clip_to_allocation = false;
        resized?.();
      },
    });
  }

  updateFocus(): void {
    this.updateIndicators();
    const previous = [...this.items.values()].find(item => item.focused) ?? null;
    for (const [id, item] of this.items) {
      const focused = id === this.tracker.focus_app?.id;
      if (focused) item.button.add_style_class_name('kestrel-app-focused');
      else item.button.remove_style_class_name('kestrel-app-focused');
      if (focused === item.focused) continue;
      item.focused = focused;
      this.updateDots(item, true);
    }
    const next = [...this.items.values()].find(item => item.focused) ?? null;
    if (next !== previous) this.movePlate(previous, next);
  }

  private platePosition(item: AppItem): number {
    const [x, y] = item.button.get_transformed_position();
    return this.vertical ? y + item.plate.translation_y : x + item.plate.translation_x;
  }

  private movePlate(from: AppItem | null, to: AppItem | null): void {
    const property = this.vertical ? 'translation_y' : 'translation_x';
    const sliding = !!from && !!to && from.button.mapped && to.button.mapped && to.button.has_allocation() && from.plate.visible && !stillMotion();
    const offset = sliding ? this.platePosition(from) - this.platePosition(to) : 0;
    const velocity = sliding ? transitionVelocity(from.plate, property.replace('_', '-')) : 0;
    if (from) {
      from.plate.remove_all_transitions();
      from.plate.set({ visible: false, translation_x: 0, translation_y: 0 });
    }
    if (!to) return;
    to.plate.show();
    if (!sliding) {
      to.plate.opacity = 0;
      animateActor(to.plate, { opacity: 255, duration: Duration.quick, curve: Curve.decelerate });
      return;
    }
    to.plate.opacity = 255;
    to.plate[property] = offset;
    animateActor(to.plate, { [property]: 0, spring: Spring.snappy, velocity });
  }

  launching(app: Shell.App): void {
    const item = this.items.get(app.id);
    if (item) this.bounce(item);
  }

  private bounce(item: AppItem): void {
    if (stillMotion() || !item.button.mapped) return;
    const [x, y] = direction(this.edge);
    const glyph = item.icon.child;
    animateActor(glyph, { translation_x: 0, translation_y: 0, spring: Spring.thrown, velocity: { translation_x: -x * BOUNCE_SPEED, translation_y: -y * BOUNCE_SPEED } });
  }

  private makeDraggable(item: AppItem): { enabled: boolean } {
    (item.button as St.Button & { _delegate: object })._delegate = {
      get id() { return item.app.id; },
      folder: false,
      getDragActor: () => taskbarAppIcon(item.app, this.iconSize, this.artworkFill),
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
    const button = this.frame.outer;
    const count = item.indicators.showsProgress ? 0 : Math.min(4, this.windowsOf(item.app).filter(window => !window.skip_taskbar).length);
    const width = item.focused ? Math.min(DOT_SIZE * 3, Math.floor((button - 8 - (count - 1) * DOT_GAP) / Math.max(1, count))) : DOT_SIZE;
    const start = (button - (count * width + (count - 1) * DOT_GAP)) / 2;
    const [position, size] = this.vertical ? ['y', 'height'] as const : ['x', 'width'] as const;
    item.dots.forEach((dot, index) => {
      const shown = index < count;
      const appearing = shown && (!dot.visible || dot.scale_x < 1);
      animateActor(dot, {
        [position]: start + index * (width + DOT_GAP), [size]: width,
        duration: animate && dot.visible && !appearing ? Duration.quick : 0, curve: Curve.settle,
      });
      if (shown) dot.show();
      if (!item.button.mapped || stillMotion()) {
        dot.remove_transition('scale-x');
        dot.remove_transition('scale-y');
        dot.set({ visible: shown, scale_x: 1, scale_y: 1 });
      } else if (appearing) {
        if (!dot.get_transition('scale-x')) dot.set_scale(0, 0);
        animateActor(dot, { scale_x: 1, scale_y: 1, spring: Spring.arrive });
      } else if (!shown && dot.visible) {
        animateActor(dot, { scale_x: 0, scale_y: 0, spring: Spring.snappy, onComplete: () => dot.hide() });
      }
    });
  }

  private create(app: Shell.App): AppItem {
    const icon = new St.Bin({ child: taskbarAppIcon(app, this.iconSize, this.artworkFill) });
    const content = new St.Widget();
    const plate = new St.Widget({ style_class: 'kestrel-task-plate', visible: false });
    content.add_child(plate);
    content.add_child(icon);
    const dots = Array.from({ length: 4 }, () => {
      const dot = new St.Widget({ style_class: 'kestrel-running-dot', width: DOT_SIZE, height: DOT_SIZE, visible: false, pivot_point: new Graphene.Point({ x: 0.5, y: 0.5 }) });
      content.add_child(dot);
      return dot;
    });
    const button = new St.Button({
      name: `kestrel-app-${app.id}`, style_class: 'kestrel-task-button', child: content,
      can_focus: true, track_hover: true, accessible_name: app.get_name(),
    });
    const slot = new St.Widget({ [this.lengthKey]: this.slotLength });
    slot.add_child(button);
    const item: AppItem = { app, icon, slot, button, plate, dots, focused: false, iconGeometry: null, removing: false, windowsChanged: 0,
      draggable: { enabled: false }, indicators: new AppIndicators(content, this.metrics.button, this.edge) };
    this.layoutItem(item);
    item.draggable = this.makeDraggable(item);
    item.windowsChanged = app.connect('windows-changed', () => this.windowsChanged(item));
    button.connect('notify::allocation', () => this.syncIconGeometry(item));
    button.connect('style-changed', () => (plate.style = `border-radius: ${button.get_theme_node().get_border_radius(St.Corner.TOPLEFT) / St.ThemeContext.get_for_stage(global.stage).scale_factor}px;`));
    button.connect('destroy', () => item.app.disconnect(item.windowsChanged));
    liftIcon(button, icon, () => {
      const [x, y] = direction(this.edge);
      return [-x, -y];
    });
    this.previews.bind(button, () => item.app, () => this.windowsOf(item.app));
    this.menus.bind(button, () => this.menus.appEntries(item.app, this.windowsOf(item.app), () => this.open(item.app)));
    button.connect('clicked', () => this.activate(item.app, button));
    return item;
  }

  private activate(app: Shell.App, source: St.Button): void {
    const windows = this.windowsOf(app);
    if (windows.length > 1) { this.previews.open(source, app, windows, true); return; }
    this.previews.close();
    if (this.tracker.focus_app === app && windows.length === 1) windows[0].minimize();
    else if (windows.length === 1) this.activateWindow(windows[0]);
    else {
      launchHistory.record(appKey(app.id));
      this.open(app);
    }
  }
}
