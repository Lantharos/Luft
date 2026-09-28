import Gio from 'gi://Gio';

import { canonical } from './accelerators.js';

export interface StoredShortcut { description: string; shortcuts: string[] }
export type AppShortcuts = Record<string, StoredShortcut>;

const KEY = 'kestrel-global-shortcuts';

export class ShortcutStore {
  private readonly settings = new Gio.Settings({ schema_id: 'org.gnome.shell' });

  app(appId: string): AppShortcuts {
    return this.all()[appId] ?? {};
  }

  save(appId: string, shortcuts: AppShortcuts): void {
    this.settings.set_string(KEY, JSON.stringify({ ...this.all(), [appId]: shortcuts }));
  }

  takenByOthers(appId: string): Set<string> {
    return new Set(Object.entries(this.all()).filter(([id]) => id !== appId)
      .flatMap(([, shortcuts]) => Object.values(shortcuts).flatMap(shortcut => shortcut.shortcuts.map(canonical))));
  }

  private all(): Record<string, AppShortcuts> {
    return JSON.parse(this.settings.get_string(KEY));
  }
}
