import Gio from 'gi://Gio';
import type GLib from 'gi://GLib';

const SESSION = 'org.gnome.SessionManager';
const SESSION_PATH = '/org/gnome/SessionManager';
const IDLE = 8;

async function call(path: string, iface: string, method: string): Promise<GLib.Variant | null> {
  try {
    return await Gio.DBus.session.call(SESSION, path, iface, method, null, null, Gio.DBusCallFlags.NO_AUTO_START, -1, null);
  } catch {
    return null;
  }
}

export class KeepAwake {
  private readonly holders = new Set<string>();
  private readonly present = new Set<string>();
  private readonly subscriptions: number[];

  constructor(private readonly changed: () => void) {
    this.subscriptions = [
      Gio.DBus.session.signal_subscribe(SESSION, SESSION, 'InhibitorAdded', SESSION_PATH, null, Gio.DBusSignalFlags.NONE,
        (_connection, _sender, _path, _iface, _signal, parameters) => void this.add((parameters.deep_unpack() as [string])[0])),
      Gio.DBus.session.signal_subscribe(SESSION, SESSION, 'InhibitorRemoved', SESSION_PATH, null, Gio.DBusSignalFlags.NONE,
        (_connection, _sender, _path, _iface, _signal, parameters) => {
          const [path] = parameters.deep_unpack() as [string];
          this.present.delete(path);
          if (this.holders.delete(path)) this.changed();
        }),
    ];
    void call(SESSION_PATH, SESSION, 'GetInhibitors').then(reply => {
      for (const path of reply ? (reply.deep_unpack() as [string[]])[0] : []) void this.add(path);
    });
  }

  get active(): boolean {
    return this.holders.size > 0;
  }

  destroy(): void {
    for (const id of this.subscriptions) Gio.DBus.session.signal_unsubscribe(id);
  }

  private async add(path: string): Promise<void> {
    this.present.add(path);
    const flags = await call(path, `${SESSION}.Inhibitor`, 'GetFlags');
    if (!this.present.has(path) || !flags || !((flags.deep_unpack() as [number])[0] & IDLE)) return;
    this.holders.add(path);
    this.changed();
  }
}
