import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';
import type St from 'gi://St';

import type { Context } from './context.js';
import type { Rgb } from './appearance/color.js';
import { Greeter, type GreeterContext } from './auth/greeter/greeter.js';
import { LockControls } from './auth/lockScreen/controls.js';
import { Board, type BoardFrame } from './desktop/board/board.js';
import type { Monitor } from './desktop/panel/panel.js';
import { taskbarPreferences } from './desktop/panel/preferences/taskbarPreferences.js';
import { systemMonitor } from './desktop/panel/widgets/systemMonitor.js';
import { wallpaperFloor } from './desktop/wallpaper/floor.js';
import { Setup, type SetupContext } from './session/setup/setup.js';
import { prewarmSettled } from './surfaces/prewarm/queue.js';
import type { Surface } from './surfaces/surfaces.js';
import { confirmStartupOnceSettled } from './system/status/health/startup.js';
import { startPeekHost, type HostContext } from './system/capture/peek/host/host.js';
import type { PeekService } from './system/capture/peek/service.js';
import { NO_DEPTHS, type Anchor, type Depths } from './shared/layout/anchor.js';
import { TaskbarEditor } from './desktop/panel/editing/editor.js';
import { DesktopUi } from './core/desktopUi.js';

export { appIcon, appIcons, sourceApp, windowIcon } from './appearance/icons/appIcons.js';
export { signInToNetwork } from './system/connectivity/network/signIn.js';
export { isGame } from './desktop/windows/games.js';
export { VpnSecrets } from './system/connectivity/network/vpnSecrets.js';
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
export { playNotificationSound, playSound, startSounds } from './system/sound/sounds/sounds.js';

let currentUi: DesktopUi | null = null;
let greeter: Greeter | null = null;
let peekHost: PeekService | null = null;
let setup: Setup | null = null;

let pendingWallpaper: Rgb[] | null = null;

export function initialize(context: Context): void {
  currentUi = new DesktopUi(context);
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

function monitorAt(index: number): Monitor {
  return currentUi!.monitors[index] ?? currentUi!.monitors[global.display.get_primary_monitor()];
}

export function taskbarDepths(monitorIndex = global.display.get_primary_monitor()): Depths {
  return currentUi?.taskbarDepths(monitorAt(monitorIndex)) ?? NO_DEPTHS;
}

export function taskbarAnchor(surface: 'start' | 'quick' | 'notifications', monitorIndex = global.display.get_primary_monitor()): Anchor {
  return currentUi?.taskbarAnchor(surface, monitorAt(monitorIndex)) ?? { edge: 'bottom', target: 0, align: 1 };
}

export function arrangeTaskbar(): void { currentUi?.arrangeTaskbar(); }

export function taskbarEditor(): TaskbarEditor | null { return currentUi?.taskbarEditor ?? null; }

export { taskbarElements } from './desktop/panel/elements/extensionElements.js';

export function taskbarOwnsBottomEdge(): boolean {
  return currentUi !== null && Array.from({ length: global.display.get_n_monitors() }, (_, index) => index).some(index => taskbarPreferences.on(index).touch);
}

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
