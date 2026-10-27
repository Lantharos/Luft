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

const phoneIcons = new Map<string, string | null>();

function isConnectable(uuids: string[]): boolean {
  return uuids.some(uuid => uuid.toLowerCase() === MIDI_SERVICE ||
    (!uuid.endsWith(VENDOR_SERVICE_SUFFIX) && CONNECTABLE_SERVICES.has(parseInt(uuid, 16))));
}

function appearanceKind(appearance: number): string | null {
  const sub = appearance & 0x3f;
  switch (appearance >> 6) {
    case 0x01: return 'phone';
    case 0x02: return 'computer';
    case 0x05: return 'display';
    case 0x0a: return 'audio';
    case 0x0b: return 'scanner';
    case 0x0f: return ({ 1: 'keyboard', 2: 'mouse', 3: 'joypad', 4: 'joypad', 5: 'tablet', 8: 'scanner' } as Record<number, string>)[sub] ?? null;
    case 0x21: return 'speakers';
    case 0x25: return ({ 1: 'headset', 2: 'headset', 3: 'headphones', 4: 'headset' } as Record<number, string>)[sub] ?? 'audio';
    default: return null;
  }
}

function peripheralKind(deviceClass: number): string | null {
  const minor = (deviceClass & 0x1e) >> 2;
  switch ((deviceClass & 0xc0) >> 6) {
    case 0x00: return ({ 1: 'joypad', 2: 'joypad', 3: 'remote' } as Record<number, string>)[minor] ?? null;
    case 0x01: return 'keyboard';
    case 0x02: return minor === 5 ? 'tablet' : 'mouse';
    default: return null;
  }
}

function imagingKind(deviceClass: number): string | null {
  if (deviceClass & 0x80) return 'printer';
  if (deviceClass & 0x40) return 'scanner';
  if (deviceClass & 0x20) return 'camera';
  return deviceClass & 0x10 ? 'display' : null;
}

function classKind(deviceClass: number): string | null {
  const minor = (deviceClass & 0xfc) >> 2;
  switch ((deviceClass & 0x1f00) >> 8) {
    case 0x01: return 'computer';
    case 0x02: return ({ 1: 'phone', 2: 'phone', 3: 'phone', 4: 'modem', 5: 'phone' } as Record<number, string>)[minor] ?? null;
    case 0x03: return 'network';
    case 0x04: return ({ 1: 'headset', 2: 'headset', 5: 'speakers', 6: 'headphones', 11: 'video', 12: 'video', 13: 'video' } as Record<number, string>)[minor] ?? 'audio';
    case 0x05: return peripheralKind(deviceClass);
    case 0x06: return imagingKind(deviceClass);
    case 0x07: return 'wearable';
    case 0x08: return 'toy';
    default: return null;
  }
}

function phoneIcon(address: string): string | null {
  if (!phoneIcons.has(address)) {
    const vendor = Shell.systemd_get_oui_vendor(address) ?? '';
    phoneIcons.set(address, PHONE_ICONS.find(([name]) => vendor.includes(name))?.[1] ?? null);
  }
  return phoneIcons.get(address)!;
}

function kindIcon(kind: string | null, name: string | undefined, address: string): string | null {
  if (kind === 'phone') return phoneIcon(address);
  if (kind === 'mouse' && name?.toLowerCase().includes('tablet')) return 'input-tablet';
  return KIND_ICONS.get(kind!) ?? null;
}

interface DeviceState {
  alias: string;
  icon: string;
  paired: boolean;
  trusted: boolean;
  connected: boolean;
  connectable: boolean;
}

export class BluetoothDevice extends GObject.Object {
  static [GObject.properties] = {
    'alias': GObject.ParamSpec.string('alias', null, null, GObject.ParamFlags.READABLE, ''),
    'icon': GObject.ParamSpec.string('icon', null, null, GObject.ParamFlags.READABLE, 'bluetooth'),
    'paired': GObject.ParamSpec.boolean('paired', null, null, GObject.ParamFlags.READABLE, false),
    'trusted': GObject.ParamSpec.boolean('trusted', null, null, GObject.ParamFlags.READABLE, false),
    'connected': GObject.ParamSpec.boolean('connected', null, null, GObject.ParamFlags.READABLE, false),
    'connectable': GObject.ParamSpec.boolean('connectable', null, null, GObject.ParamFlags.READABLE, false),
  };

  static {
    GObject.registerClass(this);
  }

  private state: DeviceState;

  constructor(private readonly proxy: Gio.DBusProxy) {
    super();
    this.state = this.readState();
    proxy.connectObject('g-properties-changed', () => this.sync(), this);
  }

  get alias(): string {
    return this.state.alias;
  }

  get icon(): string {
    return this.state.icon;
  }

  get paired(): boolean {
    return this.state.paired;
  }

  get trusted(): boolean {
    return this.state.trusted;
  }

  get connected(): boolean {
    return this.state.connected;
  }

  get connectable(): boolean {
    return this.state.connectable;
  }

  get address(): string {
    return this.value<string>('Address') ?? '';
  }

  get adapter(): string | undefined {
    return this.value<string>('Adapter');
  }

  get objectPath(): string {
    return this.proxy.g_object_path;
  }

  async setConnected(connected: boolean, cancellable: Gio.Cancellable | null = null): Promise<void> {
    await this.proxy.g_connection.call(BUS_NAME, this.proxy.g_object_path, DEVICE_INTERFACE,
      connected ? 'Connect' : 'Disconnect', null, null, Gio.DBusCallFlags.NONE, -1, cancellable);
  }

  destroy(): void {
    this.proxy.disconnectObject(this);
  }

  private value<T>(name: string): T | undefined {
    return this.proxy.get_cached_property(name)?.unpack<T>();
  }

  private iconName(): string {
    const name = this.value<string>('Name');
    if (name !== undefined && GAME_CONTROLLERS.has(name)) return 'input-gaming';
    const kind = appearanceKind(this.value<number>('Appearance') ?? 0) ?? classKind(this.value<number>('Class') ?? 0);
    return kindIcon(kind, name, this.address) || this.value<string>('Icon') || 'bluetooth';
  }

  private readState(): DeviceState {
    return {
      alias: this.value<string>('Alias') ?? '',
      icon: this.iconName(),
      paired: this.value<boolean>('Paired') ?? false,
      trusted: this.value<boolean>('Trusted') ?? false,
      connected: this.value<boolean>('Connected') ?? false,
      connectable: isConnectable(this.proxy.get_cached_property('UUIDs')?.deepUnpack<string[]>() ?? []),
    };
  }

  private sync(): void {
    const state = this.readState();
    const previous = this.state;
    this.state = state;
    this.freeze_notify();
    for (const key of Object.keys(state) as (keyof DeviceState)[]) {
      if (previous[key] !== state[key]) this.notify(key);
    }
    this.thaw_notify();
  }
}
