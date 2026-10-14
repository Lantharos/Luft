import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {loadInterfaceXML} from './fileUtils.js';

export const UpdateAction = {
    REBOOT: 'reboot',
    POWER_OFF: 'power-off',
};

const COMPOSEFS_ROOT = /(^|\s)composefs(\.digest)?=/;
const VERSION_LABEL = 'org.opencontainers.image.version';

const OfflineUpdatesIface = loadInterfaceXML('org.freedesktop.PackageKit.Offline');
const OfflineUpdatesProxy = Gio.DBusProxy.makeProxyWrapper(OfflineUpdatesIface);

const UPDATER = 'com.lantharos.Updater1';
const UPDATER_PATH = '/com/lantharos/Updater1';
const CALL_TIMEOUT = 10000;

class OfflineUpdates {
    constructor(proxy) {
        this._proxy = proxy;
        this.scheduled = proxy.UpdateTriggered ?? false;
        this.prepared = !this.scheduled && (proxy.UpdatePrepared ?? false);
        this.version = null;
    }

    static async load() {
        const proxy = await OfflineUpdatesProxy.newAsync(
            Gio.DBus.system, 'org.freedesktop.PackageKit', '/org/freedesktop/PackageKit');
        // A proxy for a missing service still gets created, without an owner.
        return proxy.g_name_owner === null ? null : new OfflineUpdates(proxy);
    }

    async installThroughRestart(action) {
        await this._proxy.TriggerAsync(action);
        return true;
    }

    async skip() {
        await this._proxy.CancelAsync();
    }
}

function startedFromImage() {
    const [, commandLine] = GLib.file_get_contents('/proc/cmdline');
    return COMPOSEFS_ROOT.test(new TextDecoder().decode(commandLine));
}

async function callUpdater(method, flags = Gio.DBusCallFlags.NONE) {
    const reply = await Gio.DBus.system.call(
        UPDATER, UPDATER_PATH, UPDATER, method, null, null, flags, CALL_TIMEOUT, null);
    return reply.deepUnpack();
}

class StagedImage {
    constructor(staged, version) {
        this.scheduled = !staged.downloadOnly;
        this.prepared = staged.downloadOnly;
        this.version = version;
    }

    static async load() {
        const [json] = await callUpdater('Status');
        const {host, configs} = JSON.parse(json);
        const staged = host.status.staged;
        if (!staged)
            return null;
        const label = configs[staged.image?.imageDigest]?.config?.Labels?.[VERSION_LABEL];
        return new StagedImage(staged, label ?? staged.image?.version ?? null);
    }

    async installThroughRestart() {
        await callUpdater('Apply', Gio.DBusCallFlags.ALLOW_INTERACTIVE_AUTHORIZATION);
        return false;
    }

    async skip() {
    }
}

/**
 * Updates waiting to be installed when the computer restarts: PackageKit's
 * offline update on a regular install, or a downloaded image on an image-based
 * one. A downloaded image is only installed once Apply unlocks it, so skipping
 * it needs nothing.
 *
 * @returns {Promise<OfflineUpdates | StagedImage | null>}
 */
export async function loadPendingUpdates() {
    try {
        if (startedFromImage())
            return await StagedImage.load();
        return await OfflineUpdates.load();
    } catch (error) {
        log(`Pending updates: ${error.message}`);
        return null;
    }
}
