import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { CLIENT_XML, MANAGER_PATH } from './interfaces.js';

const QUERY_TIMEOUT = 1000;
const END_TIMEOUT = 5000;

interface Client {
  owner: string;
  exported: Gio.DBusExportedObject;
  answered: (() => void) | null;
}

export class Clients {
  private readonly items = new Map<string, Client>();
  private nextId = 1;

  constructor(private readonly changed: (added: boolean, path: string) => void) {}

  get paths(): string[] {
    return [...this.items.keys()];
  }

  register(owner: string): string {
    const path = `${MANAGER_PATH}/Client${this.nextId++}`;
    const exported = Gio.DBusExportedObject.wrapJSObject(CLIENT_XML, { EndSessionResponse: () => this.answer(path) });
    exported.export(Gio.DBus.session, path);
    this.items.set(path, { owner, exported, answered: null });
    this.changed(true, path);
    return path;
  }

  unregister(path: string): boolean {
    const client = this.items.get(path);
    if (!client) return false;
    this.items.delete(path);
    client.answered?.();
    client.exported.unexport();
    this.changed(false, path);
    return true;
  }

  removeOwner(owner: string): void {
    for (const [path, client] of this.items) if (client.owner === owner) this.unregister(path);
  }

  queryEndSession(): Promise<void> {
    return this.broadcast('QueryEndSession', QUERY_TIMEOUT);
  }

  endSession(): Promise<void> {
    return this.broadcast('EndSession', END_TIMEOUT);
  }

  private answer(path: string): void {
    const client = this.items.get(path);
    client?.answered?.();
    if (client) client.answered = null;
  }

  private broadcast(signal: string, timeout: number): Promise<void> {
    const clients = [...this.items.values()];
    const answers = clients.map(client => new Promise<void>(resolve => {
      client.answered = resolve;
      client.exported.emit_signal(signal, new GLib.Variant('(u)', [0]));
    }));
    return new Promise(resolve => {
      let settled = false;
      const settle = () => {
        if (settled) return;
        settled = true;
        for (const client of clients) client.answered = null;
        resolve();
      };
      const timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, timeout, () => {
        settle();
        return GLib.SOURCE_REMOVE;
      });
      void Promise.all(answers).then(() => {
        if (!settled) GLib.Source.remove(timer);
        settle();
      });
    });
  }

  destroy(): void {
    for (const client of this.items.values()) client.exported.unexport();
    this.items.clear();
  }
}
