import Gio from 'gi://Gio';
import * as MessageTray from 'resource:///com/lantharos/kestrel/ui/messageTray.js';

import { shortDuration } from '../../shared/duration.js';
import { PowerDevices, type PowerDevice } from './powerDevices.js';

const SYSTEM_THRESHOLDS = [20, 10, 5];
const ACCESSORY_THRESHOLDS = [20, 10];
const RECHARGED_MARGIN = 5;
const UPS = 3;

const ACCESSORIES: Record<number, [name: string, icon: string]> = {
  5: ['Mouse', 'input-mouse-symbolic'],
  6: ['Keyboard', 'input-keyboard-symbolic'],
  8: ['Phone', 'phone-symbolic'],
  10: ['Tablet', 'input-tablet-symbolic'],
  12: ['Controller', 'input-gaming-symbolic'],
  13: ['Pen', 'input-tablet-symbolic'],
  14: ['Touchpad', 'input-touchpad-symbolic'],
  17: ['Headset', 'audio-headset-symbolic'],
  18: ['Speaker', 'audio-speakers-symbolic'],
  19: ['Headphones', 'audio-headphones-symbolic'],
  22: ['Remote', 'input-gaming-symbolic'],
};

interface Warned {
  threshold: number | null;
  notification: MessageTray.Notification | null;
}

interface Warning {
  title: string;
  body: string;
  icon: string;
  urgency: number;
}

function reached(thresholds: number[], percentage: number): number | null {
  return thresholds.filter(threshold => percentage <= threshold).at(-1) ?? null;
}

function systemWarning({ kind, percentage, secondsLeft }: PowerDevice, threshold: number): Warning {
  const source = kind === UPS ? 'UPS battery' : 'Battery';
  const left = `${Math.round(percentage)}% left${secondsLeft > 0 ? `, about ${shortDuration(secondsLeft)}` : ''}.`;
  if (threshold === 5)
    return { title: `${source} almost empty`, body: `${left} Plug in now to avoid losing unsaved work.`, icon: 'battery-caution-symbolic', urgency: MessageTray.Urgency.CRITICAL };
  if (threshold === 10)
    return { title: `${source} very low`, body: `${left} Plug in soon.`, icon: 'battery-caution-symbolic', urgency: MessageTray.Urgency.HIGH };
  return { title: `${source} low`, body: left, icon: 'battery-low-symbolic', urgency: MessageTray.Urgency.NORMAL };
}

function accessoryWarning({ kind, model, percentage }: PowerDevice, threshold: number): Warning {
  const [kindName, icon] = ACCESSORIES[kind] ?? ['Connected device', 'battery-low-symbolic'];
  const name = model.trim() || kindName;
  const left = `${Math.round(percentage)}% left.`;
  return threshold === 10
    ? { title: `${name} battery very low`, body: `${left} Charge it now so it doesn't turn off.`, icon, urgency: MessageTray.Urgency.HIGH }
    : { title: `${name} battery low`, body: `${left} Charge it soon.`, icon, urgency: MessageTray.Urgency.NORMAL };
}

export class BatteryWarnings {
  private readonly warned = new Map<string, Warned>();
  private readonly devices = new PowerDevices(device => this.update(device), path => this.clear(path));

  private update(device: PowerDevice): void {
    if (!device.discharging) {
      this.clear(device.path);
      return;
    }
    const thresholds = device.system ? SYSTEM_THRESHOLDS : ACCESSORY_THRESHOLDS;
    let warned = this.warned.get(device.path);
    if (!warned) {
      warned = { threshold: null, notification: null };
      this.warned.set(device.path, warned);
    }
    if (warned.threshold !== null && device.percentage >= warned.threshold + RECHARGED_MARGIN)
      warned.threshold = reached(thresholds, device.percentage);
    const threshold = reached(thresholds, device.percentage);
    if (threshold === null || (warned.threshold !== null && threshold >= warned.threshold)) return;
    warned.threshold = threshold;
    this.show(warned, device.system ? systemWarning(device, threshold) : accessoryWarning(device, threshold));
  }

  private show(warned: Warned, { title, body, icon, urgency }: Warning): void {
    warned.notification?.destroy();
    const source = MessageTray.getSystemSource();
    const notification = new MessageTray.Notification({
      source, title, body, urgency,
      gicon: new Gio.ThemedIcon({ name: icon }),
      privacyScope: MessageTray.PrivacyScope.SYSTEM,
    });
    notification.connect('destroy', () => {
      if (warned.notification === notification) warned.notification = null;
    });
    warned.notification = notification;
    source.addNotification(notification);
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
