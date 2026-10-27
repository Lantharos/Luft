import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

import { loadInterfaceXML } from '../../core/runtime/fileUtils.js';
import { BluetoothDevice, BUS_NAME, DEVICE_INTERFACE } from './device.js';
import { Reconnector } from './reconnect.js';

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

const rfkillInfo = Gio.DBusInterfaceInfo.new_for_xml(loadInterfaceXML('com.lantharos.Settings.Rfkill')!);

type RfkillProxy = Gio.DBusProxy & {
  BluetoothAirplaneMode: boolean;
  readonly BluetoothHasAirplaneMode: boolean;
  readonly BluetoothHardwareAirplaneMode: boolean;
};

export namespace BluetoothClient {
  export interface Signals extends GObject.Object.SignalSignatures {
    'devices-changed': () => void;
    'device-removed': (path: string) => void;
  }
}

export class BluetoothClient extends GObject.Object {
  static [GObject.properties] = {
    'available': GObject.ParamSpec.boolean('available', null, null, GObject.ParamFlags.READABLE, false),
    'active': GObject.ParamSpec.boolean('active', null, null, GObject.ParamFlags.READABLE, false),
    'adapter-state': GObject.ParamSpec.string('adapter-state', null, null, GObject.ParamFlags.READABLE, 'absent'),
  };

  static [GObject.signals] = {
    'devices-changed': {},
    'device-removed': { param_types: [GObject.TYPE_STRING] },
  };

  static {
    GObject.registerClass(this);
  }

  declare connect: GObject.SignalMethods<this, BluetoothClient.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, BluetoothClient.Signals>['emit'];

  private adapter: Gio.DBusProxy | null = null;
  private readonly deviceMap = new Map<string, BluetoothDevice>();
  private predictedState: string | null = null;
  private manager: Gio.DBusObjectManagerClient | null = null;
  private devicesChangedId = 0;
  private readonly rfkill = new Gio.DBusProxy({
    g_connection: Gio.DBus.session,
    g_name: RFKILL_BUS_NAME,
    g_object_path: RFKILL_OBJECT_PATH,
    g_interface_name: rfkillInfo.name,
    g_interface_info: rfkillInfo,
  }) as RfkillProxy;

  private readonly reconnector: Reconnector;

  constructor() {
    super();

    this.rfkill.connect('g-properties-changed', (_proxy, properties) => {
      const changed = properties.unpack<Record<string, GLib.Variant>>();
      if ('BluetoothHardwareAirplaneMode' in changed || 'BluetoothHasAirplaneMode' in changed) this.notify('available');
    });
    this.rfkill.init_async(GLib.PRIORITY_DEFAULT, null).catch((e: Error) => console.error(e.message));

    this.reconnector = new Reconnector(this);

    Gio.DBusObjectManagerClient.new_for_bus(Gio.BusType.SYSTEM,
      Gio.DBusObjectManagerClientFlags.DO_NOT_AUTO_START, BUS_NAME, '/', null, null,
      (_source, result) => {
        try {
          this.watch(Gio.DBusObjectManagerClient.new_for_bus_finish(result));
        } catch (e) {
          console.error(`Could not watch Bluetooth: ${(e as Error).message}`);
        }
      });
  }

  get available(): boolean {
    return this.rfkill.BluetoothHasAirplaneMode && !this.rfkill.BluetoothHardwareAirplaneMode;
  }

  get active(): boolean {
    return this.adapterValue<boolean>('Powered') ?? false;
  }

  get adapterState(): string {
    if (this.predictedState) return this.predictedState;
    if (!this.adapter) return 'absent';
    return POWER_STATES.get(this.adapterValue<string>('PowerState')!) ?? (this.active ? 'on' : 'off');
  }

  toggleActive(): void {
    const { active } = this;

    this.predictedState = active ? 'turning-off' : 'turning-on';
    this.notify('adapter-state');
    setTimeout(() => this.adapterStateChanged(), STATE_CHANGE_FAILED_TIMEOUT_MS);

    this.rfkill.BluetoothAirplaneMode = active;
    if (!active && this.adapter)
      this.setPowered(this.adapter, true).catch((e: Error) => console.debug(`Could not turn Bluetooth on: ${e.message}`));
  }

  async toggleDevice(device: BluetoothDevice): Promise<void> {
    const connect = !device.connected;
    if (!connect) this.reconnector.forget(device.address);

    try {
      await device.setConnected(connect);
    } catch (e) {
      console.error(`Failed to ${connect ? 'connect' : 'disconnect'} device "${device.alias}": ${(e as Error).message}`);
    }
  }

  *getDevices(): Generator<BluetoothDevice> {
    if (!this.active) return;

    for (const device of this.deviceMap.values()) {
      if (device.paired || device.trusted) yield device;
    }
  }

  get devices(): MapIterator<BluetoothDevice> {
    return this.deviceMap.values();
  }

  private adapterValue<T>(name: string): T | undefined {
    return this.adapter?.get_cached_property(name)?.unpack<T>();
  }

  private setPowered(adapter: Gio.DBusProxy, powered: boolean): Promise<GLib.Variant> {
    return adapter.g_connection.call(BUS_NAME, adapter.g_object_path,
      'org.freedesktop.DBus.Properties', 'Set',
      new GLib.Variant('(ssv)', [ADAPTER_INTERFACE, 'Powered', GLib.Variant.new_boolean(powered)]),
      null, Gio.DBusCallFlags.NONE, -1, null);
  }

  private adapterStateChanged(): void {
    this.predictedState = null;
    this.notify('adapter-state');
  }

  private watch(manager: Gio.DBusObjectManagerClient): void {
    this.manager = manager;
    manager.connect('object-added', (_m, object) => object.get_interfaces().forEach(iface => this.interfaceAdded(iface as Gio.DBusProxy)));
    manager.connect('object-removed', (_m, object) => object.get_interfaces().forEach(iface => this.interfaceRemoved(iface as Gio.DBusProxy)));
    manager.connect('interface-added', (_m, _object, iface) => this.interfaceAdded(iface as Gio.DBusProxy));
    manager.connect('interface-removed', (_m, _object, iface) => this.interfaceRemoved(iface as Gio.DBusProxy));

    const adapter = this.latestAdapter();
    if (adapter) this.setAdapter(adapter);
  }

  private interfaces(name: string): Gio.DBusProxy[] {
    return this.manager!.get_objects()
      .map(object => object.get_interface(name) as Gio.DBusProxy | null)
      .filter(iface => iface !== null);
  }

  private latestAdapter(removedPath?: string): Gio.DBusProxy | null {
    return this.interfaces(ADAPTER_INTERFACE)
      .filter(adapter => adapter.g_object_path !== removedPath)
      .reduce<Gio.DBusProxy | null>((latest, adapter) => !latest || adapter.g_object_path > latest.g_object_path ? adapter : latest, null);
  }

  private interfaceAdded(iface: Gio.DBusProxy): void {
    const name = iface.g_interface_name;
    if (name === ADAPTER_INTERFACE) {
      if (!this.adapter || iface.g_object_path > this.adapter.g_object_path) this.setAdapter(iface);
      else if (iface.g_object_path === this.adapter.g_object_path) this.watchAdapter(iface);
    } else if (name === DEVICE_INTERFACE && this.adapter) {
      this.addDevice(this.adapter, iface);
    }
  }

  private interfaceRemoved(iface: Gio.DBusProxy): void {
    const name = iface.g_interface_name;
    if (name === ADAPTER_INTERFACE && iface.g_object_path === this.adapter?.g_object_path) this.setAdapter(this.latestAdapter(iface.g_object_path));
    else if (name === DEVICE_INTERFACE) this.removeDevice(iface.g_object_path);
  }

  private watchAdapter(adapter: Gio.DBusProxy | null): void {
    this.adapter?.disconnectObject(this);
    this.adapter = adapter;
    adapter?.connectObject('g-properties-changed', (_proxy: Gio.DBusProxy, properties: GLib.Variant) => {
      const changed = properties.unpack<Record<string, GLib.Variant>>();
      if ('Powered' in changed) this.notify('active');
      if ('PowerState' in changed || ('Powered' in changed && this.adapterValue('PowerState') === undefined)) this.adapterStateChanged();
    }, this);
  }

  private setAdapter(adapter: Gio.DBusProxy | null): void {
    for (const path of [...this.deviceMap.keys()]) this.removeDevice(path);
    this.watchAdapter(adapter);
    if (adapter) this.interfaces(DEVICE_INTERFACE).forEach(device => this.addDevice(adapter, device, false));

    this.notify('active');
    this.adapterStateChanged();
    this.emit('devices-changed');
  }

  private addDevice(adapter: Gio.DBusProxy, proxy: Gio.DBusProxy, announce = true): void {
    const path = proxy.g_object_path;
    if (this.deviceMap.has(path)) return;

    const device = new BluetoothDevice(proxy);
    if (device.adapter !== adapter.g_object_path) {
      device.destroy();
      return;
    }

    this.deviceMap.set(path, device);
    device.connectObject(
      'notify::alias', () => this.queueDevicesChanged(),
      'notify::paired', () => this.queueDevicesChanged(),
      'notify::trusted', () => this.queueDevicesChanged(),
      'notify::connected', () => {
        this.reconnector.connectionChanged(device);
        this.queueDevicesChanged();
      }, this);
    if (device.connected) this.reconnector.connectionChanged(device);
    if (announce) this.emit('devices-changed');
  }

  private removeDevice(path: string): void {
    const device = this.deviceMap.get(path);
    if (!device) return;

    this.deviceMap.delete(path);
    device.disconnectObject(this);
    device.destroy();
    this.emit('device-removed', path);
    this.emit('devices-changed');
  }

  private queueDevicesChanged(): void {
    if (this.devicesChangedId) return;
    this.devicesChangedId = GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => {
      this.devicesChangedId = 0;
      this.emit('devices-changed');
    });
  }
}

let client: BluetoothClient | null = null;

export function getBluetoothClient(): BluetoothClient {
  client ??= new BluetoothClient();
  return client;
}
