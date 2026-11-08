import Clutter from 'gi://Clutter';
import GUdev from 'gi://GUdev';

import { PowerDevices } from '../power/powerDevices.js';

const PEN_BATTERY = 13;

export type PenKind = 'screen' | 'tablet';

export interface Pen {
  id: string;
  name: string;
  kind: PenKind;
}

export interface PensState {
  pens: Pen[];
  battery: number | null;
}

type Listener = (state: PensState) => void;

const hex = (value: number) => value.toString(16).padStart(4, '0');
const has = (device: Clutter.InputDevice, capability: Clutter.InputCapabilities) => (device.get_capabilities() & capability) !== 0;

class Pens {
  private readonly seat: Clutter.Seat = global.stage.context.get_backend().get_default_seat();
  private readonly udev = new GUdev.Client();
  private readonly listeners = new Set<Listener>();
  private power: PowerDevices | null = null;
  private signals: number[] = [];
  private state: PensState = { pens: [], battery: null };

  watch(listener: Listener): () => void {
    if (!this.listeners.size) this.start();
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
      if (!this.listeners.size) this.stop();
    };
  }

  private start(): void {
    this.signals = (['device-added', 'device-removed'] as const).map(signal => this.seat.connect(signal, () => this.refresh()));
    this.refresh();
  }

  private stop(): void {
    for (const id of this.signals) this.seat.disconnect(id);
    this.signals = [];
    this.power?.destroy();
    this.power = null;
  }

  private parentOf(device: Clutter.InputDevice): string | null {
    const node = device.get_device_node();
    if (!node) return null;
    return this.udev.query_by_device_file(node)?.get_parent()?.get_parent()?.get_sysfs_path() ?? null;
  }

  private refresh(): void {
    const devices = this.seat.list_devices();
    const screens = new Set(devices.filter(device => has(device, Clutter.InputCapabilities.TOUCH)).map(device => this.parentOf(device)));
    const pens = devices.filter(device => has(device, Clutter.InputCapabilities.TABLET_TOOL)).map(device => {
      const parent = this.parentOf(device);
      return {
        id: `${hex(device.get_vendor_id())}:${hex(device.get_product_id())}`,
        name: device.get_device_name() ?? '',
        kind: parent === null || screens.has(parent) ? 'screen' : 'tablet',
      } satisfies Pen;
    });
    if (pens.length && !this.power) this.power = new PowerDevices(device => device.kind === PEN_BATTERY && this.publish({ ...this.state, battery: device.percentage }));
    this.publish({ pens, battery: pens.length ? this.state.battery : null });
  }

  private publish(state: PensState): void {
    this.state = state;
    for (const listener of this.listeners) listener(state);
  }
}

export const pens = new Pens();
