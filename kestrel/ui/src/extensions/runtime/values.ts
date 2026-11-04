import type { SettingCondition, SettingDescription, SettingValue, SliderRange } from '../api/v1/types.js';
import { validValue } from './manifest.js';
import type { ExtensionStore } from './store.js';

const same = (one: SettingValue | undefined, other: SettingValue | undefined) => JSON.stringify(one) === JSON.stringify(other);

function met(when: SettingCondition | undefined, value: SettingValue): boolean {
  if (when === undefined) return value === true;
  if (Array.isArray(when)) return when.some(wanted => Array.isArray(value) ? value.includes(wanted) : value === wanted);
  const { min = -Infinity, max = Infinity } = when as SliderRange;
  return typeof value === 'number' && value >= min && value <= max;
}

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
    const stored = setting.type === 'choices' ? setting.options.map(option => option.value).filter(option => (value as readonly string[]).includes(option)) : value;
    if (!same(this.get(key), stored)) this.store.setValue(this.id, key, stored);
  }

  /** Whether a setting shows: everything it depends on shows and has a value it wants. `assumedOn` is a switch taken to be on, such as the toggle a menu belongs to. */
  shown(key: string, assumedOn?: string): boolean {
    const { depends, when } = this.describe(key);
    if (!depends) return true;
    if (depends === assumedOn) return met(when, true);
    return met(when, this.get(depends)) && this.shown(depends, assumedOn);
  }

  watch(changed: (key: string) => void): () => void {
    this.listeners.add(changed);
    return () => this.listeners.delete(changed);
  }

  refresh(): void {
    const previous = this.known;
    this.known = this.snapshot();
    for (const [key, value] of this.known)
      if (!same(previous.get(key), value)) for (const listener of [...this.listeners]) listener(key);
  }

  private snapshot(): Map<string, SettingValue> {
    return new Map([...this.described.keys()].map(key => [key, this.get(key)]));
  }
}
