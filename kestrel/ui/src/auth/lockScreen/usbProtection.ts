import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import * as MessageTray from '../../surfaces/notifications/tray/messageTray.js';
import { t } from '../../shared/i18n/index.js';
import { openSettings } from '../../system/settingsPages.js';

const USB_PROTECTION = 'com.lantharos.UsbProtection1';
const USB_PROTECTION_PATH = '/com/lantharos/UsbProtection1';
const REFUSED = `${USB_PROTECTION}.Error.NotAuthorized`;

function tellDevicesWait(): void {
  const source = MessageTray.getSystemSource();
  const notification = new MessageTray.Notification({ source, title: t('usb-protection-refused-title'), body: t('usb-protection-refused-body') });
  notification.addAction(t('usb-protection-refused-settings'), () => openSettings('security'));
  source.addNotification(notification);
}

export class UsbLockState {
  private told = false;

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
          if (!this.locked && !this.told && error instanceof GLib.Error && Gio.DBusError.get_remote_error(error) === REFUSED) {
            this.told = true;
            tellDevicesWait();
          }
        }
      });
  }
}
