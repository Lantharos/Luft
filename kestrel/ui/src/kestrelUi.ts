import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import Meta from 'gi://Meta';
import type St from 'gi://St';

import type { Context } from './context.js';
import type { Rgb } from './appearance/color.js';
import type { AppearanceService } from './appearance/service.js';
import { Greeter, type GreeterContext } from './auth/greeter/greeter.js';
import { LockControls } from './auth/lockScreen/controls.js';
import { Board, type BoardFrame } from './desktop/board/board.js';
import { ContextMenus } from './desktop/menus/contextMenus.js';
import { coveredMonitors } from './desktop/panel/coverage.js';
import type { Monitor } from './desktop/panel/panel.js';
import { PanelSet } from './desktop/panel/panels.js';
import { taskbarPreferences } from './desktop/panel/preferences/taskbarPreferences.js';
import { systemMonitor } from './desktop/panel/widgets/systemMonitor.js';
import { WindowPreviews } from './desktop/panel/windowPreviews.js';
import { TaskView } from './desktop/taskView/taskView.js';
import { LiveWallpaper } from './desktop/wallpaper/liveWallpaper.js';
import { SnapLayouts } from './desktop/windows/snapLayouts.js';
import { Workspaces } from './desktop/windows/workspaces.js';
import { navigateWithKeyboard } from './shared/input/keyboardNavigation.js';
import { ClipboardPanel } from './surfaces/clipboard/panel.js';
import { EmojiPanel } from './surfaces/emoji/panel.js';
import { NotificationCenter } from './surfaces/notifications/notificationCenter.js';
import { QuickSettings } from './surfaces/quickSettings/quickSettings.js';
import { StartMenu } from './surfaces/start/startMenu.js';
import { Surfaces, type Surface } from './surfaces/surfaces.js';
import { confirmStartup } from './system/health/startup.js';
import { startPeekHost, type HostContext } from './system/peek/host/host.js';
import type { PeekService } from './system/peek/service.js';
import { SystemServices } from './system/services.js';

export { appIcon, appIcons, sourceApp, windowIcon } from './appearance/icons/appIcons.js';
export { signInToNetwork } from './system/network/signIn.js';
export { isGame } from './desktop/windows/games.js';
export { VpnSecrets } from './system/network/vpnSecrets.js';

class KestrelUi {
  private readonly ownsTheScreen = !(global as unknown as Shell.Global).backend.is_headless();
  private readonly services: SystemServices;
  private readonly menus: ContextMenus;
  private readonly workspaces: Workspaces;
  private readonly previews: WindowPreviews;
  private readonly panels: PanelSet;
  private readonly quick: QuickSettings;
  private readonly taskView: TaskView;
  private readonly surfaces: Surfaces;
  readonly board: Board;
  private readonly liveWallpaper: LiveWallpaper;
  private focusWindow: Meta.Window | null = null;
  private focusSignals: number[] = [];
  private readonly disconnectors: (() => void)[] = [];

  constructor(private readonly context: Context) {
    const shellGlobal = global as unknown as Shell.Global;
    this.services = new SystemServices(context, this.ownsTheScreen, () => this.openStart());
    const close = () => this.surfaces.close();
    const place = () => this.surfaces.place();
    const monitorAt = (x: number, y: number) => this.surfaces.monitorAt(x, y);

    this.workspaces = new Workspaces(() => this.canInteract(), () => this.dismissImmediately());
    this.menus = new ContextMenus(monitorAt, close, () => this.canInteract(), () => this.previews.close(), context.activateWindow);
    this.previews = new WindowPreviews(actor => monitorAt(...actor.get_transformed_position()), () => this.canInteract() && !this.menus.actor.visible, close, context.activateWindow);
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
      openQuickSettings: () => this.surfaces.toggle('quick'),
      openStart: () => this.surfaces.toggle('start'),
      changed: () => this.syncSession(),
      canInteract: () => this.canInteract() && !this.surfaces.active,
    });
    const start = new StartMenu(close, this.menus);
    this.quick = new QuickSettings(context.quickSettings, place, close,
      icons => {
        this.panels.primary.updateStatus(icons);
        this.board.showStatus(icons);
      }, this.menus, () => this.takeScreenshot());
    const notifications = new NotificationCenter(context.messageTray, this.menus, place, close);
    const clipboard = new ClipboardPanel(this.menus, close, place, context.inputMethod);
    const emoji = new EmojiPanel(context.inputMethod, close, text => clipboard.pasteWithoutKeeping(text));
    const snapLayouts = new SnapLayouts(index => context.layoutManager.getWorkAreaForMonitor(index), context.snapWindow, close);
    this.taskView = new TaskView(context.createBackground, workspace => this.board.frameOf(workspace), close, context.activateWindow);
    this.liveWallpaper = new LiveWallpaper(() => context.layoutManager.monitors);
    this.surfaces = new Surfaces({
      context,
      menus: this.menus,
      previews: this.previews,
      panels: () => this.panels,
      board: this.board,
      start,
      quick: this.quick,
      notifications,
      clipboard,
      emoji,
      snapLayouts,
      taskView: this.taskView,
      canInteract: () => this.canInteract(),
      syncSession: () => this.syncSession(),
    });

    context.layoutManager.addTopChrome(this.menus.shield);
    context.layoutManager.addTopChrome(this.menus.actor);

    this.panels = new PanelSet(context.layoutManager, monitor => ({
      start: () => this.surfaces.toggle('start', monitor()),
      quickSettings: () => this.surfaces.toggle('quick', monitor()),
      notifications: () => this.surfaces.toggle('notifications', monitor()),
      activateWindow: context.activateWindow,
      stopScreencast: context.stopScreencast,
    }), this.menus, this.previews, () => {
      place();
      this.syncSession();
    });
    const holdPanels = () => this.panels.hold(this.menus.actor.visible || this.previews.actor.visible);
    for (const actor of [this.menus.actor, this.previews.actor]) actor.connect('notify::visible', holdPanels);
    this.disconnectors.push(taskbarPreferences.watch(key => {
      if (key === 'taskbar-style' || key === 'taskbar-size') place();
    }));

    context.layoutManager.addTopChrome(this.surfaces.cover);
    for (const actor of this.surfaces.all()) context.layoutManager.addTopChrome(actor);
    context.layoutManager.addTopChrome(this.taskView.actor);
    for (const actor of this.surfaces.all()) this.surfaces.clipToFloor(actor);

    this.watch(shellGlobal.stage, 'key-press-event', (_stage, event) => {
      const active = this.surfaces.active;
      if (active && event.get_key_symbol() === Clutter.KEY_Escape) {
        if (active !== 'quick' || !this.quick.closeSubmenu()) close();
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
    for (const actor of [...this.surfaces.all(), this.previews.actor, this.taskView.actor])
      navigateWithKeyboard(actor);
    this.watch(context.layoutManager, 'monitors-changed', () => {
      this.dismissImmediately();
      this.panels.sync();
      this.liveWallpaper.monitorsChanged();
      this.board.monitorsChanged();
      place();
      this.syncSession();
    });
    place();
    this.syncSession();
  }

  get appearance(): AppearanceService {
    return this.services.appearance;
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
    this.surfaces.toggle('start');
  }

  private takeScreenshot(): void {
    this.dismissImmediately();
    const stage = (global as unknown as Shell.Global).stage;
    const painted = stage.connect('after-paint', () => {
      stage.disconnect(painted);
      this.context.openScreenshot();
    });
  }

  private openStart(): void {
    if (this.surfaces.active !== 'start') this.surfaces.toggle('start');
  }

  dismissImmediately(): void {
    this.surfaces.dismissImmediately();
  }

  lockControls(): LockControls {
    return new LockControls(this.context.layoutManager, (x, y) => this.surfaces.monitorAt(x, y));
  }

  taskViewOpen(): boolean { return this.taskView.visible; }

  shutdown(): void {
    for (const id of this.focusSignals) this.focusWindow!.disconnect(id);
    for (const disconnect of this.disconnectors) disconnect();
    this.panels.shutdown();
    this.liveWallpaper.destroy();
    this.board.destroy();
    this.services.destroy();
  }

  switchWorkspace(index: number): void {
    if (index === 9 && this.board.shown) this.board.fitAll();
    else this.workspaces.switchTo(index);
  }

  toggleSurface(surface: Surface): void {
    this.surfaces.toggle(surface);
  }
}

let currentUi: KestrelUi | null = null;
let greeter: Greeter | null = null;
let peekHost: PeekService | null = null;

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

export function startPeek(context: HostContext): void {
  peekHost = startPeekHost(context);
}

export function shutdown(): void {
  currentUi?.shutdown();
  peekHost?.destroy();
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

export function enterBoardWindow(window: Meta.Window): void {
  currentUi?.board.enterWindow(window);
}

export function boardView(workspace: Meta.Workspace): BoardFrame | null {
  return currentUi?.board.frameOf(workspace) ?? null;
}

export function boardBackdrop(workspace: Meta.Workspace, monitor: Monitor): St.Widget | null {
  return currentUi?.board.backdropFor(workspace, monitor) ?? null;
}
