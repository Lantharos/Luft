import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export interface Folder { name: string; apps: string[]; }
interface Layout { items: string[]; folders: Record<string, Folder>; }

export class StartLayout {
  private readonly settings = new Gio.Settings({ schema_id: 'org.gnome.shell' });
  private layout: Layout = JSON.parse(this.settings.get_string('kestrel-start-layout'));

  folder(id: string): Folder | undefined { return this.layout.folders[id]; }
  items(folder: string | null = null): string[] { return folder ? this.folder(folder)?.apps ?? [] : this.layout.items; }

  sync(installed: string[]): void {
    const available = new Set(installed);
    for (const folder of Object.values(this.layout.folders)) folder.apps = folder.apps.filter(id => available.has(id));
    this.layout.items = this.layout.items.filter(id => this.folder(id) || available.has(id));
    this.prune();
    const placed = new Set([...this.layout.items, ...Object.values(this.layout.folders).flatMap(folder => folder.apps)]);
    this.layout.items.push(...installed.filter(id => !placed.has(id)));
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
    this.layout.folders[key] = { name: 'Folder', apps: [target, id] };
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
    this.settings.set_string('kestrel-start-layout', JSON.stringify(this.layout));
  }
}
