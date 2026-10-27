import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import * as Config from './config.js';
import * as KestrelUi from '../kestrelUi.js';
import * as Screenshot from './screenshot/screenshot.js';

import {loadInterfaceXML} from './runtime/fileUtils.js';

const GnomeShellIface = loadInterfaceXML('org.gnome.Shell');
const ScreenSaverIface = loadInterfaceXML('org.gnome.ScreenSaver');
const BrightnessIface = loadInterfaceXML('com.lantharos.Kestrel.Brightness');

export class GnomeShell {
    constructor() {
        this._dbusImpl = Gio.DBusExportedObject.wrapJSObject(GnomeShellIface, this);
        this._dbusImpl.export(Gio.DBus.session, '/org/gnome/Shell');

        this._screenshotService = new Screenshot.ScreenshotService();
    }

    get Mode() {
        return global.session_mode;
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
        KestrelUi.ownOnItsOwnConnection('org.gnome.ScreenSaver', [[this._dbusImpl, '/org/gnome/ScreenSaver']], () => {});
    }

    LockAsync(parameters, invocation) {
        const tmpId = this._screenShield.connect('lock-screen-shown', () => {
            this._screenShield.disconnect(tmpId);

            invocation.return_value(null);
        });

        this._screenShield.lock(true);
    }

    SetActiveAsync([active], invocation) {
        if (active) {
            this._screenShield.activate(true);
        } else if (this._screenShield.locked) {
            invocation.return_error_literal(Gio.DBusError, Gio.DBusError.ACCESS_DENIED,
                'The screen is locked and only unlocks after signing in');
            return;
        } else {
            this._screenShield.deactivate(false);
        }
        invocation.return_value(null);
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
        this._dbusImpl.export(Gio.DBus.session, '/com/lantharos/Kestrel/Brightness');

        Gio.DBus.session.own_name('com.lantharos.Kestrel.Brightness',
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

    async SetDimmingAsync([enable], invocation) {
        if (await KestrelUi.refuseSandboxed(invocation, 'dim the screen'))
            return;
        this._manager.dimming = enable;
        invocation.return_value(null);
    }

    async SetAutoBrightnessTargetAsync([target], invocation) {
        if (await KestrelUi.refuseSandboxed(invocation, 'change the screen brightness'))
            return;
        this._manager.autoBrightnessTarget = target;
        invocation.return_value(null);
    }

    get HasBrightnessControl() {
        return this._hasBrightnessControl;
    }
}
