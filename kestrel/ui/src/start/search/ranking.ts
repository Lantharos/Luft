const WORD_START = /[\s\-_.]/;
const MAXIMUM_USAGE_LIFT = 1.25;
const LAUNCHES_FOR_HALF_LIFT = 3;

enum Tier { Prefix, WordStart, Keyword, Substring }

export interface Searchable {
  key: string;
  name: string;
  keywords: string[];
}

export interface Match<T extends Searchable> {
  entry: T;
  exact: boolean;
  score: number;
}

function tier({ name, keywords }: Searchable, query: string): Tier | null {
  const index = name.indexOf(query);
  if (index === 0) return Tier.Prefix;
  if (index > 0 && WORD_START.test(name[index - 1])) return Tier.WordStart;
  if (keywords.some(keyword => keyword.startsWith(query))) return Tier.Keyword;
  if (index > 0) return Tier.Substring;
  return null;
}

function usageLift(launches: number): number {
  return MAXIMUM_USAGE_LIFT * launches / (launches + LAUNCHES_FOR_HALF_LIFT);
}

export function byRelevance<T extends Searchable>(a: Match<T>, b: Match<T>): number {
  return Number(b.exact) - Number(a.exact) || a.score - b.score;
}

export function rank<T extends Searchable>(entries: T[], query: string, launches: (key: string) => number): Match<T>[] {
  const matches: Match<T>[] = [];
  for (const entry of entries) {
    const found = tier(entry, query);
    if (found === null) continue;
    matches.push({ entry, exact: entry.name === query, score: found - usageLift(launches(entry.key)) });
  }
  return matches.sort(byRelevance);
}
