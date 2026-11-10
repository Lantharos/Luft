import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { playSound } from './sounds.js';

const UPOWER = 'org.freedesktop.UPower';
const UPOWER_PATH = '/org/freedesktop/UPower';

export class ChargerSound {
  private readonly subscription: number;

  constructor() {
    this.subscription = Gio.DBus.system.signal_subscribe(UPOWER, 'org.freedesktop.DBus.Properties', 'PropertiesChanged', UPOWER_PATH, UPOWER,
      Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _iface, _signal, parameters) => {
        const [, changed] = parameters.deep_unpack() as [string, Record<string, GLib.Variant>];
        const onBattery = changed.OnBattery?.deep_unpack() as boolean | undefined;
        if (onBattery === false) playSound('charger-connected');
      });
  }

  destroy(): void {
    Gio.DBus.system.signal_unsubscribe(this.subscription);
  }
}
