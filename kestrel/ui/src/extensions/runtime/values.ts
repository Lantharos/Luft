import type { SettingDescription, SettingValue } from '../api/v1/types.js';
import { validValue } from './manifest.js';
import type { ExtensionStore } from './store.js';

/** One extension's declared settings and their values, checked against the manifest both ways. */
export class SettingValues {
  private readonly described: Map<string, SettingDescription>;
  private readonly listeners = new Set<(key: string) => void>();
  private known: Map<string, SettingValue>;

  constructor(private readonly id: string, settings: readonly SettingDescription[], private readonly store: ExtensionStore) {
    this.described = new Map(settings.map(setting => [setting.key, setting]));
    this.known = this.snapshot();
  }

  get descriptions(): SettingDescription[] {
    return [...this.described.values()];
  }

  describe(key: string): SettingDescription {
    const setting = this.described.get(key);
    if (!setting) throw new Error(`${key} isn't a setting in extension.toml`);
    return setting;
  }

  get(key: string): SettingValue {
    const setting = this.describe(key);
    const stored = this.store.value(this.id, key);
    return stored !== undefined && validValue(setting, stored) ? stored : setting.default;
  }

  set(key: string, value: SettingValue): void {
    const setting = this.describe(key);
    if (!validValue(setting, value)) throw new Error(`${JSON.stringify(value)} doesn't fit the setting ${key}`);
    if (this.get(key) !== value) this.store.setValue(this.id, key, value);
  }

  /** Whether a setting shows: every switch it depends on is on, or is `assumedOn`, such as the toggle a menu belongs to. */
  shown(key: string, assumedOn?: string): boolean {
    const depends = this.describe(key).depends;
    return !depends || depends === assumedOn || (this.get(depends) === true && this.shown(depends, assumedOn));
  }

  watch(changed: (key: string) => void): () => void {
    this.listeners.add(changed);
    return () => this.listeners.delete(changed);
  }

  refresh(): void {
    const previous = this.known;
    this.known = this.snapshot();
    for (const [key, value] of this.known)
      if (previous.get(key) !== value) for (const listener of [...this.listeners]) listener(key);
  }

  private snapshot(): Map<string, SettingValue> {
    return new Map([...this.described.keys()].map(key => [key, this.get(key)]));
  }
}
