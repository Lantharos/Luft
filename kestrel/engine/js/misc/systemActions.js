import AccountsService from 'gi://AccountsService';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

import {logErrorUnlessCancelled} from './errorUtils.js';
import * as GnomeSession from './gnomeSession.js';
import * as Main from '../ui/main.js';

const LOCKDOWN_SCHEMA = 'org.gnome.desktop.lockdown';
const SCREENSAVER_SCHEMA = 'org.gnome.desktop.screensaver';
const DISABLE_LOCK_SCREEN_KEY = 'disable-lock-screen';
const DISABLE_LOG_OUT_KEY = 'disable-log-out';
const RESTART_ENABLED_KEY = 'restart-enabled';
const ALWAYS_SHOW_LOG_OUT_KEY = 'always-show-log-out';

const POWER_OFF_ACTION_ID        = 'power-off';
const RESTART_ACTION_ID          = 'restart';
const LOCK_SCREEN_ACTION_ID      = 'lock-screen';
const LOGOUT_ACTION_ID           = 'logout';
const SUSPEND_ACTION_ID          = 'suspend';
const LOCK_ORIENTATION_ACTION_ID = 'lock-orientation';

let _singleton = null;

/**
 * @returns {SystemActions}
 */
export function getDefault() {
    if (_singleton == null)
        _singleton = new SystemActions();

    return _singleton;
}

const SystemActions = GObject.registerClass({
    Properties: {
        'can-power-off': GObject.ParamSpec.boolean(
            'can-power-off', null, null,
            GObject.ParamFlags.READABLE,
            false),
        'can-restart': GObject.ParamSpec.boolean(
            'can-restart', null, null,
            GObject.ParamFlags.READABLE,
            false),
        'can-suspend': GObject.ParamSpec.boolean(
            'can-suspend', null, null,
            GObject.ParamFlags.READABLE,
            false),
        'can-lock-screen': GObject.ParamSpec.boolean(
            'can-lock-screen', null, null,
            GObject.ParamFlags.READABLE,
            false),
        'can-logout': GObject.ParamSpec.boolean(
            'can-logout', null, null,
            GObject.ParamFlags.READABLE,
            false),
        'can-lock-orientation': GObject.ParamSpec.boolean(
            'can-lock-orientation', null, null,
            GObject.ParamFlags.READABLE,
            false),
        'orientation-lock-icon': GObject.ParamSpec.string(
            'orientation-lock-icon', null, null,
            GObject.ParamFlags.READWRITE,
            null),
    },
}, class SystemActions extends GObject.Object {
    _init() {
        super._init();

        this._canHavePowerOff = true;
        this._powerOffNeedsAuth = false;
        this._canHaveReboot = true;
        this._rebootNeedsAuth = false;
        this._canHaveSuspend = true;
        this._suspendNeedsAuth = false;

        this._actions = new Map([
            [POWER_OFF_ACTION_ID, {available: false}],
            [RESTART_ACTION_ID, {available: false}],
            [LOCK_SCREEN_ACTION_ID, {available: false}],
            [LOGOUT_ACTION_ID, {available: false}],
            [SUSPEND_ACTION_ID, {available: false}],
            [LOCK_ORIENTATION_ACTION_ID, {iconName: '', available: false}],
        ]);

        this._lockdownSettings = new Gio.Settings({schema_id: LOCKDOWN_SCHEMA});
        this._orientationSettings = new Gio.Settings({schema_id: 'com.lantharos.kestrel.touchscreen'});
        this._screenSaverSettings = new Gio.Settings({schema_id: SCREENSAVER_SCHEMA});

        this._session = new GnomeSession.SessionManager();
        this._monitorManager = global.backend.get_monitor_manager();

        this._userManager = AccountsService.UserManager.get_default();

        this._userManager.connect('notify::is-loaded',
            () => this._updateLogout());
        this._userManager.connect('notify::has-multiple-users',
            () => this._updateLogout());
        this._userManager.connect('user-added',
            () => this._updateLogout());
        this._userManager.connect('user-removed',
            () => this._updateLogout());

        this._user = this._userManager.get_user(GLib.get_user_name());

        this._user.connect('notify::is-loaded', () => this._updateLogout());

        this._lockdownSettings.connect(`changed::${DISABLE_LOG_OUT_KEY}`,
            () => this._updateLogout());
        global.settings.connect(`changed::${ALWAYS_SHOW_LOG_OUT_KEY}`,
            () => this._updateLogout());

        this._lockdownSettings.connect(`changed::${DISABLE_LOCK_SCREEN_KEY}`,
            () => this._updateLockScreen());

        this._lockdownSettings.connect(`changed::${DISABLE_LOG_OUT_KEY}`, () => {
            this._updateHaveShutdown();
            this._updateHaveReboot();
        });

        this._screenSaverSettings.connect(`changed::${RESTART_ENABLED_KEY}`, () => {
            this._updateHaveShutdown();
            this._updateHaveReboot();
        });

        this.forceUpdate();

        this._orientationSettings.connect('changed::orientation-lock', () => {
            this._updateOrientationLock();
            this._updateOrientationLockStatus();
        });
        Main.layoutManager.connect('monitors-changed',
            () => this._updateOrientationLock());
        this._monitorManager.connect('notify::panel-orientation-managed',
            () => this._updateOrientationLock());
        this._updateOrientationLock();
        this._updateOrientationLockStatus();

        Main.sessionMode.connect('updated', () => this._sessionUpdated());
        this._sessionUpdated();
    }

    get canPowerOff() {
        return this._actions.get(POWER_OFF_ACTION_ID).available;
    }

    get canRestart() {
        return this._actions.get(RESTART_ACTION_ID).available;
    }

    get canSuspend() {
        return this._actions.get(SUSPEND_ACTION_ID).available;
    }

    get canLockScreen() {
        return this._actions.get(LOCK_SCREEN_ACTION_ID).available;
    }

    get canLogout() {
        return this._actions.get(LOGOUT_ACTION_ID).available;
    }

    get canLockOrientation() {
        return this._actions.get(LOCK_ORIENTATION_ACTION_ID).available;
    }

    get orientationLockIcon() {
        return this._actions.get(LOCK_ORIENTATION_ACTION_ID).iconName;
    }

    _updateOrientationLock() {
        const available = this._monitorManager.get_panel_orientation_managed();

        this._actions.get(LOCK_ORIENTATION_ACTION_ID).available = available;

        this.notify('can-lock-orientation');
    }

    _updateOrientationLockStatus() {
        const locked = this._orientationSettings.get_boolean('orientation-lock');
        this._actions.get(LOCK_ORIENTATION_ACTION_ID).iconName = locked
            ? 'rotation-locked-symbolic'
            : 'rotation-allowed-symbolic';

        this.notify('orientation-lock-icon');
    }

    _sessionUpdated() {
        this._updateLockScreen();
        this._updatePowerOff();
        this._updateReboot();
        this._updateSuspend();
        this._updateLogout();
    }

    forceUpdate() {
        // Whether those actions are available or not depends on both lockdown
        // settings and Polkit policy - we don't get change notifications for the
        // latter, so their value may be outdated; force an update now
        this._updateHaveShutdown();
        this._updateHaveReboot();
        this._updateHaveSuspend();
    }

    _updateLockScreen() {
        const showLock = !Main.sessionMode.isLocked;
        const allowLockScreen = !this._lockdownSettings.get_boolean(DISABLE_LOCK_SCREEN_KEY);
        this._actions.get(LOCK_SCREEN_ACTION_ID).available = showLock && allowLockScreen;
        this.notify('can-lock-screen');
    }

    async _updateHaveShutdown() {
        try {
            const [availability] = await this._session.CanShutdownAsync();
            this._canHavePowerOff = availability !== GnomeSession.ActionAvailability.UNAVAILABLE;
            this._powerOffNeedsAuth = availability === GnomeSession.ActionAvailability.CHALLENGE;
        } catch {
            this._canHavePowerOff = false;
            this._powerOffNeedsAuth = false;
        }
        this._updatePowerOff();
    }

    _updatePowerOff() {
        const disabled = (Main.sessionMode.isLocked &&
                        !this._screenSaverSettings.get_boolean(RESTART_ENABLED_KEY)) ||
                       (Main.sessionMode.isLocked && this._powerOffNeedsAuth);
        this._actions.get(POWER_OFF_ACTION_ID).available = this._canHavePowerOff && !disabled;
        this.notify('can-power-off');
    }

    async _updateHaveReboot() {
        try {
            const [availability] = await this._session.CanRebootAsync();
            this._canHaveReboot = availability !== GnomeSession.ActionAvailability.UNAVAILABLE;
            this._rebootNeedsAuth = availability === GnomeSession.ActionAvailability.CHALLENGE;
        } catch {
            this._canHaveReboot = false;
            this._rebootNeedsAuth = false;
        }
        this._updateReboot();
    }

    _updateReboot() {
        const disabled = (Main.sessionMode.isLocked &&
                        !this._screenSaverSettings.get_boolean(RESTART_ENABLED_KEY)) ||
                       (Main.sessionMode.isLocked && this._rebootNeedsAuth);
        this._actions.get(RESTART_ACTION_ID).available = this._canHaveReboot && !disabled;
        this.notify('can-restart');
    }

    async _updateHaveSuspend() {
        try {
            const [availability] = await this._session.CanSuspendAsync();
            this._canHaveSuspend = availability !== GnomeSession.ActionAvailability.UNAVAILABLE;
            this._suspendNeedsAuth = availability === GnomeSession.ActionAvailability.CHALLENGE;
        } catch {
            this._canHaveSuspend = false;
            this._suspendNeedsAuth = false;
        }
        this._updateSuspend();
    }

    _updateSuspend() {
        const disabled = Main.sessionMode.isLocked && this._suspendNeedsAuth;
        this._actions.get(SUSPEND_ACTION_ID).available = this._canHaveSuspend && !disabled;
        this.notify('can-suspend');
    }

    _updateLogout() {
        const allowLogout = !this._lockdownSettings.get_boolean(DISABLE_LOG_OUT_KEY);
        const alwaysShow = global.settings.get_boolean(ALWAYS_SHOW_LOG_OUT_KEY);
        const {systemAccount, localAccount} = this._user;
        const multiUser = this._userManager.has_multiple_users;
        const shouldShowInMode = !Main.sessionMode.isLocked;

        const visible = allowLogout && (alwaysShow || multiUser || systemAccount || !localAccount) && shouldShowInMode;
        this._actions.get(LOGOUT_ACTION_ID).available = visible;
        this.notify('can-logout');

        return visible;
    }

    activateLockOrientation() {
        if (!this._actions.get(LOCK_ORIENTATION_ACTION_ID).available)
            throw new Error('The lock-orientation action is not available!');

        const locked = this._orientationSettings.get_boolean('orientation-lock');
        this._orientationSettings.set_boolean('orientation-lock', !locked);
    }

    activateLockScreen() {
        if (!this._actions.get(LOCK_SCREEN_ACTION_ID).available)
            throw new Error('The lock-screen action is not available!');

        Main.screenShield.lock(true);
    }

    activateLogout() {
        if (!this._actions.get(LOGOUT_ACTION_ID).available)
            throw new Error('The logout action is not available!');

        this._session.LogoutAsync(0).catch(logErrorUnlessCancelled);
    }

    activatePowerOff() {
        if (!this._actions.get(POWER_OFF_ACTION_ID).available)
            throw new Error('The power-off action is not available!');

        this._session.ShutdownAsync(0).catch(logErrorUnlessCancelled);
    }

    activateRestart() {
        if (!this._actions.get(RESTART_ACTION_ID).available)
            throw new Error('The restart action is not available!');

        this._session.RebootAsync().catch(logErrorUnlessCancelled);
    }

    activateSuspend() {
        if (!this._actions.get(SUSPEND_ACTION_ID).available)
            throw new Error('The suspend action is not available!');

        this._session.SuspendAsync().catch(logErrorUnlessCancelled);
    }
});
