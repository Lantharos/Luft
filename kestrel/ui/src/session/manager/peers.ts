import Gio from 'gi://Gio';

export class Peers {
  private readonly watches = new Map<string, number>();

  constructor(private readonly vanished: (name: string) => void) {}

  watch(name: string): void {
    if (this.watches.has(name)) return;
    this.watches.set(name, Gio.bus_watch_name_on_connection(Gio.DBus.session, name, Gio.BusNameWatcherFlags.NONE, null, () => {
      Gio.bus_unwatch_name(this.watches.get(name)!);
      this.watches.delete(name);
      this.vanished(name);
    }));
  }

  destroy(): void {
    for (const id of this.watches.values()) Gio.bus_unwatch_name(id);
    this.watches.clear();
  }
}
