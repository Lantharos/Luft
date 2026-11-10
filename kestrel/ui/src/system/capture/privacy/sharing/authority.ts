import GLib from 'gi://GLib';

import { RememberedGrants, type Kind } from './remembered.js';

export type { Kind } from './remembered.js';

export interface Grant {
  readonly id: string;
  readonly app: string;
  readonly kind: Kind;
  readonly since: number;
  readonly remembered: boolean;
  readonly active: boolean;
}

interface Use {
  readonly app: string;
  readonly kind: Kind;
  readonly since: number;
  readonly remembered: string | null;
  readonly stop: () => void;
}

class SharingAuthority {
  private readonly rememberedGrants = new RememberedGrants();
  private readonly uses = new Map<string, Use>();
  private readonly listeners = new Set<() => void>();
  private serial = 0;

  watch(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  begin(app: string, kind: Kind, stop: () => void, remembered: string | null = null): () => void {
    const id = `live-${++this.serial}`;
    this.uses.set(id, { app, kind, since: Math.floor(GLib.get_real_time() / GLib.USEC_PER_SEC), remembered, stop });
    this.changed();
    return () => {
      if (this.uses.delete(id)) this.changed();
    };
  }

  async remember(app: string, kind: Kind): Promise<string> {
    const id = await this.rememberedGrants.add(app, kind);
    this.changed();
    return id;
  }

  async remembers(id: string, app: string, kind: Kind): Promise<boolean> {
    return (await this.rememberedGrants.all()).some(grant => grant.id === id && grant.app === app && grant.kind === kind);
  }

  async forget(id: string): Promise<void> {
    if (await this.rememberedGrants.remove(id)) this.changed();
  }

  async list(): Promise<Grant[]> {
    const remembered = await this.rememberedGrants.all();
    const uses = [...this.uses];
    return [
      ...remembered.map(grant => ({ ...grant, remembered: true, active: uses.some(([, use]) => use.remembered === grant.id) })),
      ...uses.filter(([, use]) => !remembered.some(grant => grant.id === use.remembered))
        .map(([id, { app, kind, since }]) => ({ id, app, kind, since, remembered: false, active: true })),
    ];
  }

  async revoke(id: string): Promise<void> {
    await this.forget(id);
    for (const [useId, use] of [...this.uses])
      if (useId === id || use.remembered === id) use.stop();
  }

  private changed(): void {
    for (const listener of this.listeners) listener();
  }
}

export const sharing = new SharingAuthority();
