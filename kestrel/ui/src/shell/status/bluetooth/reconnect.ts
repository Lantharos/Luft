import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { getLoginManager } from '../../system/loginManager.js';
import type { BluetoothClient } from './client.js';
import type { BluetoothDevice } from './device.js';

const STATE_KEY = 'bluetooth-reconnect';
const SETTLE_SECONDS = 2;
const RETRY_SECONDS = [5, 15, 45, 120];
const FORGET_AFTER_MS = 3000;

export class Reconnector {
  private readonly remembered = new Set(global.get_persistent_state('as', STATE_KEY)?.deepUnpack<string[]>() ?? []);
  private readonly forgetTimers = new Map<string, number>();
  private retryId = 0;
  private round = 0;
  private cancellable: Gio.Cancellable | null = null;
  private readonly loginManager = getLoginManager();

  constructor(private readonly client: BluetoothClient) {
    client.connect('notify::active', () => this.adapterChanged());
    this.loginManager.connect('prepare-for-sleep', (_manager, aboutToSuspend) => {
      if (aboutToSuspend) this.stop();
      else this.adapterChanged();
    });
    this.adapterChanged();
  }

  connectionChanged(device: BluetoothDevice): void {
    const { address } = device;
    this.cancelForget(address);
    if (device.connected) {
      this.remember(address);
      return;
    }
    if (!this.adapterUp) return;
    this.forgetTimers.set(address, GLib.timeout_add(GLib.PRIORITY_DEFAULT, FORGET_AFTER_MS, () => {
      this.forgetTimers.delete(address);
      if (this.adapterUp && !device.connected) this.forget(address);
      return GLib.SOURCE_REMOVE;
    }));
  }

  forget(address: string): void {
    this.cancelForget(address);
    if (!this.remembered.delete(address)) return;
    this.save();
  }

  private get adapterUp(): boolean {
    return this.client.active && !this.loginManager.preparingForSleep;
  }

  private remember(address: string): void {
    if (this.remembered.has(address)) return;
    this.remembered.add(address);
    this.save();
  }

  private save(): void {
    global.set_persistent_state(STATE_KEY, new GLib.Variant('as', [...this.remembered]));
  }

  private cancelForget(address: string): void {
    const id = this.forgetTimers.get(address);
    if (!id) return;
    GLib.source_remove(id);
    this.forgetTimers.delete(address);
  }

  private stop(): void {
    for (const address of [...this.forgetTimers.keys()]) this.cancelForget(address);
    if (this.retryId) GLib.source_remove(this.retryId);
    this.retryId = 0;
    this.cancellable?.cancel();
    this.cancellable = null;
  }

  private adapterChanged(): void {
    this.stop();
    if (!this.adapterUp) return;
    this.round = 0;
    this.schedule(SETTLE_SECONDS);
  }

  private schedule(seconds: number): void {
    this.retryId = GLib.timeout_add_seconds(GLib.PRIORITY_LOW, seconds, () => {
      this.retryId = 0;
      this.reconnect().catch(logError);
      return GLib.SOURCE_REMOVE;
    });
  }

  private waiting(): BluetoothDevice[] {
    return [...this.client.devices].filter(device =>
      this.remembered.has(device.address) && device.paired && device.trusted && !device.connected);
  }

  private async reconnect(): Promise<void> {
    const cancellable = new Gio.Cancellable();
    this.cancellable = cancellable;
    for (const device of this.waiting()) {
      if (!this.remembered.has(device.address) || device.connected) continue;
      try {
        await device.setConnected(true, cancellable);
      } catch (e) {
        if (cancellable.is_cancelled()) return;
        console.debug(`Could not reconnect "${device.alias}": ${(e as Error).message}`);
      }
    }
    this.cancellable = null;
    if (this.round < RETRY_SECONDS.length && this.waiting().length > 0) this.schedule(RETRY_SECONDS[this.round++]);
  }
}
