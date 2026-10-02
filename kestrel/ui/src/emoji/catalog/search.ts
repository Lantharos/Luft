import type { Item } from './catalog.js';

const SEPARATORS = /[\s|:,.\-–—()]+/;
const ALL_SEPARATORS = new RegExp(SEPARATORS.source, 'g');
const NON_ASCII = /[^\x00-\x7f]/;
const SIGN = ' sign';
const DIRECTIONS = /\b(left|right|up|down)wards\b/g;
const INITIALS = /(?<= )[^ ]/gu;
const KEYWORD_RANK = 5;
const LENGTH_LIMIT = 128;

function normalize(text: string): string {
  const lower = text.toLocaleLowerCase();
  return NON_ASCII.test(lower) ? lower.normalize('NFD').replace(/\p{M}/gu, '') : lower;
}

function words(text: string): string {
  return ` ${text.replace(ALL_SEPARATORS, ' ').trim()} `;
}

function variants(name: string): string[] {
  const found = [name];
  if (name.endsWith(SIGN)) found.push(name.slice(0, -SIGN.length));
  if (name.includes('wards')) found.push(name.replace(DIRECTIONS, '$1'));
  return found;
}

class Entry {
  private nameWords: string[] | null = null;

  constructor(readonly item: Item, readonly names: readonly string[], readonly words: string) {}

  wordsOf(index: number): string {
    this.nameWords ??= this.names.map(words);
    return this.nameWords[index];
  }
}

function entry(item: Item): Entry {
  const names = [...new Set([...variants(normalize(item.name)), ...item.aliases.map(normalize)])];
  return new Entry(item, names, words(`${names.join(' ')} ${normalize(item.keywords)}`));
}

interface Query {
  readonly phrase: string;
  readonly phraseWord: string;
  readonly prefixes: readonly string[];
  readonly words: readonly string[];
}

function containsAll(text: string, parts: readonly string[]): boolean {
  for (const part of parts) if (!text.includes(part)) return false;
  return true;
}

function nameRank(entry: Entry, index: number, query: Query): number {
  const name = entry.names[index];
  if (name === query.phrase) return 0;
  if (name.startsWith(query.phraseWord)) return 1;
  if (name.startsWith(query.phrase)) return 2;
  const nameWords = entry.wordsOf(index);
  if (containsAll(nameWords, query.words)) return 3;
  if (containsAll(nameWords, query.prefixes)) return 4;
  return Infinity;
}

function score(entry: Entry, query: Query): number {
  let best = Infinity;
  for (let index = 0; index < entry.names.length; index++) {
    const rank = nameRank(entry, index, query);
    if (rank !== Infinity) best = Math.min(best, rank * LENGTH_LIMIT + Math.min(entry.names[index].length, LENGTH_LIMIT - 1));
  }
  if (best !== Infinity) return best;
  const rank = containsAll(entry.words, query.words) ? KEYWORD_RANK : KEYWORD_RANK + 1;
  return rank * LENGTH_LIMIT + Math.min(entry.names[0].length, LENGTH_LIMIT - 1);
}

export class SearchIndex {
  private readonly entries: Entry[] = [];
  private readonly byInitial = new Map<string, Entry[]>();
  private previous: { phrase: string; entries: Entry[] } = { phrase: '', entries: [] };

  constructor(private readonly items: readonly Item[]) {}

  get complete(): boolean {
    return this.entries.length === this.items.length;
  }

  extend(count: number): void {
    const end = Math.min(this.items.length, this.entries.length + count);
    for (let index = this.entries.length; index < end; index++) {
      const added = entry(this.items[index]);
      this.entries.push(added);
      for (const initial of new Set(added.words.match(INITIALS))) {
        const entries = this.byInitial.get(initial);
        if (entries) entries.push(added);
        else this.byInitial.set(initial, [added]);
      }
    }
  }

  search(text: string): Item[] {
    this.extend(Infinity);
    const phrase = normalize(text.trim());
    const prefixes = phrase.split(SEPARATORS).filter(Boolean).map(token => ` ${token}`);
    if (!prefixes.length) return [];
    const query = { phrase, phraseWord: `${phrase} `, prefixes, words: prefixes.map(prefix => `${prefix} `) };
    const candidates = this.previous.phrase && phrase.startsWith(this.previous.phrase)
      ? this.previous.entries
      : this.rarestBucket(prefixes);
    const found = candidates.filter(entry => containsAll(entry.words, prefixes));
    this.previous = { phrase, entries: found };
    const count = this.items.length;
    const keys = Float64Array.from(found, entry => score(entry, query) * count + entry.item.order).sort();
    return Array.from(keys, key => this.items[key % count]);
  }

  private rarestBucket(prefixes: readonly string[]): Entry[] {
    const buckets = prefixes.map(prefix => this.byInitial.get(String.fromCodePoint(prefix.codePointAt(1)!)) ?? []);
    return buckets.reduce((rarest, bucket) => bucket.length < rarest.length ? bucket : rarest);
  }
}
