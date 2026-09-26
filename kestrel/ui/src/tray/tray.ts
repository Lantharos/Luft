import type Clutter from 'gi://Clutter';
import St from 'gi://St';

import type { ContextMenus } from '../contextMenus.js';
import { TrayItem } from './item.js';
import { StatusNotifierWatcher, type TrayItemAddress } from './watcher.js';

export class Tray {
  readonly actor = new St.BoxLayout({ name: 'kestrel-tray', style_class: 'kestrel-tray' });
  private readonly items = new Map<string, TrayItem>();
  private readonly watcher: StatusNotifierWatcher;

  constructor(private readonly menus: ContextMenus) {
    this.watcher = new StatusNotifierWatcher(this);
  }

  added(id: string, address: TrayItemAddress): void {
    const item = new TrayItem(address, this.menus);
    this.items.set(id, item);
    this.actor.add_child(item.actor);
  }

  removed(id: string): void {
    this.items.get(id)?.destroy();
    this.items.delete(id);
  }

  contains(actor: Clutter.Actor | null): boolean {
    return !!actor && this.actor.contains(actor);
  }

  shutdown(): void {
    this.watcher.destroy();
    for (const item of this.items.values()) item.shutdown();
    this.items.clear();
  }
}
