import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as MessageTray from './messageTray.js';
import * as AccessDialog from './accessDialog.js';
import {DesktopControls} from './desktopControls.js';
import * as BrightnessManager from '../misc/brightnessManager.js';
import * as Config from '../misc/config.js';
import * as Components from './components.js';
import * as CtrlAltTab from './ctrlAltTab.js';
import * as EndSessionDialog from './endSessionDialog.js';
import * as InputMethod from '../misc/inputMethod.js';
import * as Introspect from '../misc/introspect.js';
import * as Keyboard from './keyboard.js';
import * as InputSources from './status/keyboard.js';
import * as KestrelUi from './kestrelUi.js';
import * as OsdWindow from './osdWindow.js';
import * as Layout from './layout.js';
import * as NotificationDaemon from './notificationDaemon.js';
import * as Screenshot from './screenshot.js';
import * as ScreenShield from './screenShield.js';
import * as SessionMode from './sessionMode.js';
import * as ShellDBus from './shellDBus.js';
import * as ShellMountOperation from './shellMountOperation.js';
import * as WindowManager from './windowManager.js';
import * as Magnifier from './magnifier.js';
import * as XdndHandler from './xdndHandler.js';
import * as KbdA11yDialog from './kbdA11yDialog.js';
import * as LocatePointer from './locatePointer.js';
import * as PointerA11yTimeout from './pointerA11yTimeout.js';
import {formatError} from '../misc/errorUtils.js';

const LOG_DOMAIN = 'Kestrel';
const GNOMESHELL_STARTED_MESSAGE_ID = 'f3ea493c22934e26811cd62abe8e203a';

export let componentManager = null;
export let wm = null;
export let messageTray = null;
export let screenShield = null;
export let notificationDaemon = null;
export let ctrlAltTabManager = null;
export let osdWindowManager = null;
export let sessionMode = null;
export let screenshotUI = null;
export let shellAccessDialogDBusService = null;
export let shellDBusService = null;
export let shellMountOpDBusService = null;
export let modalCount = 0;
export let actionMode = Shell.ActionMode.NONE;
export const modalActorFocusStack = [];
export let uiGroup = null;
export let magnifier = null;
export let xdndHandler = null;
export let keyboard = null;
export let layoutManager = null;
export let kbdA11yDialog = null;
export let inputMethod = null;
export let introspectService = null;
export let locatePointer = null;
export let endSessionDialog = null;
export let brightnessManager = null;
export let brightnessDBus = null;

let _startDate;
let _defaultCssStylesheet = null;
let _themeResource = null;
let _oskResource = null;
let _iconResource = null;
let _workspacesAdjustment = null;
let _workspaceAdjustmentRegistry = null;

let _remoteAccessInhibited = false;

function _sessionUpdated() {
    if (sessionMode.isPrimary)
        _loadDefaultStylesheet();

    wm.allowKeybinding('overlay-key',
        Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW);

    wm.allowKeybinding('locate-pointer-key', Shell.ActionMode.ALL);

    const remoteAccessController = global.backend.get_remote_access_controller();
    if (remoteAccessController && !global.backend.is_headless()) {
        if (sessionMode.allowScreencast && _remoteAccessInhibited) {
            remoteAccessController.uninhibit_remote_access();
            _remoteAccessInhibited = false;
        } else if (!sessionMode.allowScreencast && !_remoteAccessInhibited) {
            remoteAccessController.inhibit_remote_access();
            _remoteAccessInhibited = true;
        }
    }
}

/** @returns {void} */
export async function start() {
    globalThis.log = console.log;
    globalThis.logError = function (err, msg) {
        const args = [formatError(err)];
        try {
            // toString() can throw
            if (msg)
                args.unshift(`${msg}:`);
        } catch {}

        console.error(...args);
    };

    const currentDesktop = GLib.getenv('XDG_CURRENT_DESKTOP');
    if (!currentDesktop || !currentDesktop.split(':').includes('GNOME'))
        GioUnix.DesktopAppInfo.set_desktop_env('GNOME');

    sessionMode = new SessionMode.SessionMode();
    sessionMode.connect('updated', _sessionUpdated);

    St.Settings.get().connect('notify::high-contrast', _loadDefaultStylesheet);

    if (sessionMode.isGreeter) {
        await _initializeGreeter();
        _sessionUpdated();
        return;
    }

    global.connect('notify-error', (global, msg, detail) => {
        notifyError(msg, detail);
    });

    await _initializeUI();

    shellAccessDialogDBusService = new AccessDialog.AccessDialogDBus();
    shellDBusService = new ShellDBus.GnomeShell();
    shellMountOpDBusService = new ShellMountOperation.GnomeShellMountOpHandler();

    const watchId = Gio.DBus.session.watch_name('com.lantharos.Kestrel.Notifications',
        Gio.BusNameWatcherFlags.AUTO_START,
        bus => bus.unwatch_name(watchId),
        bus => bus.unwatch_name(watchId));

    _sessionUpdated();
}

async function _loadAutomation() {
    const {automationScript} = global;
    if (!automationScript)
        return null;

    const automation = await import(automationScript.get_uri());
    return () => _runAutomation(automation);
}

async function _runAutomation(automation) {
    try {
        await automation.run();
    } catch (err) {
        logError(err, 'Script failed');
        Meta.exit(Meta.ExitCode.ERROR);
    }

    global.context.terminate();
}

async function _initializeGreeter() {
    global.connect('notify-error', (_global, msg, detail) => console.warn(`${msg}: ${detail}`));

    reloadThemeResource();
    _loadIcons();
    _loadDefaultStylesheet();

    new AnimationsSettings();

    layoutManager = new Layout.LayoutManager();
    uiGroup = layoutManager.uiGroup;
    ctrlAltTabManager = new CtrlAltTab.CtrlAltTabManager();
    osdWindowManager = new OsdWindow.OsdWindowManager();
    wm = new WindowManager.WindowManager();
    InputSources.getInputSourceManager().reload();

    layoutManager.init(KestrelUi.startGreeter({
        layoutManager,
        pushModal: actor => pushModal(actor, {actionMode: Shell.ActionMode.LOGIN_SCREEN}),
    }));

    GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => {
        Shell.util_sd_notify();
        global.context.notify_ready();
    });

    const runAutomation = await _loadAutomation();
    layoutManager.connect('startup-complete', () => runAutomation?.());
}

/** @private */
async function _initializeUI() {
    // Ensure ShellWindowTracker is initialized; this will
    // also initialize ShellAppSystem first. ShellAppSystem
    // needs to load all the .desktop files, and ShellWindowTracker
    // will use those to associate with windows. Right now
    // the Monitor doesn't listen for installed app changes
    // and recalculate application associations, so to avoid
    // races for now we initialize it here. It's better to
    // be predictable anyways.
    Shell.WindowTracker.get_default();

    reloadThemeResource();
    _loadIcons();
    _loadOskLayouts();
    _loadDefaultStylesheet();
    _loadWorkspacesAdjustment();

    new AnimationsSettings();

    // Setup the stage hierarchy early
    layoutManager = new Layout.LayoutManager();

    // Various parts of the codebase still refer to Main.uiGroup
    // instead of using the layoutManager. This keeps that code
    // working until it's updated.
    uiGroup = layoutManager.uiGroup;

    xdndHandler = new XdndHandler.XdndHandler();
    ctrlAltTabManager = new CtrlAltTab.CtrlAltTabManager();
    osdWindowManager = new OsdWindow.OsdWindowManager();
    kbdA11yDialog = new KbdA11yDialog.KbdA11yDialog();
    wm = new WindowManager.WindowManager();
    magnifier = new Magnifier.Magnifier();
    locatePointer = new LocatePointer.LocatePointer();

    screenShield = new ScreenShield.ScreenShield();

    inputMethod = new InputMethod.InputMethod();
    global.stage.context.get_backend().set_input_method(inputMethod);
    global.connect('shutdown',
        () => global.stage.context.get_backend().set_input_method(null));

    screenshotUI = new Screenshot.ScreenshotUI();

    brightnessManager = new BrightnessManager.BrightnessManager();
    brightnessDBus = new ShellDBus.BrightnessDBus(brightnessManager);

    messageTray = new MessageTray.MessageTray();
    keyboard = new Keyboard.KeyboardManager();
    InputSources.getInputSourceManager().reload();
    notificationDaemon = new NotificationDaemon.NotificationDaemon();
    componentManager = new Components.ComponentManager();

    introspectService = new Introspect.IntrospectService();

    global.connect('shutdown', () => KestrelUi.shutdown());

    layoutManager.connect('first-frame', () => {
        const quickSettings = new DesktopControls();
        global.connect('shutdown', () => quickSettings.destroy());
        KestrelUi.initialize({
            layoutManager, messageTray, quickSettings, sessionMode, screenShield,
            canInteract: () => actionMode === Shell.ActionMode.NORMAL,
            snapWindow: (window, rect) => wm.snapWindow(window, rect),
            activateWindow: window => wm.activateWithSnapGroup(window),
            openScreenshot: () => screenshotUI.open().catch(logError),
            stopScreencast: () => screenshotUI.stopScreencast(),
            createBackground: (container, monitorIndex) => layoutManager.createBackground(container, monitorIndex),
            wallpaper: layoutManager.backgroundGroup,
            registerPanel: actor => ctrlAltTabManager.addGroup(actor, _('Panel'), 'view-grid-symbolic'),
            inputMethod,
            keybindings: {
                add: (name, settings, flags, modes, handler) => wm.addKeybinding(name, settings, flags, modes, handler),
                allow: (name, modes) => wm.allowKeybinding(name, modes),
            },
            showOsd: (icon, label, level, maxLevel) => osdWindowManager.showAll(icon, label, level, maxLevel),
        });
    });
    layoutManager.init();

    new PointerA11yTimeout.PointerA11yTimeout();

    global.connect('locate-pointer', () => {
        locatePointer.show();
    });

    global.context.connect('notify::unsafe-mode', () => {
        if (!global.context.unsafe_mode)
            return; // we're safe

        const source = MessageTray.getSystemSource();
        const notification = new MessageTray.Notification({
            source,
            title: _('System was put in unsafe mode'),
            body: _('Apps now have unrestricted access'),
            isTransient: true,
        });
        notification.addAction(_('Undo'),
            () => (global.context.unsafe_mode = false));
        source.addNotification(notification);
    });

    // Provide the bus object for gnome-session to
    // initiate logouts.
    endSessionDialog = new EndSessionDialog.EndSessionDialog();

    // We're ready for the session manager to move to the next phase
    GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => {
        Shell.util_sd_notify();
        global.context.notify_ready();
    });

    _startDate = new Date();

    const runAutomation = await _loadAutomation();

    layoutManager.connect('startup-complete', () => {
        if (actionMode === Shell.ActionMode.NONE)
            actionMode = Shell.ActionMode.NORMAL;

        if (screenShield)
            screenShield.lockIfWasLocked();

        GLib.log_structured(LOG_DOMAIN, GLib.LogLevelFlags.LEVEL_MESSAGE, {
            'MESSAGE': `Kestrel started at ${_startDate}`,
            'MESSAGE_ID': GNOMESHELL_STARTED_MESSAGE_ID,
        });

        if (!runAutomation) {
            const credentials = new Gio.Credentials();
            if (credentials.get_unix_user() === 0) {
                notify(
                    _('Logged in as a privileged user'),
                    _('Running a session as a privileged user should be avoided for security reasons. If possible, you should log in as a normal user.'));
            }
        }

        runAutomation?.();
    });
}

function _getStylesheet(name) {
    let stylesheet;

    stylesheet = Gio.File.new_for_uri(`resource:///com/lantharos/kestrel/theme/${name}`);
    if (stylesheet.query_exists(null))
        return stylesheet;

    const dataDirs = GLib.get_system_data_dirs();
    for (let i = 0; i < dataDirs.length; i++) {
        const path = GLib.build_filenamev([dataDirs[i], Config.PACKAGE_NAME, 'theme', name]);
        stylesheet = Gio.file_new_for_path(path);
        if (stylesheet.query_exists(null))
            return stylesheet;
    }

    stylesheet = Gio.File.new_for_path(`${global.datadir}/theme/${name}`);
    if (stylesheet.query_exists(null))
        return stylesheet;

    return null;
}

function _getDefaultStylesheet() {
    const variant = St.Settings.get().high_contrast ? 'high-contrast' : 'dark';
    return _getStylesheet(sessionMode.stylesheetName.replace('.css', `-${variant}.css`));
}

function _loadDefaultStylesheet() {
    const stylesheet = _getDefaultStylesheet();
    if (_defaultCssStylesheet && _defaultCssStylesheet.equal(stylesheet))
        return;

    _defaultCssStylesheet = stylesheet;
    loadTheme();
}

class AdjustmentRegistry {
    #count = 0;
    #adjustments = new Map();
    #registry = new FinalizationRegistry(key => {
        this.#adjustments.delete(key);
    });

    register(adj) {
        const key = this.#count++;
        this.#adjustments.set(key, new WeakRef(adj));
        this.#registry.register(adj, key);
    }

    forEach(callback) {
        this.#adjustments.forEach((ref, key) => {
            const adj = ref.deref();
            if (adj)
                callback(adj);
            else
                this.#adjustments.delete(key);
        });
    }
}

function _loadWorkspacesAdjustment() {
    const {workspaceManager} = global;
    const activeWorkspaceIndex = workspaceManager.get_active_workspace_index();

    _workspacesAdjustment = new St.Adjustment({
        value: activeWorkspaceIndex,
        lower: 0,
        page_increment: 1,
        page_size: 1,
        step_increment: 0,
        upper: workspaceManager.n_workspaces,
    });

    workspaceManager.bind_property('n-workspaces',
        _workspacesAdjustment, 'upper',
        GObject.BindingFlags.SYNC_CREATE);

    _workspacesAdjustment.connect('notify::upper', () => {
        const newActiveIndex = workspaceManager.get_active_workspace_index();

        // A workspace might have been inserted or removed before the active
        // one, causing the adjustment to go out of sync, so update the value
        _workspaceAdjustmentRegistry.forEach(c => c.remove_transition('value'));
        _workspacesAdjustment.remove_transition('value');
        _workspacesAdjustment.value = newActiveIndex;
    });

    _workspaceAdjustmentRegistry = new AdjustmentRegistry();
}

/**
 * Creates an adjustment that has its lower, upper, and value
 * properties set for the number of available workspaces. Consumers
 * of the returned adjustment must only change the 'value' property,
 * and only that.
 *
 * @param {Clutter.Actor} actor
 *
 * @returns {St.Adjustment} - an adjustment representing the
 * current workspaces layout
 */
export function createWorkspacesAdjustment(actor) {
    const adjustment = new St.Adjustment({actor});

    const properties = [
        ['lower', GObject.BindingFlags.SYNC_CREATE],
        ['page-increment', GObject.BindingFlags.SYNC_CREATE],
        ['page-size', GObject.BindingFlags.SYNC_CREATE],
        ['step-increment', GObject.BindingFlags.SYNC_CREATE],
        ['upper', GObject.BindingFlags.SYNC_CREATE],
        ['value', GObject.BindingFlags.SYNC_CREATE | GObject.BindingFlags.BIDIRECTIONAL],
    ];

    for (const [propName, flags] of properties)
        _workspacesAdjustment.bind_property(propName, adjustment, propName, flags);

    _workspaceAdjustmentRegistry.register(adjustment);

    return adjustment;
}

export function reloadThemeResource() {
    if (_themeResource)
        _themeResource._unregister();

    _themeResource = Gio.Resource.load(
        `${global.datadir}/${sessionMode.themeResourceName}`);
    _themeResource._register();
}

/** @private */
function _loadIcons() {
    _iconResource = Gio.Resource.load(`${global.datadir}/kestrel-icons.gresource`);
    _iconResource._register();
}

function _loadOskLayouts() {
    _oskResource = Gio.Resource.load(`${global.datadir}/kestrel-osk-layouts.gresource`);
    _oskResource._register();
}

/**
 * loadTheme:
 *
 * Reloads the theme CSS file
 */
export function loadTheme() {
    const themeContext = St.ThemeContext.get_for_stage(global.stage);
    const previousTheme = themeContext.get_theme();

    const theme = new St.Theme({
        default_stylesheet: _defaultCssStylesheet,
    });

    if (theme.default_stylesheet == null)
        throw new Error(`No valid stylesheet found for '${sessionMode.stylesheetName}'`);

    if (previousTheme) {
        const customStylesheets = previousTheme.get_custom_stylesheets();

        for (let i = 0; i < customStylesheets.length; i++)
            theme.load_stylesheet(customStylesheets[i]);
    }

    themeContext.set_theme(theme);
}

/**
 * @param {string} msg A message
 * @param {string=} details Additional information
 */
export function notify(msg, details = null) {
    const source = MessageTray.getSystemSource();
    const notification = new MessageTray.Notification({
        source,
        title: msg,
        body: details,
        isTransient: true,
    });
    source.addNotification(notification);
}

/**
 * See shell_global_notify_problem().
 *
 * @param {string} msg - An error message
 * @param {string} details - Additional information
 */
export function notifyError(msg, details) {
    // Also print to stderr so it's logged somewhere
    if (details)
        console.warn(`error: ${msg}: ${details}`);
    else
        console.warn(`error: ${msg}`);

    notify(msg, details);
}

/**
 * @private
 * @param {Clutter.Grab} grab - grab
 */
function _findModal(grab) {
    for (let i = 0; i < modalActorFocusStack.length; i++) {
        if (modalActorFocusStack[i].grab === grab)
            return i;
    }
    return -1;
}

/**
 * Ensure we are in a mode where all keyboard and mouse input goes to
 * the stage, and focus @actor. Multiple calls to this function act in
 * a stacking fashion; the effect will be undone when an equal number
 * of popModal() invocations have been made.
 *
 * Next, record the current Clutter keyboard focus on a stack. If the
 * modal stack returns to this actor, reset the focus to the actor
 * which was focused at the time pushModal() was invoked.
 *
 * `params` may be used to provide the following parameters:
 *  - actionMode: used to set the current Shell.ActionMode to filter
 *                global keybindings; the default of NONE will filter
 *                out all keybindings
 *
 * @param {Clutter.Actor} actor - actor which will be given keyboard focus
 * @param {object=} params - optional parameters
 * @returns {Clutter.Grab} - the grab handle created
 */
export function pushModal(actor, params = {}) {
    const {actionMode: newActionMode, dismissShell} = {
        actionMode: Shell.ActionMode.NONE,
        dismissShell: true,
        ...params,
    };

    if (dismissShell)
        KestrelUi.dismissImmediately();
    const grab = global.stage.grab(actor);

    if (modalCount === 0)
        global.compositor.disable_unredirect();

    modalCount += 1;
    const actorDestroyId = actor.connect('destroy', () => {
        const index = _findModal(grab);
        if (index >= 0)
            popModal(grab);
    });

    const prevFocus = global.stage.get_key_focus();
    let prevFocusDestroyId;
    if (prevFocus != null) {
        prevFocusDestroyId = prevFocus.connect('destroy', () => {
            const index = modalActorFocusStack.findIndex(
                record => record.prevFocus === prevFocus);

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

/**
 * Reverse the effect of pushModal(). If this invocation is undoing
 * the topmost invocation, then the focus will be restored to the
 * previous focus at the time when pushModal() was invoked.
 *
 * @param {Clutter.Grab} grab - the grab given by pushModal()
 */
export function popModal(grab) {
    const focusIndex = _findModal(grab);
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
            record.prevFocus.disconnect(record.prevFocusDestroyId);
        actionMode = record.actionMode;
        global.stage.set_key_focus(record.prevFocus);
    } else {
        // If we have:
        //     global.stage.set_focus(a);
        //     Main.pushModal(b);
        //     Main.pushModal(c);
        //     Main.pushModal(d);
        //
        // then we have the stack:
        //     [{ prevFocus: a, actor: b },
        //      { prevFocus: b, actor: c },
        //      { prevFocus: c, actor: d }]
        //
        // When actor c is destroyed/popped, if we only simply remove the
        // record, then the focus stack will be [a, c], rather than the correct
        // [a, b]. Shift the focus stack up before removing the record to ensure
        // that we get the correct result.
        const t = modalActorFocusStack[modalActorFocusStack.length - 1];
        if (t.prevFocus)
            t.prevFocus.disconnect(t.prevFocusDestroyId);
        // Remove from the middle, shift the focus chain up
        for (let i = modalActorFocusStack.length - 1; i > focusIndex; i--) {
            modalActorFocusStack[i].prevFocus = modalActorFocusStack[i - 1].prevFocus;
            modalActorFocusStack[i].prevFocusDestroyId = modalActorFocusStack[i - 1].prevFocusDestroyId;
            modalActorFocusStack[i].actionMode = modalActorFocusStack[i - 1].actionMode;
        }
    }
    modalActorFocusStack.splice(focusIndex, 1);

    if (modalCount > 0)
        return;

    layoutManager.modalEnded();
    global.compositor.enable_unredirect();
    actionMode = Shell.ActionMode.NORMAL;
}

/**
 * activateWindow:
 *
 * @param {Meta.Window} window the window to activate
 * @param {number=} time current event time
 * @param {number=} workspaceNum  window's workspace number
 *
 * Activates @window, switching to its workspace first if necessary,
 * and dismissing any open shell surfaces
 */
export function activateWindow(window, time, workspaceNum) {
    const workspaceManager = global.workspace_manager;
    const activeWorkspaceNum = workspaceManager.get_active_workspace_index();
    const windowWorkspaceNum = workspaceNum !== undefined ? workspaceNum : window.get_workspace().index();

    if (!time)
        time = global.get_current_time();

    if (windowWorkspaceNum !== activeWorkspaceNum) {
        const workspace = workspaceManager.get_workspace_by_index(windowWorkspaceNum);
        workspace.activate_with_focus(window, time);
    } else {
        window.activate(time);
    }

    KestrelUi.dismissImmediately();
}

class AnimationsSettings {
    constructor() {
        this._animationsEnabled = true;
        this._handles = new Set();

        global.connect('notify::force-animations',
            this._syncAnimationsEnabled.bind(this));
        this._syncAnimationsEnabled();

        const backend = global.backend;
        const remoteAccessController = backend.get_remote_access_controller();
        if (remoteAccessController) {
            remoteAccessController.connect('new-handle',
                (_, handle) => this._onNewRemoteAccessHandle(handle));
        }
    }

    _shouldEnableAnimations() {
        if (global.force_animations)
            return true;

        if (this._handles.size > 0)
            return false;

        return global.backend.is_rendering_hardware_accelerated();
    }

    _syncAnimationsEnabled() {
        const shouldEnableAnimations = this._shouldEnableAnimations();
        if (this._animationsEnabled === shouldEnableAnimations)
            return;
        this._animationsEnabled = shouldEnableAnimations;

        const settings = St.Settings.get();
        if (shouldEnableAnimations)
            settings.uninhibit_animations();
        else
            settings.inhibit_animations();
    }

    _onRemoteAccessHandleStopped(handle) {
        this._handles.delete(handle);
        this._syncAnimationsEnabled();
    }

    _onNewRemoteAccessHandle(handle) {
        if (!handle.get_disable_animations())
            return;

        this._handles.add(handle);
        this._syncAnimationsEnabled();
        handle.connect('stopped', this._onRemoteAccessHandleStopped.bind(this));
    }
}

export function closeShellPopups() {
    KestrelUi.dismissImmediately();
    panel.closeQuickSettings();
}
