import Gio from 'gi://Gio';

const ORDER = 'quick-tile-order';
const REMOVED = 'quick-tiles-removed';
const KNOWN = 'quick-tiles-known';

export class TileLayout {
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });

  constructor() {
    this.hideNewTiles();
  }

  order(defaults: string[]): string[] {
    const stored = this.settings.get_strv(ORDER).filter(id => defaults.includes(id));
    return [...stored, ...defaults.filter(id => !stored.includes(id))];
  }

  watchRemoved(changed: () => void): () => void {
    const id = this.settings.connect(`changed::${REMOVED}`, changed);
    return () => this.settings.disconnect(id);
  }

  get removed(): Set<string> {
    return new Set(this.settings.get_strv(REMOVED));
  }

  get customized(): boolean {
    return this.settings.get_user_value(ORDER) !== null || this.settings.get_user_value(REMOVED) !== null;
  }

  saveOrder(ids: string[]): void {
    this.settings.set_strv(ORDER, ids);
  }

  remove(id: string): void {
    this.settings.set_strv(REMOVED, [...this.removed, id]);
  }

  restore(id: string): void {
    this.settings.set_strv(REMOVED, [...this.removed].filter(removed => removed !== id));
  }

  private hideNewTiles(): void {
    const hiddenByDefault = this.settings.get_default_value(REMOVED)!.deepUnpack() as string[];
    const known = new Set(this.settings.get_strv(KNOWN));
    const unknown = hiddenByDefault.filter(id => !known.has(id));
    if (!unknown.length) return;
    if (this.settings.get_user_value(REMOVED)) this.settings.set_strv(REMOVED, [...new Set([...this.removed, ...unknown])]);
    this.settings.set_strv(KNOWN, hiddenByDefault);
  }

  reset(): void {
    this.settings.reset(ORDER);
    this.settings.reset(REMOVED);
  }
}
