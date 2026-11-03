import GLib from 'gi://GLib';

import type { SettingDescription } from './api/v1/types.js';
import type { Installed } from './runtime/folders.js';
import type { ExtensionInstance } from './runtime/instance.js';
import type { ExtensionManager } from './runtime/manager.js';
import { variant } from './runtime/store.js';

type Fields = Record<string, GLib.Variant>;

const text = (value: string) => GLib.Variant.new_string(value);
const choices = (options: { value: string; label: string }[], instance: ExtensionInstance) =>
  new GLib.Variant('a(ss)', options.map(option => [option.value, instance.translations.t(option.label)]));

function described(setting: SettingDescription, instance: ExtensionInstance): Fields {
  const { translations, values } = instance;
  const fields: Fields = {
    key: text(setting.key),
    type: text(setting.type),
    label: text(translations.t(setting.label)),
    description: text(translations.has(`${setting.label}.description`) ? translations.t(`${setting.label}.description`) : ''),
    value: variant(values.get(setting.key)),
    default: variant(setting.default),
  };
  if (setting.depends) fields.depends = text(setting.depends);
  if (setting.type === 'choice') fields.options = choices(setting.options, instance);
  if (setting.type === 'color') fields.swatches = choices(setting.swatches ?? [], instance);
  if (setting.type === 'slider') {
    Object.assign(fields, { min: GLib.Variant.new_double(setting.min), max: GLib.Variant.new_double(setting.max) });
    if (setting.step) fields.step = GLib.Variant.new_double(setting.step);
    if (setting.unit) fields.unit = text(setting.unit);
  }
  return fields;
}

function state(installed: Installed, manager: ExtensionManager): string {
  const instance = manager.instance(installed.id);
  if (!instance) return 'invalid';
  if (instance.running) return 'running';
  const problem = manager.store.problem(installed.id);
  if (problem) return problem.kind === 'crash' ? 'crashed' : 'failed';
  return 'off';
}

/** What `List` answers for one extension. */
export function listed(installed: Installed, manager: ExtensionManager): Fields {
  const instance = manager.instance(installed.id);
  const fields: Fields = {
    id: text(installed.id),
    path: text(installed.path),
    origin: text(installed.origin),
    overrides: GLib.Variant.new_boolean(installed.overrides),
    enabled: GLib.Variant.new_boolean(!manager.store.disabled.has(installed.id)),
    state: text(state(installed, manager)),
    problem: text(installed.problem ?? manager.store.problem(installed.id)?.detail ?? ''),
  };
  if (!instance) return { ...fields, name: text(installed.id) };
  const { manifest } = instance;
  const usage = instance.usage();
  return {
    ...fields,
    name: text(instance.name),
    description: text(instance.description),
    version: text(manifest.version),
    api: GLib.Variant.new_uint32(manifest.api),
    permissions: GLib.Variant.new_strv(manifest.permissions ?? []),
    helper: GLib.Variant.new_boolean(!!manifest.helper),
    settings: new GLib.Variant('aa{sv}', instance.values.descriptions.map(setting => described(setting, instance))),
    ...usage ? { cpu: GLib.Variant.new_double(usage.cpu), memory: GLib.Variant.new_uint64(usage.memory) } : {},
  };
}
