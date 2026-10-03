import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Shell from 'gi://Shell';

export const BUS_NAME = 'org.bluez';
export const DEVICE_INTERFACE = 'org.bluez.Device1';

const CONNECTABLE_SERVICES = new Set([0x1108, 0x110a, 0x110b, 0x110c, 0x110e, 0x1112, 0x111e, 0x111f, 0x1124, 0x1812]);
const MIDI_SERVICE = '03b80e5a-ede8-4b33-a751-6ce34ec4c700';
const VENDOR_SERVICE_SUFFIX = '-0000-1000-8000-0002ee000002';
const GAME_CONTROLLERS = new Set(['ION iCade Game Controller', '8Bitdo Zero GamePad']);
const PHONE_ICONS = [['Apple', 'phone-apple-iphone'], ['Samsung', 'phone-samsung-galaxy-s'], ['Google', 'phone-google-nexus-one']];
const KIND_ICONS = new Map([
    ['headset', 'audio-headset'],
    ['headphones', 'audio-headphones'],
    ['audio', 'audio-speakers'],
    ['display', 'video-display'],
    ['scanner', 'scanner'],
]);

const phoneIcons = new Map();

function isConnectable(uuids) {
    return uuids.some(uuid => uuid.toLowerCase() === MIDI_SERVICE ||
        (!uuid.endsWith(VENDOR_SERVICE_SUFFIX) && CONNECTABLE_SERVICES.has(parseInt(uuid, 16))));
}

function appearanceKind(appearance) {
    const sub = appearance & 0x3f;
    switch (appearance >> 6) {
    case 0x01: return 'phone';
    case 0x02: return 'computer';
    case 0x05: return 'display';
    case 0x0a: return 'audio';
    case 0x0b: return 'scanner';
    case 0x0f: return {1: 'keyboard', 2: 'mouse', 3: 'joypad', 4: 'joypad', 5: 'tablet', 8: 'scanner'}[sub] ?? null;
    case 0x21: return 'speakers';
    case 0x25: return {1: 'headset', 2: 'headset', 3: 'headphones', 4: 'headset'}[sub] ?? 'audio';
    default: return null;
    }
}

function peripheralKind(deviceClass) {
    const minor = (deviceClass & 0x1e) >> 2;
    switch ((deviceClass & 0xc0) >> 6) {
    case 0x00: return {1: 'joypad', 2: 'joypad', 3: 'remote'}[minor] ?? null;
    case 0x01: return 'keyboard';
    case 0x02: return minor === 5 ? 'tablet' : 'mouse';
    default: return null;
    }
}

function imagingKind(deviceClass) {
    if (deviceClass & 0x80)
        return 'printer';
    if (deviceClass & 0x40)
        return 'scanner';
    if (deviceClass & 0x20)
        return 'camera';
    return deviceClass & 0x10 ? 'display' : null;
}

function classKind(deviceClass) {
    const minor = (deviceClass & 0xfc) >> 2;
    switch ((deviceClass & 0x1f00) >> 8) {
    case 0x01: return 'computer';
    case 0x02: return {1: 'phone', 2: 'phone', 3: 'phone', 4: 'modem', 5: 'phone'}[minor] ?? null;
    case 0x03: return 'network';
    case 0x04: return {1: 'headset', 2: 'headset', 5: 'speakers', 6: 'headphones', 11: 'video', 12: 'video', 13: 'video'}[minor] ?? 'audio';
    case 0x05: return peripheralKind(deviceClass);
    case 0x06: return imagingKind(deviceClass);
    case 0x07: return 'wearable';
    case 0x08: return 'toy';
    default: return null;
    }
}

function phoneIcon(address) {
    if (!phoneIcons.has(address)) {
        const vendor = Shell.systemd_get_oui_vendor(address) ?? '';
        phoneIcons.set(address, PHONE_ICONS.find(([name]) => vendor.includes(name))?.[1] ?? null);
    }
    return phoneIcons.get(address);
}

function kindIcon(kind, name, address) {
    if (kind === 'phone')
        return phoneIcon(address);
    if (kind === 'mouse' && name?.toLowerCase().includes('tablet'))
        return 'input-tablet';
    return KIND_ICONS.get(kind) ?? null;
}

export const BluetoothDevice = GObject.registerClass({
    Properties: {
        'alias': GObject.ParamSpec.string('alias', null, null, GObject.ParamFlags.READABLE, ''),
        'icon': GObject.ParamSpec.string('icon', null, null, GObject.ParamFlags.READABLE, 'bluetooth'),
        'paired': GObject.ParamSpec.boolean('paired', null, null, GObject.ParamFlags.READABLE, false),
        'trusted': GObject.ParamSpec.boolean('trusted', null, null, GObject.ParamFlags.READABLE, false),
        'connected': GObject.ParamSpec.boolean('connected', null, null, GObject.ParamFlags.READABLE, false),
        'connectable': GObject.ParamSpec.boolean('connectable', null, null, GObject.ParamFlags.READABLE, false),
    },
}, class BluetoothDevice extends GObject.Object {
    constructor(proxy) {
        super();
        this._proxy = proxy;
        this._state = {};
        this._sync();
        proxy.connectObject('g-properties-changed', () => this._sync(), this);
    }

    get alias() {
        return this._state.alias;
    }

    get icon() {
        return this._state.icon;
    }

    get paired() {
        return this._state.paired;
    }

    get trusted() {
        return this._state.trusted;
    }

    get connected() {
        return this._state.connected;
    }

    get connectable() {
        return this._state.connectable;
    }

    get address() {
        return this._value('Address') ?? '';
    }

    get adapter() {
        return this._value('Adapter');
    }

    get_object_path() {
        return this._proxy.g_object_path;
    }

    async setConnected(connected, cancellable = null) {
        await this._proxy.g_connection.call(BUS_NAME, this._proxy.g_object_path, DEVICE_INTERFACE,
            connected ? 'Connect' : 'Disconnect', null, null, Gio.DBusCallFlags.NONE, -1, cancellable);
    }

    destroy() {
        this._proxy.disconnectObject(this);
    }

    _value(name) {
        return this._proxy.get_cached_property(name)?.unpack();
    }

    _icon() {
        const name = this._value('Name');
        if (GAME_CONTROLLERS.has(name))
            return 'input-gaming';
        const kind = appearanceKind(this._value('Appearance') ?? 0) ?? classKind(this._value('Class') ?? 0);
        return kindIcon(kind, name, this.address) || this._value('Icon') || 'bluetooth';
    }

    _sync() {
        const state = {
            alias: this._value('Alias') ?? '',
            icon: this._icon(),
            paired: this._value('Paired') ?? false,
            trusted: this._value('Trusted') ?? false,
            connected: this._value('Connected') ?? false,
            connectable: isConnectable(this._proxy.get_cached_property('UUIDs')?.deepUnpack() ?? []),
        };
        const previous = this._state;
        this._state = state;
        this.freeze_notify();
        for (const key of Object.keys(state)) {
            if (previous[key] !== state[key])
                this.notify(key);
        }
        this.thaw_notify();
    }
});
