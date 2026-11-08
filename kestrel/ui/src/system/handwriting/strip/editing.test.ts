import { describe, expect, test } from 'bun:test';

import { replace, spaced, struckWords } from './editing.js';

const field = (text: string, cursor: number) => ({ letters: Array.from(text), cursor });

describe('editing a field through its cursor', () => {
  test('a word struck out before the cursor is deleted and the text after it typed back', () => {
    const text = 'Wir sehen uns morgen';
    const [from, to] = struckWords(Array.from(text), 9, 14)!;
    const edit = replace(field(text, text.length), from, to, '');
    expect(edit).toEqual({ offset: -10, length: 10, commit: 'morgen' });
  });

  test('a word struck out after the cursor is deleted without moving the text before it', () => {
    const text = 'Vidimo se sutra';
    const [from, to] = struckWords(Array.from(text), 10, 13)!;
    expect(replace(field(text, 0), from, to, '')).toEqual({ offset: 0, length: 15, commit: 'Vidimo se' });
  });

  test('a stroke only strikes the words it mostly covers', () => {
    expect(struckWords(Array.from('Vidimo se sutra'), 6, 11)).toEqual([7, 10]);
    expect(struckWords(Array.from('Vidimo se sutra'), 1, 2)).toBeNull();
  });

  test('writing between two words gets a space on each side', () => {
    const letters = Array.from('Shihemi nesër');
    expect(spaced(letters, 7, 'sot')).toBe(' sot');
    expect(spaced(Array.from('Shihemisot'), 7, 'nesër')).toBe(' nesër ');
    expect(spaced(letters, 13, '!')).toBe('!');
  });

  test('letters beyond the basic plane count as one letter each', () => {
    const edit = replace(field('ok 😀 fine', 9), 3, 5, '');
    expect(edit).toEqual({ offset: -6, length: 6, commit: 'fine' });
  });
});
