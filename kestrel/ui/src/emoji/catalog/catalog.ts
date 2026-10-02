import Gio from 'gi://Gio';

import { codepointOf, loadCharacters, type Character } from './characters.js';
import { KAOMOJI } from './kaomoji.js';

export type Kind = 'emoji' | 'character' | 'space' | 'kaomoji';

export interface Tab {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly glyph?: string;
  readonly sections: Section[];
}

export interface Section {
  readonly title: string;
  readonly tab: Tab;
  readonly items: Item[];
}

export interface Item {
  readonly text: string;
  readonly face: string;
  readonly toned: string | null;
  readonly kind: Kind;
  readonly order: number;
  name: string;
  aliases: string[];
  keywords: string;
}

type Entry = string | [string, string];
type Fields = Omit<Item, 'order'>;

const LIGHT_TONE = '\u{1F3FB}';
export const SKIN_TONES = ['', LIGHT_TONE, '\u{1F3FC}', '\u{1F3FD}', '\u{1F3FE}', '\u{1F3FF}'];
const EMOJI_TABS: readonly (readonly [id: string, title: string])[] = [
  ['smileys', 'Smileys and emotion'],
  ['people', 'People and body'],
  ['nature', 'Animals and nature'],
  ['food', 'Food and drink'],
  ['activities', 'Activities'],
  ['travel', 'Travel and places'],
  ['objects', 'Objects'],
  ['symbols', 'Symbols'],
  ['flags', 'Flags'],
];
const ICONS: Record<string, string> = {
  smileys: 'emoji-people-symbolic', people: 'emoji-body-symbolic', nature: 'emoji-nature-symbolic',
  food: 'emoji-food-symbolic', activities: 'emoji-activities-symbolic', travel: 'emoji-travel-symbolic',
  objects: 'emoji-objects-symbolic', symbols: 'emoji-symbols-symbolic', flags: 'emoji-flags-symbolic',
};

export function withTone(item: Item, tone: number): string {
  return tone && item.toned ? item.toned.replaceAll(LIGHT_TONE, SKIN_TONES[tone]) : item.text;
}

export function annotationKey(text: string): string {
  return text.replace(/[\u{FE0E}\u{FE0F}]/gu, '');
}

export function describe(item: Item): string {
  const name = item.name.charAt(0).toLocaleUpperCase() + item.name.slice(1);
  return item.kind === 'character' || item.kind === 'space' ? `${name} · ${codepointOf(item.text)}` : name;
}

function emoji(entry: Entry): Fields {
  const [text, toned] = typeof entry === 'string' ? [entry, null] : entry;
  return { text, face: text, toned, kind: 'emoji', name: '', aliases: [], keywords: '' };
}

function character({ text, name, label, aliases }: Character): Fields {
  return { text, face: label ?? text, toned: null, kind: label ? 'space' : 'character', name, aliases, keywords: '' };
}

export class Catalog {
  readonly tabs: Tab[] = [];
  readonly items: Item[] = [];
  private readonly byText = new Map<string, Item>();

  constructor() {
    const file = Gio.File.new_for_uri('resource:///org/gnome/shell/osk-layouts/emoji.json');
    const groups: { group: string; emoji: Entry[] }[] = JSON.parse(new TextDecoder().decode(file.load_contents(null)[1]));
    const entries = new Map(groups.map(({ group, emoji }) => [group, emoji]));
    for (const [id, title] of EMOJI_TABS) this.section(this.tab(id, title, { icon: ICONS[id] }), title, entries.get(id)!.map(emoji));
    for (const { id, title, glyph, sections } of loadCharacters()) {
      const tab = this.tab(id, title, { glyph });
      for (const section of sections) this.section(tab, section.title, section.characters.map(character));
    }
    const kaomoji = this.tab('kaomoji', 'Kaomoji', { glyph: ';)' });
    this.section(kaomoji, 'Kaomoji', KAOMOJI.map(([text, name, keywords = '']) => ({ text, face: text, toned: null, kind: 'kaomoji', name, aliases: [], keywords })));
  }

  find(text: string): Item | undefined {
    return this.byText.get(text);
  }

  private tab(id: string, title: string, face: { icon?: string; glyph?: string }): Tab {
    const tab = { id, title, icon: face.icon ?? '', glyph: face.glyph, sections: [] };
    this.tabs.push(tab);
    return tab;
  }

  private section(tab: Tab, title: string, fields: Fields[]): void {
    tab.sections.push({ title, tab, items: fields.map(field => this.byText.get(field.text) ?? this.add(field)) });
  }

  private add({ text, face, toned, kind, name, aliases, keywords }: Fields): Item {
    const item: Item = { text, face, toned, kind, order: this.items.length, name, aliases, keywords };
    this.items.push(item);
    this.byText.set(item.text, item);
    return item;
  }
}
