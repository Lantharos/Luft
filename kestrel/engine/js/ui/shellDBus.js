import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import * as Config from '../misc/config.js';
import * as Main from './main.js';
import * as Screenshot from './screenshot.js';

import {emitSignalToDestination} from '../misc/dbusUtils.js';
import {loadInterfaceXML} from '../misc/fileUtils.js';
import {DBusSenderChecker} from '../misc/util.js';
import * as KestrelUi from './kestrelUi.js';

const GnomeShellIface = loadInterfaceXML('org.gnome.Shell');
const ScreenSaverIface = loadInterfaceXML('org.gnome.ScreenSaver');
const BrightnessIface = loadInterfaceXML('org.gnome.Shell.Brightness');

export class GnomeShell {
    constructor() {
        this._dbusImpl = Gio.DBusExportedObject.wrapJSObject(GnomeShellIface, this);
        this._dbusImpl.export(Gio.DBus.session, '/org/gnome/Shell');

        this._senderChecker = new DBusSenderChecker([
            'org.gnome.Settings',
            'org.gnome.SettingsDaemon.MediaKeys',
            'org.freedesktop.impl.portal.desktop.gnome',
        ]);

        this._screenshotService = new Screenshot.ScreenshotService();

        this._grabbedAccelerators = new Map();
        this._grabbers = new Map();

        global.display.connect('accelerator-activated',
            (display, action, device, timestamp) => {
                this._emitAcceleratorActivated(action, device, timestamp);
            });
        global.display.connect('accelerator-deactivated',
            (display, action, device, timestamp) => {
                this._emitAcceleratorDeactivated(action, device, timestamp);
            });

        KestrelUi.watchStart(visible => {
            this._dbusImpl.emit_property_changed('OverviewActive', new GLib.Variant('b', visible));
        });
    }

    /**
     * This function executes arbitrary code in the main
     * loop, and returns a boolean success and
     * JSON representation of the object as a string.
     *
     * If evaluation completes without throwing an exception,
     * then the return value will be [true, JSON.stringify(result)].
     * If evaluation fails, then the return value will be
     * [false, JSON.stringify(exception)];
     *
     * @async
     * @param {...any} params - method parameters
     * @param {Gio.DBusMethodInvocation} invocation - the invocation
     * @returns {void}
     */
    async EvalAsync(params, invocation) {
        if (!global.context.unsafe_mode) {
            invocation.return_value(new GLib.Variant('(bs)', [false, '']));
            return;
        }

        const [code] = params;
        let returnValue;
        let success;
        try {
            returnValue = JSON.stringify(await eval(code));
            // A hack; DBus doesn't have null/undefined
            if (returnValue === undefined)
                returnValue = '';
            success = true;
        } catch (e) {
            returnValue = `${e}`;
            success = false;
        }
        invocation.return_value(
            new GLib.Variant('(bs)', [success, returnValue]));
    }

    /**
     * Open Start with its search entry focused
     *
     * @async
     * @param {...any} params - method parameters
     * @param {Gio.DBusMethodInvocation} invocation - the invocation
     * @returns {void}
     */
    async FocusSearchAsync(params, invocation) {
        try {
            await this._senderChecker.checkInvocation(invocation);
        } catch (e) {
            invocation.return_gerror(e);
            return;
        }

        KestrelUi.openStart();
        invocation.return_value(null);
    }

    /**
     * Show OSD with the specified parameters
     *
     * @async
     * @param {...any} params - method parameters
     * @param {Gio.DBusMethodInvocation} invocation - the invocation
     * @returns {void}
     */
    async ShowOSDAsync([params], invocation) {
        try {
            await this._senderChecker.checkInvocation(invocation);
        } catch (e) {
            invocation.return_gerror(e);
            return;
        }

        for (const param in params)
            params[param] = params[param].deepUnpack();

        const {
            connector,
            label,
            level,
            max_level: maxLevel,
            icon: serializedIcon,
        } = params;

        let icon = null;
        if (serializedIcon)
            icon = Gio.Icon.new_for_string(serializedIcon);

        if (connector) {
            const monitorManager = global.backend.get_monitor_manager();
            const monitorIndex =
                monitorManager.get_monitor_for_connector(connector);
            Main.osdWindowManager.showOne(monitorIndex, icon, label, level, maxLevel);
        } else {
            Main.osdWindowManager.showAll(icon, label, level, maxLevel);
        }
        invocation.return_value(null);
    }

    /**
     * Open Start searching for the specified app
     *
     * @async
     * @param {string} id - an application ID
     * @param {Gio.DBusMethodInvocation} invocation - the invocation
     * @returns {void}
     */
    async FocusAppAsync([id], invocation) {
        try {
            await this._senderChecker.checkInvocation(invocation);
        } catch (e) {
            invocation.return_gerror(e);
            return;
        }

        const appSys = Shell.AppSystem.get_default();
        if (appSys.lookup_app(id) === null) {
            invocation.return_error_literal(
                Gio.DBusError,
                Gio.DBusError.FILE_NOT_FOUND,
                `No app with ID ${id}`);
            return;
        }

        KestrelUi.openStart(appSys.lookup_app(id).get_name());
        invocation.return_value(null);
    }

    /**
     * Open Start
     *
     * @async
     * @param {...any} params - method parameters
     * @param {Gio.DBusMethodInvocation} invocation - the invocation
     * @returns {void}
     */
    async ShowApplicationsAsync(params, invocation) {
        try {
            await this._senderChecker.checkInvocation(invocation);
        } catch (e) {
            invocation.return_gerror(e);
            return;
        }

        KestrelUi.openStart();
        invocation.return_value(null);
    }

    async GrabAcceleratorAsync(params, invocation) {
        try {
            await this._senderChecker.checkInvocation(invocation);
        } catch (e) {
            invocation.return_gerror(e);
            return;
        }

        const [accel, modeFlags, grabFlags] = params;
        const sender = invocation.get_sender();
        const bindingAction = this._grabAcceleratorForSender(accel, modeFlags, grabFlags, sender);
        invocation.return_value(GLib.Variant.new('(u)', [bindingAction]));
    }

    async GrabAcceleratorsAsync(params, invocation) {
        try {
            await this._senderChecker.checkInvocation(invocation);
        } catch (e) {
            invocation.return_gerror(e);
            return;
        }

        const [accels] = params;
        const sender = invocation.get_sender();
        const bindingActions = [];
        for (let i = 0; i < accels.length; i++) {
            const [accel, modeFlags, grabFlags] = accels[i];
            bindingActions.push(this._grabAcceleratorForSender(accel, modeFlags, grabFlags, sender));
        }
        invocation.return_value(GLib.Variant.new('(au)', [bindingActions]));
    }

    async UngrabAcceleratorAsync(params, invocation) {
        try {
            await this._senderChecker.checkInvocation(invocation);
        } catch (e) {
            invocation.return_gerror(e);
            return;
        }

        const [action] = params;
        const sender = invocation.get_sender();
        const ungrabSucceeded = this._ungrabAcceleratorForSender(action, sender);

        invocation.return_value(GLib.Variant.new('(b)', [ungrabSucceeded]));
    }

    async UngrabAcceleratorsAsync(params, invocation) {
        try {
            await this._senderChecker.checkInvocation(invocation);
        } catch (e) {
            invocation.return_gerror(e);
            return;
        }

        const [actions] = params;
        const sender = invocation.get_sender();
        let ungrabSucceeded = true;

        for (let i = 0; i < actions.length; i++)
            ungrabSucceeded &= this._ungrabAcceleratorForSender(actions[i], sender);

        invocation.return_value(GLib.Variant.new('(b)', [ungrabSucceeded]));
    }

    async ScreenTransitionAsync(params, invocation) {
        try {
            await this._senderChecker.checkInvocation(invocation);
        } catch (e) {
            invocation.return_gerror(e);
            return;
        }

        Main.layoutManager.screenTransition.run();

        invocation.return_value(null);
    }

    _emitAcceleratorSignal(signal, action, device, timestamp) {
        const destination = this._grabbedAccelerators.get(action);
        if (!destination)
            return;

        const context = global.create_app_launch_context(0, -1);
        const token = context.get_startup_notify_id(null, []);

        const params = {
            'timestamp': GLib.Variant.new('u', timestamp),
            'action-mode': GLib.Variant.new('u', Main.actionMode),
            'activation-token': GLib.Variant.new('s', token),
        };

        const deviceNode = device.get_device_node();
        if (deviceNode)
            params['device-node'] = GLib.Variant.new('s', deviceNode);

        emitSignalToDestination(
            this._dbusImpl,
            destination,
            signal,
            GLib.Variant.new('(ua{sv})', [action, params]));
    }

    _emitAcceleratorActivated(action, device, timestamp) {
        this._emitAcceleratorSignal(
            'AcceleratorActivated', action, device, timestamp);
    }

    _emitAcceleratorDeactivated(action, device, timestamp) {
        this._emitAcceleratorSignal(
            'AcceleratorDeactivated', action, device, timestamp);
    }

    _grabAcceleratorForSender(accelerator, modeFlags, grabFlags, sender) {
        const bindingAction = global.display.grab_accelerator(accelerator, grabFlags);
        if (bindingAction === Meta.KeyBindingAction.NONE)
            return Meta.KeyBindingAction.NONE;

        const bindingName = Meta.external_binding_name_for_action(bindingAction);
        Main.wm.allowKeybinding(bindingName, modeFlags);

        this._grabbedAccelerators.set(bindingAction, sender);

        if (!this._grabbers.has(sender)) {
            const id = Gio.bus_watch_name(Gio.BusType.SESSION,
                sender, 0, null, this._onGrabberBusNameVanished.bind(this));
            this._grabbers.set(sender, id);
        }

        return bindingAction;
    }

    _ungrabAccelerator(action) {
        const ungrabSucceeded = global.display.ungrab_accelerator(action);
        if (ungrabSucceeded)
            this._grabbedAccelerators.delete(action);

        return ungrabSucceeded;
    }

    _ungrabAcceleratorForSender(action, sender) {
        const grabbedBy = this._grabbedAccelerators.get(action);
        if (sender !== grabbedBy)
            return false;

        return this._ungrabAccelerator(action);
    }

    _onGrabberBusNameVanished(connection, name) {
        const grabs = this._grabbedAccelerators.entries();
        for (const [action, sender] of grabs) {
            if (sender === name)
                this._ungrabAccelerator(action);
        }
        Gio.bus_unwatch_name(this._grabbers.get(name));
        this._grabbers.delete(name);
    }

    async ShowMonitorLabelsAsync(params, invocation) {
        try {
            await this._senderChecker.checkInvocation(invocation);
        } catch (e) {
            invocation.return_gerror(e);
            return;
        }

        const sender = invocation.get_sender();
        const [dict] = params;
        Main.osdMonitorLabeler.show(sender, dict);
        invocation.return_value(null);
    }

    async HideMonitorLabelsAsync(params, invocation) {
        try {
            await this._senderChecker.checkInvocation(invocation);
        } catch (e) {
            invocation.return_gerror(e);
            return;
        }

        const sender = invocation.get_sender();
        Main.osdMonitorLabeler.hide(sender);
        invocation.return_value(null);
    }

    get Mode() {
        return global.session_mode;
    }

    get OverviewActive() {
        return KestrelUi.startOpen();
    }

    set OverviewActive(visible) {
        if (visible)
            KestrelUi.openStart();
        else
            KestrelUi.dismissImmediately();
    }

    get ShellVersion() {
        return Config.PACKAGE_VERSION;
    }
}

export class ScreenSaverDBus {
    constructor(screenShield) {
        this._screenShield = screenShield;
        screenShield.connect('active-changed', shield => {
            this._dbusImpl.emit_signal('ActiveChanged', GLib.Variant.new('(b)', [shield.active]));
        });
        screenShield.connect('wake-up-screen', () => {
            this._dbusImpl.emit_signal('WakeUpScreen', null);
        });

        this._dbusImpl = Gio.DBusExportedObject.wrapJSObject(ScreenSaverIface, this);
        this._dbusImpl.export(Gio.DBus.session, '/org/gnome/ScreenSaver');

        Gio.DBus.session.own_name('org.gnome.Shell.ScreenShield',
            Gio.BusNameOwnerFlags.NONE, null, null);
    }

    LockAsync(parameters, invocation) {
        const tmpId = this._screenShield.connect('lock-screen-shown', () => {
            this._screenShield.disconnect(tmpId);

            invocation.return_value(null);
        });

        this._screenShield.lock(true);
    }

    SetActive(active) {
        if (active)
            this._screenShield.activate(true);
        else
            this._screenShield.deactivate(false);
    }

    GetActive() {
        return this._screenShield.active;
    }

    GetActiveTime() {
        const started = this._screenShield.activationTime;
        if (started > 0)
            return Math.floor((GLib.get_monotonic_time() - started) / 1000000);
        else
            return 0;
    }
}

export class BrightnessDBus {
    constructor(brightnessManager) {
        this._manager = brightnessManager;

        this._dbusImpl = Gio.DBusExportedObject.wrapJSObject(BrightnessIface, this);
        this._dbusImpl.export(Gio.DBus.session, '/org/gnome/Shell/Brightness');

        Gio.DBus.session.own_name('org.gnome.Shell.Brightness',
            Gio.BusNameOwnerFlags.NONE, null, null);

        this._manager.connectObject(
            'changed', () => this._sync(),
            'user-update', () => this._userChange(),
            this);
        this._sync();
    }

    _sync() {
        const hasBrightnessControl = !!this._manager.globalScale;
        if (hasBrightnessControl === this._hasBrightnessControl)
            return;

        this._hasBrightnessControl = hasBrightnessControl;
        this._dbusImpl.emit_property_changed('HasBrightnessControl',
            new GLib.Variant('b', this._hasBrightnessControl));
    }

    _userChange() {
        this._dbusImpl.emit_signal('BrightnessChanged', null);
    }

    SetDimming(enable) {
        this._manager.dimming = enable;
    }

    SetAutoBrightnessTarget(target) {
        this._manager.autoBrightnessTarget = target;
    }

    get HasBrightnessControl() {
        return this._hasBrightnessControl;
    }
}
