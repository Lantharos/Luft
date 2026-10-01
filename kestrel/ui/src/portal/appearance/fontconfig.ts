import Gio from 'gi://Gio';
import type GLib from 'gi://GLib';

const GTK_SETTINGS = 'org.gtk.Settings';

export class FontconfigSerial {
  serial = 0;
  private readonly subscription: number;

  constructor(changed: (serial: number) => void) {
    this.subscription = Gio.DBus.session.signal_subscribe(null, 'org.freedesktop.DBus.Properties', 'PropertiesChanged',
      '/org/gtk/Settings', GTK_SETTINGS, Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _iface, _signal, parameters: GLib.Variant) => {
        const [, properties, invalidated] = parameters.deepUnpack() as [string, Record<string, GLib.Variant>, string[]];
        if (!('FontconfigTimestamp' in properties) && !invalidated.includes('FontconfigTimestamp')) return;
        this.serial++;
        changed(this.serial);
      });
  }

  destroy(): void {
    Gio.DBus.session.signal_unsubscribe(this.subscription);
  }
}
