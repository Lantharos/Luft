import Clutter from 'gi://Clutter';
import GUdev from 'gi://GUdev';

import { tabletMode } from '../../../desktop/panel/tablet/tabletMode.js';

const BUS_I8042 = 0x11;

class Keyboards {
  private readonly seat: Clutter.Seat = global.stage.context.get_backend().get_default_seat();
  private readonly udev = new GUdev.Client();
  private readonly watchers = new Set<() => void>();
  private builtIn = this.find();
  private current = this.usable();

  constructor() {
    this.seat.connect('device-added', () => this.refresh());
    this.seat.connect('device-removed', () => this.refresh());
    tabletMode.watch(() => this.sync());
  }

  get attached(): boolean {
    return this.current;
  }

  watch(watcher: () => void): () => void {
    this.watchers.add(watcher);
    return () => this.watchers.delete(watcher);
  }

  private find(): boolean[] {
    return this.seat.list_devices().flatMap(device => {
      const node = device.get_device_node();
      if (device.get_device_type() !== Clutter.InputDeviceType.KEYBOARD_DEVICE || !node) return [];
      const udev = this.udev.query_by_device_file(node);
      return udev?.get_property('ID_INPUT_KEYBOARD') === '1' ? [this.isBuiltIn(udev)] : [];
    });
  }

  private isBuiltIn(device: GUdev.Device): boolean {
    const integration = device.get_property('LIBINPUT_ATTR_KEYBOARD_INTEGRATION');
    if (integration) return integration === 'internal';
    return Number.parseInt(device.get_parent()?.get_sysfs_attr('id/bustype') ?? '', 16) === BUS_I8042;
  }

  private usable(): boolean {
    return this.builtIn.some(builtIn => !builtIn || !tabletMode.active);
  }

  private refresh(): void {
    this.builtIn = this.find();
    this.sync();
  }

  private sync(): void {
    const usable = this.usable();
    if (usable === this.current) return;
    this.current = usable;
    this.watchers.forEach(watcher => watcher());
  }
}

export const keyboards = new Keyboards();
