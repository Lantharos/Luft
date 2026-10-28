import { freezeSelection } from '../appearance/kestrelGlass.js';
import Clutter from 'gi://Clutter';
import St from 'gi://St';

import type { CaretPopup, Context } from '../context.js';
import type { Board } from '../desktop/board/board.js';
import { banded, type SwipeTrack } from '../desktop/gestures/fourFingers.js';
import type { ContextMenus } from '../desktop/menus/contextMenus.js';
import type { Monitor } from '../desktop/panel/panel.js';
import type { PanelSet } from '../desktop/panel/panels.js';
import { taskbarPreferences } from '../desktop/panel/preferences/taskbarPreferences.js';
import { dock, gap, inset, isVertical, toward, type Along, type Edge, type Inset, type Offset } from '../shared/layout/edge.js';
import type { Box } from '../shared/layout/box.js';
import type { WindowPreviews } from '../desktop/panel/windowPreviews.js';
import type { TaskView } from '../desktop/taskView/taskView.js';
import type { SnapLayouts } from '../desktop/windows/snapLayouts.js';
import { onLocaleChanged } from '../shared/i18n/index.js';
import { animateActor, Curve, Duration, reducedMotion, Spring } from '../shared/motion/motion.js';
import { navigateWithKeyboard } from '../shared/input/keyboardNavigation.js';
import { raiseSurface, SURFACE_GAP } from '../shared/layout/surface.js';
import type { ClipboardPanel } from './clipboard/panel.js';
import type { EmojiPanel } from './emoji/panel.js';
import type { NotificationCenter } from './notifications/notificationCenter.js';
import type { QuickSettings } from './quickSettings/quickSettings.js';
import type { StartSurface } from './start/startSurface.js';

export type Surface = 'start' | 'quick' | 'notifications' | 'clipboard' | 'emoji' | 'snap' | 'tasks';
type PanelSurface = Exclude<Surface, 'tasks'>;

const EDGE_MARGIN = 12;
const FAR_MARGIN = 14;
const PANEL_SLIDE = 56;

interface LazySurfaces {
  start: StartSurface;
  notifications: NotificationCenter;
  emoji: EmojiPanel;
  snapLayouts: SnapLayouts;
}

type SurfaceFactories = { [Name in keyof LazySurfaces]: () => LazySurfaces[Name] };

interface SurfaceParts extends SurfaceFactories {
  context: Context;
  menus: ContextMenus;
  previews: WindowPreviews;
  panels: () => PanelSet;
  board: Board;
  quick: QuickSettings;
  clipboard: ClipboardPanel;
  taskView: TaskView;
  canInteract: () => boolean;
  syncSession: () => void;
  taskbarInset: () => Inset;
  startReplaced: () => void;
}

export class Surfaces {
  readonly cover = new St.Widget({ reactive: true, visible: false });
  readonly layer = new Clutter.Actor({ name: 'kestrel-surfaces' });
  private monitor: Monitor | null = null;
  private current: Surface | null = null;
  private readonly closingSelections = new Map<Clutter.Actor, () => void>();
  private keepsComposited = false;
  private readonly created: Partial<LazySurfaces> = {};
  private readonly outdated = new Set<keyof LazySurfaces>();

  constructor(private readonly parts: SurfaceParts) {
    this.cover.connect('button-press-event', () => {
      this.close();
      return Clutter.EVENT_STOP;
    });
    for (const surface of [parts.quick, parts.clipboard]) this.adopt(surface);
    this.watchVisibility(parts.taskView.actor);
    this.layer.connect('destroy', onLocaleChanged(() => this.dropOutdated(true)));
  }

  get active(): Surface | null {
    return this.current;
  }

  get start(): StartSurface {
    return this.ensure('start');
  }

  get notifications(): NotificationCenter {
    return this.ensure('notifications');
  }

  get emoji(): EmojiPanel {
    return this.ensure('emoji');
  }

  private get snapLayouts(): SnapLayouts {
    return this.ensure('snapLayouts');
  }

  all(): St.BoxLayout[] {
    const { start, notifications, emoji, snapLayouts } = this.created;
    const { quick, clipboard } = this.parts;
    return [start, quick, notifications, clipboard, emoji, snapLayouts].flatMap(surface => surface ? [surface.actor] : []);
  }

  monitorAt(x: number, y: number): Monitor | null {
    return this.parts.context.layoutManager.monitors.find(m => x >= m.x && x < m.x + m.width && y >= m.y && y < m.y + m.height) ?? null;
  }

  restyleStart(): void {
    if (!this.created.start) return;
    this.outdated.add('start');
    this.dropOutdated(false);
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
    this.dropOutdated(false);
  }

  place(): void {
    const { context, quick, clipboard, board } = this.parts;
    if (!context.layoutManager.primaryMonitor)
      return;

    const monitor = this.surfaceMonitor();
    this.cover.set_position(0, 0);
    const stage = global.stage;
    this.cover.set_size(stage.width, stage.height);
    const { edge } = this.parts.taskbarInset();
    const area = this.freeArea(monitor);
    const available = area.height - FAR_MARGIN;
    const { start, notifications, emoji, snapLayouts } = this.created;
    start?.place({ monitor, area, edge, available, cornered: board.shown, anchor: this.besideButton('start', monitor, edge) });

    for (const [surface, actor, width, height] of [
      ['quick', quick.actor, 420, quick.preferredHeight(420, available)],
      ...notifications ? [['notifications', notifications.actor, 380, notifications.preferredHeight(380, available)] as const] : [],
    ] as const) {
      actor.set_size(width, height);
      actor.set_position(...dock(area, edge, width, height, this.along(surface, monitor, edge, 'end'), EDGE_MARGIN));
    }
    for (const popup of [clipboard, emoji])
      popup?.place(available, context.layoutManager.getWorkAreaForMonitor(monitor.index));
    if (snapLayouts) {
      const [snapWidth, snapHeight] = snapLayouts.size();
      snapLayouts.actor.set_size(snapWidth, snapHeight);
      snapLayouts.actor.set_position(...dock(area, edge, snapWidth, snapHeight, 'center'));
    }
    this.clipToFloor();
  }

  followTasks(): SwipeTrack {
    const { taskView } = this.parts;
    const opening = this.current !== 'tasks';
    if (opening) this.toggle('tasks', this.pointerMonitor(), true);
    const direction = opening ? 1 : -1;
    return {
      update: progress => taskView.follow(opening ? banded(progress) : 1 - banded(progress)),
      release: (velocity, commit) => {
        if (commit !== opening) this.close(Duration.quick, direction * velocity);
        else taskView.settle(direction * velocity);
      },
    };
  }

  toggle(surface: Surface, monitor = this.pointerMonitor(), following = false): void {
    const { previews, board, taskView } = this.parts;
    if (!this.parts.canInteract()) return;
    previews.close();
    const popup = this.popupFor(surface);
    if (popup && !popup.available) return;
    if (popup) monitor = this.current === surface ? this.surfaceMonitor() : this.monitorAt(...popup.locate()) ?? monitor;
    if (surface === 'snap' && (!this.snapLayouts.available || board.shown)) return;
    if (this.current === surface && this.surfaceMonitor() === monitor) {
      this.close();
      return;
    }

    this.close(Duration.tap);
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
      if (following) taskView.prepare(monitor);
      else taskView.open(monitor);
      this.parts.syncSession();
      return;
    }

    const actor = this.actorFor(surface);
    this.releaseSelection(actor);
    if (surface === 'start') this.start.reset();

    raiseSurface(this.layer);
    this.layer.set_child_above_sibling(actor, null);
    const opening = !actor.visible;
    actor.show();
    if (surface === 'notifications') this.notifications.prepareOpen();
    popup?.open();
    if (surface === 'snap') this.snapLayouts.prepareOpen();
    this.place();
    if (opening) {
      actor.opacity = 0;
      actor.set(reducedMotion() ? { translation_x: 0, translation_y: 0 } : this.slideOffset(actor));
    }
    this.reveal(actor);

    if (surface === 'start' && (!taskbarPreferences.touch || this.start.focusOnTouch)) this.start.focus();
    else if (!popup) actor.grab_key_focus();
  }

  close(fade: number = Duration.quick, velocity?: number): void {
    const { menus, taskView, quick } = this.parts;
    menus.close();
    const surface = this.current;
    if (surface === 'notifications') this.notifications.freeze();
    if (surface && surface !== 'tasks') this.closingSelections.set(this.actorFor(surface), freezeSelection(this.actorFor(surface)));
    this.setActive(null);
    this.popupFor(surface)?.closed?.();
    this.cover.hide();
    const panels = this.parts.panels();
    for (const panel of panels.all)
      panel.actor.get_parent()!.set_child_below_sibling(panel.actor, global.top_window_group);
    const stage = global.stage;
    const focus = stage.get_key_focus();
    if (focus && [...this.all(), taskView.actor].some(actor => actor.contains(focus)))
      stage.set_key_focus(null);
    if (surface === 'tasks') {
      taskView.close(false, velocity);
      panels.setActive(null, null);
      this.parts.syncSession();
      return;
    }
    if (!surface)
      return;

    const actor = this.actorFor(surface);
    this.conceal(actor, fade, () => {
      if (this.current === surface) return;
      actor.remove_all_transitions();
      actor.hide();
      this.releaseSelection(actor);
      if (surface === 'quick') quick.closeSubmenu(false);
      if (!this.current) panels.setActive(null, null);
      this.dropOutdated(false);
    });
  }

  private clipToFloor(): void {
    const { width, height } = global.stage;
    const stage = { x: 0, y: 0, width, height };
    const { edge, depth } = this.parts.taskbarInset();
    const monitor = this.surfaceMonitor();
    const { x, y, width: clipWidth, height: clipHeight } = inset(stage, edge, gap(stage, inset(monitor, edge, depth), edge));
    const [clipX, clipY, currentWidth, currentHeight] = this.layer.get_clip();
    if (this.layer.has_clip && clipX === x && clipY === y && currentWidth === clipWidth && currentHeight === clipHeight) return;
    this.layer.set_clip(x, y, clipWidth, clipHeight);
  }

  private along(surface: Surface, monitor: Monitor, edge: Edge, fallback: Along): Along | number {
    return this.besideButton(surface, monitor, edge) ?? fallback;
  }

  private besideButton(surface: Surface, monitor: Monitor, edge: Edge): number | null {
    if (!isVertical(edge)) return null;
    const button = this.parts.panels().buttonFor(surface, monitor);
    if (!button?.mapped) return null;
    const [, y] = button.get_transformed_position();
    return y + button.get_transformed_size()[1] / 2;
  }

  private freeArea(monitor: Monitor): Box {
    const { edge, depth } = this.parts.taskbarInset();
    const keyboard = this.keyboardHeight(monitor);
    if (edge === 'bottom') return inset(monitor, edge, Math.max(depth, keyboard) + SURFACE_GAP);
    const beside = inset(monitor, edge, depth + SURFACE_GAP);
    return keyboard ? inset(beside, 'bottom', keyboard + SURFACE_GAP) : beside;
  }

  private ensure<Name extends keyof LazySurfaces>(name: Name): LazySurfaces[Name] {
    const created = this.created[name];
    if (created) return created;
    const surface = this.adopt((this.parts[name] as SurfaceFactories[Name])());
    this.created[name] = surface;
    return surface;
  }

  private dropOutdated(languageChanged: boolean): void {
    const names = Object.keys(this.created) as (keyof LazySurfaces)[];
    if (languageChanged) names.forEach(name => this.outdated.add(name));
    for (const name of names) {
      const { actor } = this.created[name]!;
      if (!this.outdated.has(name) || actor.visible) continue;
      this.outdated.delete(name);
      delete this.created[name];
      actor.destroy();
      if (name === 'start') this.parts.startReplaced();
    }
  }

  private adopt<T extends { actor: St.BoxLayout }>(surface: T): T {
    this.layer.add_child(surface.actor);
    this.watchVisibility(surface.actor);
    navigateWithKeyboard(surface.actor);
    return surface;
  }

  private watchVisibility(actor: Clutter.Actor): void {
    actor.connect('notify::visible', () => this.keepComposited([...this.all(), this.parts.taskView.actor].some(surface => surface.visible)));
  }

  private keepComposited(composited: boolean): void {
    if (composited === this.keepsComposited) return;
    this.keepsComposited = composited;
    const compositor = global.compositor;
    if (composited) compositor.disable_unredirect();
    else compositor.enable_unredirect();
  }

  private releaseSelection(actor: Clutter.Actor): void {
    this.closingSelections.get(actor)?.();
    this.closingSelections.delete(actor);
  }

  private setActive(surface: Surface | null): void {
    this.current = surface;
    this.parts.context.messageTray.bannerBlocked = surface === 'notifications';
  }

  private keyboardHeight(monitor: Monitor): number {
    const { keyboard, layoutManager } = this.parts.context;
    return keyboard.visible && layoutManager.keyboardIndex === monitor.index ? layoutManager.keyboardBox.height : 0;
  }

  private surfaceMonitor(): Monitor {
    const { monitors, primaryMonitor } = this.parts.context.layoutManager;
    return monitors.find(monitor => monitor === this.monitor) ?? primaryMonitor!;
  }

  private pointerMonitor(): Monitor {
    const { layoutManager } = this.parts.context;
    const index = global.display.get_current_monitor();
    const monitor = layoutManager.monitors[index];
    return monitor && this.parts.panels().panelOn(monitor) ? monitor : layoutManager.primaryMonitor!;
  }

  private popupFor(surface: Surface | null): CaretPopup | null {
    return surface === 'clipboard' ? this.parts.clipboard : surface === 'emoji' ? this.emoji : null;
  }

  private popupActor(actor: Clutter.Actor): CaretPopup | null {
    return [this.parts.clipboard, this.created.emoji].find(popup => popup?.actor === actor) ?? null;
  }

  private actorFor(surface: PanelSurface): St.BoxLayout {
    switch (surface) {
      case 'start': return this.start.actor;
      case 'quick': return this.parts.quick.actor;
      case 'notifications': return this.notifications.actor;
      case 'clipboard': return this.parts.clipboard.actor;
      case 'emoji': return this.emoji.actor;
      case 'snap': return this.snapLayouts.actor;
    }
  }

  private reveal(actor: Clutter.Actor): void {
    animateActor(actor, { [this.slideAxis(actor)]: 0, spring: Spring.snappy });
    animateActor(actor, { opacity: 255, duration: Duration.standard, curve: Curve.decelerate });
  }

  private conceal(actor: Clutter.Actor, fade: number, onHidden: () => void): void {
    const axis = this.slideAxis(actor);
    if (!reducedMotion()) animateActor(actor, { [axis]: this.slideOffset(actor)[axis], spring: Spring.snappy });
    animateActor(actor, { opacity: 0, duration: fade, curve: Curve.decelerate, onStopped: onHidden });
  }

  private slideAxis(actor: Clutter.Actor): keyof Offset {
    return this.slideOffset(actor).translation_x ? 'translation_x' : 'translation_y';
  }

  private slideOffset(actor: Clutter.Actor): Offset {
    const popup = this.popupActor(actor);
    if (popup) return { translation_x: 0, translation_y: popup.slideDistance };
    const { edge } = this.parts.taskbarInset();
    const start = this.created.start;
    return actor === start?.actor ? start.slideFrom(edge) : toward(edge, PANEL_SLIDE);
  }
}
