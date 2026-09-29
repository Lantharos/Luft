import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';

const KEYBINDING_SCHEMAS = [
  'org.gnome.desktop.wm.keybindings',
  'com.lantharos.kestrel.keybindings',
  'org.gnome.mutter.keybindings',
  'org.gnome.mutter.wayland.keybindings',
  'org.gnome.settings-daemon.plugins.media-keys',
];
const MODIFIERS: Record<string, string> = {
  ctrl: 'ctrl', control: 'ctrl', primary: 'ctrl', shift: 'shift', alt: 'alt', mod1: 'alt',
  super: 'super', mod4: 'super', logo: 'super', meta: 'meta', hyper: 'hyper',
};
const PUNCTUATION = new Set(['space', 'minus', 'equal', 'comma', 'period', 'slash', 'semicolon', 'apostrophe',
  'bracketleft', 'bracketright', 'backslash', 'grave']);
const LABELS: [string, string][] = [['super', 'Super'], ['ctrl', 'Ctrl'], ['alt', 'Alt'], ['shift', 'Shift'], ['meta', 'Meta'], ['hyper', 'Hyper']];

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
  const names = LABELS.filter(([modifier]) => modifiers.includes(modifier)).map(([, name]) => name);
  return [...names, key.length === 1 ? key.toUpperCase() : key].join('+');
}

export function typesText(accelerator: string): boolean {
  const { modifiers, key } = parse(accelerator);
  return modifiers.every(modifier => modifier === 'shift') && (key.length === 1 || PUNCTUATION.has(key.toLowerCase()));
}

export function reservedAccelerators(): Set<string> {
  const source = Gio.SettingsSchemaSource.get_default()!;
  const reserved = new Set<string>();
  for (const id of KEYBINDING_SCHEMAS) {
    const schema = source.lookup(id, true);
    if (!schema) continue;
    const settings = new Gio.Settings({ settings_schema: schema });
    for (const key of schema.list_keys()) {
      if (schema.get_key(key).get_value_type().dup_string() !== 'as') continue;
      for (const accelerator of settings.get_strv(key)) if (accelerator) reserved.add(canonical(accelerator));
    }
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
