import { parse } from 'smol-toml';

import type { ChoiceOption, Manifest, Permission, SettingCondition, SettingDescription, SettingsPageId, SettingValue, ShortcutDescription, SliderRange } from '../api/v1/types.js';
import { API_VERSIONS } from '../api/versions.js';

export const MANIFEST = 'extension.toml';
export const MODULE = 'extension.js';

const ID = /^[A-Za-z][A-Za-z0-9_-]*(\.[A-Za-z][A-Za-z0-9_-]*){2,}$/;
const KEY = /^[a-z][a-z0-9-]*$/;
const MESSAGE = /^[a-zA-Z][\w-]*$/;
const HEX = /^#[0-9a-f]{6}$/i;
const PERMISSIONS: readonly Permission[] = [
  'wallpaper', 'quick-settings', 'taskbar', 'search', 'notifications', 'weather', 'location', 'media', 'popups', 'typing', 'sounds', 'audio-levels',
  'calls', 'locked-sounds', 'input-sounds', 'do-not-disturb', 'screen-effects',
];
const NEEDS: Partial<Record<Permission, Permission>> = { 'locked-sounds': 'sounds', 'input-sounds': 'sounds' };
const APART: Partial<Record<Permission, Permission>> = { 'input-sounds': 'audio-levels' };
const HOST = /^(localhost|127\.0\.0\.1|[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+)(:\d{1,5})?$/;
const PAGES: Record<SettingsPageId, readonly Permission[]> = {
  appearance: ['wallpaper'],
  taskbar: ['taskbar'],
  sound: ['sounds', 'audio-levels'],
  input: ['typing', 'input-sounds'],
};
const IMAGE = /\.(png|jpe?g|webp|svg)$/i;

export class ManifestError extends Error {}

type Table = Record<string, unknown>;

function fail(message: string): never {
  throw new ManifestError(message);
}

function table(value: unknown, where: string): Table {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) fail(`${where} must be a table`);
  return value as Table;
}

function text(source: Table, key: string, where: string, pattern?: RegExp): string {
  const value = source[key];
  if (typeof value !== 'string' || !value || (pattern && !pattern.test(value))) fail(`${where}.${key} is missing or malformed`);
  return value;
}

function optionalText(source: Table, key: string, where: string): string | undefined {
  return source[key] === undefined ? undefined : text(source, key, where);
}

function number(source: Table, key: string, where: string): number {
  const value = source[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) fail(`${where}.${key} must be a number`);
  return value;
}

function list(source: Table, key: string, where: string): unknown[] {
  const value = source[key] ?? [];
  if (!Array.isArray(value)) fail(`${where}.${key} must be a list`);
  return value;
}

export function insideFolder(path: string): boolean {
  return !path.startsWith('/') && !path.split('/').includes('..');
}

function image(source: Table, where: string): string | undefined {
  const path = optionalText(source, 'image', where);
  if (path !== undefined && (!insideFolder(path) || !IMAGE.test(path))) fail(`${where}.image must be a PNG, JPEG, WebP or SVG inside the extension`);
  return path;
}

function options(source: Table, key: string, where: string): ChoiceOption[] {
  return list(source, key, where).map((entry, index) => {
    const at = `${where}.${key}[${index}]`;
    const option = table(entry, at);
    const described: ChoiceOption = { value: text(option, 'value', at), label: text(option, 'label', at, MESSAGE) };
    const picture = image(option, at);
    if (picture) described.image = picture;
    return described;
  });
}

export function validValue(setting: SettingDescription, value: unknown): value is SettingValue {
  switch (setting.type) {
    case 'switch': return typeof value === 'boolean';
    case 'choice': return setting.options.some(option => option.value === value);
    case 'choices':
      return Array.isArray(value) && value.length >= (setting.min ?? 0) && new Set(value).size === value.length &&
        value.every(picked => setting.options.some(option => option.value === picked));
    case 'slider': return typeof value === 'number' && value >= setting.min && value <= setting.max;
    case 'color': return value === 'accent' || value === 'wallpaper' || (typeof value === 'string' && HEX.test(value));
  }
}

function page(source: Table, where: string, permissions: readonly Permission[]): SettingsPageId | undefined {
  const value = source.page;
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !(value in PAGES)) fail(`${where}.page must be appearance, taskbar, sound or input`);
  const allowed = PAGES[value as SettingsPageId];
  if (!allowed.some(permission => permissions.includes(permission))) fail(`${where} shows on the ${value} page, which needs the ${allowed.join(' or ')} permission`);
  return value as SettingsPageId;
}

function condition(source: Table, where: string): SettingCondition | undefined {
  const when = source.when;
  if (when === undefined || Array.isArray(when)) return when as SettingCondition | undefined;
  const range = table(when, `${where}.when`);
  const unknown = Object.keys(range).find(end => end !== 'min' && end !== 'max');
  if (unknown) fail(`${where}.when can only have min and max, not ${unknown}`);
  return Object.fromEntries(Object.keys(range).map(end => [end, number(range, end, `${where}.when`)]));
}

function setting(entry: unknown, index: number, permissions: readonly Permission[]): SettingDescription {
  const where = `settings[${index}]`;
  const source = table(entry, where);
  const base = {
    key: text(source, 'key', where, KEY), label: text(source, 'label', where, MESSAGE), depends: optionalText(source, 'depends', where),
    when: condition(source, where), page: page(source, where, permissions), hidden: source.hidden === true,
  };
  const type = source.type;
  let described: SettingDescription;
  switch (type) {
    case 'switch':
      described = { ...base, type, default: source.default as boolean };
      break;
    case 'choice':
      described = { ...base, type, default: source.default as string, options: options(source, 'options', where) };
      if (!described.options.length) fail(`${where} offers no options`);
      break;
    case 'choices': {
      described = { ...base, type, default: source.default as string[], options: options(source, 'options', where) };
      if (!described.options.length) fail(`${where} offers no options`);
      if (source.min !== undefined) described.min = number(source, 'min', where);
      if ((described.min ?? 0) > described.options.length) fail(`${where}.min is more than it offers`);
      break;
    }
    case 'slider': {
      const unit = source.unit;
      if (unit !== undefined && unit !== 'percent') fail(`${where}.unit must be "percent"`);
      described = { ...base, type, default: source.default as number, min: number(source, 'min', where), max: number(source, 'max', where), unit };
      if (source.step !== undefined) described.step = number(source, 'step', where);
      if (described.min >= described.max) fail(`${where}.min must be below max`);
      break;
    }
    case 'color':
      described = { ...base, type, default: source.default as string, swatches: options(source, 'swatches', where) };
      if (!described.swatches!.every(swatch => validValue(described, swatch.value))) fail(`${where}.swatches must be colours`);
      break;
    default:
      fail(`${where}.type must be switch, choice, choices, slider or color`);
  }
  if (!validValue(described, described.default)) fail(`${where}.default doesn't fit the setting`);
  return described;
}

function checkCondition(described: SettingDescription, parent: SettingDescription): void {
  const { key, when } = described;
  if (when === undefined) {
    if (parent.type !== 'switch') fail(`${key} depends on ${parent.key}, which isn't a switch, so it needs when`);
  } else if (Array.isArray(when)) {
    if (!when.length) fail(`${key}'s when names no values`);
    const possible = (value: unknown) => parent.type === 'choices' ? parent.options.some(option => option.value === value) : validValue(parent, value);
    const wrong = when.find(value => !possible(value));
    if (wrong !== undefined) fail(`${key}'s when has ${JSON.stringify(wrong)}, which ${parent.key} can't be`);
  } else {
    const { min, max } = when as SliderRange;
    if (parent.type !== 'slider') fail(`${key}'s when is a range, which only works on a slider, and ${parent.key} isn't one`);
    if (min === undefined && max === undefined) fail(`${key}'s when has neither min nor max`);
    const low = min ?? parent.min;
    const high = max ?? parent.max;
    if (low > high || low > parent.max || high < parent.min) fail(`${key}'s when is outside what ${parent.key} can be`);
  }
}

function dependencies(settings: SettingDescription[]): void {
  const keys = new Set<string>();
  for (const described of settings) {
    if (keys.has(described.key)) fail(`settings has ${described.key} twice`);
    keys.add(described.key);
  }
  settings.forEach((described, index) => {
    if (!described.depends) {
      if (described.when !== undefined) fail(`${described.key} has when without depends`);
      return;
    }
    const parent = settings.slice(0, index).find(other => other.key === described.depends);
    if (!parent) fail(`${described.key} depends on ${described.depends}, which isn't declared before it`);
    checkCondition(described, parent);
  });
}

function helper(source: Table): Manifest['helper'] {
  if (source.helper === undefined) return undefined;
  const described = table(source.helper, 'helper');
  const path = text(described, 'path', 'helper');
  if (!insideFolder(path)) fail('helper.path must stay inside the extension');
  if (described['turned-off'] === undefined) return { path };
  const turnedOff = list(described, 'turned-off', 'helper');
  if (!turnedOff.every(argument => typeof argument === 'string')) fail('helper.turned-off must be a list of arguments');
  return { path, turnedOff: turnedOff as string[] };
}

function network(source: Table): Manifest['network'] {
  if (source.network === undefined) return undefined;
  const hosts = list(table(source.network, 'network'), 'hosts', 'network');
  if (!hosts.length) fail('network.hosts names no hosts');
  return {
    hosts: hosts.map((host, index) => {
      if (typeof host !== 'string' || !HOST.test(host)) fail(`network.hosts[${index}] must be a host name such as api.example.com`);
      return host;
    }),
  };
}

function shortcut(entry: unknown, index: number): ShortcutDescription {
  const where = `shortcuts[${index}]`;
  const source = table(entry, where);
  const described: ShortcutDescription = { key: text(source, 'key', where, KEY), label: text(source, 'label', where, MESSAGE) };
  const accelerator = optionalText(source, 'default', where);
  if (accelerator !== undefined) described.default = accelerator;
  return described;
}

function shortcuts(source: Table): ShortcutDescription[] {
  const described = list(source, 'shortcuts', 'manifest').map(shortcut);
  const keys = new Set(described.map(entry => entry.key));
  if (keys.size !== described.length) fail('shortcuts has a key twice');
  return described;
}

export function parseManifest(source: string): Manifest {
  let document: Table;
  try {
    document = parse(source);
  } catch (error) {
    fail(`${MANIFEST} isn't valid TOML: ${(error as Error).message}`);
  }
  const api = document.api;
  if (typeof api !== 'number' || !(api in API_VERSIONS)) fail(`it targets extension API ${String(api)}, which this Kestrel doesn't support`);
  const permissions = list(document, 'permissions', 'manifest').map(permission => {
    if (!PERMISSIONS.includes(permission as Permission)) fail(`it asks for an unknown permission, ${String(permission)}`);
    return permission as Permission;
  });
  for (const permission of permissions) {
    const needed = NEEDS[permission];
    if (needed && !permissions.includes(needed)) fail(`${permission} needs the ${needed} permission too`);
    const apart = APART[permission];
    if (apart && permissions.includes(apart)) fail(`${permission} can't go with the ${apart} permission`);
  }
  const settings = list(document, 'settings', 'manifest').map((entry, index) => setting(entry, index, permissions));
  dependencies(settings);
  return {
    id: text(document, 'id', 'manifest', ID),
    name: text(document, 'name', 'manifest'),
    description: optionalText(document, 'description', 'manifest'),
    version: text(document, 'version', 'manifest'),
    api: api as Manifest['api'],
    permissions,
    settings,
    shortcuts: shortcuts(document),
    helper: helper(document),
    network: network(document),
  };
}
