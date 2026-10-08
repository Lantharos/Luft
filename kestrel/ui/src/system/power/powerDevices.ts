import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const UPOWER = 'org.freedesktop.UPower';
const UPOWER_PATH = '/org/freedesktop/UPower';
const DEVICE = 'org.freedesktop.UPower.Device';
const DISPLAY_DEVICE = `${UPOWER_PATH}/devices/DisplayDevice`;
const NOT_DISCHARGING = new Set([1, 4, 5]);

export interface PowerDevice {
  path: string;
  system: boolean;
  kind: number;
  model: string;
  percentage: number;
  discharging: boolean;
  secondsLeft: number;
}

type Listener = (device: PowerDevice) => void;

export class PowerDevices {
  private readonly proxies = new Map<string, Gio.DBusProxy>();
  private readonly cancellable = new Gio.Cancellable();
  private readonly subscriptions: number[];

  constructor(private readonly changed: Listener, private readonly removed: (path: string) => void) {
    const bus = Gio.DBus.system;
    this.subscriptions = [
      bus.signal_subscribe(UPOWER, UPOWER, 'DeviceAdded', UPOWER_PATH, null, Gio.DBusSignalFlags.NONE,
        (_connection, _sender, _path, _iface, _signal, parameters) => this.watch((parameters.deep_unpack() as [string])[0])),
      bus.signal_subscribe(UPOWER, UPOWER, 'DeviceRemoved', UPOWER_PATH, null, Gio.DBusSignalFlags.NONE,
        (_connection, _sender, _path, _iface, _signal, parameters) => this.forget((parameters.deep_unpack() as [string])[0])),
    ];
    this.watch(DISPLAY_DEVICE);
    bus.call(UPOWER, UPOWER_PATH, UPOWER, 'EnumerateDevices', null, null, Gio.DBusCallFlags.NONE, -1, this.cancellable, (_bus, result) => {
      try {
        const [paths] = bus.call_finish(result).deep_unpack() as [string[]];
        paths.forEach(path => this.watch(path));
      } catch (error) {
        if (!(error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)))
          console.warn(`Power devices are unavailable: ${error}`);
      }
    });
  }

  private watch(path: string): void {
    if (this.proxies.has(path)) return;
    Gio.DBusProxy.new_for_bus(Gio.BusType.SYSTEM, Gio.DBusProxyFlags.DO_NOT_AUTO_START, null, UPOWER, path, DEVICE, this.cancellable,
      (_source, result) => {
        let proxy: Gio.DBusProxy;
        try {
          proxy = Gio.DBusProxy.new_for_bus_finish(result);
        } catch {
          return;
        }
        const property = <T>(name: string) => proxy.get_cached_property(name)?.deepUnpack() as T;
        const system = path === DISPLAY_DEVICE;
        if (!system && property<boolean>('PowerSupply')) return;
        this.proxies.set(path, proxy);
        const report = () => {
          if (!property<boolean>('IsPresent')) return;
          this.changed({
            path, system,
            kind: property<number>('Type'),
            model: property<string>('Model') ?? '',
            percentage: property<number>('Percentage'),
            discharging: !NOT_DISCHARGING.has(property<number>('State')),
            secondsLeft: Number(property<number | bigint>('TimeToEmpty')),
          });
        };
        proxy.connect('g-properties-changed', report);
        report();
      });
  }

  private forget(path: string): void {
    if (!this.proxies.delete(path)) return;
    this.removed(path);
  }

  destroy(): void {
    this.cancellable.cancel();
    for (const id of this.subscriptions) Gio.DBus.system.signal_unsubscribe(id);
    for (const proxy of this.proxies.values()) proxy.run_dispose();
    this.proxies.clear();
  }
}
