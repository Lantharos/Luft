import type { Extension, SettingDescription } from '@luft/extension-api';

import manifest from '../../extension.toml';
import type { Granted } from '../rules.js';

const declared = new Map((manifest as { settings: SettingDescription[] }).settings.map(setting => [setting.key, setting]));

const OFF = new Set<unknown>([false, 0, 'off', 'none']);

/** Whether an effect is on: a choice that isn't off, a switch that's on, or a slider above where it does nothing. */
function on({ settings }: Extension<Granted>, key: string): boolean {
  const value = settings.get(key);
  return key === 'pixelate' ? value !== 1 : !OFF.has(value);
}

/** What an effect is called while it's on: the option picked, or the setting's own name. */
function name({ settings, t }: Extension<Granted>, key: string): string {
  const setting = declared.get(key)!;
  const option = setting.type === 'choice' && setting.options.find(choice => choice.value === settings.get(key));
  return t(option ? option.label : setting.label);
}

/** What a subpage's row says about it: the one effect that's on, how many are, or that none is. Opening and closing the same way counts once. */
export function summary(phosphor: Extension<Granted>, keys: readonly string[]): string {
  const names = [...new Set(keys.filter(key => on(phosphor, key)).map(key => name(phosphor, key)))];
  if (names.length === 1) return names[0];
  return names.length ? phosphor.t('page-on', { count: names.length }) : phosphor.t('off');
}

export const anyOn = (phosphor: Extension<Granted>, keys: readonly string[]) => keys.some(key => on(phosphor, key));
