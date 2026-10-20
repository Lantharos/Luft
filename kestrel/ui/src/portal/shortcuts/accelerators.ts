import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';

import { formatsLocale, locale } from '../../shared/i18n/index.js';
import { keyLabel } from '../../shared/keys.js';

const MEDIA_KEYS = 'com.lantharos.kestrel.media-keys';
const CUSTOM_KEYBINDINGS = 'custom-keybindings';
const CUSTOM_KEYBINDING = 'com.lantharos.kestrel.custom-keybinding';
const KEYBINDING_SCHEMAS = [
  'org.gnome.desktop.wm.keybindings',
  'com.lantharos.kestrel.keybindings',
  'org.gnome.mutter.keybindings',
  'org.gnome.mutter.wayland.keybindings',
  MEDIA_KEYS,
];
const MODIFIERS: Record<string, string> = {
  ctrl: 'ctrl', control: 'ctrl', primary: 'ctrl', shift: 'shift', alt: 'alt', mod1: 'alt',
  super: 'super', mod4: 'super', logo: 'super', meta: 'meta', hyper: 'hyper',
};
const TYPING_MODIFIERS = new Set(['shift', 'mod2', 'lock']);
const EDITING_LETTERS = new Set(['a', 'c', 'v', 'x', 'y', 'z']);
const EDITING_KEYS = new Set(['left', 'right', 'up', 'down', 'home', 'end', 'page_up', 'page_down', 'prior', 'next', 'backspace', 'delete',
  'insert', 'tab', 'return', 'escape', 'space', 'f4']);
const LABEL_ORDER = ['super', 'ctrl', 'alt', 'shift', 'meta', 'hyper'];

interface Parsed { modifiers: string[]; key: string }

function parse(accelerator: string): Parsed {
  const modifiers = [...accelerator.matchAll(/<([^>]+)>/g)].map(match => MODIFIERS[match[1].toLowerCase()] ?? match[1].toLowerCase());
  return { modifiers: [...new Set(modifiers)].sort(), key: accelerator.replace(/<[^>]+>/g, '') };
}

export function canonical(accelerator: string): string {
  const { modifiers, key } = parse(accelerator);
  return [...modifiers, key.toLowerCase()].join('+');
}

export function label(accelerator: string): string {
  const { modifiers, key } = parse(accelerator);
  return [...LABEL_ORDER.filter(modifier => modifiers.includes(modifier)), key].map(keyLabel).join('+');
}

export function labels(accelerators: string[]): string {
  return new Intl.ListFormat(formatsLocale(), { type: 'unit', style: 'short' }).format(accelerators.map(label));
}

export function alternatives(accelerators: string[]): string {
  return new Intl.ListFormat(locale(), { type: 'disjunction' }).format(accelerators.map(label));
}

export function claimable(accelerator: string): boolean {
  const { modifiers, key } = parse(accelerator);
  const held = modifiers.filter(modifier => !TYPING_MODIFIERS.has(modifier));
  const name = key.toLowerCase();
  if (!held.length || !name) return false;
  if (held.length === 1 && held[0] === 'ctrl' && EDITING_LETTERS.has(name)) return false;
  return !(held.every(modifier => modifier === 'ctrl' || modifier === 'alt') && EDITING_KEYS.has(name));
}

export function reservedAccelerators(): Set<string> {
  const source = Gio.SettingsSchemaSource.get_default()!;
  const reserved = new Set<string>();
  for (const id of KEYBINDING_SCHEMAS) {
    const schema = source.lookup(id, true);
    if (!schema) continue;
    const settings = new Gio.Settings({ settings_schema: schema });
    for (const key of schema.list_keys()) {
      if (key === CUSTOM_KEYBINDINGS || schema.get_key(key).get_value_type().dup_string() !== 'as') continue;
      for (const accelerator of settings.get_strv(key)) if (accelerator) reserved.add(canonical(accelerator));
    }
  }
  for (const path of new Gio.Settings({ schema_id: MEDIA_KEYS }).get_strv(CUSTOM_KEYBINDINGS)) {
    const accelerator = new Gio.Settings({ schema_id: CUSTOM_KEYBINDING, path }).get_string('binding');
    if (accelerator) reserved.add(canonical(accelerator));
  }
  return reserved;
}

export function fromEvent(event: Clutter.Event): string | null {
  const keyval = Clutter.keyval_name(event.get_key_symbol());
  const name = keyval?.length === 1 ? keyval.toLowerCase() : keyval;
  if (!name || /^(Shift|Control|Alt|Super|Meta|Hyper|ISO_Level3)_[LR]$|^Caps_Lock$/.test(name)) return null;
  const state = event.get_state();
  const modifiers = [
    [Clutter.ModifierType.CONTROL_MASK, '<Control>'], [Clutter.ModifierType.MOD1_MASK, '<Alt>'],
    [Clutter.ModifierType.SHIFT_MASK, '<Shift>'], [Clutter.ModifierType.SUPER_MASK | Clutter.ModifierType.MOD4_MASK, '<Super>'],
  ] as const;
  return modifiers.filter(([mask]) => state & mask).map(([, text]) => text).join('') + name;
}
