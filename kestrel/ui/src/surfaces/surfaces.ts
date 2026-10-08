import { freezeSelection } from 'resource:///com/lantharos/kestrel/ui/kestrelGlass.js';
import Clutter from 'gi://Clutter';
import type Shell from 'gi://Shell';
import St from 'gi://St';

import type { CaretPopup, Context } from '../context.js';
import type { Board } from '../desktop/board/board.js';
import type { ContextMenus } from '../desktop/menus/contextMenus.js';
import type { Monitor } from '../desktop/panel/panel.js';
import type { PanelSet } from '../desktop/panel/panels.js';
import { taskbarPreferences } from '../desktop/panel/preferences/taskbarPreferences.js';
import type { WindowPreviews } from '../desktop/panel/windowPreviews.js';
import type { TaskView } from '../desktop/taskView/taskView.js';
import type { SnapLayouts } from '../desktop/windows/snapLayouts.js';
import { animateActor } from '../shared/motion.js';
import { SURFACE_GAP } from '../shared/surface.js';
import type { ClipboardPanel } from './clipboard/panel.js';
import type { EmojiPanel } from './emoji/panel.js';
import type { NotificationCenter } from './notifications/notificationCenter.js';
import type { QuickSettings } from './quickSettings/quickSettings.js';
import type { StartMenu } from './start/startMenu.js';

export type Surface = 'start' | 'quick' | 'notifications' | 'clipboard' | 'emoji' | 'snap' | 'tasks';
type PanelSurface = Exclude<Surface, 'tasks'>;

const START_HEIGHT = 600;
const EDGE_MARGIN = 12;
const OPEN_DURATION = 220;
const CLOSE_DURATION = 160;

export interface SurfaceParts {
  context: Context;
  menus: ContextMenus;
  previews: WindowPreviews;
  panels: () => PanelSet;
  board: Board;
  start: StartMenu;
  quick: QuickSettings;
  notifications: NotificationCenter;
  clipboard: ClipboardPanel;
  emoji: EmojiPanel;
  snapLayouts: SnapLayouts;
  taskView: TaskView;
  canInteract: () => boolean;
  syncSession: () => void;
}

export class Surfaces {
  readonly cover = new St.Widget({ reactive: true, visible: false });
  private monitor: Monitor | null = null;
  private current: Surface | null = null;
  private readonly closingSelections = new Map<Clutter.Actor, () => void>();

  constructor(private readonly parts: SurfaceParts) {
    this.cover.connect('button-press-event', () => {
      this.close();
      return Clutter.EVENT_STOP;
    });
  }

  get active(): Surface | null {
    return this.current;
  }

  all(): St.BoxLayout[] {
    const { start, quick, notifications, clipboard, emoji, snapLayouts } = this.parts;
    return [start.actor, quick.actor, notifications.actor, clipboard.actor, emoji.actor, snapLayouts.actor];
  }

  clipToFloor(actor: Clutter.Actor): void {
    const updateClip = () => actor.set_clip(0, 0, actor.width, Math.max(0, this.floor() - actor.y - actor.translation_y));
    for (const signal of ['notify::translation-y', 'notify::width', 'notify::height', 'notify::y'] as const)
      actor.connect(signal, updateClip);
  }

  monitorAt(x: number, y: number): Monitor | null {
    return this.parts.context.layoutManager.monitors.find(m => x >= m.x && x < m.x + m.width && y >= m.y && y < m.y + m.height) ?? null;
  }

  dismissImmediately(): void {
    const { menus, previews, quick, taskView } = this.parts;
    this.close();
    menus.close(true);
    previews.close(true);
    this.parts.panels().setActive(null, null);
    quick.closeSubmenu(false);
    taskView.close(true);
    for (const actor of this.all()) {
      actor.remove_all_transitions();
      actor.hide();
      this.releaseSelection(actor);
    }
  }

  place(): void {
    const { context, start, quick, notifications, clipboard, emoji, snapLayouts, board } = this.parts;
    if (!context.layoutManager.primaryMonitor)
      return;

    const monitor = this.surfaceMonitor();
    this.cover.set_position(0, 0);
    const stage = (global as unknown as Shell.Global).stage;
    this.cover.set_size(stage.width, stage.height);
    const startWidth = Math.min(660, monitor.width - 24);
    const clearance = board.shown ? board.cornerClearance : taskbarPreferences.clearance;
    const bottom = monitor.y + monitor.height - clearance - SURFACE_GAP;
    const available = monitor.height - clearance - 24;
    const startHeight = Math.min(START_HEIGHT, available);
    const startX = board.shown ? monitor.x + monitor.width - EDGE_MARGIN - startWidth : monitor.x + (monitor.width - startWidth) / 2;
    start.actor.set_size(startWidth, startHeight);
    start.actor.set_position(Math.round(startX), bottom - startHeight);

    for (const [actor, width, height] of [
      [quick.actor, 420, quick.preferredHeight(420, available)],
      [notifications.actor, 380, notifications.preferredHeight(380, available)],
    ] as const) {
      actor.set_size(width, height);
      actor.set_position(Math.round(monitor.x + monitor.width - EDGE_MARGIN - width), bottom - height);
    }
    for (const popup of [clipboard, emoji])
      popup.place(available, context.layoutManager.getWorkAreaForMonitor(monitor.index));
    const [snapWidth, snapHeight] = snapLayouts.size();
    snapLayouts.actor.set_size(snapWidth, snapHeight);
    snapLayouts.actor.set_position(Math.round(monitor.x + (monitor.width - snapWidth) / 2), bottom - snapHeight);
  }

  toggle(surface: Surface, monitor = this.pointerMonitor()): void {
    const { previews, snapLayouts, board, taskView, start, notifications } = this.parts;
    if (!this.parts.canInteract()) return;
    previews.close();
    const popup = this.popupFor(surface);
    if (popup && !popup.available) return;
    if (popup) monitor = this.current === surface ? this.surfaceMonitor() : this.monitorAt(...popup.locate()) ?? monitor;
    if (surface === 'snap' && (!snapLayouts.available || board.shown)) return;
    if (this.current === surface && this.surfaceMonitor() === monitor) {
      this.close();
      return;
    }

    this.close();
    if (this.monitor !== monitor) {
      for (const actor of this.all()) {
        actor.remove_all_transitions();
        actor.hide();
      }
    }
    this.monitor = monitor;
    this.setActive(surface);
    const panels = this.parts.panels();
    panels.setActive(surface, monitor);
    this.cover.show();
    for (const panel of panels.all) panel.actor.get_parent()!.set_child_above_sibling(panel.actor, this.cover);
    if (surface === 'tasks') {
      taskView.open(monitor);
      this.parts.syncSession();
      return;
    }

    const actor = this.actorFor(surface);
    this.releaseSelection(actor);
    if (surface === 'start') start.reset();

    actor.get_parent()!.set_child_above_sibling(actor, null);
    const opening = !actor.visible;
    actor.show();
    if (surface === 'notifications') notifications.prepareOpen();
    popup?.open();
    if (surface === 'snap') snapLayouts.prepareOpen();
    this.place();
    if (opening) {
      actor.opacity = popup ? 0 : 255;
      actor.translation_y = this.slideDistance(actor);
    }
    this.animate(actor, 0, OPEN_DURATION);

    if (surface === 'start') start.focus();
    else if (!popup) actor.grab_key_focus();
  }

  close(): void {
    const { menus, notifications, taskView, quick } = this.parts;
    menus.close();
    const surface = this.current;
    if (surface === 'notifications') notifications.freeze();
    if (surface && surface !== 'tasks') this.closingSelections.set(this.actorFor(surface), freezeSelection(this.actorFor(surface)));
    this.setActive(null);
    this.popupFor(surface)?.closed?.();
    this.cover.hide();
    const panels = this.parts.panels();
    for (const panel of panels.all)
      panel.actor.get_parent()!.set_child_below_sibling(panel.actor, (global as unknown as Shell.Global).top_window_group);
    const stage = (global as unknown as Shell.Global).stage;
    const focus = stage.get_key_focus();
    if (focus && [...this.all(), taskView.actor].some(actor => actor.contains(focus)))
      stage.set_key_focus(null);
    if (surface === 'tasks') {
      taskView.close();
      panels.setActive(null, null);
      this.parts.syncSession();
      return;
    }
    if (!surface)
      return;

    const actor = this.actorFor(surface);
    this.animate(actor, this.slideDistance(actor), CLOSE_DURATION, () => {
      if (this.current === surface) return;
      actor.hide();
      this.releaseSelection(actor);
      if (surface === 'quick') quick.closeSubmenu(false);
      if (!this.current) panels.setActive(null, null);
    });
  }

  private releaseSelection(actor: Clutter.Actor): void {
    this.closingSelections.get(actor)?.();
    this.closingSelections.delete(actor);
  }

  private setActive(surface: Surface | null): void {
    this.current = surface;
    this.parts.context.messageTray.bannerBlocked = surface === 'notifications';
  }

  private surfaceMonitor(): Monitor {
    const { monitors, primaryMonitor } = this.parts.context.layoutManager;
    return monitors.find(monitor => monitor === this.monitor) ?? primaryMonitor!;
  }

  private pointerMonitor(): Monitor {
    const { layoutManager } = this.parts.context;
    const index = (global as unknown as Shell.Global).display.get_current_monitor();
    const monitor = layoutManager.monitors[index];
    return monitor && this.parts.panels().panelOn(monitor) ? monitor : layoutManager.primaryMonitor!;
  }

  private floor(): number {
    const monitor = this.surfaceMonitor();
    const { board } = this.parts;
    return board.shown ? monitor.y + monitor.height - board.cornerClearance : this.parts.panels().forMonitor(monitor).actor.y;
  }

  private popupFor(surface: Surface | null): CaretPopup | null {
    return surface === 'clipboard' ? this.parts.clipboard : surface === 'emoji' ? this.parts.emoji : null;
  }

  private popupActor(actor: Clutter.Actor): CaretPopup | null {
    return [this.parts.clipboard, this.parts.emoji].find(popup => popup.actor === actor) ?? null;
  }

  private actorFor(surface: PanelSurface): St.BoxLayout {
    switch (surface) {
      case 'start': return this.parts.start.actor;
      case 'quick': return this.parts.quick.actor;
      case 'notifications': return this.parts.notifications.actor;
      case 'clipboard': return this.parts.clipboard.actor;
      case 'emoji': return this.parts.emoji.actor;
      case 'snap': return this.parts.snapLayouts.actor;
    }
  }

  private animate(actor: Clutter.Actor, translationY: number, duration: number, onStopped?: () => void): void {
    animateActor(actor, {
      translation_y: translationY,
      ...this.popupActor(actor) ? { opacity: translationY === 0 ? 255 : 0 } : {},
      duration,
      mode: translationY === 0
        ? Clutter.AnimationMode.EASE_OUT_QUART
        : Clutter.AnimationMode.EASE_IN_QUART,
      onStopped,
    });
  }

  private slideDistance(actor: Clutter.Actor): number {
    const popup = this.popupActor(actor);
    if (popup) return popup.slideDistance;
    const monitor = this.surfaceMonitor();
    return monitor.y + monitor.height - actor.y;
  }
}
