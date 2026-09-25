import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const BATTERY_TYPE = 2;

export interface BatteryState {
  iconName: string;
  percentage: number;
}

export class Battery {
  private proxy: Gio.DBusProxy | null = null;
  private readonly cancellable = new Gio.Cancellable();

  constructor(private readonly changed: (state: BatteryState | null) => void) {
    Gio.DBusProxy.new_for_bus(Gio.BusType.SYSTEM, Gio.DBusProxyFlags.DO_NOT_AUTO_START, null,
      'org.freedesktop.UPower', '/org/freedesktop/UPower/devices/DisplayDevice', 'org.freedesktop.UPower.Device',
      this.cancellable, (_source, result) => {
        try {
          this.proxy = Gio.DBusProxy.new_for_bus_finish(result);
        } catch (error) {
          if (!(error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)))
            console.warn(`Battery status is unavailable: ${error}`);
          return;
        }
        this.proxy.connect('g-properties-changed', () => this.sync());
        this.sync();
      });
  }

  private property<T>(name: string): T | undefined {
    return this.proxy?.get_cached_property(name)?.deepUnpack() as T | undefined;
  }

  private sync(): void {
    const present = this.property<boolean>('IsPresent') && this.property<number>('Type') === BATTERY_TYPE;
    this.changed(present ? {
      iconName: this.property<string>('IconName') || 'battery-missing-symbolic',
      percentage: Math.round(this.property<number>('Percentage') ?? 0),
    } : null);
  }

  destroy(): void {
    this.cancellable.cancel();
    this.proxy = null;
  }
}
