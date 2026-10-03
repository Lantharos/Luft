import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {getLoginManager} from '../../../misc/loginManager.js';

const STATE_KEY = 'bluetooth-reconnect';
const SETTLE_SECONDS = 2;
const RETRY_SECONDS = [5, 15, 45, 120];
const FORGET_AFTER_MS = 3000;

export class Reconnector {
    constructor(client) {
        this._client = client;
        this._remembered = new Set(global.get_persistent_state('as', STATE_KEY)?.deepUnpack() ?? []);
        this._forgetTimers = new Map();
        this._retryId = 0;
        this._round = 0;
        this._cancellable = null;
        this._loginManager = getLoginManager();

        this._client.connect('notify::active', () => this._adapterChanged());
        this._loginManager.connect('prepare-for-sleep', (manager, aboutToSuspend) => {
            if (aboutToSuspend)
                this._stop();
            else
                this._adapterChanged();
        });
        this._adapterChanged();
    }

    connectionChanged(device) {
        const {address} = device;
        this._cancelForget(address);
        if (device.connected) {
            this._remember(address);
            return;
        }
        if (!this._adapterUp)
            return;
        this._forgetTimers.set(address, GLib.timeout_add(GLib.PRIORITY_DEFAULT, FORGET_AFTER_MS, () => {
            this._forgetTimers.delete(address);
            if (this._adapterUp && !device.connected)
                this.forget(address);
            return GLib.SOURCE_REMOVE;
        }));
    }

    forget(address) {
        this._cancelForget(address);
        if (!this._remembered.delete(address))
            return;
        this._save();
    }

    get _adapterUp() {
        return this._client.active && !this._loginManager.preparingForSleep;
    }

    _remember(address) {
        if (this._remembered.has(address))
            return;
        this._remembered.add(address);
        this._save();
    }

    _save() {
        global.set_persistent_state(STATE_KEY, new GLib.Variant('as', [...this._remembered]));
    }

    _cancelForget(address) {
        const id = this._forgetTimers.get(address);
        if (!id)
            return;
        GLib.source_remove(id);
        this._forgetTimers.delete(address);
    }

    _stop() {
        for (const address of [...this._forgetTimers.keys()])
            this._cancelForget(address);
        if (this._retryId)
            GLib.source_remove(this._retryId);
        this._retryId = 0;
        this._cancellable?.cancel();
        this._cancellable = null;
    }

    _adapterChanged() {
        this._stop();
        if (!this._adapterUp)
            return;
        this._round = 0;
        this._schedule(SETTLE_SECONDS);
    }

    _schedule(seconds) {
        this._retryId = GLib.timeout_add_seconds(GLib.PRIORITY_LOW, seconds, () => {
            this._retryId = 0;
            this._reconnect().catch(logError);
            return GLib.SOURCE_REMOVE;
        });
    }

    _waiting() {
        return [...this._client.devices].filter(device =>
            this._remembered.has(device.address) && device.paired && device.trusted && !device.connected);
    }

    async _reconnect() {
        const cancellable = new Gio.Cancellable();
        this._cancellable = cancellable;
        for (const device of this._waiting()) {
            if (!this._remembered.has(device.address) || device.connected)
                continue;
            try {
                await device.setConnected(true, cancellable);
            } catch (e) {
                if (cancellable.is_cancelled())
                    return;
                console.debug(`Could not reconnect "${device.alias}": ${e.message}`);
            }
        }
        this._cancellable = null;
        if (this._round < RETRY_SECONDS.length && this._waiting().length > 0)
            this._schedule(RETRY_SECONDS[this._round++]);
    }
}
