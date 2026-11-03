import { parse } from 'smol-toml';

import type { ChoiceOption, Manifest, Permission, SettingDescription, SettingValue } from '../api/v1/types.js';
import { API_VERSIONS } from '../api/versions.js';

export const MANIFEST = 'extension.toml';
export const MODULE = 'extension.js';

const ID = /^[A-Za-z][A-Za-z0-9_-]*(\.[A-Za-z][A-Za-z0-9_-]*){2,}$/;
const KEY = /^[a-z][a-z0-9-]*$/;
const MESSAGE = /^[a-zA-Z][\w-]*$/;
const HEX = /^#[0-9a-f]{6}$/i;
const PERMISSIONS: readonly Permission[] = ['wallpaper', 'quick-settings', 'taskbar', 'search', 'notifications', 'weather', 'location', 'media'];

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

function options(source: Table, key: string, where: string): ChoiceOption[] {
  return list(source, key, where).map((entry, index) => {
    const option = table(entry, `${where}.${key}[${index}]`);
    return { value: text(option, 'value', `${where}.${key}[${index}]`), label: text(option, 'label', `${where}.${key}[${index}]`, MESSAGE) };
  });
}

export function validValue(setting: SettingDescription, value: unknown): value is SettingValue {
  switch (setting.type) {
    case 'switch': return typeof value === 'boolean';
    case 'choice': return setting.options.some(option => option.value === value);
    case 'slider': return typeof value === 'number' && value >= setting.min && value <= setting.max;
    case 'color': return value === 'accent' || (typeof value === 'string' && HEX.test(value));
  }
}

function setting(entry: unknown, index: number): SettingDescription {
  const where = `settings[${index}]`;
  const source = table(entry, where);
  const base = { key: text(source, 'key', where, KEY), label: text(source, 'label', where, MESSAGE), depends: optionalText(source, 'depends', where) };
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
      fail(`${where}.type must be switch, choice, slider or color`);
  }
  if (!validValue(described, described.default)) fail(`${where}.default doesn't fit the setting`);
  return described;
}

function dependencies(settings: SettingDescription[]): void {
  const keys = new Set<string>();
  for (const described of settings) {
    if (keys.has(described.key)) fail(`settings has ${described.key} twice`);
    keys.add(described.key);
  }
  settings.forEach((described, index) => {
    if (!described.depends) return;
    const depends = settings.slice(0, index).find(other => other.key === described.depends);
    if (depends?.type !== 'switch') fail(`${described.key} depends on ${described.depends}, which isn't a switch declared before it`);
  });
}

function helper(source: Table): Manifest['helper'] {
  if (source.helper === undefined) return undefined;
  const path = text(table(source.helper, 'helper'), 'path', 'helper');
  if (path.startsWith('/') || path.split('/').includes('..')) fail('helper.path must stay inside the extension');
  return { path };
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
  const settings = list(document, 'settings', 'manifest').map(setting);
  dependencies(settings);
  return {
    id: text(document, 'id', 'manifest', ID),
    name: text(document, 'name', 'manifest'),
    description: optionalText(document, 'description', 'manifest'),
    version: text(document, 'version', 'manifest'),
    api: api as Manifest['api'],
    permissions,
    settings,
    helper: helper(document),
  };
}
