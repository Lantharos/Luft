import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';

export type KeyAction = 'hide' | 'languageMenu' | 'emoji' | 'modifier' | 'delete' | 'levelSwitch';

export interface ModelKey {
  strings?: string[];
  label?: string;
  iconName?: string;
  keyval?: string;
  action?: KeyAction;
  level?: string;
  width?: number;
  height?: number;
  leftOffset?: number;
}

export interface ModelLevel {
  level: string;
  rows: ModelKey[][];
}

const LATIN_LAYOUTS: Record<string, string> = { rs: 'hr' };

const PURPOSE_LAYOUTS = new Map<Clutter.InputContentPurpose, string>([
  [Clutter.InputContentPurpose.DIGITS, 'digits'],
  [Clutter.InputContentPurpose.NUMBER, 'number'],
  [Clutter.InputContentPurpose.PHONE, 'phone'],
  [Clutter.InputContentPurpose.EMAIL, 'email'],
  [Clutter.InputContentPurpose.URL, 'url'],
]);

export function keyvalOf(key: ModelKey): number {
  return key.keyval ? parseInt(key.keyval, 16) : 0;
}

export function loadResource<T>(name: string): T {
  const file = Gio.File.new_for_uri(`resource:///com/lantharos/kestrel/osk-layouts/${name}.json`);
  const [, contents] = file.load_contents(null);
  return JSON.parse(new TextDecoder().decode(contents)) as T;
}

function loadLevels(groupName: string): ModelLevel[] {
  return loadResource<{ levels: ModelLevel[] }>(groupName).levels;
}

function layoutCandidates(groupName: string): string[] {
  const [layout, variant] = groupName.split('+');
  if (!variant) return [layout, 'us'];
  if (variant.startsWith('latin')) return [groupName, LATIN_LAYOUTS[layout] ?? 'us', 'us'];
  return [groupName, layout, 'us'];
}

export function levelsFor(groupName: string, purpose: Clutter.InputContentPurpose): ModelLevel[] | null {
  const fixed = PURPOSE_LAYOUTS.get(purpose);
  if (fixed) return loadLevels(fixed);

  let groups = layoutCandidates(groupName);
  if (purpose === Clutter.InputContentPurpose.TERMINAL) groups = groups.map(group => `${group}-extended`);

  for (const group of groups) {
    try {
      return loadLevels(group);
    } catch {}
  }
  return null;
}
