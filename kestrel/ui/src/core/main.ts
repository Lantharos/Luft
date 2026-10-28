import type Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import * as MessageTray from '../surfaces/notifications/tray/messageTray.js';
import * as AccessDialog from '../system/privacy/accessDialog.js';
import { DesktopControls } from '../system/toggles/desktopControls.js';
import * as BrightnessManager from '../system/display/brightnessManager.js';
import * as Components from './components.js';
import * as CtrlAltTab from '../desktop/switchers/ctrlAltTab.js';
import * as EndSessionDialog from '../session/actions/endSessionDialog.js';
import * as InputMethod from '../system/inputSources/inputMethod.js';
import * as Introspect from './introspect.js';
import * as Keyboard from '../surfaces/keyboard/manager.js';
import * as InputSources from '../system/inputSources/keyboard.js';
import * as KestrelUi from '../kestrelUi.js';
import { initTheme, updateTheme } from '../appearance/kestrelTheme.js';
import * as OsdWindow from './stage/osdWindow.js';
import * as Layout from './stage/layout.js';
import * as NotificationDaemon from '../surfaces/notifications/tray/notificationDaemon.js';
import { ScreenshotUI } from '../system/screenshot/ui/screenshotUI.js';
import * as ScreenShield from '../auth/lockScreen/screenShield.js';
import * as SessionMode from './sessionMode.js';
import * as ShellDBus from './shellDBus.js';
import { MountOperationHandler } from '../system/drives/mountOpHandler.js';
import * as WindowManager from '../desktop/windowManager/windowManager.js';
import * as Magnifier from '../system/accessibility/magnifier.js';
import * as XdndHandler from './stage/xdndHandler.js';
import * as KbdA11yDialog from '../system/accessibility/kbdA11yDialog.js';
import * as LocatePointer from '../system/accessibility/locatePointer.js';
import * as PointerA11yTimeout from '../system/accessibility/pointerA11yTimeout.js';
import { formatError } from './runtime/errorUtils.js';
import { AnimationsSettings } from './startup/animationsSettings.js';
import { loadAutomation } from './startup/automation.js';
import { loadWorkspacesAdjustment } from './startup/workspacesAdjustment.js';

export { createWorkspacesAdjustment } from './startup/workspacesAdjustment.js';

const LOG_DOMAIN = 'Kestrel';
const GNOMESHELL_STARTED_MESSAGE_ID = 'f3ea493c22934e26811cd62abe8e203a';

interface ModalRecord {
  actor: Clutter.Actor;
  grab: Clutter.Grab;
  destroyId: number;
  prevFocus: Clutter.Actor | null;
  prevFocusDestroyId: number | undefined;
  actionMode: Shell.ActionMode;
}

interface ModalParams {
  actionMode?: Shell.ActionMode;
  dismissShell?: boolean;
}

export let componentManager!: Components.ComponentManager;
export let wm!: WindowManager.WindowManager;
export let messageTray!: MessageTray.MessageTray;
export let screenShield!: ScreenShield.ScreenShield;
export let notificationDaemon!: NotificationDaemon.NotificationDaemon;
export let ctrlAltTabManager!: CtrlAltTab.CtrlAltTabManager;
export let osdWindowManager!: OsdWindow.OsdWindowManager;
export let sessionMode!: SessionMode.SessionMode;
export let screenshotUI!: ScreenshotUI;
export let shellAccessDialogDBusService!: AccessDialog.AccessDialogDBus;
export let shellDBusService!: ShellDBus.GnomeShell;
export let shellMountOpDBusService!: MountOperationHandler;
export let modalCount = 0;
export let actionMode = Shell.ActionMode.NONE;
export const modalActorFocusStack: ModalRecord[] = [];
export let uiGroup!: Clutter.Actor;
export let magnifier!: Magnifier.Magnifier;
export let xdndHandler!: XdndHandler.XdndHandler;
export let keyboard!: Keyboard.KeyboardManager;
export let layoutManager!: InstanceType<typeof Layout.LayoutManager>;
export let kbdA11yDialog!: KbdA11yDialog.KbdA11yDialog;
export let inputMethod!: InstanceType<typeof InputMethod.InputMethod>;
export let introspectService!: Introspect.IntrospectService;
export let locatePointer!: LocatePointer.LocatePointer;
export let endSessionDialog!: InstanceType<typeof EndSessionDialog.EndSessionDialog>;
export let brightnessManager!: InstanceType<typeof BrightnessManager.BrightnessManager>;
export let brightnessDBus!: ShellDBus.BrightnessDBus;

let themeResource: Gio.Resource | null = null;
let remoteAccessInhibited = false;

function sessionUpdated(): void {
  if (sessionMode.isPrimary)
    updateTheme();

  wm.allowKeybinding('overlay-key', Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW);
  wm.allowKeybinding('locate-pointer-key', Shell.ActionMode.ALL);

  const remoteAccessController = global.backend.get_remote_access_controller();
  if (remoteAccessController && !global.backend.is_headless()) {
    if (sessionMode.allowScreencast && remoteAccessInhibited) {
      remoteAccessController.uninhibit_remote_access();
      remoteAccessInhibited = false;
    } else if (!sessionMode.allowScreencast && !remoteAccessInhibited) {
      remoteAccessController.inhibit_remote_access();
      remoteAccessInhibited = true;
    }
  }
}

function installLogging(): void {
  globalThis.log = console.log;
  globalThis.logError = (err?: unknown, msg?: unknown) => {
    const args = [formatError(err)];
    try {
      if (msg)
        args.unshift(`${msg}:`);
    } catch {}

    console.error(...args);
  };
}

export async function start(): Promise<void> {
  installLogging();

  const currentDesktop = GLib.getenv('XDG_CURRENT_DESKTOP');
  if (!currentDesktop || !currentDesktop.split(':').includes('GNOME'))
    GioUnix.DesktopAppInfo.set_desktop_env('GNOME');

  sessionMode = new SessionMode.SessionMode();
  sessionMode.connect('updated', sessionUpdated);

  initTheme(sessionMode);

  if (!sessionMode.isPeek)
    KestrelUi.startSounds(sessionMode);

  if (!sessionMode.isGreeter)
    KestrelUi.followAppPermissions();

  if (sessionMode.isGreeter) {
    await initializeGreeter();
    sessionUpdated();
    return;
  }

  if (sessionMode.isPeek) {
    initializePeek();
    sessionUpdated();
    return;
  }

  if (sessionMode.isSetup) {
    await initializeSetup();
    sessionUpdated();
    return;
  }

  global.connect('notify-error', (_global, msg, detail) => notifyError(msg, detail));

  await initializeUI();

  shellAccessDialogDBusService = new AccessDialog.AccessDialogDBus();
  shellDBusService = new ShellDBus.GnomeShell();
  shellMountOpDBusService = new MountOperationHandler();

  const watchId = Gio.DBus.session.watch_name('com.lantharos.Kestrel.Notifications',
    Gio.BusNameWatcherFlags.AUTO_START,
    bus => bus.unwatch_name(watchId),
    bus => bus.unwatch_name(watchId));

  sessionUpdated();
}

function warnOnNotifyError(): void {
  global.connect('notify-error', (_global, msg, detail) => console.warn(`${msg}: ${detail}`));
}

function initializePeek(): void {
  warnOnNotifyError();

  reloadThemeResource();
  loadIcons();
  updateTheme();

  layoutManager = new Layout.LayoutManager();
  uiGroup = layoutManager.uiGroup;
  wm = new WindowManager.WindowManager();

  layoutManager.connect('startup-complete', () => {
    actionMode = Shell.ActionMode.NORMAL;
    KestrelUi.startPeek({
      activateWindow: window => window.activate(global.get_current_time()),
      canInteract: () => actionMode === Shell.ActionMode.NORMAL,
    });
  });
  layoutManager.init();
  global.connect('shutdown', () => KestrelUi.shutdown());

  GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => global.context.notify_ready());
}

function startInputMethod(): void {
  inputMethod = new InputMethod.InputMethod();
  global.stage.context.get_backend().set_input_method(inputMethod);
  global.connect('shutdown', () => global.stage.context.get_backend().set_input_method(null));
}

async function initializeSetup(): Promise<void> {
  warnOnNotifyError();

  reloadThemeResource();
  loadIcons();
  loadOskLayouts();
  updateTheme();

  new AnimationsSettings();

  layoutManager = new Layout.LayoutManager();
  uiGroup = layoutManager.uiGroup;
  wm = new WindowManager.WindowManager();
  startInputMethod();
  keyboard = new Keyboard.KeyboardManager();
  InputSources.getInputSourceManager().reload();
  componentManager = new Components.ComponentManager();

  layoutManager.init(KestrelUi.startSetup({ layoutManager }));
  global.connect('shutdown', () => KestrelUi.shutdown());

  KestrelUi.portalPublished.then(() => Shell.util_sd_notify());
  GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => global.context.notify_ready());

  const runAutomation = await loadAutomation();
  layoutManager.connect('startup-complete', () => {
    actionMode = Shell.ActionMode.NORMAL;
    runAutomation?.();
  });
}

async function initializeGreeter(): Promise<void> {
  warnOnNotifyError();

  reloadThemeResource();
  loadIcons();
  updateTheme();

  new AnimationsSettings();

  layoutManager = new Layout.LayoutManager();
  uiGroup = layoutManager.uiGroup;
  ctrlAltTabManager = new CtrlAltTab.CtrlAltTabManager();
  osdWindowManager = new OsdWindow.OsdWindowManager();
  wm = new WindowManager.WindowManager();
  InputSources.getInputSourceManager().reload();

  layoutManager.init(KestrelUi.startGreeter({
    layoutManager,
    pushModal: actor => pushModal(actor, { actionMode: Shell.ActionMode.LOGIN_SCREEN }),
  }));

  GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => {
    Shell.util_sd_notify();
    global.context.notify_ready();
  });

  const runAutomation = await loadAutomation();
  layoutManager.connect('startup-complete', () => runAutomation?.());
}

function initializeDesktop(): void {
  const quickSettings = new DesktopControls();
  global.connect('shutdown', () => quickSettings.destroy());
  KestrelUi.initialize({
    layoutManager, messageTray, quickSettings, sessionMode, screenShield,
    canInteract: () => actionMode === Shell.ActionMode.NORMAL,
    snapWindow: (window, rect) => wm.snapWindow(window, rect),
    morphWindow: window => wm.morphWindow(window),
    showWindowMenu: (window, rect) => wm.showWindowMenu(window, rect),
    swipeWorkspaces: event => wm.swipeWorkspaces(event),
    activateWindow: window => wm.activateWithSnapGroup(window),
    openScreenshot: () => screenshotUI.open().catch(logError),
    stopScreencast: () => screenshotUI.stopScreencast(),
    createBackground: (container, monitorIndex) => layoutManager.createBackground(container, monitorIndex),
    wallpaper: layoutManager.backgroundGroup,
    registerPanel: actor => ctrlAltTabManager.addGroup(actor, 'ctrl-alt-tab-panel', 'view-grid-symbolic'),
    inputMethod,
    keyboard,
    keybindings: {
      add: (name, settings, flags, modes, handler) => wm.addKeybinding(name, settings, flags, modes, handler),
      remove: name => global.display.remove_keybinding(name),
      allow: (name, modes) => wm.allowKeybinding(name, modes),
    },
    showOsd: (icon, label, level, maxLevel) => osdWindowManager.showAll(icon, label, level, maxLevel),
  });
  screenShield.desktopStarted().catch(logError);
}

function notifyUnsafeMode(): void {
  if (!global.context.unsafe_mode) return;

  const source = MessageTray.getSystemSource();
  const notification = new MessageTray.Notification({
    source,
    title: KestrelUi.t('unsafe-mode-title'),
    body: KestrelUi.t('unsafe-mode-body'),
    isTransient: true,
  });
  notification.addAction(KestrelUi.t('unsafe-mode-undo'), () => (global.context.unsafe_mode = false));
  source.addNotification(notification);
}

async function initializeUI(): Promise<void> {
  Shell.WindowTracker.get_default();

  reloadThemeResource();
  loadIcons();
  loadOskLayouts();
  updateTheme();
  loadWorkspacesAdjustment();

  new AnimationsSettings();

  layoutManager = new Layout.LayoutManager();
  uiGroup = layoutManager.uiGroup;

  xdndHandler = new XdndHandler.XdndHandler();
  ctrlAltTabManager = new CtrlAltTab.CtrlAltTabManager();
  osdWindowManager = new OsdWindow.OsdWindowManager();
  kbdA11yDialog = new KbdA11yDialog.KbdA11yDialog();
  wm = new WindowManager.WindowManager();
  magnifier = new Magnifier.Magnifier();
  locatePointer = new LocatePointer.LocatePointer();

  screenShield = new ScreenShield.ScreenShield();

  startInputMethod();

  screenshotUI = new ScreenshotUI();

  brightnessManager = new BrightnessManager.BrightnessManager();
  brightnessDBus = new ShellDBus.BrightnessDBus(brightnessManager);

  messageTray = new MessageTray.MessageTray();
  keyboard = new Keyboard.KeyboardManager();
  InputSources.getInputSourceManager().reload();
  notificationDaemon = new NotificationDaemon.NotificationDaemon();
  componentManager = new Components.ComponentManager();

  introspectService = new Introspect.IntrospectService();

  global.connect('shutdown', () => KestrelUi.shutdown());

  layoutManager.connect('first-frame', initializeDesktop);
  layoutManager.init();

  new PointerA11yTimeout.PointerA11yTimeout();

  global.connect('locate-pointer', () => locatePointer.show());
  global.context.connect('notify::unsafe-mode', notifyUnsafeMode);

  endSessionDialog = new EndSessionDialog.EndSessionDialog();

  KestrelUi.portalPublished.then(() => Shell.util_sd_notify());
  GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => global.context.notify_ready());

  const startDate = new Date();

  const runAutomation = await loadAutomation();

  layoutManager.connect('startup-complete', () => {
    if (actionMode === Shell.ActionMode.NONE)
      actionMode = Shell.ActionMode.NORMAL;

    GLib.log_structured(LOG_DOMAIN, GLib.LogLevelFlags.LEVEL_MESSAGE, {
      'MESSAGE': `Kestrel started at ${startDate}`,
      'MESSAGE_ID': GNOMESHELL_STARTED_MESSAGE_ID,
    });

    if (!runAutomation && new Gio.Credentials().get_unix_user() === 0)
      notify(KestrelUi.t('privileged-user-title'), KestrelUi.t('privileged-user-body'));

    runAutomation?.();
  });
}

export function reloadThemeResource(): void {
  if (themeResource)
    Gio.resources_unregister(themeResource);

  themeResource = Gio.Resource.load(`${global.datadir}/${sessionMode.themeResourceName}`);
  Gio.resources_register(themeResource);
}

function loadIcons(): void {
  Gio.resources_register(Gio.Resource.load(`${global.datadir}/kestrel-icons.gresource`));
}

function loadOskLayouts(): void {
  Gio.resources_register(Gio.Resource.load(`${global.datadir}/kestrel-osk-layouts.gresource`));
}

export function notify(msg: string, details: string | null = null): void {
  const source = MessageTray.getSystemSource();
  const notification = new MessageTray.Notification({
    source,
    title: msg,
    body: details,
    isTransient: true,
  });
  source.addNotification(notification);
}

export function notifyError(msg: string, details: string | null): void {
  if (details)
    console.warn(`error: ${msg}: ${details}`);
  else
    console.warn(`error: ${msg}`);

  notify(msg, details);
}

function findModal(grab: Clutter.Grab): number {
  return modalActorFocusStack.findIndex(record => record.grab === grab);
}

export function pushModal(actor: Clutter.Actor, params: ModalParams = {}): Clutter.Grab {
  const { actionMode: newActionMode, dismissShell } = { actionMode: Shell.ActionMode.NONE, dismissShell: true, ...params };

  if (dismissShell)
    KestrelUi.dismissImmediately();
  const grab = global.stage.grab(actor);

  if (modalCount === 0)
    global.compositor.disable_unredirect();

  modalCount += 1;
  const actorDestroyId = actor.connect('destroy', () => {
    if (findModal(grab) >= 0)
      popModal(grab);
  });

  const prevFocus = global.stage.get_key_focus();
  let prevFocusDestroyId: number | undefined;
  if (prevFocus != null) {
    prevFocusDestroyId = prevFocus.connect('destroy', () => {
      const index = modalActorFocusStack.findIndex(record => record.prevFocus === prevFocus);
      if (index >= 0)
        modalActorFocusStack[index].prevFocus = null;
    });
  }
  modalActorFocusStack.push({
    actor,
    grab,
    destroyId: actorDestroyId,
    prevFocus,
    prevFocusDestroyId,
    actionMode,
  });

  actionMode = newActionMode;
  const newFocus = actor === global.stage ? null : actor;
  global.stage.set_key_focus(newFocus);
  return grab;
}

export function popModal(grab: Clutter.Grab): void {
  const focusIndex = findModal(grab);
  if (focusIndex < 0) {
    global.stage.set_key_focus(null);
    actionMode = Shell.ActionMode.NORMAL;

    throw new Error('incorrect pop');
  }

  modalCount -= 1;

  const record = modalActorFocusStack[focusIndex];
  record.actor.disconnect(record.destroyId);

  record.grab.dismiss();

  if (focusIndex === modalActorFocusStack.length - 1) {
    if (record.prevFocus)
      record.prevFocus.disconnect(record.prevFocusDestroyId!);
    actionMode = record.actionMode;
    global.stage.set_key_focus(record.prevFocus);
  } else {
    const top = modalActorFocusStack[modalActorFocusStack.length - 1];
    if (top.prevFocus)
      top.prevFocus.disconnect(top.prevFocusDestroyId!);
    for (let i = modalActorFocusStack.length - 1; i > focusIndex; i--) {
      modalActorFocusStack[i].prevFocus = modalActorFocusStack[i - 1].prevFocus;
      modalActorFocusStack[i].prevFocusDestroyId = modalActorFocusStack[i - 1].prevFocusDestroyId;
      modalActorFocusStack[i].actionMode = modalActorFocusStack[i - 1].actionMode;
    }
  }
  modalActorFocusStack.splice(focusIndex, 1);

  if (modalCount > 0) return;

  layoutManager.modalEnded();
  global.compositor.enable_unredirect();
  actionMode = Shell.ActionMode.NORMAL;
}

export function activateWindow(window: Meta.Window, time?: number, workspaceNum?: number): void {
  const workspaceManager = global.workspace_manager;
  const activeWorkspaceNum = workspaceManager.get_active_workspace_index();
  const windowWorkspaceNum = workspaceNum !== undefined ? workspaceNum : window.get_workspace().index();

  if (!time)
    time = global.get_current_time();

  if (windowWorkspaceNum !== activeWorkspaceNum) {
    const workspace = workspaceManager.get_workspace_by_index(windowWorkspaceNum)!;
    workspace.activate_with_focus(window, time);
  } else {
    window.activate(time);
  }

  KestrelUi.dismissImmediately();
}

export function closeShellPopups(): void {
  KestrelUi.dismissImmediately();
}
