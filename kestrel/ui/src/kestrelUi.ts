import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';
import type St from 'gi://St';

import type { Context } from './context.js';
import type { Rgb } from './appearance/color.js';
import type { AppearanceService } from './appearance/service.js';
import { Greeter, type GreeterContext } from './auth/greeter/greeter.js';
import { LockControls } from './auth/lockScreen/controls.js';
import { Board, type BoardFrame } from './desktop/board/board.js';
import { FourFingerSwipe, type SwipeDirection, type SwipeTrack } from './desktop/gestures/fourFingers.js';
import { TouchscreenGestures } from './desktop/gestures/touchscreen.js';
import { ContextMenus, type MenuEntry } from './desktop/menus/contextMenus.js';
import { coveredMonitors } from './desktop/panel/coverage.js';
import type { Monitor } from './desktop/panel/panel.js';
import { PanelSet } from './desktop/panel/panels.js';
import { taskbarPreferences } from './desktop/panel/preferences/taskbarPreferences.js';
import { systemMonitor } from './desktop/panel/widgets/systemMonitor.js';
import { WindowPreviews } from './desktop/panel/windowPreviews.js';
import { TaskView } from './desktop/taskView/taskView.js';
import { wallpaperFloor } from './desktop/wallpaper/floor.js';
import { LiveWallpaper } from './desktop/wallpaper/liveWallpaper.js';
import { Rain } from './desktop/rain/rain.js';
import { RainSound } from './desktop/rain/sound.js';
import { Tiling } from './desktop/tiling/tiling.js';
import { SnapLayouts } from './desktop/windows/snapLayouts.js';
import { Workspaces } from './desktop/windows/workspaces.js';
import { RotationAnimation } from './desktop/rotation/rotation.js';
import { Setup, type SetupContext } from './session/setup/setup.js';
import { afterMotion, dropAfterMotion } from './shared/motion/afterMotion.js';
import { navigateWithKeyboard } from './shared/input/keyboardNavigation.js';
import { t } from './shared/i18n/index.js';
import { ClipboardPanel } from './surfaces/clipboard/panel.js';
import { EmojiPanel } from './surfaces/emoji/panel.js';
import { NotificationCenter } from './surfaces/notifications/notificationCenter.js';
import { QuickSettings } from './surfaces/quickSettings/quickSettings.js';
import { Palette } from './surfaces/palette/palette.js';
import type { SearchHost } from './surfaces/search/engine.js';
import { StartMenu } from './surfaces/start/startMenu.js';
import { warmHidden } from './surfaces/prewarm/hidden.js';
import { prewarmAfterStartup, prewarmSettled, prewarmSoon, type Step } from './surfaces/prewarm/queue.js';
import { Surfaces, type Surface } from './surfaces/surfaces.js';
import { confirmStartupOnceSettled } from './system/health/startup.js';
import { CopilotActions } from './system/dictation/copilotActions.js';
import { startPeekHost, type HostContext } from './system/peek/host/host.js';
import type { PeekService } from './system/peek/service.js';
import { followUserLanguage } from './system/language/language.js';
import type { Inset } from './shared/layout/edge.js';
import { SystemServices } from './system/services.js';

export { appIcon, appIcons, sourceApp, windowIcon } from './appearance/icons/appIcons.js';
export { signInToNetwork } from './system/network/signIn.js';
export { isGame } from './desktop/windows/games.js';
export { VpnSecrets } from './system/network/vpnSecrets.js';
export { battery } from './shared/battery/battery.js';
export { accelerometer } from './desktop/rotation/accelerometer.js';
export { holdMotion } from './shared/motion/afterMotion.js';
export { Curve, Duration, Gesture, projection, reducedMotion, rubberband, Spring } from './shared/motion/motion.js';
export { SwipeAway } from './surfaces/notifications/swipeAway.js';
export { published as portalPublished } from './portal/backend.js';
export { ownOnItsOwnConnection } from './shared/dbus/dedicatedName.js';
export { refuseSandboxed } from './shared/dbus/sandbox.js';
export { followAppPermissions } from './auth/permissions/appPermissions.js';
export { bindText, formatsLocale, localized, onLocaleChanged, t } from './shared/i18n/index.js';
export { playNotificationSound, playSound, startSounds } from './system/sounds/sounds.js';

type Signals = { connect(signal: string, callback: (...args: any[]) => any): number; disconnect(id: number): void };

class KestrelUi {
  private readonly services: SystemServices;
  private readonly menus: ContextMenus;
  private readonly workspaces: Workspaces;
  private readonly previews: WindowPreviews;
  private readonly panels: PanelSet;
  private readonly quick: QuickSettings;
  private readonly taskView: TaskView;
  private readonly surfaces: Surfaces;
  readonly board: Board;
  private readonly tiling: Tiling;
  private readonly liveWallpaper: LiveWallpaper;
  private readonly rain: Rain;
  private readonly rainSound = new RainSound();
  private readonly rotation: RotationAnimation;
  private readonly copilot: CopilotActions;
  private readonly fourFingers = new FourFingerSwipe(direction => this.followFourFingers(direction));
  private readonly touchscreen = new TouchscreenGestures({
    handle: event => this.touchpad(event),
    wantsSwipe: (fingers, x, y) => fingers === 4 || (fingers === 3 && (this.board.shown || this.tiling.ownsSwipe(x, y))),
    // Two fingers on the board zoom anywhere once they pinch, and move the view on its empty canvas
    wantsPinch: (x, y, pinched) => this.board.shown && this.board.canInteract() && (pinched || this.board.onCanvas(x, y)),
  });
  private focusSignals: (() => void)[] = [];
  private readonly disconnectors: (() => void)[] = [];
  private sessionSyncLater = 0;
  private cancelStartPrewarm = () => {};
  private draggedWindow: Meta.Window | null = null;
  private readonly syncSessionAfterMotion = () => this.syncSession();

  constructor(private readonly context: Context) {
    this.services = new SystemServices(context, () => this.openStart());
    const close = () => this.surfaces.close();
    const place = () => this.surfaces.place();
    const monitorAt = (x: number, y: number) => this.surfaces.monitorAt(x, y);

    this.workspaces = new Workspaces(() => this.canInteract(), () => this.dismissImmediately(), context.swipeWorkspaces);
    this.menus = new ContextMenus(monitorAt, close, () => this.canInteract(), () => this.previews.close(), context.activateWindow,
      actor => this.panels?.contains(actor) ? taskbarPreferences.edge : null);
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
    this.tiling = new Tiling({
      monitors: () => context.layoutManager.monitors.map(({ x, y, width, height }) => ({ x, y, width, height })),
      primaryIndex: () => context.layoutManager.primaryMonitor?.index ?? 0,
      workArea: index => context.layoutManager.getWorkAreaForMonitor(index),
      morph: window => context.morphWindow(window),
      activate: window => context.activateWindow(window),
      keybindings: context.keybindings,
      board: this.board,
      addChrome: actor => context.layoutManager.addChrome(actor),
      removeChrome: actor => context.layoutManager.removeChrome(actor),
      canInteract: () => this.canInteract(),
    });
    this.quick = new QuickSettings(context.quickSettings, place, close,
      icons => {
        this.panels.updateStatus(icons);
        this.board.showStatus(icons);
      }, this.menus, () => this.takeScreenshot());
    const clipboard = new ClipboardPanel(this.menus, close, place, context.inputMethod);
    this.copilot = new CopilotActions(context, () => this.surfaces.toggle('start'), text => clipboard.pasteWithoutKeeping(text));
    const searchHost: SearchHost = {
      menus: this.menus,
      quickSettings: context.quickSettings,
      clipboard,
      paste: text => clipboard.pasteWithoutKeeping(text),
      activateWindow: context.activateWindow,
      close,
    };
    this.taskView = new TaskView(context.createBackground, workspace => this.board.frameOf(workspace), close, context.activateWindow);
    this.liveWallpaper = new LiveWallpaper(() => context.layoutManager.monitors);
    this.rain = new Rain({
      monitors: () => context.layoutManager.monitors,
      taskbar: monitor => {
        const actor = this.panels.panelOn(monitor)?.actor;
        if (!actor?.mapped) return null;
        const [x, y] = actor.get_transformed_position();
        const [width, height] = actor.get_transformed_size();
        return { x, y, width, height };
      },
    });
    this.rotation = new RotationAnimation(context.layoutManager, context.createBackground);
    this.surfaces = new Surfaces({
      context,
      menus: this.menus,
      previews: this.previews,
      panels: () => this.panels,
      board: this.board,
      start: () => taskbarPreferences.startStyle === 'palette' ? new Palette(searchHost) : new StartMenu(searchHost),
      quick: this.quick,
      notifications: () => new NotificationCenter(context.messageTray, this.menus, place, close),
      clipboard,
      emoji: () => new EmojiPanel(context.inputMethod, close, text => clipboard.pasteWithoutKeeping(text)),
      snapLayouts: () => new SnapLayouts(index => context.layoutManager.getWorkAreaForMonitor(index), context.snapWindow, close, () => this.snappingAllowed()),
      taskView: this.taskView,
      canInteract: () => this.canInteract(),
      syncSession: () => this.syncSession(),
      taskbarInset: () => this.taskbarInset(),
      startReplaced: () => this.prewarmStart(),
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
    this.quick.updateStatus();
    const holdPanels = () => this.panels.hold(this.menus.actor.visible || this.previews.actor.visible);
    for (const actor of [this.menus.actor, this.previews.actor]) actor.connect('notify::visible', holdPanels);
    this.disconnectors.push(followUserLanguage());
    this.disconnectors.push(taskbarPreferences.watch(key => {
      if (key === 'taskbar-position' || key === 'tablet') this.followTaskbarEdge();
      if (key === 'taskbar-style' || key === 'taskbar-size' || key === 'tablet') place();
      if (key === 'start-style') this.surfaces.restyleStart();
    }));

    context.layoutManager.addTopChrome(this.surfaces.cover);
    context.layoutManager.addTopChrome(this.surfaces.layer);
    context.layoutManager.addTopChrome(this.taskView.actor);

    this.watch(context.keyboard, 'visibility-changed', place);
    this.watch(global.stage, 'key-press-event', (_stage, event) => {
      const active = this.surfaces.active;
      if (active && event.get_key_symbol() === Clutter.KEY_Escape) {
        if (active !== 'quick' || !this.quick.closeSubmenu()) close();
        return Clutter.EVENT_STOP;
      }
      return Clutter.EVENT_PROPAGATE;
    });
    this.watch(global.stage, 'captured-event', (_stage, event) => {
      if (this.touchpad(event)) return Clutter.EVENT_STOP;
      if (event.type() === Clutter.EventType.SCROLL) {
        const [x, y] = event.get_coords();
        const target = global.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y);
        if ((event.get_state() & (Clutter.ModifierType.SUPER_MASK | Clutter.ModifierType.MOD4_MASK)) || (this.panels.contains(target) && !this.panels.primary.handlesScroll(target)))
          return this.workspaces.scroll(event) ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE;
      }
      if (!this.canInteract() || event.type() !== Clutter.EventType.BUTTON_PRESS)
        return Clutter.EVENT_PROPAGATE;
      const [x, y] = event.get_coords();
      const target = global.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y);
      if (!this.previews.contains(target)) this.previews.close();
      return Clutter.EVENT_PROPAGATE;
    });
    const bindWallpaper = (actor: Clutter.Actor) => {
      if (actor instanceof Meta.BackgroundActor) this.menus.bind(actor, () => this.desktopMenu());
    };
    context.wallpaper.get_children().forEach(bindWallpaper);
    this.watch(context.wallpaper, 'child-added', (_wallpaper, actor: Clutter.Actor) => bindWallpaper(actor));
    this.watch(global.display, 'overlay-key', () => this.superTapped());
    this.watch(global.display, 'in-fullscreen-changed', () => this.queueSyncSession());
    this.watch(global.display, 'notify::focus-window', () => this.trackFocusedWindow());
    this.watch(global.display, 'restacked', () => this.queueSyncSession());
    this.watch(global.workspace_manager, 'active-workspace-changed', () => this.queueSyncSession());
    this.watch(global.display, 'window-visibility-updated', () => this.queueSyncSession());
    this.watch(global.display, 'grab-op-begin', (_display, window: Meta.Window | null) => { this.draggedWindow = window; });
    this.watch(global.display, 'grab-op-end', () => {
      this.draggedWindow = null;
      this.queueSyncSession();
    });
    this.watch(context.sessionMode, 'updated', () => this.syncSession());
    if (context.screenShield) this.watch(context.screenShield, 'active-changed', () => this.syncSession());
    context.registerPanel(this.panels.primary.actor);
    for (const actor of [this.previews.actor, this.taskView.actor])
      navigateWithKeyboard(actor);
    this.watch(context.layoutManager, 'monitors-changed', () => {
      this.dismissImmediately();
      this.panels.sync();
      this.liveWallpaper.monitorsChanged();
      this.rain.monitorsChanged();
      this.board.monitorsChanged();
      this.tiling.monitorsChanged();
      this.followTaskbarEdge();
      place();
      this.syncSession();
    });
    this.followTaskbarEdge();
    place();
    this.syncSession();
    this.disconnectors.push(prewarmAfterStartup(context.layoutManager, [
      ...this.startPrewarm(),
      () => warmHidden(this.quick.actor, { focused: this.quick.actor }),
      () => warmHidden(this.surfaces.notifications.actor, { focused: this.surfaces.notifications.actor, place }),
      () => this.surfaces.emoji.prewarm(),
      () => warmHidden(this.surfaces.emoji.actor, { place }),
      () => this.taskView.prewarm(context.layoutManager.primaryMonitor!),
    ]));
  }

  get appearance(): AppearanceService {
    return this.services.appearance;
  }

  private watch(object: Signals, signal: string, callback: (...args: any[]) => any): void {
    const id = object.connect(signal, callback);
    this.disconnectors.push(() => object.disconnect(id));
  }

  private desktopMenu(): MenuEntry[] {
    return [
      { label: t('desktop-menu-wallpaper'), run: () => this.menus.settings('appearance/wallpaper') },
      { label: t('desktop-menu-display-settings'), run: () => this.menus.settings('display') },
      { label: t('desktop-menu-settings'), run: () => this.menus.settings() },
    ];
  }

  private desktopAvailable(): boolean {
    return this.context.sessionMode.hasWindows && !this.context.sessionMode.isLocked && !this.context.screenShield?.active;
  }

  private canInteract(): boolean {
    return this.desktopAvailable() && this.context.canInteract();
  }

  private trackFocusedWindow(): void {
    for (const disconnect of this.focusSignals) disconnect();
    const window = global.display.focus_window;
    const actor = window?.get_compositor_private() as Meta.WindowActor | null;
    const sync = (object: Signals, signal: string, when = () => true) => {
      const id = object.connect(signal, () => {
        if (when()) this.queueSyncSession();
      });
      return () => object.disconnect(id);
    };
    const notDragged = () => window !== this.draggedWindow;
    this.focusSignals = [
      ...window ? [sync(window, 'size-changed', notDragged), sync(window, 'position-changed', notDragged), sync(window, 'notify::fullscreen')] : [],
      ...actor ? [sync(actor, 'effects-completed')] : [],
    ];
    this.queueSyncSession();
  }

  private queueSyncSession(): void {
    if (this.sessionSyncLater) return;
    this.sessionSyncLater = global.compositor.get_laters().add(Meta.LaterType.BEFORE_REDRAW, () => {
      this.sessionSyncLater = 0;
      afterMotion(this.syncSessionAfterMotion);
      return false;
    });
  }

  private syncSession(): void {
    this.tiling.syncBoard();
    const available = this.desktopAvailable();
    const covered = coveredMonitors(this.context.layoutManager.monitors);
    for (const panel of this.panels.all)
      panel.autoHide.setAllowed(taskbarPreferences.shown && !!panel.monitor && available && !this.taskView.visible && !covered.has(panel.monitor.index));
    const primary = this.context.layoutManager.primaryMonitor;
    this.panels.showCorner(!taskbarPreferences.shown && !!primary && available && !this.taskView.visible && !this.board.shown && !covered.has(primary.index));
    this.liveWallpaper.sync(available && !this.taskView.visible && !this.board.shown);
    this.rain.sync(available && !this.taskView.visible && !this.board.shown);
    this.rainSound.sync(available);
    if (!available) this.dismissImmediately();
  }

  private followTaskbarEdge(): void {
    const primary = this.context.layoutManager.primaryMonitor;
    if (primary && wallpaperFloor.follow(taskbarPreferences.edge, primary)) this.services.appearance.repaintTaskbar();
  }

  private taskbarInset(): Inset {
    if (this.board.shown) return { edge: 'bottom', depth: this.board.cornerClearance };
    return { edge: taskbarPreferences.edge, depth: taskbarPreferences.shown ? taskbarPreferences.clearance : this.panels.cornerClearance };
  }

  private prewarmStart(): void {
    this.cancelStartPrewarm();
    this.cancelStartPrewarm = prewarmSoon(this.startPrewarm());
  }

  private startPrewarm(): Step[] {
    return [
      () => this.surfaces.start.reset(),
      () => warmHidden(this.surfaces.start.actor, { focused: this.surfaces.start.search, place: () => this.surfaces.place() }),
    ];
  }

  private superTapped(): void {
    if (this.board.doubleTapped() && this.canInteract()) {
      this.dismissImmediately();
      this.board.toggle();
      return;
    }
    this.surfaces.toggle('start');
  }

  private followFourFingers(direction: SwipeDirection): SwipeTrack | null {
    const up = direction === 'up';
    if (this.surfaces.active === 'tasks') return up ? this.surfaces.followTasks() : null;
    if (!this.canInteract() || this.surfaces.active) return null;
    if (this.board.shown) return up ? null : this.board.track(false);
    return up ? this.board.track(true) : this.surfaces.followTasks();
  }

  private takeScreenshot(): void {
    this.dismissImmediately();
    const stage = global.stage;
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
  taskViewProgress(): number { return this.taskView.progress; }

  touchpad(event: Clutter.Event): boolean {
    return this.fourFingers.handle(event) || this.tiling.touchpad(event) || this.board.input.handle(event);
  }

  touchClaimed(gesture: Clutter.Gesture): boolean {
    return this.touchscreen.claims(gesture);
  }

  snappingAllowed(): boolean {
    return this.tiling.mode === 'off';
  }

  shutdown(): void {
    for (const disconnect of [...this.focusSignals, ...this.disconnectors]) disconnect();
    this.cancelStartPrewarm();
    if (this.sessionSyncLater) global.compositor.get_laters().remove(this.sessionSyncLater);
    dropAfterMotion(this.syncSessionAfterMotion);
    this.panels.shutdown();
    this.liveWallpaper.destroy();
    this.touchscreen.destroy();
    this.rain.destroy();
    this.rainSound.destroy();
    this.rotation.destroy();
    this.copilot.destroy();
    this.tiling.destroy();
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
let setup: Setup | null = null;

let pendingWallpaper: Rgb[] | null = null;

export function initialize(context: Context): void {
  currentUi = new KestrelUi(context);
  if (pendingWallpaper) currentUi.appearance.apply(pendingWallpaper);
  pendingWallpaper = null;
}

export function startGreeter(context: GreeterContext): Promise<void> {
  greeter = new Greeter(context);
  confirmStartupOnceSettled(context.layoutManager);
  return greeter.wallpaperShown;
}

export function startSetup(context: SetupContext): Promise<void> {
  setup = new Setup(context);
  return setup.ready;
}

export function wallpaperSampled(samples: Rgb[]): void {
  wallpaperFloor.sample(samples);
  if (currentUi) currentUi.appearance.apply(samples);
  else if (greeter) greeter.wallpaperSampled(samples);
  else if (setup) setup.wallpaperSampled(samples);
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
  setup?.destroy();
}

export function surfacesPrepared(): Promise<void> { return prewarmSettled(); }

export function dismissImmediately(): void {
  currentUi?.dismissImmediately();
}

export function switchWorkspace(index: number): void { currentUi?.switchWorkspace(index); }

export function openSystemMonitor(): void { systemMonitor()?.activate(); }

export function taskbarInset(): Inset { return { edge: taskbarPreferences.edge, depth: taskbarPreferences.clearance }; }

export function taskbarOwnsBottomEdge(): boolean { return currentUi !== null && taskbarPreferences.touch; }

export function taskViewOpen(): boolean { return currentUi?.taskViewOpen() ?? false; }

export function snappingAllowed(): boolean { return currentUi?.snappingAllowed() ?? true; }

export function taskViewProgress(): number { return currentUi?.taskViewProgress() ?? 0; }

export function lockControls(): LockControls { return currentUi!.lockControls(); }

export function touchpad(event: Clutter.Event): boolean { return currentUi?.touchpad(event) ?? false; }
export function touchClaimed(gesture: Clutter.Gesture): boolean { return currentUi?.touchClaimed(gesture) ?? false; }

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
