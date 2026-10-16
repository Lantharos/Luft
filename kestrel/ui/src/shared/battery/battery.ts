import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const BATTERY_TYPE = 2;
const CHARGING = 1;
const FULLY_CHARGED = 4;
const SETTLE_SECONDS = 60;
const SHORTEST_ESTIMATE = 60;
const LONGEST_ESTIMATE = 24 * 3600;

export type BatteryStatus = 'charging' | 'full' | 'plugged' | 'discharging';

export interface BatteryState {
  percentage: number;
  status: BatteryStatus;
  secondsLeft: number;
}

type Listener = (state: BatteryState | null) => void;

const plausible = (seconds: number) => seconds >= SHORTEST_ESTIMATE && seconds <= LONGEST_ESTIMATE;

class UPowerBattery {
  private device: Gio.DBusProxy | null = null;
  private power: Gio.DBusProxy | null = null;
  private readonly cancellable = new Gio.Cancellable();
  private status: BatteryStatus | null = null;
  private settledAt = 0;
  private settleTimer = 0;

  constructor(private readonly changed: Listener) {
    this.connect('/org/freedesktop/UPower', 'org.freedesktop.UPower', proxy => this.power = proxy);
    this.connect('/org/freedesktop/UPower/devices/DisplayDevice', 'org.freedesktop.UPower.Device', proxy => this.device = proxy);
  }

  private connect(path: string, iface: string, adopt: (proxy: Gio.DBusProxy) => void): void {
    Gio.DBusProxy.new_for_bus(Gio.BusType.SYSTEM, Gio.DBusProxyFlags.DO_NOT_AUTO_START, null,
      'org.freedesktop.UPower', path, iface, this.cancellable, (_source, result) => {
        let proxy: Gio.DBusProxy;
        try {
          proxy = Gio.DBusProxy.new_for_bus_finish(result);
        } catch (error) {
          if (!(error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)))
            console.warn(`Battery status is unavailable: ${error}`);
          return;
        }
        adopt(proxy);
        proxy.connect('g-properties-changed', () => this.sync());
        this.sync();
      });
  }

  private property<T>(name: string): T | undefined {
    return this.device?.get_cached_property(name)?.deepUnpack() as T | undefined;
  }

  private currentStatus(): BatteryStatus {
    const state = this.property<number>('State');
    if (state === CHARGING) return 'charging';
    if (state === FULLY_CHARGED) return 'full';
    const onBattery = this.power?.get_cached_property('OnBattery')?.deepUnpack() as boolean | undefined;
    return onBattery === false ? 'plugged' : 'discharging';
  }

  private estimate(status: BatteryStatus): number {
    if (status !== 'charging' && status !== 'discharging') return 0;
    if (GLib.get_monotonic_time() < this.settledAt) return 0;
    const seconds = Number(this.property<number | bigint>(status === 'charging' ? 'TimeToFull' : 'TimeToEmpty') ?? 0);
    return plausible(seconds) ? seconds : 0;
  }

  private statusChanged(status: BatteryStatus): void {
    const first = this.status === null;
    this.status = status;
    if (first) return;
    this.settledAt = GLib.get_monotonic_time() + SETTLE_SECONDS * GLib.USEC_PER_SEC;
    if (this.settleTimer) GLib.Source.remove(this.settleTimer);
    this.settleTimer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, SETTLE_SECONDS, () => {
      this.settleTimer = 0;
      this.sync();
      return GLib.SOURCE_REMOVE;
    });
  }

  private sync(): void {
    if (!this.device || !this.power) return;
    if (!this.property<boolean>('IsPresent') || this.property<number>('Type') !== BATTERY_TYPE) {
      this.changed(null);
      return;
    }
    const status = this.currentStatus();
    if (status !== this.status) this.statusChanged(status);
    this.changed({
      percentage: Math.round(this.property<number>('Percentage') ?? 0),
      status,
      secondsLeft: this.estimate(status),
    });
  }

  destroy(): void {
    this.cancellable.cancel();
    if (this.settleTimer) GLib.Source.remove(this.settleTimer);
  }
}

class BatteryMonitor {
  private readonly listeners = new Set<Listener>();
  private source: UPowerBattery | null = null;
  private reported: BatteryState | null = null;
  private pinned: BatteryState | null | undefined;

  watch(listener: Listener): () => void {
    this.listeners.add(listener);
    this.source ??= new UPowerBattery(state => this.report(state));
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size) return;
      this.source?.destroy();
      this.source = null;
      this.reported = null;
    };
  }

  pin(state: BatteryState | null | undefined): void {
    this.pinned = state;
    this.notify();
  }

  private get state(): BatteryState | null {
    return this.pinned === undefined ? this.reported : this.pinned;
  }

  private report(state: BatteryState | null): void {
    this.reported = state;
    if (this.pinned === undefined) this.notify();
  }

  private notify(): void {
    for (const listener of this.listeners) listener(this.state);
  }
}

export const battery = new BatteryMonitor();
