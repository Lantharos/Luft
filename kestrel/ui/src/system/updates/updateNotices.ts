import Gio from 'gi://Gio';
import * as MessageTray from '../../surfaces/notifications/tray/messageTray.js';

import { t } from '../../shared/i18n/index.js';
import { openSettings } from '../settingsPages.js';

const UPDATER = 'com.lantharos.Updater1';
const UPDATER_PATH = '/com/lantharos/Updater1';

export class UpdateNotices {
  private readonly subscription: number;
  private shown: MessageTray.Notification | null = null;

  constructor() {
    this.subscription = Gio.DBus.system.signal_subscribe(UPDATER, UPDATER, 'UpdateFound', UPDATER_PATH, null,
      Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _iface, _signal, parameters) => {
        const [ready] = parameters.deep_unpack() as [boolean];
        this.show(ready);
      });
  }

  destroy(): void {
    Gio.DBus.system.signal_unsubscribe(this.subscription);
    this.shown?.destroy();
  }

  private show(ready: boolean): void {
    this.shown?.destroy();
    const source = MessageTray.getSystemSource();
    const notification = new MessageTray.Notification({
      source,
      title: t(ready ? 'updates-ready-title' : 'updates-available-title'),
      body: t(ready ? 'updates-ready-body' : 'updates-available-body'),
      gicon: new Gio.ThemedIcon({ name: 'software-update-available-symbolic' }),
      privacyScope: MessageTray.PrivacyScope.SYSTEM,
    });
    notification.connect('activated', () => openSettings('system'));
    notification.connect('destroy', () => {
      if (this.shown === notification) this.shown = null;
    });
    this.shown = notification;
    source.addNotification(notification);
  }
}
