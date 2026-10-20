import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GUdev from 'gi://GUdev';

import { playSound } from './sounds.js';

const HUB_CLASS = '09';
const SETTLE_MS = 300;
const BLUEZ = 'org.bluez';
const BLUEZ_DEVICE = 'org.bluez.Device1';

function userFacing(device: GUdev.Device): boolean {
  if (device.get_subsystem() === 'mmc') return true;
  return device.get_devtype() === 'usb_device' &&
    device.get_sysfs_attr('bDeviceClass') !== HUB_CLASS &&
    device.get_sysfs_attr('removable') !== 'fixed';
}

export class DeviceSounds {
  private readonly udev = new GUdev.Client({ subsystems: ['usb/usb_device', 'mmc'] });
  private readonly connected = new Set<string>();
  private readonly ueventId: number;
  private readonly bluetooth: number;
  private settle = 0;
  private plugged = false;

  constructor() {
    for (const subsystem of ['usb', 'mmc'])
      for (const device of this.udev.query_by_subsystem(subsystem) ?? [])
        if (userFacing(device)) this.connected.add(device.get_sysfs_path()!);
    this.ueventId = this.udev.connect('uevent', (_client, action: string, device: GUdev.Device) => this.uevent(action, device));
    this.bluetooth = Gio.DBus.system.signal_subscribe(BLUEZ, 'org.freedesktop.DBus.Properties', 'PropertiesChanged', null, BLUEZ_DEVICE,
      Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _iface, _signal, parameters) => {
        const connected = (parameters.deepUnpack() as [string, Record<string, GLib.Variant>])[1].Connected?.unpack();
        if (typeof connected === 'boolean') this.changed(connected);
      });
  }

  private uevent(action: string, device: GUdev.Device): void {
    const path = device.get_sysfs_path()!;
    if (action === 'add' && userFacing(device)) {
      this.connected.add(path);
      this.changed(true);
    } else if (action === 'remove' && this.connected.delete(path)) {
      this.changed(false);
    }
  }

  private changed(plugged: boolean): void {
    this.plugged = plugged;
    if (this.settle) GLib.source_remove(this.settle);
    this.settle = GLib.timeout_add(GLib.PRIORITY_DEFAULT, SETTLE_MS, () => {
      this.settle = 0;
      playSound(this.plugged ? 'device-plugged' : 'device-unplugged');
      return GLib.SOURCE_REMOVE;
    });
  }

  destroy(): void {
    if (this.settle) GLib.source_remove(this.settle);
    this.udev.disconnect(this.ueventId);
    Gio.DBus.system.signal_unsubscribe(this.bluetooth);
  }
}
