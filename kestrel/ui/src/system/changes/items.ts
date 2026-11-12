import type GLib from 'gi://GLib';

import { t } from '../../shared/i18n/index.js';
import { SETTINGS_PAGES } from '../settingsPages.js';
import type { Option, Setting, Value } from '../../../../../packages/web/settings-catalogue/catalogue.js';
import { Key } from './keys.js';

type Catalogue = typeof import('../../../../../packages/web/settings-catalogue/catalogue.js');

export class Invalid extends Error {}

/** One change as the review shows it, with what it is now and how to make it. */
export interface Item {
  setting: Setting;
  value: Value;
  title: string;
  from: string;
  to: string;
  note: string | null;
}

let catalogue: Promise<Catalogue> | null = null;

const load = () => (catalogue ??= import('../../../../../packages/web/settings-catalogue/catalogue.js'));

function words(setting: Setting, value: Value | null): string {
  if (value === null) return t('changes-unknown');
  const option = setting.options?.find(candidate => candidate.value === value);
  if (option?.label) return t(option.label);
  if (option?.name) return option.name;
  if (typeof value === 'boolean') return t(value ? 'changes-on' : 'changes-off');
  if (setting.unit) return t(`changes-${setting.unit}`, { count: value as number });
  return String(value);
}

function given(variant: GLib.Variant): Value {
  const value = variant.recursiveUnpack();
  if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') return value;
  throw new Invalid('A value has to be on or off, a number or text');
}

function checked(setting: Setting, value: Value, isMapped: (setting: Setting) => boolean): Value {
  const offered = setting.options?.map(option => option.value);
  if (setting.key) {
    const key = Key.open(setting.key);
    if (!key) throw new Invalid(`${setting.id} isn't installed on this computer`);
    if ((offered && key.type !== 'b' && !offered.includes(value)) || !key.variant(value)) throw new Invalid(`${setting.id} can't be ${String(value)}`);
    return value;
  }
  if (isMapped(setting) || setting.type === 'choice') {
    if (!offered?.includes(value)) throw new Invalid(`${setting.id} can't be ${String(value)}`);
    return value;
  }
  if (setting.type === 'switch' && typeof value !== 'boolean') throw new Invalid(`${setting.id} is on or off`);
  if (setting.type === 'text' && (typeof value !== 'string' || !value.trim())) throw new Invalid(`${setting.id} takes text`);
  return value;
}

export function mappedNow(setting: Setting, matches: Catalogue['matches']): Value | null {
  const option = setting.options?.find(candidate =>
    Object.entries(candidate.when ?? {}).every(([name, condition]) => {
      const key = Key.open(name);
      return !!key && matches(condition, key.read());
    }));
  return option?.value ?? null;
}

export function currentOf(setting: Setting, matches: Catalogue['matches'], system: Map<string, Value>, service: Map<string, Value>): Value | null {
  if (setting.key) return Key.open(setting.key)?.read() ?? null;
  if (setting.system) return system.get(setting.system) ?? null;
  if (setting.service) return service.get(setting.service) ?? null;
  return mappedNow(setting, matches);
}

export interface Requested {
  setting: Setting;
  value: Value;
}

/**
 * The changes a review was asked for, each checked against the catalogue and
 * the keys themselves: anything Kestrel can't describe truthfully is refused.
 */
export async function requested(changes: [string, GLib.Variant][]): Promise<{ catalogue: Catalogue; changes: Requested[] }> {
  const loaded = await load();
  if (!changes.length) throw new Invalid('There is nothing to review');
  const seen = new Set<string>();
  const checkedChanges = changes.map(([id, variant]) => {
    const setting = loaded.SETTINGS.find(candidate => candidate.id === id && !candidate.developer);
    if (!setting) throw new Invalid(`There is no setting called ${id}`);
    if (seen.has(id)) throw new Invalid(`${id} is changed twice`);
    seen.add(id);
    return { setting, value: checked(setting, given(variant), loaded.isMapped) };
  });
  return { catalogue: loaded, changes: checkedChanges };
}

export function describe(change: Requested, current: Value | null): Item {
  const option: Option | undefined = change.setting.options?.find(candidate => candidate.value === change.value);
  return {
    ...change,
    title: t('changes-setting', { page: t(SETTINGS_PAGES.find(page => page.id === change.setting.page)!.title), setting: t(change.setting.title!) }),
    from: words(change.setting, current),
    to: words(change.setting, change.value),
    note: option?.note ? t(option.note) : null,
  };
}
