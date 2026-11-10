import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const USB_PROTECTION = 'com.lantharos.UsbProtection1';
const USB_PROTECTION_PATH = '/com/lantharos/UsbProtection1';

export class UsbLockState {
  constructor(private locked: boolean) {
    Gio.bus_watch_name(Gio.BusType.SYSTEM, USB_PROTECTION, Gio.BusNameWatcherFlags.AUTO_START, () => this.tell(), null);
  }

  set(locked: boolean): void {
    this.locked = locked;
    this.tell();
  }

  private tell(): void {
    Gio.DBus.system.call(USB_PROTECTION, USB_PROTECTION_PATH, USB_PROTECTION, 'SetLocked', new GLib.Variant('(b)', [this.locked]),
      null, Gio.DBusCallFlags.NONE, -1, null, (connection, result) => {
        try {
          connection!.call_finish(result);
        } catch (error) {
          console.warn(`Couldn't tell USB protection whether the screen is locked: ${error}`);
        }
      });
  }
}
