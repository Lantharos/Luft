/** What the field holds around its cursor, letter by letter. */
export interface Surrounding {
  letters: string[];
  cursor: number;
}

/** Text input can only delete next to the cursor, then type at it: this does both, and the rest is typed back. */
export interface Edit {
  offset: number;
  length: number;
  commit: string;
}

const SPACE = /\s/u;
const CLINGS_LEFT = /^[.,!?;:)\]}%»"'’]/u;

export function surroundingOf([text, cursor]: [string | null, number, number]): Surrounding | null {
  return text === null ? null : { letters: Array.from(text), cursor };
}

export function replace({ letters, cursor }: Surrounding, from: number, to: number, text: string): Edit {
  const low = Math.min(from, cursor);
  const high = Math.max(to, cursor);
  return {
    offset: low - cursor,
    length: high - low,
    commit: letters.slice(low, from).join('') + text + letters.slice(to, high).join(''),
  };
}

/** Puts spaces around written words where the letters next to them need one. */
export function spaced(letters: string[], at: number, text: string): string {
  const before = letters[at - 1];
  const after = letters[at];
  const lead = before !== undefined && !SPACE.test(before) && !CLINGS_LEFT.test(text) ? ' ' : '';
  const trail = after !== undefined && !SPACE.test(after) && !CLINGS_LEFT.test(after) ? ' ' : '';
  return lead + text + trail;
}

/** The words a stroke crossed out: each one it covers at least half of, and the space after them. */
export function struckWords(letters: string[], from: number, to: number): [number, number] | null {
  let start = -1;
  let end = -1;
  for (let i = 0; i < letters.length;) {
    if (SPACE.test(letters[i])) {
      i++;
      continue;
    }
    let j = i;
    while (j < letters.length && !SPACE.test(letters[j])) j++;
    if (2 * (Math.min(j, to) - Math.max(i, from)) >= j - i) {
      if (start < 0) start = i;
      end = j;
    }
    i = j;
  }
  if (start < 0) return null;
  if (end < letters.length && SPACE.test(letters[end])) end++;
  else while (start > 0 && SPACE.test(letters[start - 1])) start--;
  return [start, end];
}
