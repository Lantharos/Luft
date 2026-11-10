import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { ExtensionManager } from './runtime/manager.js';

const FIREWALL = 'com.lantharos.Firewall1';
const FIREWALL_PATH = '/com/lantharos/Firewall1';

export class ExtensionPorts {
  private readonly stop: () => void;
  private readonly watch: number;
  private present = false;
  private sent: string | null = null;

  constructor(private readonly manager: ExtensionManager) {
    this.stop = manager.watch(() => this.sync());
    this.watch = Gio.bus_watch_name_on_connection(Gio.DBus.system, FIREWALL, Gio.BusNameWatcherFlags.NONE, () => {
      this.present = true;
      this.sent = null;
      this.sync();
    }, () => (this.present = false));
  }

  destroy(): void {
    this.stop();
    Gio.bus_unwatch_name(this.watch);
  }

  private sync(): void {
    if (!this.present) return;
    const ports = new Map<string, [number, string]>();
    for (const { id } of this.manager.all) {
      const instance = this.manager.instance(id);
      if (!instance?.running) continue;
      for (const { port, protocol } of instance.manifest.network?.listen ?? []) ports.set(`${port}/${protocol}`, [port, protocol]);
    }
    const listed = [...ports.keys()].sort().join();
    if (listed === this.sent) return;
    this.sent = listed;
    Gio.DBus.system.call(FIREWALL, FIREWALL_PATH, FIREWALL, 'SetExtensionPorts', new GLib.Variant('(a(qs))', [[...ports.values()]]),
      null, Gio.DBusCallFlags.NO_AUTO_START | Gio.DBusCallFlags.ALLOW_INTERACTIVE_AUTHORIZATION, -1, null, (connection, result) => {
        try {
          connection!.call_finish(result);
        } catch (error) {
          console.warn(`Couldn't open the ports extensions listen on: ${error}`);
        }
      });
  }
}
