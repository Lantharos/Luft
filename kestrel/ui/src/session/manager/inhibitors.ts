import Gio from 'gi://Gio';

import { INHIBITOR_XML, MANAGER_PATH } from './interfaces.js';

interface Inhibitor {
  path: string;
  owner: string;
  flags: number;
  exported: Gio.DBusExportedObject;
}

export class Inhibitors {
  private readonly items = new Map<number, Inhibitor>();
  private nextCookie = 1;

  constructor(private readonly changed: (added: boolean, path: string) => void) {}

  get flags(): number {
    return [...this.items.values()].reduce((flags, inhibitor) => flags | inhibitor.flags, 0);
  }

  paths(flags = ~0): string[] {
    return [...this.items.values()].filter(inhibitor => inhibitor.flags & flags).map(inhibitor => inhibitor.path);
  }

  add(owner: string, appId: string, reason: string, flags: number, clientPath: string): number {
    const cookie = this.nextCookie++;
    const path = `${MANAGER_PATH}/Inhibitor${cookie}`;
    const exported = Gio.DBusExportedObject.wrapJSObject(INHIBITOR_XML, {
      GetAppId: () => appId,
      GetClientId: () => clientPath,
      GetReason: () => reason,
      GetFlags: () => flags,
    });
    exported.export(Gio.DBus.session, path);
    this.items.set(cookie, { path, owner, flags, exported });
    this.changed(true, path);
    return cookie;
  }

  remove(cookie: number): boolean {
    const inhibitor = this.items.get(cookie);
    if (!inhibitor) return false;
    this.items.delete(cookie);
    inhibitor.exported.unexport();
    this.changed(false, inhibitor.path);
    return true;
  }

  removeOwner(owner: string): void {
    for (const [cookie, inhibitor] of this.items) if (inhibitor.owner === owner) this.remove(cookie);
  }

  destroy(): void {
    for (const inhibitor of this.items.values()) inhibitor.exported.unexport();
    this.items.clear();
  }
}
