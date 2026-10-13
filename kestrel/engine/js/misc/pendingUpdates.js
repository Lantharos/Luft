import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {loadInterfaceXML} from './fileUtils.js';

Gio._promisify(Gio.DBusConnection, 'new_for_address');
Gio._promisify(Gio.DBusConnection.prototype, 'close');

export const UpdateAction = {
    REBOOT: 'reboot',
    POWER_OFF: 'power-off',
};

const IMAGE_BOOTED = '/run/ostree-booted';
const IMAGE_STAGED = '/run/ostree/staged-deployment';

const OfflineUpdatesIface = loadInterfaceXML('org.freedesktop.PackageKit.Offline');
const OfflineUpdatesProxy = Gio.DBusProxy.makeProxyWrapper(OfflineUpdatesIface);

const RPM_OSTREE = 'org.projectatomic.rpmostree1';
const SYSROOT_PATH = '/org/projectatomic/rpmostree1/Sysroot';
const SYSROOT = 'org.projectatomic.rpmostree1.Sysroot';
const OS = 'org.projectatomic.rpmostree1.OS';
const TRANSACTION = 'org.projectatomic.rpmostree1.Transaction';
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

async function systemCall(path, iface, method, parameters, replyType) {
    const reply = await Gio.DBus.system.call(
        RPM_OSTREE, path, iface, method, parameters, new GLib.VariantType(replyType),
        Gio.DBusCallFlags.NONE, CALL_TIMEOUT, null);
    return reply.deepUnpack();
}

const sysrootProperty = async name => {
    const [value] = await systemCall(SYSROOT_PATH, 'org.freedesktop.DBus.Properties', 'Get',
        new GLib.Variant('(ss)', [SYSROOT, name]), '(v)');
    return value.recursiveUnpack();
};

function finished(peer) {
    return new Promise((resolve, reject) => {
        const id = peer.signal_subscribe(null, TRANSACTION, 'Finished', '/', null, Gio.DBusSignalFlags.NONE,
            (_connection, _sender, _path, _iface, _signal, parameters) => {
                peer.signal_unsubscribe(id);
                const [success, error] = parameters.deepUnpack();
                if (success)
                    resolve();
                else
                    reject(new Error(error));
            });
    });
}

async function runTransaction(address) {
    const peer = await Gio.DBusConnection.new_for_address(address,
        Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT, null, null);
    const done = finished(peer);
    await peer.call(null, '/', TRANSACTION, 'Start', null, null, Gio.DBusCallFlags.NONE, CALL_TIMEOUT, null);
    await done;
    await peer.close(null);
}

class StagedImage {
    constructor(version) {
        this.scheduled = false;
        this.prepared = true;
        this.version = version;
    }

    static async load() {
        if (!GLib.file_test(IMAGE_STAGED, GLib.FileTest.EXISTS))
            return null;
        const deployments = await sysrootProperty('Deployments');
        const booted = deployments.find(deployment => deployment.booted);
        const staged = deployments.find(deployment => deployment.staged && !deployment.booted);
        if (!staged)
            return null;
        return new StagedImage(staged.version !== booted?.version ? staged.version ?? null : null);
    }

    async installThroughRestart() {
        return false;
    }

    async skip() {
        const os = await sysrootProperty('Booted');
        const [address] = await systemCall(os, OS, 'Cleanup', new GLib.Variant('(as)', [['pending']]), '(s)');
        await runTransaction(address);
    }
}

/**
 * Updates waiting to be installed when the computer restarts: PackageKit's
 * offline update on a regular install, or a staged image on an image-based one.
 *
 * @returns {Promise<OfflineUpdates | StagedImage | null>}
 */
export async function loadPendingUpdates() {
    try {
        if (GLib.file_test(IMAGE_BOOTED, GLib.FileTest.EXISTS))
            return await StagedImage.load();
        return await OfflineUpdates.load();
    } catch (error) {
        log(`Pending updates: ${error.message}`);
        return null;
    }
}
