import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {loadInterfaceXML} from './fileUtils.js';

const INTROSPECT_DBUS_API_VERSION = 3;

const IntrospectDBusIface = loadInterfaceXML('com.lantharos.Kestrel.Introspect');

export class IntrospectService {
    constructor() {
        this._dbusImpl =
            Gio.DBusExportedObject.wrapJSObject(IntrospectDBusIface, this);
        this._dbusImpl.export(Gio.DBus.session, '/com/lantharos/Kestrel/Introspect');
        Gio.DBus.session.own_name('com.lantharos.Kestrel.Introspect',
            Gio.BusNameOwnerFlags.REPLACE,
            null, null);

        this._animationsEnabled = true;

        this._settings = St.Settings.get();
        this._settings.connect('notify::enable-animations',
            this._syncAnimationsEnabled.bind(this));
        this._syncAnimationsEnabled();

        const monitorManager = global.backend.get_monitor_manager();
        monitorManager.connect('monitors-changed',
            this._syncScreenSize.bind(this));
        this._syncScreenSize();
    }

    _syncAnimationsEnabled() {
        const wasAnimationsEnabled = this._animationsEnabled;
        this._animationsEnabled = this._settings.enable_animations;
        if (wasAnimationsEnabled !== this._animationsEnabled) {
            const variant = new GLib.Variant('b', this._animationsEnabled);
            this._dbusImpl.emit_property_changed('AnimationsEnabled', variant);
        }
    }

    _syncScreenSize() {
        const oldScreenWidth = this._screenWidth;
        const oldScreenHeight = this._screenHeight;
        this._screenWidth = global.screen_width;
        this._screenHeight = global.screen_height;

        if (oldScreenWidth !== this._screenWidth ||
            oldScreenHeight !== this._screenHeight) {
            const variant = new GLib.Variant('(ii)',
                [this._screenWidth, this._screenHeight]);
            this._dbusImpl.emit_property_changed('ScreenSize', variant);
        }
    }

    get AnimationsEnabled() {
        return this._animationsEnabled;
    }

    get ScreenSize() {
        return [this._screenWidth, this._screenHeight];
    }

    get version() {
        return INTROSPECT_DBUS_API_VERSION;
    }
}
