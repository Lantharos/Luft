import { describe, expect, test } from 'bun:test';

import { afterCrash } from './count.js';

const SECOND = 1_000_000;
const MINUTE = 60 * SECOND;
const restartedAt = (started: number) => ({ started, running: ['seasons'], crashes: { seasons: 1 }, turnedOff: ['probe'] });

describe('crashes in a row', () => {
  test('one crash counts once, however soon after the start it comes', () => {
    for (const ranFor of [10 * SECOND, 90 * MINUTE])
      expect(afterCrash({ started: 0, running: ['seasons'], crashes: {}, turnedOff: [] }, ranFor).crashes).toEqual({ seasons: 1 });
  });

  test('a crash soon after the restart that followed one is the second in a row', () => {
    const after = afterCrash(restartedAt(MINUTE), MINUTE + 30 * SECOND);
    expect(after.crashes).toEqual({ seasons: 2 });
    expect(after.turnedOff).toEqual(['probe']);
  });

  test('a crash long after that restart starts counting again', () => {
    const after = afterCrash(restartedAt(MINUTE), 31 * MINUTE);
    expect(after.crashes).toEqual({ seasons: 1 });
    expect(after.turnedOff).toEqual([]);
  });
});
