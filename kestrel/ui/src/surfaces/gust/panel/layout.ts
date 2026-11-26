import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { t } from '../../../shared/i18n/index.js';

interface Folder { name: string; apps: string[]; }
interface Layout { items: string[]; folders: Record<string, Folder>; }

export class GustLayout {
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private stored = this.settings.get_string('gust-layout');
  private layout: Layout = JSON.parse(this.stored);
  private readonly signal: number;

  constructor(changed: () => void) {
    this.signal = this.settings.connect('changed::gust-layout', () => {
      const stored = this.settings.get_string('gust-layout');
      if (stored === this.stored) return;
      this.stored = stored;
      this.layout = JSON.parse(stored);
      changed();
    });
  }

  destroy(): void {
    this.settings.disconnect(this.signal);
  }

  folder(id: string): Folder | undefined { return this.layout.folders[id]; }
  items(folder: string | null = null): string[] { return folder ? this.folder(folder)?.apps ?? [] : this.layout.items; }

  pinned(id: string): boolean {
    return this.layout.items.includes(id) || Object.values(this.layout.folders).some(folder => folder.apps.includes(id));
  }

  adopt(ids: string[]): void {
    const known = new Set(this.settings.get_strv('gust-known-apps'));
    const fresh = known.size && this.settings.get_boolean('gust-pin-new-apps') ? ids.filter(id => !known.has(id) && !this.pinned(id)) : [];
    if (fresh.length) {
      this.layout.items.push(...fresh);
      this.save();
    }
    if (ids.length !== known.size || ids.some(id => !known.has(id))) this.settings.set_strv('gust-known-apps', ids);
  }

  pin(id: string): void {
    if (this.pinned(id)) return;
    this.layout.items.push(id);
    this.save();
  }

  unpin(id: string): void {
    this.remove(id);
    this.save();
  }

  move(id: string, folder: string | null, target?: string, after = false): void {
    if (id === target || (folder && this.folder(id))) return;
    this.remove(id);
    const items = this.items(folder);
    const index = target ? items.indexOf(target) : -1;
    items.splice(index < 0 ? items.length : index + Number(after), 0, id);
    this.save();
  }

  combine(id: string, target: string): void {
    if (id === target || this.folder(id)) return;
    if (this.folder(target)) { this.move(id, target); return; }
    const index = this.layout.items.indexOf(target);
    if (index < 0) return;
    const key = `folder:${GLib.uuid_string_random()}`;
    this.layout.items.splice(index, 1, key);
    this.remove(id);
    this.layout.folders[key] = { name: t('gust-folder-default-name'), apps: [target, id] };
    this.save();
  }

  rename(id: string, name: string): void {
    const folder = this.folder(id);
    if (!folder || !name.trim()) return;
    folder.name = name.trim();
    this.save();
  }

  dissolve(id: string): void {
    const folder = this.folder(id);
    if (!folder) return;
    const index = this.layout.items.indexOf(id);
    this.layout.items.splice(index, 1, ...folder.apps);
    delete this.layout.folders[id];
    this.save();
  }

  private remove(id: string): void {
    this.layout.items = this.layout.items.filter(item => item !== id);
    for (const folder of Object.values(this.layout.folders)) folder.apps = folder.apps.filter(item => item !== id);
  }

  private prune(): void {
    for (const [id, folder] of Object.entries(this.layout.folders)) {
      if (folder.apps.length) continue;
      delete this.layout.folders[id];
      this.layout.items = this.layout.items.filter(item => item !== id);
    }
  }

  private save(): void {
    this.prune();
    this.stored = JSON.stringify(this.layout);
    this.settings.set_string('gust-layout', this.stored);
  }
}
