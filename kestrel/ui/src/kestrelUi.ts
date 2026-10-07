import { freezeSelection } from 'resource:///com/lantharos/kestrel/ui/kestrelGlass.js';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import Shell from 'gi://Shell';
import Meta from 'gi://Meta';
import St from 'gi://St';

import { navigateWithKeyboard } from './shared/keyboardNavigation.js';
import { Workspaces } from './windows/workspaces.js';
import { WindowPreviews } from './panel/windowPreviews.js';
import { ContextMenus } from './menus/contextMenus.js';
import type { Monitor } from './panel/panel.js';
import { PanelSet } from './panel/panels.js';
import { StartMenu } from './start/startMenu.js';
import { QuickSettings } from './quickSettings/quickSettings.js';
import { NotificationCenter } from './notifications/notificationCenter.js';
import { SURFACE_GAP } from './shared/surface.js';
import { taskbarPreferences } from './panel/preferences/taskbarPreferences.js';
import { animateActor } from './shared/motion.js';
import { loadKestrelStylesheets } from './shared/stylesheet.js';
import { AppearanceService } from './appearance/service.js';
import { SystemPrompts } from './keyring/prompts.js';
import { ClipboardPanel } from './clipboard/panel.js';
import { EmojiPanel } from './emoji/panel.js';
import type { CaretPopup, Context } from './context.js';
import { SnapLayouts } from './windows/snapLayouts.js';
import { TaskView } from './taskView/taskView.js';
import { OomNotifier } from './memory/oomNotifier.js';
import { Health } from './health/health.js';
import { notifyAboutIncidents } from './health/incidents.js';
import { confirmStartup, notifyAboutFailedStartup } from './health/startup.js';
import { BatteryWarnings } from './power/batteryWarnings.js';
import { PlugSounds } from './power/plugSounds.js';
import { MediaKeys } from './mediaKeys/mediaKeys.js';
import { coveredMonitors } from './panel/coverage.js';
import { systemMonitor } from './panel/systemMonitor.js';
import { LaunchFeedback } from './windows/launchFeedback.js';
import { VariableRefresh } from './windows/variableRefresh.js';
import { PortalBackend } from './portal/backend.js';
import { PasskeyPrompts } from './passkeys/service.js';
import { LiveWallpaper } from './wallpaper/liveWallpaper.js';
import { LoginWallpaper } from './wallpaper/loginWallpaper.js';
import { LoginDisplays } from './session/loginScreen/displays.js';
import { LockControls } from './lockScreen/controls.js';
import { LoginNumLock } from './session/loginScreen/numLock.js';
import { Farewell } from './session/farewell.js';
import { FontRefresh } from './appearance/fonts.js';
import type { Rgb } from './appearance/color.js';
import { Greeter, type GreeterContext } from './greeter/greeter.js';
import { Board, type BoardFrame } from './board/board.js';

export { appIcon, appIcons, sourceApp, windowIcon } from './appearance/icons/appIcons.js';
export { signInToNetwork } from './network/signIn.js';
export { isGame } from './windows/games.js';
export { VpnSecrets } from './network/vpnSecrets.js';

type Surface = 'start' | 'quick' | 'notifications' | 'clipboard' | 'emoji' | 'snap' | 'tasks';
type PanelSurface = Exclude<Surface, 'tasks'>;

const START_HEIGHT = 600;
const OPEN_DURATION = 220;
const CLOSE_DURATION = 160;

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
  private readonly emoji: EmojiPanel;
  private readonly snapLayouts: SnapLayouts;
  private readonly taskView: TaskView;
  readonly board: Board;
  private readonly cover = new St.Widget({ reactive: true, visible: false });
  private readonly stylesheetMonitors: Gio.FileMonitor[];
  private active: Surface | null = null;
  private readonly closingSelections = new Map<Clutter.Actor, () => void>();
  private focusWindow: Meta.Window | null = null;
  private focusSignals: number[] = [];
  private readonly disconnectors: (() => void)[] = [];
  private readonly portal: PortalBackend;
  private readonly passkeys: PasskeyPrompts;
  readonly appearance: AppearanceService;
  private readonly keyring: SystemPrompts;
  private readonly oomNotifier = new OomNotifier();
  private readonly health = new Health();
  private readonly batteryWarnings = new BatteryWarnings();
  private readonly plugSounds = new PlugSounds();
  private readonly launchFeedback = new LaunchFeedback();
  private readonly variableRefresh = new VariableRefresh();
  private readonly liveWallpaper: LiveWallpaper;
  private readonly ownsTheScreen = !(global as unknown as Shell.Global).backend.is_headless();
  private readonly loginScreen = this.ownsTheScreen ? [new LoginWallpaper(), new LoginDisplays(), new LoginNumLock()] : [];
  private readonly farewell = new Farewell();
  private readonly fontRefresh = new FontRefresh();
  private readonly mediaKeys: MediaKeys;

  constructor(private readonly context: Context) {
    const shellGlobal = global as unknown as Shell.Global;
    this.portal = new PortalBackend(context);
    this.passkeys = new PasskeyPrompts(context);
    this.appearance = new AppearanceService(color => this.portal.setAccent(color));
    this.keyring = new SystemPrompts(context);
    this.stylesheetMonitors = loadKestrelStylesheets();

    this.workspaces = new Workspaces(() => this.canInteract(), () => this.dismissImmediately());
    this.menus = new ContextMenus((x, y) => this.monitorAt(x, y), () => this.close(), () => this.canInteract(), () => this.previews.close(), context.activateWindow);
    this.previews = new WindowPreviews(actor => this.monitorAt(...actor.get_transformed_position()), () => this.canInteract() && !this.menus.actor.visible, () => this.close(), context.activateWindow);
    context.layoutManager.addTopChrome(this.previews.actor);
    this.board = new Board({
      monitors: () => context.layoutManager.monitors,
      primary: () => context.layoutManager.primaryMonitor,
      workArea: index => context.layoutManager.getWorkAreaForMonitor(index),
      createBackground: context.createBackground,
      wallpaper: context.wallpaper,
      keybindings: context.keybindings,
      addChrome: actor => context.layoutManager.addChrome(actor),
      setPanelsHidden: hidden => this.panels.suppress(hidden),
      openQuickSettings: () => this.toggle('quick'),
      changed: () => this.syncSession(),
      canInteract: () => this.canInteract() && !this.active,
    });
    this.start = new StartMenu(() => this.close(), this.menus);
    this.quick = new QuickSettings(context.quickSettings, () => this.place(), () => this.close(),
      icons => {
        this.panels.primary.updateStatus(icons);
        this.board.showStatus(icons);
      }, this.menus, () => this.takeScreenshot());
    this.notifications = new NotificationCenter(context.messageTray, this.menus, () => this.place(), () => this.close());
    this.clipboard = new ClipboardPanel(this.menus, () => this.close(), () => this.place(), context.inputMethod);
    this.emoji = new EmojiPanel(context.inputMethod, () => this.close(), text => this.clipboard.pasteWithoutKeeping(text));
    this.snapLayouts = new SnapLayouts(index => context.layoutManager.getWorkAreaForMonitor(index), context.snapWindow, () => this.close());
    this.taskView = new TaskView(context.createBackground, workspace => this.board.frameOf(workspace), () => this.close(), context.activateWindow);
    this.liveWallpaper = new LiveWallpaper(() => context.layoutManager.monitors);
    this.mediaKeys = new MediaKeys(context, () => this.openStart());
    const startup = context.layoutManager.connect('startup-complete', () => {
      context.layoutManager.disconnect(startup);
      void notifyAboutIncidents();
      if (this.ownsTheScreen) void confirmStartup().then(notifyAboutFailedStartup);
    });

    context.layoutManager.addTopChrome(this.menus.shield);
    context.layoutManager.addTopChrome(this.menus.actor);

    this.panels = new PanelSet(context.layoutManager, monitor => ({
      start: () => this.toggle('start', monitor()),
      quickSettings: () => this.toggle('quick', monitor()),
      notifications: () => this.toggle('notifications', monitor()),
      activateWindow: context.activateWindow,
      stopScreencast: context.stopScreencast,
    }), this.menus, this.previews, () => {
      this.place();
      this.syncSession();
    });
    const holdPanels = () => this.panels.hold(this.menus.actor.visible || this.previews.actor.visible);
    for (const actor of [this.menus.actor, this.previews.actor]) actor.connect('notify::visible', holdPanels);
    this.disconnectors.push(taskbarPreferences.watch(key => {
      if (key === 'taskbar-style' || key === 'taskbar-size') this.place();
    }));

    context.layoutManager.addTopChrome(this.cover);
    context.layoutManager.addTopChrome(this.start.actor);
    context.layoutManager.addTopChrome(this.quick.actor);
    context.layoutManager.addTopChrome(this.notifications.actor);
    context.layoutManager.addTopChrome(this.clipboard.actor);
    context.layoutManager.addTopChrome(this.emoji.actor);
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
      if (this.board.input.handle(event)) return Clutter.EVENT_STOP;
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
    this.watch(shellGlobal.display, 'overlay-key', () => this.superTapped());
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
      this.board.monitorsChanged();
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
      panel.autoHide.setAllowed(!!panel.monitor && available && !this.taskView.visible && !covered.has(panel.monitor.index));
    this.liveWallpaper.sync(available && !this.taskView.visible && !this.board.shown);
    if (!available) this.dismissImmediately();
  }

  private superTapped(): void {
    if (this.board.doubleTapped() && this.canInteract()) {
      this.dismissImmediately();
      this.board.toggle();
      return;
    }
    this.toggle('start');
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

  lockControls(): LockControls {
    return new LockControls(this.context.layoutManager, (x, y) => this.monitorAt(x, y));
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
    const clearance = taskbarPreferences.clearance;
    const bottom = monitor.y + monitor.height - clearance - SURFACE_GAP;
    const available = monitor.height - clearance - 24;
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
    for (const popup of [this.clipboard, this.emoji])
      popup.place(available, this.context.layoutManager.getWorkAreaForMonitor(monitor.index));
    const [snapWidth, snapHeight] = this.snapLayouts.size();
    this.snapLayouts.actor.set_size(snapWidth, snapHeight);
    this.snapLayouts.actor.set_position(Math.round(monitor.x + (monitor.width - snapWidth) / 2), bottom - snapHeight);
  }

  private pointerMonitor(): Monitor {
    const index = (global as unknown as Shell.Global).display.get_current_monitor();
    const monitor = this.context.layoutManager.monitors[index];
    return monitor && this.panels.panelOn(monitor) ? monitor : this.context.layoutManager.primaryMonitor!;
  }

  private toggle(surface: Surface, monitor = this.pointerMonitor()): void {
    if (!this.canInteract()) return;
    this.previews.close();
    const popup = this.popupFor(surface);
    if (popup && !popup.available) return;
    if (popup) monitor = this.active === surface ? this.surfaceMonitor() : this.monitorAt(...popup.locate()) ?? monitor;
    if (surface === 'snap' && (!this.snapLayouts.available || this.board.shown)) return;
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
    popup?.open();
    if (surface === 'snap') this.snapLayouts.prepareOpen();
    this.place();
    if (opening) {
      actor.opacity = popup ? 0 : 255;
      actor.translation_y = this.slideDistance(actor);
    }
    this.animate(actor, 0, OPEN_DURATION);

    if (surface === 'start') this.start.focus();
    else if (!popup) actor.grab_key_focus();
  }

  private close(): void {
    this.menus.close();
    const surface = this.active;
    if (surface === 'notifications') this.notifications.freeze();
    if (surface && surface !== 'tasks') this.closingSelections.set(this.actorFor(surface), freezeSelection(this.actorFor(surface)));
    this.setActive(null);
    this.popupFor(surface)?.closed?.();
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
    this.active = surface;
    this.context.messageTray.bannerBlocked = surface === 'notifications';
  }

  private openStart(): void {
    if (this.active !== 'start') this.toggle('start');
  }

  taskViewOpen(): boolean { return this.taskView.visible; }

  private surfaces(): St.BoxLayout[] {
    return [this.start.actor, this.quick.actor, this.notifications.actor, this.clipboard.actor, this.emoji.actor, this.snapLayouts.actor];
  }

  private popupFor(surface: Surface | null): CaretPopup | null {
    return surface === 'clipboard' ? this.clipboard : surface === 'emoji' ? this.emoji : null;
  }

  private popupActor(actor: Clutter.Actor): CaretPopup | null {
    return [this.clipboard, this.emoji].find(popup => popup.actor === actor) ?? null;
  }

  private actorFor(surface: PanelSurface): St.BoxLayout {
    switch (surface) {
      case 'start': return this.start.actor;
      case 'quick': return this.quick.actor;
      case 'notifications': return this.notifications.actor;
      case 'clipboard': return this.clipboard.actor;
      case 'emoji': return this.emoji.actor;
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

  shutdown(): void {
    for (const id of this.focusSignals) this.focusWindow!.disconnect(id);
    for (const disconnect of this.disconnectors) disconnect();
    this.panels.shutdown();
    this.keyring.destroy();
    this.appearance.destroy();
    this.liveWallpaper.destroy();
    for (const sync of this.loginScreen) sync.destroy();
    this.farewell.destroy();
    this.fontRefresh.destroy();
    this.mediaKeys.destroy();
    this.oomNotifier.destroy();
    this.health.destroy();
    this.batteryWarnings.destroy();
    this.plugSounds.destroy();
    this.launchFeedback.destroy();
    this.variableRefresh.destroy();
    this.board.destroy();
    this.portal.destroy();
    this.passkeys.destroy();
    for (const monitor of this.stylesheetMonitors) monitor.cancel();
  }

  switchWorkspace(index: number): void {
    if (index === 9 && this.board.shown) this.board.fitAll();
    else this.workspaces.switchTo(index);
  }

  toggleSurface(surface: Surface): void {
    this.toggle(surface);
  }
}

let currentUi: KestrelUi | null = null;
let greeter: Greeter | null = null;

let pendingWallpaper: Rgb[] | null = null;

export function initialize(context: Context): void {
  currentUi = new KestrelUi(context);
  if (pendingWallpaper) currentUi.appearance.apply(pendingWallpaper);
  pendingWallpaper = null;
}

export function startGreeter(context: GreeterContext): Promise<void> {
  greeter = new Greeter(context);
  void greeter.wallpaperShown.then(confirmStartup);
  return greeter.wallpaperShown;
}

export function wallpaperSampled(samples: Rgb[]): void {
  if (currentUi) currentUi.appearance.apply(samples);
  else if (greeter) greeter.wallpaperSampled(samples);
  else pendingWallpaper = samples;
}

export function toggleSurface(surface: Surface): void {
  currentUi?.toggleSurface(surface);
}

export function shutdown(): void {
  currentUi?.shutdown();
}

export function dismissImmediately(): void {
  currentUi?.dismissImmediately();
}

export function switchWorkspace(index: number): void { currentUi?.switchWorkspace(index); }

export function openSystemMonitor(): void { systemMonitor()?.activate(); }

export function taskbarClearance(): number { return taskbarPreferences.clearance; }

export function taskViewOpen(): boolean { return currentUi?.taskViewOpen() ?? false; }

export function lockControls(): LockControls { return currentUi!.lockControls(); }

export function board(): Board | null { return currentUi?.board ?? null; }

export function boardView(workspace: Meta.Workspace): BoardFrame | null {
  return currentUi?.board.frameOf(workspace) ?? null;
}

export function boardBackdrop(workspace: Meta.Workspace, monitor: Monitor): St.Widget | null {
  return currentUi?.board.backdropFor(workspace, monitor) ?? null;
}
