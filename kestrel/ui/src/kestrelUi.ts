import { freezeSelection } from 'resource:///org/gnome/shell/ui/kestrelGlass.js';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import Meta from 'gi://Meta';
import St from 'gi://St';

import { navigateWithKeyboard } from './keyboardNavigation.js';
import { Workspaces } from './workspaces.js';
import { WindowPreviews } from './windowPreviews.js';
import { ContextMenus } from './contextMenus.js';
import { KestrelPanel, type Monitor } from './panel.js';
import { StartMenu } from './startMenu.js';
import { QuickSettings } from './quickSettings.js';
import { NotificationCenter, type MessageTray } from './notificationCenter.js';
import { PANEL_HEIGHT, SURFACE_GAP } from './surface.js';
import { animateActor } from './motion.js';
import type { QuickSettingsSource } from './quickControls.js';
import { AccentService } from './accent/service.js';
import type { Rgb } from './accent/color.js';

type Surface = 'start' | 'quick' | 'notifications';

const START_HEIGHT = 600;
const OPEN_DURATION = 220;
const CLOSE_DURATION = 160;

interface LayoutManager {
  primaryMonitor: Monitor | null;
  monitors: Monitor[];
  panelBox: St.Widget;
  addChrome(actor: Clutter.Actor, params?: Record<string, boolean>): void;
  addTopChrome(actor: Clutter.Actor, params?: Record<string, boolean>): void;
  removeChrome(actor: Clutter.Actor): void;
  connect(signal: string, callback: () => void): number;
  disconnect(id: number): void;
}

interface Context {
  layoutManager: LayoutManager;
  messageTray: MessageTray;
  quickSettings: QuickSettingsSource;
  sessionMode: { isLocked: boolean; isGreeter: boolean; hasWindows: boolean; connect(signal: string, callback: () => void): number; disconnect(id: number): void };
  screenShield: { active: boolean; connect(signal: string, callback: () => void): number; disconnect(id: number): void } | null;
  canInteract(): boolean;
  registerPanel(actor: St.Widget): void;
}

class KestrelUi {
  private readonly menus: ContextMenus;
  private readonly workspaces: Workspaces;
  private readonly previews: WindowPreviews;
  private readonly panel: KestrelPanel;
  private readonly start: StartMenu;
  private readonly quick: QuickSettings;
  private readonly notifications: NotificationCenter;
  private readonly cover = new St.Widget({ reactive: true, visible: false });
  private stylesheetMonitor: Gio.FileMonitor | null = null;
  private active: Surface | null = null;
  private readonly closingSelections = new Map<Clutter.Actor, () => void>();
  private focusWindow: Meta.Window | null = null;
  private focusSignals: number[] = [];
  private readonly disconnectors: (() => void)[] = [];
  readonly accent = new AccentService();

  constructor(private readonly context: Context) {
    const shellGlobal = global as unknown as Shell.Global;
    const theme = St.ThemeContext.get_for_stage(shellGlobal.stage).get_theme();
    const cssPath = GLib.getenv('KESTREL_CSS_PATH');
    const stylesheet = cssPath
      ? Gio.File.new_for_path(cssPath)
      : Gio.File.new_for_uri('resource:///org/gnome/shell/theme/kestrel.css');
    theme.load_stylesheet(stylesheet);
    if (cssPath) {
      this.stylesheetMonitor = stylesheet.monitor_file(Gio.FileMonitorFlags.NONE, null);
      this.stylesheetMonitor.connect('changed', (_monitor, _file, _otherFile, event) => {
        if (event !== Gio.FileMonitorEvent.CHANGES_DONE_HINT)
          return;
        theme.unload_stylesheet(stylesheet);
        theme.load_stylesheet(stylesheet);
      });
    }

    this.workspaces = new Workspaces(() => this.canInteract(), () => this.dismissImmediately());
    this.menus = new ContextMenus((x, y) => context.layoutManager.monitors.find(m => x >= m.x && x < m.x + m.width && y >= m.y && y < m.y + m.height) ?? null, () => this.close(), () => this.canInteract(), () => this.previews.close());
    this.previews = new WindowPreviews(() => context.layoutManager.primaryMonitor, () => this.canInteract() && !this.menus.actor.visible, () => this.close());
    context.layoutManager.addTopChrome(this.previews.actor);
    this.panel = new KestrelPanel({
      start: () => this.toggle('start'),
      quickSettings: () => this.toggle('quick'),
      notifications: () => this.toggle('notifications'),
    }, this.menus, this.previews);
    this.start = new StartMenu(() => this.close(), this.menus);
    this.quick = new QuickSettings(context.quickSettings, () => this.place(), () => this.close(),
      icons => this.panel.updateStatus(icons), this.menus);
    this.notifications = new NotificationCenter(context.messageTray, this.menus, () => this.place(), () => this.close());

    context.layoutManager.addTopChrome(this.menus.shield);
    context.layoutManager.addTopChrome(this.menus.actor);

    const panelParent = context.layoutManager.panelBox.get_parent()!;
    context.layoutManager.removeChrome(context.layoutManager.panelBox);
    panelParent.insert_child_at_index(context.layoutManager.panelBox, 0);
    context.layoutManager.panelBox.hide();
    context.layoutManager.addChrome(this.panel.actor, {
      affectsStruts: true,
      trackFullscreen: false,
    });

    context.layoutManager.addTopChrome(this.cover);
    context.layoutManager.addTopChrome(this.start.actor);
    context.layoutManager.addTopChrome(this.quick.actor);
    context.layoutManager.addTopChrome(this.notifications.actor);
    for (const actor of this.surfaces()) {
      const updateClip = () => actor.set_clip(0, 0, actor.width,
        Math.max(0, this.panel.actor.y - actor.y - actor.translation_y));
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
        if ((event.get_state() & (Clutter.ModifierType.SUPER_MASK | Clutter.ModifierType.MOD4_MASK)) || (target && this.panel.actor.contains(target)))
          return this.workspaces.scroll(event) ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE;
      }
      if (!this.canInteract() || event.type() !== Clutter.EventType.BUTTON_PRESS)
        return Clutter.EVENT_PROPAGATE;
      const [x, y] = event.get_coords();
      const target = shellGlobal.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y);
      if (!this.previews.contains(target)) this.previews.close();
      if (event.get_button() !== Clutter.BUTTON_SECONDARY || !(target instanceof Meta.BackgroundActor)) return Clutter.EVENT_PROPAGATE;
      this.menus.open(target, [
        { label: 'Change wallpaper', run: () => this.menus.settings('background') },
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
    context.registerPanel(this.panel.actor);
    for (const actor of [this.panel.actor, ...this.surfaces(), this.previews.actor])
      navigateWithKeyboard(actor);
    this.watch(context.layoutManager, 'monitors-changed', () => { this.dismissImmediately(); this.place(); this.syncSession(); });
    this.place();
    this.syncSession();
  }

  private watch(object: { connect(signal: string, callback: (...args: any[]) => any): number; disconnect(id: number): void }, signal: string, callback: (...args: any[]) => any): void {
    const id = object.connect(signal, callback);
    this.disconnectors.push(() => object.disconnect(id));
  }

  private desktopAvailable(): boolean {
    return this.context.sessionMode.hasWindows && !this.context.sessionMode.isLocked &&
      !this.context.sessionMode.isGreeter && !this.context.screenShield?.active;
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
    const display = (global as unknown as Shell.Global).display;
    const monitor = this.context.layoutManager.primaryMonitor;
    const window = display.focus_window;
    const frame = window?.get_frame_rect();
    const coversMonitor = monitor && frame && !window?.minimized && frame.x <= monitor.x && frame.y <= monitor.y &&
      frame.x + frame.width >= monitor.x + monitor.width && frame.y + frame.height >= monitor.y + monitor.height;
    this.panel.actor.visible = available && !!monitor && !coversMonitor && !display.get_monitor_in_fullscreen(display.get_primary_monitor());
    if (!available) this.dismissImmediately();
  }

  dismissImmediately(): void {
    this.close();
    this.menus.close(true);
    this.previews.close(true);
    this.panel.setActive(null);
    this.quick.closeSubmenu();
    for (const actor of this.surfaces()) {
      actor.remove_all_transitions();
      actor.hide();
      this.closingSelections.get(actor)?.();
      this.closingSelections.delete(actor);
    }
  }

  private place(): void {
    const monitor = this.context.layoutManager.primaryMonitor;
    if (!monitor)
      return;

    this.panel.place(monitor);
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
      [this.notifications.actor, 380, this.notifications.preferredHeight(380, Math.min(640, available))],
    ] as const) {
      actor.set_size(width, height);
      actor.set_position(Math.round(monitor.x + monitor.width - 12 - width), bottom - height);
    }
  }

  private toggle(surface: Surface): void {
    if (!this.canInteract()) return;
    this.previews.close();
    if (this.active === surface) {
      this.close();
      return;
    }

    this.close();
    this.setActive(surface);
    this.panel.setActive(surface);
    this.cover.show();
    this.panel.actor.get_parent()!.set_child_above_sibling(this.panel.actor, this.cover);

    const openingActor = this.actorFor(surface);
    this.closingSelections.get(openingActor)?.();
    this.closingSelections.delete(openingActor);
    if (surface === 'start') this.start.reset();

    const actor = this.actorFor(surface);
    actor.get_parent()!.set_child_above_sibling(actor, null);
    const opening = !actor.visible;
    actor.show();
    if (surface === 'notifications') this.notifications.prepareOpen();
    this.place();
    if (opening) {
      actor.opacity = 255;
      actor.translation_y = this.slideDistance(actor);
    }
    this.animate(actor, 0, OPEN_DURATION);

    if (surface === 'start') this.start.focus();
    else if (surface === 'notifications') this.notifications.focus();
    else actor.navigate_focus(null, St.DirectionType.TAB_FORWARD, false);
  }

  private close(): void {
    this.menus.close();
    const surface = this.active;
    if (surface === 'notifications') this.notifications.freeze();
    if (surface) this.closingSelections.set(this.actorFor(surface), freezeSelection(this.actorFor(surface)));
    this.setActive(null);
    this.cover.hide();
    this.panel.actor.get_parent()!.set_child_below_sibling(this.panel.actor, (global as unknown as Shell.Global).top_window_group);
    const stage = (global as unknown as Shell.Global).stage;
    const focus = stage.get_key_focus();
    if (focus && this.surfaces().some(actor => actor.contains(focus)))
      stage.set_key_focus(null);
    if (!surface)
      return;

    const actor = this.actorFor(surface);
    this.animate(actor, this.slideDistance(actor), CLOSE_DURATION, () => {
      if (this.active === surface) return;
      actor.hide();
      this.closingSelections.get(actor)?.();
      this.closingSelections.delete(actor);
      if (surface === 'quick') this.quick.closeSubmenu();
      if (!this.active) this.panel.setActive(null);
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

  private surfaces(): St.BoxLayout[] {
    return [this.start.actor, this.quick.actor, this.notifications.actor];
  }

  private actorFor(surface: Surface): St.BoxLayout {
    switch (surface) {
      case 'start': return this.start.actor;
      case 'quick': return this.quick.actor;
      case 'notifications': return this.notifications.actor;
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
      duration,
      mode: translationY === 0
        ? Clutter.AnimationMode.EASE_OUT_QUART
        : Clutter.AnimationMode.EASE_IN_QUART,
      onStopped,
    });
  }

  private slideDistance(actor: Clutter.Actor): number {
    const monitor = this.context.layoutManager.primaryMonitor!;
    return monitor.y + monitor.height - actor.y;
  }

  shutdown(): void {
    for (const id of this.focusSignals) this.focusWindow!.disconnect(id);
    for (const disconnect of this.disconnectors) disconnect();
    this.panel.shutdown();
    this.accent.destroy();
    this.stylesheetMonitor?.cancel();
  }

  switchWorkspace(index: number): void { this.workspaces.switchTo(index); }

  toggleSurface(surface: Surface): void {
    this.toggle(surface);
  }
}

let currentUi: KestrelUi;
const startWatchers: ((visible: boolean) => void)[] = [];

let pendingWallpaper: Rgb[] | null = null;

export function initialize(context: Context): void {
  currentUi = new KestrelUi(context);
  if (pendingWallpaper) currentUi.accent.apply(pendingWallpaper);
  pendingWallpaper = null;
}

export function wallpaperSampled(samples: Rgb[]): void {
  if (currentUi) currentUi.accent.apply(samples);
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

export function watchStart(watcher: (visible: boolean) => void): void { startWatchers.push(watcher); }
