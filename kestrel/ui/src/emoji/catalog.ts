import Gio from 'gi://Gio';

import { CHARACTERS, KAOMOJI, type Named } from './extras.js';

export type Kind = 'emoji' | 'character' | 'kaomoji';

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
  readonly toned: string | null;
  readonly kind: Kind;
  readonly order: number;
  name: string;
  keywords: string;
}

type Entry = string | [string, string];

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

export class Catalog {
  readonly tabs: Tab[] = [];
  readonly items: Item[] = [];
  private readonly byText = new Map<string, Item>();

  constructor() {
    const file = Gio.File.new_for_uri('resource:///org/gnome/shell/osk-layouts/emoji.json');
    const groups: { group: string; emoji: Entry[] }[] = JSON.parse(new TextDecoder().decode(file.load_contents(null)[1]));
    const emoji = new Map(groups.map(({ group, emoji }) => [group, emoji]));
    for (const [id, title] of EMOJI_TABS) {
      const tab = this.tab(id, title, { icon: ICONS[id] });
      this.section(tab, title, emoji.get(id)!.map(entry => typeof entry === 'string' ? [entry, null] : entry), 'emoji');
    }
    const characters = this.tab('characters', 'Special characters', { glyph: 'Ω' });
    for (const [title, entries] of CHARACTERS) this.named(characters, title, entries, 'character');
    this.named(this.tab('kaomoji', 'Kaomoji', { glyph: ';)' }), 'Kaomoji', KAOMOJI, 'kaomoji');
  }

  find(text: string): Item | undefined {
    return this.byText.get(text);
  }

  private tab(id: string, title: string, face: { icon?: string; glyph?: string }): Tab {
    const tab = { id, title, icon: face.icon ?? '', glyph: face.glyph, sections: [] };
    this.tabs.push(tab);
    return tab;
  }

  private named(tab: Tab, title: string, entries: readonly Named[], kind: Kind): void {
    const section = this.section(tab, title, entries.map(([text]) => [text, null]), kind);
    section.items.forEach((item, index) => {
      item.name = entries[index][1];
      item.keywords = entries[index][2] ?? '';
    });
  }

  private section(tab: Tab, title: string, entries: [string, string | null][], kind: Kind): Section {
    const section: Section = { title, tab, items: [] };
    for (const [text, toned] of entries) {
      const item: Item = { text, toned, kind, order: this.items.length, name: '', keywords: '' };
      section.items.push(item);
      this.items.push(item);
      this.byText.set(text, item);
    }
    tab.sections.push(section);
    return section;
  }
}
