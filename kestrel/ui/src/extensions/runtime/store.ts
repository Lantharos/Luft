import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { SettingValue } from '../api/v1/types.js';

export type ProblemKind = 'error' | 'crash';

export interface Problem {
  kind: ProblemKind;
  detail: string;
}

const DISABLED = 'disabled-extensions';
const REMOVED = 'removed-extensions';
const SETTINGS = 'extension-settings';
const PROBLEMS = 'extension-problems';

/** What the person decided about extensions, kept in Kestrel's settings. */
export class ExtensionStore {
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private values: Record<string, Record<string, SettingValue>>;

  constructor() {
    this.values = this.readValues();
  }

  private readValues(): Record<string, Record<string, SettingValue>> {
    return this.settings.get_value(SETTINGS).recursiveUnpack() as Record<string, Record<string, SettingValue>>;
  }

  watchValues(changed: (id: string) => void): () => void {
    const handler = this.settings.connect(`changed::${SETTINGS}`, () => {
      const previous = this.values;
      this.values = this.readValues();
      for (const id of new Set([...Object.keys(previous), ...Object.keys(this.values)]))
        if (JSON.stringify(previous[id] ?? {}) !== JSON.stringify(this.values[id] ?? {})) changed(id);
    });
    return () => this.settings.disconnect(handler);
  }

  watchStates(changed: () => void): () => void {
    return this.watch([DISABLED, PROBLEMS], changed);
  }

  watchRemoved(changed: () => void): () => void {
    return this.watch([REMOVED], changed);
  }

  private watch(keys: string[], changed: () => void): () => void {
    const handlers = keys.map(key => this.settings.connect(`changed::${key}`, changed));
    return () => handlers.forEach(handler => this.settings.disconnect(handler));
  }

  get disabled(): ReadonlySet<string> {
    return new Set(this.settings.get_strv(DISABLED));
  }

  get removed(): ReadonlySet<string> {
    return new Set(this.settings.get_strv(REMOVED));
  }

  setDisabled(id: string, disabled: boolean): void {
    const ids = new Set(this.disabled);
    if (disabled === ids.has(id)) return;
    if (disabled) ids.add(id);
    else ids.delete(id);
    this.settings.set_strv(DISABLED, [...ids].sort());
  }

  setRemoved(id: string, removed: boolean): void {
    const ids = new Set(this.removed);
    if (removed === ids.has(id)) return;
    if (removed) ids.add(id);
    else ids.delete(id);
    this.settings.set_strv(REMOVED, [...ids].sort());
  }

  value(id: string, key: string): SettingValue | undefined {
    return this.values[id]?.[key];
  }

  setValue(id: string, key: string, value: SettingValue): void {
    const own = { ...this.values[id], [key]: value };
    this.writeValues({ ...this.values, [id]: own });
  }

  forgetValues(id: string): void {
    if (!(id in this.values)) return;
    const { [id]: _forgotten, ...rest } = this.values;
    this.writeValues(rest);
  }

  private writeValues(values: Record<string, Record<string, SettingValue>>): void {
    const packed = Object.fromEntries(Object.entries(values).map(([id, own]) =>
      [id, Object.fromEntries(Object.entries(own).map(([key, value]) => [key, variant(value)]))]));
    this.settings.set_value(SETTINGS, new GLib.Variant('a{sa{sv}}', packed));
  }

  problem(id: string): Problem | null {
    const found = (this.settings.get_value(PROBLEMS).deepUnpack() as Record<string, [string, string]>)[id];
    return found ? { kind: found[0] as ProblemKind, detail: found[1] } : null;
  }

  setProblem(id: string, problem: Problem | null): void {
    const problems = this.settings.get_value(PROBLEMS).deepUnpack() as Record<string, [string, string]>;
    if (!problem && !(id in problems)) return;
    if (problem) problems[id] = [problem.kind, problem.detail];
    else delete problems[id];
    this.settings.set_value(PROBLEMS, new GLib.Variant('a{s(ss)}', problems));
  }
}

export function variant(value: SettingValue): GLib.Variant {
  if (typeof value === 'boolean') return GLib.Variant.new_boolean(value);
  if (typeof value === 'number') return GLib.Variant.new_double(value);
  return GLib.Variant.new_string(value);
}
