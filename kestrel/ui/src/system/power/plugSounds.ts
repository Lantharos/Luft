import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Shell from 'gi://Shell';

const UPOWER = 'org.freedesktop.UPower';
const UPOWER_PATH = '/org/freedesktop/UPower';

export class PlugSounds {
  private readonly subscription: number;

  constructor() {
    this.subscription = Gio.DBus.system.signal_subscribe(UPOWER, 'org.freedesktop.DBus.Properties', 'PropertiesChanged', UPOWER_PATH, UPOWER,
      Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _iface, _signal, parameters) => {
        const [, changed] = parameters.deep_unpack() as [string, Record<string, GLib.Variant>];
        const onBattery = changed.OnBattery?.deep_unpack() as boolean | undefined;
        if (onBattery === undefined) return;
        (global as unknown as Shell.Global).display.get_sound_player().play_from_theme(
          onBattery ? 'power-unplug' : 'power-plug', onBattery ? 'On battery power' : 'On AC power', null);
      });
  }

  destroy(): void {
    Gio.DBus.system.signal_unsubscribe(this.subscription);
  }
}
