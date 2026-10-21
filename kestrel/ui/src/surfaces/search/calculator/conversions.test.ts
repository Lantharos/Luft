import { describe, expect, test } from 'bun:test';

import { mentionsCurrency, useRates } from './currencies.js';
import { evaluate } from './expression.js';
import { convert } from './units.js';

describe('numbers follow the region', () => {
  test.each([
    ['1,234 + 1', '.', 1235],
    ['1,234.5 + 0.5', '.', 1235],
    ['1,5 * 2', '.', 3],
    ['1.234 + 1', ',', 1235],
    ['1.234,5 + 0,5', ',', 1235],
    ['1,5 * 2', ',', 3],
    ['1.5 * 2', ',', 3],
  ] as const)('%s with %s as the decimal mark', (text, decimal, value) => {
    expect(evaluate(text, true, decimal)).toBe(value);
  });
});

describe('currencies', () => {
  useRates({ usd: 1.25, gbp: 0.85, all: 100, rsd: 117 }, 'de-DE');

  test.each([
    ['100 usd in eur', 'EUR', 80],
    ['$100', 'EUR', 80],
    ['100 euros to lek', 'ALL', 10_000],
    ['100 US-Dollar', 'EUR', 80],
    ['85 gbp in usd', 'USD', 125],
  ])('%s', (text, target, value) => {
    const conversion = convert(text);
    expect(conversion?.to.symbol).toBe(target);
    expect(conversion?.value).toBeCloseTo(value);
  });

  test('the home currency converts to dollars', () => {
    expect(convert('100 eur')?.to.symbol).toBe('USD');
  });

  test('units keep their meaning', () => {
    expect(convert('5 cups to ml')?.to.symbol).toBe('ml');
    expect(convert('3 lb')?.to.symbol).toBe('kg');
  });

  test('only amounts of money need rates', () => {
    expect(mentionsCurrency('100 usd')).toBe(true);
    expect(mentionsCurrency('€20')).toBe(true);
    expect(mentionsCurrency('usd')).toBe(false);
    expect(mentionsCurrency('10 km to mi')).toBe(false);
  });
});
