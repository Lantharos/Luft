import { freezeSelection } from 'resource:///org/gnome/shell/ui/kestrelGlass.js';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import Shell from 'gi://Shell';
import Meta from 'gi://Meta';
import Mtk from 'gi://Mtk';
import St from 'gi://St';

import { navigateWithKeyboard } from './shared/keyboardNavigation.js';
import { Workspaces } from './windows/workspaces.js';
import { WindowPreviews } from './panel/windowPreviews.js';
import { ContextMenus } from './menus/contextMenus.js';
import type { Monitor } from './panel/panel.js';
import { PanelSet } from './panel/panels.js';
import { StartMenu } from './start/startMenu.js';
import { QuickSettings } from './quickSettings/quickSettings.js';
import { NotificationCenter, type MessageTray } from './notifications/notificationCenter.js';
import { PANEL_HEIGHT, SURFACE_GAP } from './shared/surface.js';
import { animateActor } from './shared/motion.js';
import { loadKestrelStylesheet } from './shared/stylesheet.js';
import type { QuickSettingsSource } from './quickSettings/quickControls.js';
import { AppearanceService } from './appearance/service.js';
import { ClipboardPanel } from './clipboard/panel.js';
import type { Box } from './clipboard/placement.js';
import { SnapLayouts } from './windows/snapLayouts.js';
import { TaskView } from './taskView/taskView.js';
import { OomNotifier } from './memory/oomNotifier.js';
import { BatteryWarnings } from './power/batteryWarnings.js';
import { coveredMonitors } from './panel/coverage.js';
import { LaunchFeedback } from './windows/launchFeedback.js';
import { GlobalShortcutsProvider } from './shortcuts/provider.js';
import { PortalBackend } from './portal/backend.js';
import { LiveWallpaper } from './wallpaper/liveWallpaper.js';
import { LoginWallpaper } from './wallpaper/loginWallpaper.js';
import type { Rgb } from './appearance/color.js';
import { Greeter, type GreeterContext } from './greeter/greeter.js';

export { appIcon, appIcons, sourceApp, windowIcon } from './appearance/icons/appIcons.js';

type Surface = 'start' | 'quick' | 'notifications' | 'clipboard' | 'snap' | 'tasks';
type PanelSurface = Exclude<Surface, 'tasks'>;

const START_HEIGHT = 600;
const CLIPBOARD_WIDTH = 420;
const CLIPBOARD_MAXIMUM_HEIGHT = 480;
const OPEN_DURATION = 220;
const CLOSE_DURATION = 160;

interface LayoutManager {
  primaryMonitor: Monitor | null;
  monitors: Monitor[];
  panelBox: St.Widget;
  addChrome(actor: Clutter.Actor, params?: Record<string, boolean>): void;
  addTopChrome(actor: Clutter.Actor, params?: Record<string, boolean>): void;
  removeChrome(actor: Clutter.Actor): void;
  getWorkAreaForMonitor(index: number): Mtk.Rectangle;
  connect(signal: string, callback: () => void): number;
  disconnect(id: number): void;
}

interface Context {
  layoutManager: LayoutManager;
  messageTray: MessageTray;
  quickSettings: QuickSettingsSource;
  sessionMode: { isLocked: boolean; hasWindows: boolean; connect(signal: string, callback: () => void): number; disconnect(id: number): void };
  screenShield: { active: boolean; connect(signal: string, callback: () => void): number; disconnect(id: number): void } | null;
  canInteract(): boolean;
  snapWindow(window: Meta.Window, rect: Mtk.Rectangle): void;
  activateWindow(window: Meta.Window): void;
  openScreenshot(): void;
  stopScreencast(): void;
  createBackground(container: Clutter.Actor, monitorIndex: number): { destroy(): void };
  registerPanel(actor: St.Widget): void;
  caret(): Box | null;
}

class KestrelUi {
  private readonly menus: ContextMenus;
  private readonly workspaces: Workspaces;
  private readonly previews: WindowPreviews;
  private readonly panels: PanelSet;
  private monitor: Monitor | null = null;
  private readonly start: StartMenu;
  private readonly quick: QuickSettings;
  private readonly notifications: NotificationCenter;
  private readonly clipboard: ClipboardPanel;
  private readonly snapLayouts: SnapLayouts;
  private readonly taskView: TaskView;
  private readonly cover = new St.Widget({ reactive: true, visible: false });
  private readonly stylesheetMonitor: Gio.FileMonitor | null;
  private active: Surface | null = null;
  private readonly closingSelections = new Map<Clutter.Actor, () => void>();
  private focusWindow: Meta.Window | null = null;
  private focusSignals: number[] = [];
  private readonly disconnectors: (() => void)[] = [];
  private readonly portal = new PortalBackend();
  readonly appearance = new AppearanceService(color => this.portal.setAccent(color));
  private readonly oomNotifier = new OomNotifier();
  private readonly batteryWarnings = new BatteryWarnings();
  private readonly launchFeedback = new LaunchFeedback();
  private readonly globalShortcuts = new GlobalShortcutsProvider();
  private readonly liveWallpaper: LiveWallpaper;
  private readonly loginWallpaper = new LoginWallpaper();

  constructor(private readonly context: Context) {
    const shellGlobal = global as unknown as Shell.Global;
    this.stylesheetMonitor = loadKestrelStylesheet();

    this.workspaces = new Workspaces(() => this.canInteract(), () => this.dismissImmediately());
    this.menus = new ContextMenus((x, y) => this.monitorAt(x, y), () => this.close(), () => this.canInteract(), () => this.previews.close(), context.activateWindow);
    this.previews = new WindowPreviews(actor => this.monitorAt(...actor.get_transformed_position()), () => this.canInteract() && !this.menus.actor.visible, () => this.close(), context.activateWindow);
    context.layoutManager.addTopChrome(this.previews.actor);
    this.start = new StartMenu(() => this.close(), this.menus);
    this.quick = new QuickSettings(context.quickSettings, () => this.place(), () => this.close(),
      icons => this.panels.primary.updateStatus(icons), this.menus, () => this.takeScreenshot());
    this.notifications = new NotificationCenter(context.messageTray, this.menus, () => this.place(), () => this.close());
    this.clipboard = new ClipboardPanel(this.menus, () => this.close(), () => this.place(), context.caret);
    this.snapLayouts = new SnapLayouts(index => context.layoutManager.getWorkAreaForMonitor(index), context.snapWindow, () => this.close());
    this.taskView = new TaskView(context.createBackground, () => this.close(), context.activateWindow);
    this.liveWallpaper = new LiveWallpaper(() => context.layoutManager.monitors);

    context.layoutManager.addTopChrome(this.menus.shield);
    context.layoutManager.addTopChrome(this.menus.actor);

    const panelParent = context.layoutManager.panelBox.get_parent()!;
    context.layoutManager.removeChrome(context.layoutManager.panelBox);
    panelParent.insert_child_at_index(context.layoutManager.panelBox, 0);
    context.layoutManager.panelBox.hide();
    this.panels = new PanelSet(context.layoutManager, monitor => ({
      start: () => this.toggle('start', monitor()),
      quickSettings: () => this.toggle('quick', monitor()),
      notifications: () => this.toggle('notifications', monitor()),
      activateWindow: context.activateWindow,
      stopScreencast: context.stopScreencast,
    }), this.menus, this.previews);

    context.layoutManager.addTopChrome(this.cover);
    context.layoutManager.addTopChrome(this.start.actor);
    context.layoutManager.addTopChrome(this.quick.actor);
    context.layoutManager.addTopChrome(this.notifications.actor);
    context.layoutManager.addTopChrome(this.clipboard.actor);
    context.layoutManager.addTopChrome(this.snapLayouts.actor);
    context.layoutManager.addTopChrome(this.taskView.actor);
    for (const actor of this.surfaces()) {
      const updateClip = () => actor.set_clip(0, 0, actor.width,
        Math.max(0, this.panels.forMonitor(this.surfaceMonitor()).actor.y - actor.y - actor.translation_y));
      for (const signal of ['notify::translation-y', 'notify::width', 'notify::height', 'notify::y'] as const)
        actor.connect(signal, updateClip);
    }

    this.cover.connect('button-press-event', () => {
      this.close();
      return Clutter.EVENT_STOP;
    });
    this.watch(shellGlobal.stage, 'key-press-event', (_stage, event) => {
      if (this.active && event.get_key_symbol() === Clutter.KEY_Escape) {
        if (this.active !== 'quick' || !this.quick.closeSubmenu()) this.close();
        return Clutter.EVENT_STOP;
      }
      return Clutter.EVENT_PROPAGATE;
    });
    this.watch(shellGlobal.stage, 'captured-event', (_stage, event) => {
      if (event.type() === Clutter.EventType.SCROLL) {
        const [x, y] = event.get_coords();
        const target = shellGlobal.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y);
        if ((event.get_state() & (Clutter.ModifierType.SUPER_MASK | Clutter.ModifierType.MOD4_MASK)) || (this.panels.contains(target) && !this.panels.primary.handlesScroll(target)))
          return this.workspaces.scroll(event) ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE;
      }
      if (!this.canInteract() || event.type() !== Clutter.EventType.BUTTON_PRESS)
        return Clutter.EVENT_PROPAGATE;
      const [x, y] = event.get_coords();
      const target = shellGlobal.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y);
      if (!this.previews.contains(target)) this.previews.close();
      if (event.get_button() !== Clutter.BUTTON_SECONDARY || !(target instanceof Meta.BackgroundActor)) return Clutter.EVENT_PROPAGATE;
      this.menus.open(target, [
        { label: 'Change wallpaper', run: () => this.menus.settings('appearance') },
        { label: 'Display settings', run: () => this.menus.settings('display') },
        { label: 'Settings', run: () => this.menus.settings() },
      ], x, y);
      return Clutter.EVENT_STOP;
    });
    this.watch(shellGlobal.display, 'overlay-key', () => this.toggle('start'));
    this.watch(shellGlobal.display, 'in-fullscreen-changed', () => this.syncSession());
    this.watch(shellGlobal.display, 'notify::focus-window', () => this.trackFocusedWindow());
    this.watch(shellGlobal.display, 'restacked', () => this.syncSession());
    this.watch(context.sessionMode, 'updated', () => this.syncSession());
    if (context.screenShield) this.watch(context.screenShield, 'active-changed', () => this.syncSession());
    context.registerPanel(this.panels.primary.actor);
    for (const actor of [...this.surfaces(), this.previews.actor, this.taskView.actor])
      navigateWithKeyboard(actor);
    this.watch(context.layoutManager, 'monitors-changed', () => {
      this.dismissImmediately();
      this.panels.sync();
      this.liveWallpaper.monitorsChanged();
      this.place();
      this.syncSession();
    });
    this.place();
    this.syncSession();
  }

  private watch(object: { connect(signal: string, callback: (...args: any[]) => any): number; disconnect(id: number): void }, signal: string, callback: (...args: any[]) => any): void {
    const id = object.connect(signal, callback);
    this.disconnectors.push(() => object.disconnect(id));
  }

  private desktopAvailable(): boolean {
    return this.context.sessionMode.hasWindows && !this.context.sessionMode.isLocked && !this.context.screenShield?.active;
  }

  private canInteract(): boolean {
    return this.desktopAvailable() && this.context.canInteract();
  }

  private trackFocusedWindow(): void {
    for (const id of this.focusSignals) this.focusWindow!.disconnect(id);
    this.focusWindow = (global as unknown as Shell.Global).display.focus_window;
    this.focusSignals = this.focusWindow ? (['size-changed', 'position-changed', 'notify::fullscreen'] as const).map(signal =>
      this.focusWindow!.connect(signal, () => this.syncSession())) : [];
    this.syncSession();
  }

  private syncSession(): void {
    const available = this.desktopAvailable();
    const covered = coveredMonitors(this.context.layoutManager.monitors);
    for (const panel of this.panels.all)
      panel.actor.visible = !!panel.monitor && available && !this.taskView.visible && !covered.has(panel.monitor.index);
    this.liveWallpaper.sync(available && !this.taskView.visible);
    if (!available) this.dismissImmediately();
  }

  private takeScreenshot(): void {
    this.dismissImmediately();
    const stage = (global as unknown as Shell.Global).stage;
    const painted = stage.connect('after-paint', () => {
      stage.disconnect(painted);
      this.context.openScreenshot();
    });
  }

  dismissImmediately(): void {
    this.close();
    this.menus.close(true);
    this.previews.close(true);
    this.panels.setActive(null, null);
    this.quick.closeSubmenu(false);
    this.taskView.close(true);
    for (const actor of this.surfaces()) {
      actor.remove_all_transitions();
      actor.hide();
      this.closingSelections.get(actor)?.();
      this.closingSelections.delete(actor);
    }
  }

  private monitorAt(x: number, y: number): Monitor | null {
    return this.context.layoutManager.monitors.find(m => x >= m.x && x < m.x + m.width && y >= m.y && y < m.y + m.height) ?? null;
  }

  private surfaceMonitor(): Monitor {
    const { monitors, primaryMonitor } = this.context.layoutManager;
    return monitors.find(monitor => monitor === this.monitor) ?? primaryMonitor!;
  }

  private place(): void {
    if (!this.context.layoutManager.primaryMonitor)
      return;

    const monitor = this.surfaceMonitor();
    this.cover.set_position(0, 0);
    const stage = (global as unknown as Shell.Global).stage;
    this.cover.set_size(stage.width, stage.height);
    const startWidth = Math.min(660, monitor.width - 24);
    const bottom = monitor.y + monitor.height - PANEL_HEIGHT - SURFACE_GAP;
    const available = monitor.height - PANEL_HEIGHT - 24;
    const startHeight = Math.min(START_HEIGHT, available);
    this.start.actor.set_size(startWidth, startHeight);
    this.start.actor.set_position(Math.round(monitor.x + (monitor.width - startWidth) / 2), bottom - startHeight);

    for (const [actor, width, height] of [
      [this.quick.actor, 420, this.quick.preferredHeight(420, available)],
      [this.notifications.actor, 380, this.notifications.preferredHeight(380, available)],
    ] as const) {
      actor.set_size(width, height);
      actor.set_position(Math.round(monitor.x + monitor.width - 12 - width), bottom - height);
    }
    this.clipboard.place(CLIPBOARD_WIDTH, Math.min(CLIPBOARD_MAXIMUM_HEIGHT, available), this.context.layoutManager.getWorkAreaForMonitor(monitor.index));
    const [snapWidth, snapHeight] = this.snapLayouts.size();
    this.snapLayouts.actor.set_size(snapWidth, snapHeight);
    this.snapLayouts.actor.set_position(Math.round(monitor.x + (monitor.width - snapWidth) / 2), bottom - snapHeight);
  }

  private pointerMonitor(): Monitor {
    const index = (global as unknown as Shell.Global).display.get_current_monitor();
    return this.context.layoutManager.monitors[index] ?? this.context.layoutManager.primaryMonitor!;
  }

  private toggle(surface: Surface, monitor = this.pointerMonitor()): void {
    if (!this.canInteract()) return;
    this.previews.close();
    if (surface === 'clipboard' && this.clipboard.empty) return;
    if (surface === 'clipboard') monitor = this.active === surface ? this.surfaceMonitor() : this.monitorAt(...this.clipboard.locate()) ?? monitor;
    if (surface === 'snap' && !this.snapLayouts.available) return;
    if (this.active === surface && this.surfaceMonitor() === monitor) {
      this.close();
      return;
    }

    this.close();
    if (this.monitor !== monitor) {
      for (const actor of this.surfaces()) {
        actor.remove_all_transitions();
        actor.hide();
      }
    }
    this.monitor = monitor;
    this.setActive(surface);
    this.panels.setActive(surface, monitor);
    this.cover.show();
    for (const panel of this.panels.all) panel.actor.get_parent()!.set_child_above_sibling(panel.actor, this.cover);
    if (surface === 'tasks') {
      this.taskView.open(monitor);
      this.syncSession();
      return;
    }

    const openingActor = this.actorFor(surface);
    this.closingSelections.get(openingActor)?.();
    this.closingSelections.delete(openingActor);
    if (surface === 'start') this.start.reset();

    const actor = this.actorFor(surface);
    actor.get_parent()!.set_child_above_sibling(actor, null);
    const opening = !actor.visible;
    actor.show();
    if (surface === 'notifications') this.notifications.prepareOpen();
    if (surface === 'clipboard') this.clipboard.prepareOpen();
    if (surface === 'snap') this.snapLayouts.prepareOpen();
    this.place();
    if (opening) {
      actor.opacity = actor === this.clipboard.actor ? 0 : 255;
      actor.translation_y = this.slideDistance(actor);
    }
    this.animate(actor, 0, OPEN_DURATION);

    if (surface === 'start') this.start.focus();
    else actor.grab_key_focus();
  }

  private close(): void {
    this.menus.close();
    const surface = this.active;
    if (surface === 'notifications') this.notifications.freeze();
    if (surface && surface !== 'tasks') this.closingSelections.set(this.actorFor(surface), freezeSelection(this.actorFor(surface)));
    this.setActive(null);
    this.cover.hide();
    for (const panel of this.panels.all)
      panel.actor.get_parent()!.set_child_below_sibling(panel.actor, (global as unknown as Shell.Global).top_window_group);
    const stage = (global as unknown as Shell.Global).stage;
    const focus = stage.get_key_focus();
    if (focus && [...this.surfaces(), this.taskView.actor].some(actor => actor.contains(focus)))
      stage.set_key_focus(null);
    if (surface === 'tasks') {
      this.taskView.close();
      this.panels.setActive(null, null);
      this.syncSession();
      return;
    }
    if (!surface)
      return;

    const actor = this.actorFor(surface);
    this.animate(actor, this.slideDistance(actor), CLOSE_DURATION, () => {
      if (this.active === surface) return;
      actor.hide();
      this.closingSelections.get(actor)?.();
      this.closingSelections.delete(actor);
      if (surface === 'quick') this.quick.closeSubmenu(false);
      if (!this.active) this.panels.setActive(null, null);
    });
  }

  private setActive(surface: Surface | null): void {
    const wasStart = this.active === 'start';
    this.active = surface;
    this.context.messageTray.bannerBlocked = surface === 'notifications';
    if (wasStart !== (surface === 'start'))
      for (const watcher of startWatchers) watcher(surface === 'start');
  }

  openStart(query: string): void {
    if (this.active !== 'start') this.toggle('start');
    if (query && this.active === 'start') this.start.search.set_text(query);
  }

  startOpen(): boolean { return this.active === 'start'; }

  taskViewOpen(): boolean { return this.taskView.visible; }

  private surfaces(): St.BoxLayout[] {
    return [this.start.actor, this.quick.actor, this.notifications.actor, this.clipboard.actor, this.snapLayouts.actor];
  }

  private actorFor(surface: PanelSurface): St.BoxLayout {
    switch (surface) {
      case 'start': return this.start.actor;
      case 'quick': return this.quick.actor;
      case 'notifications': return this.notifications.actor;
      case 'clipboard': return this.clipboard.actor;
      case 'snap': return this.snapLayouts.actor;
    }
  }

  private animate(
    actor: Clutter.Actor,
    translationY: number,
    duration: number,
    onStopped?: () => void,
  ): void {
    animateActor(actor, {
      translation_y: translationY,
      ...actor === this.clipboard.actor ? { opacity: translationY === 0 ? 255 : 0 } : {},
      duration,
      mode: translationY === 0
        ? Clutter.AnimationMode.EASE_OUT_QUART
        : Clutter.AnimationMode.EASE_IN_QUART,
      onStopped,
    });
  }

  private slideDistance(actor: Clutter.Actor): number {
    if (actor === this.clipboard.actor) return this.clipboard.slideDistance;
    const monitor = this.surfaceMonitor();
    return monitor.y + monitor.height - actor.y;
  }

  shutdown(): void {
    for (const id of this.focusSignals) this.focusWindow!.disconnect(id);
    for (const disconnect of this.disconnectors) disconnect();
    this.panels.shutdown();
    this.appearance.destroy();
    this.liveWallpaper.destroy();
    this.loginWallpaper.destroy();
    this.oomNotifier.destroy();
    this.batteryWarnings.destroy();
    this.launchFeedback.destroy();
    this.globalShortcuts.destroy();
    this.portal.destroy();
    this.stylesheetMonitor?.cancel();
  }

  switchWorkspace(index: number): void { this.workspaces.switchTo(index); }

  toggleSurface(surface: Surface): void {
    this.toggle(surface);
  }
}

let currentUi: KestrelUi;
let greeter: Greeter | null = null;
const startWatchers: ((visible: boolean) => void)[] = [];

let pendingWallpaper: Rgb[] | null = null;

export function initialize(context: Context): void {
  currentUi = new KestrelUi(context);
  if (pendingWallpaper) currentUi.appearance.apply(pendingWallpaper);
  pendingWallpaper = null;
}

export function startGreeter(context: GreeterContext): void {
  greeter = new Greeter(context);
}

export function wallpaperSampled(samples: Rgb[]): void {
  if (currentUi) currentUi.appearance.apply(samples);
  else if (greeter) greeter.wallpaperSampled(samples);
  else pendingWallpaper = samples;
}

export function toggleSurface(surface: Surface): void {
  currentUi.toggleSurface(surface);
}

export function shutdown(): void {
  currentUi.shutdown();
}

export function dismissImmediately(): void {
  currentUi?.dismissImmediately();
}

export function switchWorkspace(index: number): void { currentUi?.switchWorkspace(index); }

export function openStart(query = ''): void { currentUi?.openStart(query); }

export function startOpen(): boolean { return currentUi?.startOpen() ?? false; }

export function taskViewOpen(): boolean { return currentUi?.taskViewOpen() ?? false; }

export function watchStart(watcher: (visible: boolean) => void): void { startWatchers.push(watcher); }
