import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import * as Config from '../misc/config.js';
import * as Screenshot from './screenshot.js';

import {loadInterfaceXML} from '../misc/fileUtils.js';

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
        this._dbusImpl.export(Gio.DBus.session, '/org/gnome/ScreenSaver');

        Gio.DBus.session.own_name('org.gnome.ScreenSaver',
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
