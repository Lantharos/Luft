import type { Manifest, SettingDescription, SettingValue } from '../api/v1/types.js';
import { validValue } from './manifest.js';
import type { ExtensionStore } from './store.js';

function carried(setting: SettingDescription, previous: SettingValue): SettingValue | undefined {
  const value = setting.type === 'choice' ? setting.options.find(option => (option.replaces ?? option.value) === previous)?.value : previous;
  return validValue(setting, value) ? value : undefined;
}

/** Gives an extension the settings the person chose in the one it replaces, and keeps it off if the person turned that one off. */
export function inherit(successor: Manifest, replaced: string, store: ExtensionStore): void {
  const values: Record<string, SettingValue> = {};
  for (const setting of successor.settings ?? []) {
    const previous = store.value(replaced, setting.replaces ?? setting.key);
    const value = previous === undefined ? undefined : carried(setting, previous);
    if (value !== undefined) values[setting.key] = value;
  }
  if (Object.keys(values).length) store.setValues(successor.id, values);
  if (store.disabled.has(replaced) && !store.problem(replaced)) store.setDisabled(successor.id, true);
}
