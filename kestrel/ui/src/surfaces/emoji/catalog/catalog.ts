import { t } from '../../../shared/i18n/index.js';
import { characterDecoder, codepointOf, type Character, type CharacterTable } from './characters.js';
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
export type EmojiGroups = readonly { group: string; emoji: Entry[] }[];
type Fields = Omit<Item, 'order'>;

const LIGHT_TONE = '\u{1F3FB}';
export const SKIN_TONES = ['', LIGHT_TONE, '\u{1F3FC}', '\u{1F3FD}', '\u{1F3FE}', '\u{1F3FF}'];
const EMOJI_TABS: readonly (readonly [id: string, title: string])[] = [
  ['smileys', 'emoji-smileys'],
  ['people', 'emoji-people'],
  ['nature', 'emoji-nature'],
  ['food', 'emoji-food'],
  ['activities', 'emoji-activities'],
  ['travel', 'emoji-travel'],
  ['objects', 'emoji-objects'],
  ['symbols', 'emoji-symbols'],
  ['flags', 'emoji-flags'],
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

  find(text: string): Item | undefined {
    return this.byText.get(text);
  }

  tab(id: string, title: string, face: { icon?: string; glyph?: string }): Tab {
    const tab = { id, title, icon: face.icon ?? '', glyph: face.glyph, sections: [] };
    this.tabs.push(tab);
    return tab;
  }

  section(tab: Tab, title: string, fields: Fields[]): void {
    tab.sections.push({ title, tab, items: fields.map(field => this.byText.get(field.text) ?? this.add(field)) });
  }

  private add({ text, face, toned, kind, name, aliases, keywords }: Fields): Item {
    const item: Item = { text, face, toned, kind, order: this.items.length, name, aliases, keywords };
    this.items.push(item);
    this.byText.set(item.text, item);
    return item;
  }
}

export function* buildCatalog(groups: EmojiGroups, characters: CharacterTable): Generator<void, Catalog, unknown> {
  const catalog = new Catalog();
  const entries = new Map(groups.map(({ group, emoji }) => [group, emoji]));
  for (const [id, message] of EMOJI_TABS) {
    const title = t(message);
    catalog.section(catalog.tab(id, title, { icon: ICONS[id] }), title, entries.get(id)!.map(emoji));
    yield;
  }
  const decode = characterDecoder(characters);
  for (const { id, title, glyph, sections } of characters.tabs) {
    const tab = catalog.tab(id, title, { glyph });
    for (const section of sections) {
      catalog.section(tab, section.title, decode(section).map(character));
      yield;
    }
  }
  const kaomojiTitle = t('emoji-kaomoji');
  const kaomoji = catalog.tab('kaomoji', kaomojiTitle, { glyph: ';)' });
  catalog.section(kaomoji, kaomojiTitle, KAOMOJI.map(([text, name, keywords = '']) => ({ text, face: text, toned: null, kind: 'kaomoji', name, aliases: [], keywords })));
  return catalog;
}
