const CYRILLIC: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', ґ: 'g', д: 'd', ђ: 'dj', ѓ: 'gj', е: 'e', ё: 'e', є: 'ie', ж: 'z', з: 'z', ѕ: 'dz', и: 'i',
  і: 'i', ї: 'i', й: 'i', ј: 'j', к: 'k', ќ: 'kj', л: 'l', љ: 'lj', м: 'm', н: 'n', њ: 'nj', о: 'o', п: 'p', р: 'r', с: 's',
  т: 't', ћ: 'c', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'c', џ: 'dz', ш: 's', щ: 'sc', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'iu', я: 'ia',
};
const LETTERS: Record<string, string> = { đ: 'dj', ß: 'ss', ø: 'o', œ: 'oe', æ: 'ae', ł: 'l', ı: 'i', þ: 'th', ð: 'd', ħ: 'h' };

const TOKEN = /\d+(?:[.,:/-]\d+)*\.?|[\p{L}][\p{L}']*|%/gu;

export function fold(text: string): string {
  return text.toLowerCase()
    .replace(/[Ѐ-ӿ]/g, letter => CYRILLIC[letter] ?? letter)
    .normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/[đßøœæłıþðħ]/g, letter => LETTERS[letter]);
}

export interface Tokens {
  folded: string[];
  original: string[];
}

export function tokenize(text: string): Tokens {
  const prepared = text.normalize('NFC').toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\b([ap])\.m\.?/g, '$1m')
    .replace(/o'clock/g, 'oclock')
    .replace(/,(?=\s|$)/g, ' ');
  const original = prepared.match(TOKEN) ?? [];
  return { original, folded: original.map(fold) };
}

export const tokens = (text: string) => tokenize(text).folded;

export function words(...lists: string[]): Set<string> {
  return new Set(lists.flatMap(list => list.split(/\s+/)).filter(Boolean));
}

export function count(token: string | undefined, numbers: ReadonlyMap<string, number>): number | null {
  if (token === undefined) return null;
  const spelled = numbers.get(token);
  if (spelled !== undefined) return spelled;
  if (!/^\d+(?:[.,]\d+)?$/.test(token)) return null;
  return Number(token.replace(',', '.'));
}

export class Cursor {
  at = 0;

  constructor(readonly tokens: readonly string[]) {}

  get done(): boolean {
    return this.at >= this.tokens.length;
  }

  peek(offset = 0): string | undefined {
    return this.tokens[this.at + offset];
  }

  take(): string | undefined {
    return this.tokens[this.at++];
  }

  word(set: ReadonlySet<string>): string | null {
    const token = this.peek();
    if (token === undefined || !set.has(token)) return null;
    this.at++;
    return token;
  }

  attempt<T>(parse: (cursor: Cursor) => T | null): T | null {
    const start = this.at;
    const parsed = parse(this);
    if (parsed === null) this.at = start;
    return parsed;
  }
}
