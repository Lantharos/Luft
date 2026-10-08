import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { Context } from '../../context.js';

type ShowOsd = Context['showOsd'];

const RFKILL = 'com.lantharos.Settings.Rfkill';
const RFKILL_PATH = '/com/lantharos/Settings/Rfkill';
const KEYBOARD = 'com.lantharos.Settings.KeyboardLight';
const KEYBOARD_PATH = '/com/lantharos/Settings/KeyboardLight';
const UPOWER = 'org.freedesktop.UPower';
const DISPLAY_DEVICE = '/org/freedesktop/UPower/devices/DisplayDevice';
const BATTERY_KINDS = new Set([2, 3]);
const RADIO_KEY_INTERVAL_US = 1_000_000;

type KeyboardStep = 'StepUp' | 'StepDown' | 'Toggle';

function icon(name: string): Gio.Icon {
  return Gio.ThemedIcon.new(name);
}

async function properties(bus: Gio.DBusConnection, name: string, path: string, iface: string): Promise<Record<string, unknown>> {
  const reply = await bus.call(name, path, 'org.freedesktop.DBus.Properties', 'GetAll', new GLib.Variant('(s)', [iface]),
    new GLib.VariantType('(a{sv})'), Gio.DBusCallFlags.NONE, -1, null);
  return reply.recursiveUnpack()[0] as Record<string, unknown>;
}

export class DeviceKeys {
  private readonly touchpad = new Gio.Settings({ schema_id: 'org.gnome.desktop.peripherals.touchpad' });
  private readonly touchscreen = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.touchscreen' });
  private radioPressedAt = 0;

  constructor(private readonly showOsd: ShowOsd) {}

  touchpadEnabled(enabled: boolean | null): void {
    const next = enabled ?? this.touchpad.get_string('send-events') !== 'enabled';
    this.showOsd(icon(next ? 'input-touchpad-symbolic' : 'touchpad-disabled-symbolic'), null, null, 1);
    this.touchpad.set_string('send-events', next ? 'enabled' : 'disabled');
  }

  async toggleRotationLock(): Promise<void> {
    const sensor = await properties(Gio.DBus.system, 'net.hadess.SensorProxy', '/net/hadess/SensorProxy', 'net.hadess.SensorProxy').catch(() => null);
    if (!sensor?.HasAccelerometer) return;
    const locked = !this.touchscreen.get_boolean('orientation-lock');
    this.touchscreen.set_boolean('orientation-lock', locked);
    this.showOsd(icon(locked ? 'rotation-locked-symbolic' : 'rotation-allowed-symbolic'), null, null, 1);
  }

  async keyboardBrightness(step: KeyboardStep): Promise<void> {
    try {
      const reply = await Gio.DBus.session.call(KEYBOARD, KEYBOARD_PATH, KEYBOARD, step, null,
        new GLib.VariantType('(i)'), Gio.DBusCallFlags.NONE, -1, null);
      const [percentage] = reply.deep_unpack() as [number];
      this.showOsd(icon('keyboard-brightness-symbolic'), null, percentage / 100, 1);
    } catch (error) {
      console.warn(`The keyboard brightness didn't change: ${error}`);
    }
  }

  async showBattery(): Promise<void> {
    const battery = await properties(Gio.DBus.system, UPOWER, DISPLAY_DEVICE, `${UPOWER}.Device`).catch(() => null);
    if (!battery || !BATTERY_KINDS.has(battery.Type as number)) return;
    this.showOsd(icon(battery.IconName as string), null, (battery.Percentage as number) / 100, 1);
  }

  async toggleRadios(bluetooth: boolean): Promise<void> {
    const now = GLib.get_monotonic_time();
    if (now - this.radioPressedAt < RADIO_KEY_INTERVAL_US) return;
    this.radioPressedAt = now;
    const prefix = bluetooth ? 'Bluetooth' : '';
    const radios = await properties(Gio.DBus.session, RFKILL, RFKILL_PATH, RFKILL).catch(() => null);
    if (!radios?.[`${prefix}HasAirplaneMode`]) return;
    if (radios[`${prefix}HardwareAirplaneMode`]) {
      this.showOsd(icon('airplane-mode-symbolic'), 'Airplane mode is on in hardware', null, 1);
      return;
    }
    const blocked = !radios[`${prefix}AirplaneMode`];
    await Gio.DBus.session.call(RFKILL, RFKILL_PATH, 'org.freedesktop.DBus.Properties', 'Set',
      new GLib.Variant('(ssv)', [RFKILL, `${prefix}AirplaneMode`, new GLib.Variant('b', blocked)]), null, Gio.DBusCallFlags.NONE, -1, null);
    if (bluetooth)
      this.showOsd(icon(blocked ? 'bluetooth-disabled-symbolic' : 'bluetooth-active-symbolic'), blocked ? 'Bluetooth off' : 'Bluetooth on', null, 1);
    else
      this.showOsd(icon(blocked ? 'airplane-mode-symbolic' : 'network-wireless-signal-excellent-symbolic'), blocked ? 'Airplane mode on' : 'Airplane mode off', null, 1);
  }

  eject(): void {
    const drives = Gio.VolumeMonitor.get().get_connected_drives().filter(drive => drive.can_eject());
    const drive = drives.find(candidate => candidate.has_media()) ?? drives[0];
    this.showOsd(icon('media-eject-symbolic'), null, null, 1);
    drive?.eject_with_operation(Gio.MountUnmountFlags.FORCE, null, null, (_drive, result) => {
      try {
        drive.eject_with_operation_finish(result);
      } catch (error) {
        console.warn(`The drive didn't eject: ${error}`);
      }
    });
  }
}
