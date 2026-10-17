const WORD_BREAK = /[\s\-_.,:;/&()+]+/;
const MAXIMUM_USAGE_LIFT = 1.25;
const LAUNCHES_FOR_HALF_LIFT = 3;

const Tier = { Exact: 0, Prefix: 1, WordStart: 2, Words: 2.5, Keyword: 3, Substring: 4 } as const;

export interface Searchable {
  key: string;
  name: string;
  keywords: string[];
  words: string[];
}

export interface Query {
  text: string;
  words: string[];
}

export interface Match<T extends Searchable> {
  entry: T;
  score: number;
}

export function fold(text: string): string {
  return text.toLocaleLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

export function query(text: string): Query {
  const folded = fold(text.trim());
  return { text: folded, words: folded.split(WORD_BREAK).filter(Boolean) };
}

export function searchable<T extends object>(value: T, key: string, name: string, keywords: string[]): T & Searchable {
  const folded = fold(name);
  const foldedKeywords = keywords.map(fold);
  const words = [folded, ...foldedKeywords].flatMap(text => text.split(WORD_BREAK)).filter(Boolean);
  return { ...value, key, name: folded, keywords: foldedKeywords, words };
}

function startsWord(text: string, part: string): boolean {
  const index = text.indexOf(part);
  return index === 0 || (index > 0 && WORD_BREAK.test(text[index - 1]));
}

function tier(entry: Searchable, { text, words }: Query): number | null {
  if (entry.name === text) return Tier.Exact;
  const index = entry.name.indexOf(text);
  if (index === 0) return Tier.Prefix;
  if (index > 0 && WORD_BREAK.test(entry.name[index - 1])) return Tier.WordStart;
  if (words.length > 1 && words.every(word => entry.words.some(candidate => candidate.startsWith(word)))) return Tier.Words;
  if (entry.keywords.some(keyword => startsWord(keyword, text))) return Tier.Keyword;
  if (index > 0) return Tier.Substring;
  return null;
}

function usageLift(launches: number): number {
  return MAXIMUM_USAGE_LIFT * launches / (launches + LAUNCHES_FOR_HALF_LIFT);
}

export function rank<T extends Searchable>(entries: T[], search: Query, bias: number, launches: (key: string) => number): Match<T>[] {
  const matches: Match<T>[] = [];
  for (const entry of entries) {
    const found = tier(entry, search);
    if (found !== null) matches.push({ entry, score: found + bias - usageLift(launches(entry.key)) });
  }
  return matches.sort((a, b) => a.score - b.score);
}
