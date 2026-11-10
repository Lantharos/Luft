import GLib from 'gi://GLib';

import type { SettingDescription, SliderRange } from './api/v1/types.js';
import type { Installed } from './runtime/folders.js';
import type { ExtensionInstance } from './runtime/instance.js';
import type { ExtensionManager } from './runtime/manager.js';
import { chosenShortcuts } from './runtime/shortcuts.js';
import { variant } from './runtime/store.js';

type Fields = Record<string, GLib.Variant>;

const text = (value: string) => GLib.Variant.new_string(value);
const choices = (options: { value: string; label: string }[], instance: ExtensionInstance) =>
  new GLib.Variant('a(ss)', options.map(option => [option.value, instance.translations.t(option.label)]));
const pictures = (options: { image?: string }[], instance: ExtensionInstance) =>
  GLib.Variant.new_strv(options.map(option => GLib.build_filenamev([instance.installed.path, option.image!])));

function range({ min, max }: SliderRange = {}): Fields {
  return {
    ...min === undefined ? {} : { 'when-min': GLib.Variant.new_double(min) },
    ...max === undefined ? {} : { 'when-max': GLib.Variant.new_double(max) },
  };
}

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
  if (Array.isArray(setting.when)) fields.when = new GLib.Variant('av', setting.when.map(variant));
  else Object.assign(fields, range(setting.when as SliderRange | undefined));
  if (setting.page) fields.page = text(setting.page);
  if (setting.hidden) fields.hidden = GLib.Variant.new_boolean(true);
  if (setting.type === 'choice' || setting.type === 'choices') fields.options = choices(setting.options, instance);
  if (setting.type === 'choices' && setting.min) fields.min = GLib.Variant.new_double(setting.min);
  if (setting.type === 'choice' && setting.options.every(option => option.image)) fields.images = pictures(setting.options, instance);
  if (setting.type === 'color') fields.swatches = choices(setting.swatches ?? [], instance);
  if (setting.type === 'slider') {
    Object.assign(fields, { min: GLib.Variant.new_double(setting.min), max: GLib.Variant.new_double(setting.max) });
    if (setting.step) fields.step = GLib.Variant.new_double(setting.step);
    if (setting.unit) fields.unit = text(setting.unit);
  }
  return fields;
}

function shortcuts(instance: ExtensionInstance, manager: ExtensionManager): GLib.Variant {
  const { manifest, translations } = instance;
  const bound = instance.shortcuts.current?.accelerators ?? chosenShortcuts(manifest.id, manifest, manager.store);
  const chosen = manager.store.shortcutChoices[manifest.id] ?? {};
  return new GLib.Variant('aa{sv}', (manifest.shortcuts ?? []).map(shortcut => ({
    key: text(shortcut.key),
    label: text(translations.t(shortcut.label)),
    accelerators: GLib.Variant.new_strv(bound[shortcut.key] ?? []),
    default: text(shortcut.default ?? ''),
    changed: GLib.Variant.new_boolean(shortcut.key in chosen),
  })));
}

function state(installed: Installed, manager: ExtensionManager): string {
  const instance = manager.instance(installed.id);
  if (!instance) return 'invalid';
  if (instance.running) return 'running';
  const problem = manager.store.problem(installed.id);
  if (problem) return problem.kind === 'crash' ? 'crashed' : 'failed';
  return 'off';
}

export function listed(installed: Installed, manager: ExtensionManager): Fields {
  const instance = manager.instance(installed.id);
  const fields: Fields = {
    id: text(installed.id),
    path: text(installed.path),
    enabled: GLib.Variant.new_boolean(!manager.store.disabled.has(installed.id)),
    state: text(state(installed, manager)),
    problem: text(installed.problem ?? manager.store.problem(installed.id)?.detail ?? ''),
  };
  if (!instance) return { ...fields, name: text(installed.id) };
  const { manifest } = instance;
  return {
    ...fields,
    name: text(instance.name),
    description: text(instance.description),
    version: text(manifest.version),
    api: GLib.Variant.new_uint32(manifest.api),
    permissions: GLib.Variant.new_strv(manifest.permissions ?? []),
    helper: GLib.Variant.new_boolean(!!manifest.helper),
    network: GLib.Variant.new_strv(manifest.network?.hosts ?? []),
    listen: new GLib.Variant('a(qs)', (manifest.network?.listen ?? []).map(({ port, protocol }): [number, string] => [port, protocol])),
    settings: new GLib.Variant('aa{sv}', instance.values.descriptions.map(setting => described(setting, instance))),
    shortcuts: shortcuts(instance, manager),
    page: GLib.Variant.new_boolean(instance.page.described),
  };
}
