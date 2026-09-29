import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const DISPLAY_OFF_MODES = [1, 2, 3];

interface Source {
  bus: Gio.BusType;
  name: string;
  path: string;
  iface: string;
}

const DISPLAY: Source = { bus: Gio.BusType.SESSION, name: 'org.gnome.Mutter.DisplayConfig', path: '/org/gnome/Mutter/DisplayConfig', iface: 'org.gnome.Mutter.DisplayConfig' };
const POWER: Source = { bus: Gio.BusType.SYSTEM, name: 'org.freedesktop.UPower', path: '/org/freedesktop/UPower', iface: 'org.freedesktop.UPower' };
const PROFILES: Source = { bus: Gio.BusType.SYSTEM, name: 'org.freedesktop.UPower.PowerProfiles', path: '/org/freedesktop/UPower/PowerProfiles', iface: 'org.freedesktop.UPower.PowerProfiles' };

export class PlaybackConditions {
  private readonly proxies = new Map<Source, Gio.DBusProxy>();
  private readonly settings = new Gio.Settings({ schema_id: 'dev.lantharos.kestrel' });
  private readonly disconnectors: (() => void)[] = [];
  private readonly cancellable = new Gio.Cancellable();

  constructor(private readonly changed: () => void) {
    for (const source of [DISPLAY, POWER, PROFILES]) this.watch(source);
    const id = this.settings.connect('changed::live-wallpaper-on-battery', () => this.changed());
    this.disconnectors.push(() => this.settings.disconnect(id));
  }

  private watch(source: Source): void {
    Gio.DBusProxy.new_for_bus(source.bus, Gio.DBusProxyFlags.DO_NOT_AUTO_START, null, source.name, source.path, source.iface,
      this.cancellable, (_source, result) => {
        try {
          const proxy = Gio.DBusProxy.new_for_bus_finish(result);
          this.proxies.set(source, proxy);
          const id = proxy.connect('g-properties-changed', () => this.changed());
          this.disconnectors.push(() => proxy.disconnect(id));
          this.changed();
        } catch (error) {
          if (!(error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)))
            console.warn(`${source.name} is unavailable: ${error}`);
        }
      });
  }

  private property<T>(source: Source, name: string): T | undefined {
    return this.proxies.get(source)?.get_cached_property(name)?.deepUnpack() as T | undefined;
  }

  get allowed(): boolean {
    return !DISPLAY_OFF_MODES.includes(this.property<number>(DISPLAY, 'PowerSaveMode') ?? 0) &&
      (this.settings.get_boolean('live-wallpaper-on-battery') || !this.property<boolean>(POWER, 'OnBattery')) &&
      this.property<string>(PROFILES, 'ActiveProfile') !== 'power-saver';
  }

  destroy(): void {
    this.cancellable.cancel();
    for (const disconnect of this.disconnectors) disconnect();
  }
}
