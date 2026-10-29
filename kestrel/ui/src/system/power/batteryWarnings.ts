import Gio from 'gi://Gio';
import * as MessageTray from '../../surfaces/notifications/tray/messageTray.js';

import { formatsLocale, t } from '../../shared/i18n/index.js';
import { playSound } from '../sounds/sounds.js';
import { PowerDevices, type PowerDevice } from './powerDevices.js';

const THRESHOLDS = [20, 10];
const RECHARGED_MARGIN = 5;

const ACCESSORIES: Record<number, [name: string, icon: string]> = {
  5: ['battery-device-mouse', 'input-mouse-symbolic'],
  6: ['battery-device-keyboard', 'input-keyboard-symbolic'],
  8: ['battery-device-phone', 'phone-symbolic'],
  10: ['battery-device-tablet', 'input-tablet-symbolic'],
  12: ['battery-device-controller', 'input-gaming-symbolic'],
  13: ['battery-device-pen', 'input-tablet-symbolic'],
  14: ['battery-device-touchpad', 'input-touchpad-symbolic'],
  17: ['battery-device-headset', 'audio-headset-symbolic'],
  18: ['battery-device-speaker', 'audio-speakers-symbolic'],
  19: ['battery-device-headphones', 'audio-headphones-symbolic'],
  22: ['battery-device-remote', 'input-gaming-symbolic'],
};
const UNKNOWN_ACCESSORY: [name: string, icon: string] = ['battery-device-other', 'battery-low-symbolic'];

interface Warned {
  threshold: number | null;
  notification: MessageTray.Notification | null;
}

interface Warning {
  title: string;
  body: string;
  icon: string;
  urgency: MessageTray.Urgency;
}

function reached(percentage: number): number | null {
  return THRESHOLDS.filter(threshold => percentage <= threshold).at(-1) ?? null;
}

function percent(percentage: number): string {
  return new Intl.NumberFormat(formatsLocale(), { style: 'percent' }).format(Math.round(percentage) / 100);
}

function warning({ kind, model, percentage }: PowerDevice, threshold: number): Warning {
  const [kindName, icon] = ACCESSORIES[kind] ?? UNKNOWN_ACCESSORY;
  const device = model.trim() || t(kindName);
  const left = t('battery-left', { percent: percent(percentage) });
  return threshold === 10
    ? { title: t('battery-device-very-low-title', { device }), body: t('battery-device-very-low-body', { left }), icon, urgency: MessageTray.Urgency.HIGH }
    : { title: t('battery-device-low-title', { device }), body: t('battery-device-low-body', { left }), icon, urgency: MessageTray.Urgency.NORMAL };
}

export class BatteryWarnings {
  private readonly warned = new Map<string, Warned>();
  private readonly devices = new PowerDevices(device => this.update(device), path => this.clear(path));

  private update(device: PowerDevice): void {
    if (!device.discharging) {
      this.clear(device.path);
      return;
    }
    let warned = this.warned.get(device.path);
    if (!warned) {
      warned = { threshold: null, notification: null };
      this.warned.set(device.path, warned);
    }
    if (warned.threshold !== null && device.percentage >= warned.threshold + RECHARGED_MARGIN)
      warned.threshold = reached(device.percentage);
    const threshold = reached(device.percentage);
    if (threshold === null || (warned.threshold !== null && threshold >= warned.threshold)) return;
    warned.threshold = threshold;
    this.show(warned, warning(device, threshold));
  }

  private show(warned: Warned, { title, body, icon, urgency }: Warning): void {
    warned.notification?.destroy();
    const source = MessageTray.getSystemSource();
    const notification = new MessageTray.Notification({
      source, title, body, urgency,
      gicon: new Gio.ThemedIcon({ name: icon }),
      privacyScope: MessageTray.PrivacyScope.SYSTEM,
      sound: new MessageTray.Sound(null),
    });
    notification.connect('destroy', () => {
      if (warned.notification === notification) warned.notification = null;
    });
    warned.notification = notification;
    source.addNotification(notification);
    playSound('low-battery');
  }

  private clear(path: string): void {
    this.warned.get(path)?.notification?.destroy();
    this.warned.delete(path);
  }

  destroy(): void {
    this.devices.destroy();
    for (const path of [...this.warned.keys()]) this.clear(path);
  }
}
