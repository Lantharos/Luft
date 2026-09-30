import GLib from 'gi://GLib';

import { annotationKey, type Item } from './catalog.js';

const ROOT = '/usr/share/unicode/cldr/common';
const FOLDERS = ['annotations', 'annotationsDerived'];
const ANNOTATION = /<annotation cp="([^"]+)"( type="tts")?>([^<]+)<\/annotation>/g;
const INHERITED = '↑↑↑';
const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" };

function unescape(text: string): string {
  return text.includes('&') ? text.replace(/&(amp|lt|gt|quot|apos);/g, entity => ENTITIES[entity]) : text;
}

function locales(): string[] {
  const names = GLib.get_language_names().filter(name => !/[.@]/.test(name) && name !== 'C' && name !== 'POSIX');
  return [...new Set(['en', ...names.reverse()])];
}

export function annotate(items: readonly Item[]): void {
  const byKey = new Map(items.map(item => [annotationKey(item.text), item]));
  const decoder = new TextDecoder();
  for (const locale of locales()) {
    for (const folder of FOLDERS) {
      let contents: Uint8Array;
      try {
        contents = GLib.file_get_contents(`${ROOT}/${folder}/${locale}.xml`)[1];
      } catch {
        continue;
      }
      for (const [, key, tts, value] of decoder.decode(contents).matchAll(ANNOTATION)) {
        const item = byKey.get(unescape(key));
        if (!item || value === INHERITED) continue;
        if (tts) item.name = unescape(value);
        else item.keywords = unescape(value);
      }
    }
  }
}

interface Entry {
  readonly item: Item;
  readonly name: string;
  readonly nameWords: string;
  readonly words: string;
}

const SEPARATORS = /[\s|:,.\-–—()]+/;

function normalize(text: string): string {
  return text.toLocaleLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

function words(text: string): string {
  return ` ${text.split(SEPARATORS).filter(Boolean).join(' ')} `;
}

export class EmojiIndex {
  private readonly entries: Entry[];

  constructor(items: readonly Item[]) {
    this.entries = items.map(item => {
      const name = normalize(item.name);
      return { item, name, nameWords: words(name), words: words(`${name} ${normalize(item.keywords)}`) };
    });
  }

  search(query: string): Item[] {
    const phrase = normalize(query.trim());
    const tokens = phrase.split(SEPARATORS).filter(Boolean).map(token => ` ${token}`);
    if (!tokens.length) return [];
    const matches: { item: Item; rank: number }[] = [];
    for (const entry of this.entries) {
      if (!tokens.every(token => entry.words.includes(token))) continue;
      matches.push({ item: entry.item, rank: this.rank(entry, phrase, tokens) });
    }
    return matches.sort((a, b) => a.rank - b.rank || a.item.order - b.item.order).map(match => match.item);
  }

  private rank(entry: Entry, phrase: string, tokens: string[]): number {
    if (entry.name === phrase) return 0;
    if (entry.name.startsWith(`${phrase} `)) return 1;
    if (entry.name.startsWith(phrase)) return 2;
    if (tokens.every(token => entry.nameWords.includes(`${token} `))) return 3;
    if (tokens.every(token => entry.nameWords.includes(token))) return 4;
    if (tokens.every(token => entry.words.includes(`${token} `))) return 5;
    return 6;
  }
}
