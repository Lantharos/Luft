import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

import {loadInterfaceXML} from '../../../misc/fileUtils.js';
import {BluetoothDevice, BUS_NAME, DEVICE_INTERFACE} from './device.js';
import {Reconnector} from './reconnect.js';

const ADAPTER_INTERFACE = 'org.bluez.Adapter1';
const RFKILL_BUS_NAME = 'com.lantharos.Settings.Rfkill';
const RFKILL_OBJECT_PATH = '/com/lantharos/Settings/Rfkill';
const STATE_CHANGE_FAILED_TIMEOUT_MS = 30 * 1000;
const POWER_STATES = new Map([
    ['on', 'on'],
    ['off', 'off'],
    ['off-blocked', 'off'],
    ['off-enabling', 'turning-on'],
    ['on-disabling', 'turning-off'],
]);

const rfkillInfo = Gio.DBusInterfaceInfo.new_for_xml(loadInterfaceXML('com.lantharos.Settings.Rfkill'));

const BluetoothClient = GObject.registerClass({
    Properties: {
        'available': GObject.ParamSpec.boolean('available', null, null, GObject.ParamFlags.READABLE, false),
        'active': GObject.ParamSpec.boolean('active', null, null, GObject.ParamFlags.READABLE, false),
        'adapter-state': GObject.ParamSpec.string('adapter-state', null, null, GObject.ParamFlags.READABLE, 'absent'),
    },
    Signals: {
        'devices-changed': {},
        'device-removed': {param_types: [GObject.TYPE_STRING]},
    },
}, class BluetoothClient extends GObject.Object {
    constructor() {
        super();

        this._adapter = null;
        this._devices = new Map();
        this._predictedState = null;

        this._rfkill = new Gio.DBusProxy({
            g_connection: Gio.DBus.session,
            g_name: RFKILL_BUS_NAME,
            g_object_path: RFKILL_OBJECT_PATH,
            g_interface_name: rfkillInfo.name,
            g_interface_info: rfkillInfo,
        });
        this._rfkill.connect('g-properties-changed', (proxy, properties) => {
            const changed = properties.unpack();
            if ('BluetoothHardwareAirplaneMode' in changed || 'BluetoothHasAirplaneMode' in changed)
                this.notify('available');
        });
        this._rfkill.init_async(GLib.PRIORITY_DEFAULT, null)
            .catch(e => console.error(e.message));

        this._reconnector = new Reconnector(this);

        Gio.DBusObjectManagerClient.new_for_bus(Gio.BusType.SYSTEM,
            Gio.DBusObjectManagerClientFlags.DO_NOT_AUTO_START, BUS_NAME, '/', null, null,
            (source, result) => {
                try {
                    this._watch(Gio.DBusObjectManagerClient.new_for_bus_finish(result));
                } catch (e) {
                    console.error(`Could not watch Bluetooth: ${e.message}`);
                }
            });
    }

    get available() {
        return this._rfkill.BluetoothHasAirplaneMode && !this._rfkill.BluetoothHardwareAirplaneMode;
    }

    get active() {
        return this._adapterValue('Powered') ?? false;
    }

    get adapter_state() {
        if (this._predictedState)
            return this._predictedState;
        if (!this._adapter)
            return 'absent';
        return POWER_STATES.get(this._adapterValue('PowerState')) ?? (this.active ? 'on' : 'off');
    }

    toggleActive() {
        const {active} = this;

        this._predictedState = active ? 'turning-off' : 'turning-on';
        this.notify('adapter-state');
        setTimeout(() => this._adapterStateChanged(), STATE_CHANGE_FAILED_TIMEOUT_MS);

        this._rfkill.BluetoothAirplaneMode = active;
        if (!active && this._adapter)
            this._setPowered(true).catch(e => console.debug(`Could not turn Bluetooth on: ${e.message}`));
    }

    async toggleDevice(device) {
        const connect = !device.connected;
        if (!connect)
            this._reconnector.forget(device.address);

        try {
            await device.setConnected(connect);
        } catch (e) {
            console.error(`Failed to ${connect ? 'connect' : 'disconnect'} device "${device.alias}": ${e.message}`);
        }
    }

    *getDevices() {
        if (!this.active)
            return;

        for (const device of this._devices.values()) {
            if (device.paired || device.trusted)
                yield device;
        }
    }

    get devices() {
        return this._devices.values();
    }

    _adapterValue(name) {
        return this._adapter?.get_cached_property(name)?.unpack();
    }

    _setPowered(powered) {
        return this._adapter.g_connection.call(BUS_NAME, this._adapter.g_object_path,
            'org.freedesktop.DBus.Properties', 'Set',
            new GLib.Variant('(ssv)', [ADAPTER_INTERFACE, 'Powered', GLib.Variant.new_boolean(powered)]),
            null, Gio.DBusCallFlags.NONE, -1, null);
    }

    _adapterStateChanged() {
        this._predictedState = null;
        this.notify('adapter-state');
    }

    _watch(manager) {
        this._manager = manager;
        manager.connect('object-added', (m, object) => object.get_interfaces().forEach(iface => this._interfaceAdded(iface)));
        manager.connect('object-removed', (m, object) => object.get_interfaces().forEach(iface => this._interfaceRemoved(iface)));
        manager.connect('interface-added', (m, object, iface) => this._interfaceAdded(iface));
        manager.connect('interface-removed', (m, object, iface) => this._interfaceRemoved(iface));

        const adapter = this._latestAdapter();
        if (adapter)
            this._setAdapter(adapter);
    }

    _interfaces(name) {
        return this._manager.get_objects().map(object => object.get_interface(name)).filter(iface => iface);
    }

    _latestAdapter(removedPath) {
        return this._interfaces(ADAPTER_INTERFACE)
            .filter(adapter => adapter.g_object_path !== removedPath)
            .reduce((latest, adapter) => !latest || adapter.g_object_path > latest.g_object_path ? adapter : latest, null);
    }

    _interfaceAdded(iface) {
        const name = iface.g_interface_name;
        if (name === ADAPTER_INTERFACE) {
            if (!this._adapter || iface.g_object_path > this._adapter.g_object_path)
                this._setAdapter(iface);
            else if (iface.g_object_path === this._adapter.g_object_path)
                this._watchAdapter(iface);
        } else if (name === DEVICE_INTERFACE && this._adapter) {
            this._addDevice(iface);
        }
    }

    _interfaceRemoved(iface) {
        const name = iface.g_interface_name;
        if (name === ADAPTER_INTERFACE && iface.g_object_path === this._adapter?.g_object_path) {
            this._setAdapter(this._latestAdapter(iface.g_object_path));
        } else if (name === DEVICE_INTERFACE) {
            this._removeDevice(iface.g_object_path);
        }
    }

    _watchAdapter(adapter) {
        this._adapter?.disconnectObject(this);
        this._adapter = adapter;
        adapter?.connectObject('g-properties-changed', (proxy, properties) => {
            const changed = properties.unpack();
            if ('Powered' in changed)
                this.notify('active');
            if ('PowerState' in changed || ('Powered' in changed && this._adapterValue('PowerState') === undefined))
                this._adapterStateChanged();
        }, this);
    }

    _setAdapter(adapter) {
        for (const path of [...this._devices.keys()])
            this._removeDevice(path);
        this._watchAdapter(adapter);
        if (adapter)
            this._interfaces(DEVICE_INTERFACE).forEach(device => this._addDevice(device, false));

        this.notify('active');
        this._adapterStateChanged();
        this.emit('devices-changed');
    }

    _addDevice(proxy, announce = true) {
        const path = proxy.g_object_path;
        if (this._devices.has(path))
            return;

        const device = new BluetoothDevice(proxy);
        if (device.adapter !== this._adapter.g_object_path) {
            device.destroy();
            return;
        }

        this._devices.set(path, device);
        device.connectObject(
            'notify::alias', () => this._queueDevicesChanged(),
            'notify::paired', () => this._queueDevicesChanged(),
            'notify::trusted', () => this._queueDevicesChanged(),
            'notify::connected', () => {
                this._reconnector.connectionChanged(device);
                this._queueDevicesChanged();
            }, this);
        if (device.connected)
            this._reconnector.connectionChanged(device);
        if (announce)
            this.emit('devices-changed');
    }

    _removeDevice(path) {
        const device = this._devices.get(path);
        if (!device)
            return;

        this._devices.delete(path);
        device.disconnectObject(this);
        device.destroy();
        this.emit('device-removed', path);
        this.emit('devices-changed');
    }

    _queueDevicesChanged() {
        if (this._devicesChangedId)
            return;
        this._devicesChangedId = GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => {
            delete this._devicesChangedId;
            this.emit('devices-changed');
        });
    }
});

let client = null;

export function getBluetoothClient() {
    client ??= new BluetoothClient();
    return client;
}
