import Gio from 'gi://Gio';

const ORDER = 'quick-tile-order';
const REMOVED = 'quick-tiles-removed';

export class TileLayout {
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });

  order(defaults: string[]): string[] {
    const stored = this.settings.get_strv(ORDER).filter(id => defaults.includes(id));
    return [...stored, ...defaults.filter(id => !stored.includes(id))];
  }

  get removed(): Set<string> {
    return new Set(this.settings.get_strv(REMOVED));
  }

  get customized(): boolean {
    return this.settings.get_strv(ORDER).length > 0 || this.settings.get_strv(REMOVED).length > 0;
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

  reset(): void {
    this.settings.reset(ORDER);
    this.settings.reset(REMOVED);
  }
}
