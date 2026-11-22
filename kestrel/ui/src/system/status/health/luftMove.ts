import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import * as MessageTray from '../../../surfaces/notifications/tray/messageTray.js';

import { t } from '../../../shared/i18n/index.js';

const TRUST = 'com.lantharos.Trust1';
const MOVING = ['moving', 'finishing'];

function notify(title: string, body: string): void {
  const source = MessageTray.getSystemSource();
  source.addNotification(new MessageTray.Notification({
    source,
    title,
    body,
    gicon: new Gio.ThemedIcon({ name: 'drive-harddisk-symbolic' }),
    privacyScope: MessageTray.PrivacyScope.SYSTEM,
  }));
}

export class LuftMoveNotices {
  private stage = '';
  private readonly subscription = Gio.DBus.system.signal_subscribe(TRUST, 'org.freedesktop.DBus.Properties',
    'PropertiesChanged', '/com/lantharos/Trust1', TRUST, Gio.DBusSignalFlags.NONE,
    (_connection, _sender, _path, _interface, _signal, parameters: GLib.Variant) => {
      const [, changed] = parameters.deepUnpack<[string, Record<string, GLib.Variant>]>();
      const stage = changed.Disk?.recursiveUnpack<Record<string, unknown>>().Resize;
      if (typeof stage === 'string') this.follow(stage);
    });

  private follow(stage: string): void {
    if (MOVING.includes(this.stage) && stage === '') notify(t('health-luft-moved-title'), t('health-luft-moved-body'));
    if (MOVING.includes(this.stage) && stage === 'paused') notify(t('health-luft-move-paused-title'), t('health-luft-move-paused-body'));
    this.stage = stage;
  }

  destroy(): void {
    Gio.DBus.system.signal_unsubscribe(this.subscription);
  }
}
