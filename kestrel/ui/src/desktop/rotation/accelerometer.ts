import Gio from 'gi://Gio';

import { standInBus } from '../../system/standIn/bus.js';

const SENSOR_PROXY = 'net.hadess.SensorProxy';

type Listener = (present: boolean) => void;

class Accelerometer {
  private proxy: Gio.DBusProxy | null = null;
  private readonly listeners = new Set<Listener>();

  constructor() {
    Gio.DBusProxy.new(standInBus() ?? Gio.DBus.system, Gio.DBusProxyFlags.DO_NOT_AUTO_START, null, SENSOR_PROXY,
      '/net/hadess/SensorProxy', SENSOR_PROXY, null, (_source, result) => {
        try {
          this.proxy = Gio.DBusProxy.new_finish(result);
        } catch (error) {
          console.warn(`The accelerometer is unavailable: ${error}`);
          return;
        }
        this.proxy.connect('g-properties-changed', () => this.changed());
        this.proxy.connect('notify::g-name-owner', () => this.changed());
        this.changed();
      });
  }

  get present(): boolean {
    return !!this.proxy?.get_cached_property('HasAccelerometer')?.get_boolean();
  }

  watch(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.present);
    return () => this.listeners.delete(listener);
  }

  private changed(): void {
    for (const listener of this.listeners) listener(this.present);
  }
}

export const accelerometer = new Accelerometer();
