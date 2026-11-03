import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { PageItem, PageSection } from '../types.js';

type Callback = (value: unknown) => void;
type Plain = Record<string, unknown>;

const SECTION_LIMIT = 40;
const ITEM_LIMIT = 200;
const IMAGE = /\.(png|jpe?g|webp|svg)$/i;

/** A page built once: what Settings gets as JSON, and the callbacks its controls name. */
export interface BuiltPage {
  json: string;
  callbacks: Map<string, Callback>;
}

function text(value: unknown, what: string): string {
  if (typeof value !== 'string') throw new Error(`${what} must be text`);
  return value;
}

function optionalText(value: unknown, what: string): string | undefined {
  return value === undefined ? undefined : text(value, what);
}

function finite(value: unknown, what: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${what} must be a number`);
  return value;
}

const ELEMENT_KEY = /^[a-z][a-z0-9-]*$/;

export function pageBuilder(folders: readonly string[], extensionPath: string, settings: ReadonlySet<string>, id: string) {
  const callbacks = new Map<string, Callback>();
  const callback = (run: unknown, what: string): string => {
    if (typeof run !== 'function') throw new Error(`${what} must be a function`);
    const id = `${callbacks.size}`;
    callbacks.set(id, run as Callback);
    return id;
  };
  const image = (path: unknown, what: string): string | undefined => {
    if (path === undefined) return undefined;
    const file = Gio.File.new_for_path(GLib.path_is_absolute(text(path, what)) ? path as string : GLib.build_filenamev([extensionPath, path as string]));
    if (!IMAGE.test(path as string) || !folders.some(folder => file.has_prefix(Gio.File.new_for_path(folder))))
      throw new Error(`${what} must be a PNG, JPEG, WebP or SVG in the extension's folders`);
    return file.get_path()!;
  };
  const control = (item: Plain, where: string) => ({ title: text(item.title, `${where}.title`), description: optionalText(item.description, `${where}.description`) });

  const describe = (entry: PageItem, where: string): Plain => {
    const item = entry as unknown as Plain;
    if ('setting' in item) {
      const key = text(item.setting, `${where}.setting`);
      if (!settings.has(key)) throw new Error(`${key} isn't a setting in extension.toml`);
      return { type: 'setting', key };
    }
    switch (item.type) {
      case 'text': return { type: 'text', text: text(item.text, `${where}.text`) };
      case 'taskbar-place': {
        const key = text(item.element, `${where}.element`);
        if (!ELEMENT_KEY.test(key)) throw new Error(`${where}.element must be an element's key`);
        return { type: 'taskbar-place', element: `${id}/${key}` };
      }
      case 'row': return { type: 'row', ...control(item, where), value: optionalText(item.value, `${where}.value`), action: item.onActivate ? callback(item.onActivate, `${where}.onActivate`) : undefined };
      case 'switch': return { type: 'switch', ...control(item, where), checked: !!item.checked, action: callback(item.onToggled, `${where}.onToggled`) };
      case 'choice': return {
        type: 'choice', ...control(item, where), value: text(item.value, `${where}.value`), action: callback(item.onChanged, `${where}.onChanged`),
        options: (item.options as Plain[]).map((option, index) => ({
          value: text(option.value, `${where}.options[${index}].value`), label: text(option.label, `${where}.options[${index}].label`),
          image: image(option.image, `${where}.options[${index}].image`),
        })),
      };
      case 'slider': return {
        type: 'slider', ...control(item, where), value: finite(item.value, `${where}.value`), min: finite(item.min, `${where}.min`), max: finite(item.max, `${where}.max`),
        step: item.step === undefined ? undefined : finite(item.step, `${where}.step`), unit: item.unit === 'percent' ? 'percent' : undefined,
        action: callback(item.onChanged, `${where}.onChanged`),
      };
      case 'button': return { type: 'button', ...control(item, where), label: text(item.label, `${where}.label`), danger: !!item.danger, action: callback(item.onActivate, `${where}.onActivate`) };
      case 'entry': return {
        type: 'entry', ...control(item, where), value: text(item.value, `${where}.value`), placeholder: optionalText(item.placeholder, `${where}.placeholder`),
        action: callback(item.onSubmit, `${where}.onSubmit`),
      };
      case 'preview': return { type: 'preview', image: image(item.image, `${where}.image`), description: text(item.description, `${where}.description`) };
      case 'list': return {
        type: 'list', empty: optionalText(item.empty, `${where}.empty`),
        items: (item.items as Plain[]).slice(0, ITEM_LIMIT).map((row, index) => ({
          title: text(row.title, `${where}.items[${index}].title`), description: optionalText(row.description, `${where}.items[${index}].description`),
          image: image(row.image, `${where}.items[${index}].image`),
          actions: ((row.actions ?? []) as Plain[]).map((action, number) => ({
            label: text(action.label, `${where}.items[${index}].actions[${number}].label`), danger: !!action.danger,
            action: callback(action.onActivate, `${where}.items[${index}].actions[${number}].onActivate`),
          })),
        })),
      };
      default: throw new Error(`${where} isn't a kind of page item`);
    }
  };

  return (sections: readonly PageSection[]): BuiltPage => {
    if (!Array.isArray(sections)) throw new Error('A settings page is a list of sections');
    const described = sections.slice(0, SECTION_LIMIT).map((section, index) => ({
      title: optionalText(section.title, `sections[${index}].title`),
      description: optionalText(section.description, `sections[${index}].description`),
      items: section.items.slice(0, ITEM_LIMIT).map((item: PageItem, number: number) => describe(item, `sections[${index}].items[${number}]`)),
    }));
    return { json: JSON.stringify(described), callbacks };
  };
}
