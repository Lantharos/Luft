import { describe, expect, test } from 'bun:test';

import { addDays, dayOf, instantOf, nextMidnight } from '../src/model/days.js';
import { completed, dueAt, momentsOf, rang, rolled, type Rules } from '../src/model/moments.js';
import { firstFrom, following } from '../src/model/repeats.js';
import type { Reminder } from '../src/model/types.js';

const RULES: Rules = { morning: '09:00', nagMinutes: 10, nudgeDays: 3 };
const at = (day: string, time: string) => instantOf(day, time);

function reminder(change: Partial<Reminder>): Reminder {
  return {
    id: 'a', title: 'A', kind: 'reminder', when: { day: '2026-11-05', time: '15:00' }, repeat: null, headsUp: 0, persistent: true, nudgeDays: null,
    rung: null, snoozedUntil: null, warned: false, doneAt: null, createdAt: 0, updatedAt: 0, ...change,
  };
}

describe('occurrences', () => {
  test('the 31st makes do in shorter months and comes back', () => {
    const repeat = { unit: 'month', every: 1, date: 31 } as const;
    expect(following(repeat, '2026-01-31')).toBe('2026-02-28');
    expect(following(repeat, '2026-02-28')).toBe('2026-03-31');
    expect(following(repeat, '2027-12-31')).toBe('2028-01-31');
  });

  test('29 February in years without one', () => {
    const repeat = { unit: 'year', every: 1, date: 29 } as const;
    expect(following(repeat, '2024-02-29')).toBe('2025-02-28');
    expect(following(repeat, '2027-02-28')).toBe('2028-02-29');
  });

  test('every other week on two days', () => {
    const repeat = { unit: 'week', every: 2, weekdays: [1, 4] } as const;
    expect(following(repeat, '2026-11-02')).toBe('2026-11-05');
    expect(following(repeat, '2026-11-05')).toBe('2026-11-16');
  });

  test('the last and the first weekday of a month', () => {
    expect(following({ unit: 'month', every: 1, nth: { week: -1, weekday: 5 } }, '2026-11-27')).toBe('2026-12-25');
    expect(firstFrom({ unit: 'month', every: 1, nth: { week: 1, weekday: 1 } }, '2026-11-03')).toBe('2026-12-07');
  });
});

describe('what comes next', () => {
  test('it rings when due, then keeps coming back until answered', () => {
    const fresh = reminder({});
    const due = at('2026-11-05', '15:00');
    expect(momentsOf(fresh, due - 1, RULES)).toEqual([{ at: due, kind: 'ring' }]);
    const once = rang(fresh, due);
    expect(momentsOf(once, due, RULES)).toEqual([{ at: due + 600_000, kind: 'nag' }]);
    expect(rang(once, due + 600_000).rung).toEqual({ count: 2, last: due + 600_000 });
  });

  test('a snooze replaces coming back until it ends', () => {
    const due = at('2026-11-05', '15:00');
    const snoozed = { ...rang(reminder({}), due), snoozedUntil: due + 3_600_000 };
    expect(momentsOf(snoozed, due, RULES)).toEqual([{ at: due + 3_600_000, kind: 'ring' }]);
  });

  test('without coming back it rings once', () => {
    const due = at('2026-11-05', '15:00');
    expect(momentsOf(rang(reminder({ persistent: false }), due), due, RULES)).toEqual([]);
    expect(momentsOf(rang(reminder({}), due), due, { ...RULES, nagMinutes: null })).toEqual([]);
  });

  test('a birthday gives its heads-up, then rings in the morning', () => {
    const birthday = reminder({ kind: 'birthday', when: { day: '2027-03-14', time: null }, repeat: { unit: 'year', every: 1, date: 14 }, headsUp: 3 });
    expect(momentsOf(birthday, at('2027-01-01', '12:00'), RULES)[0]).toEqual({ at: at('2027-03-11', '09:00'), kind: 'warn' });
    expect(momentsOf({ ...birthday, warned: true }, at('2027-03-12', '12:00'), RULES)[0]).toEqual({ at: at('2027-03-14', '09:00'), kind: 'ring' });
  });

  test('a goal gets nudged on its own rhythm, in the morning', () => {
    const goal = rang(reminder({ kind: 'goal', when: { day: '2026-11-01', time: null } }), at('2026-11-02', '18:00'));
    expect(momentsOf(goal, at('2026-11-02', '18:00'), RULES)).toEqual([{ at: at('2026-11-05', '09:00'), kind: 'nudge' }]);
    expect(momentsOf({ ...goal, nudgeDays: 0 }, at('2026-11-02', '18:00'), RULES)).toEqual([]);
  });
});

describe('missed occurrences', () => {
  const daily = reminder({ when: { day: '2026-11-01', time: '08:00' }, repeat: { unit: 'day', every: 1 } });

  test('a daily reminder missed for days comes back once, for the latest', () => {
    const moved = rolled(daily, at('2026-11-05', '12:00'), RULES);
    expect(moved.when).toEqual({ day: '2026-11-05', time: '08:00' });
    expect(momentsOf(moved, at('2026-11-05', '12:00'), RULES).filter(moment => moment.at <= at('2026-11-05', '12:00'))).toHaveLength(1);
  });

  test('once it rang, the same occurrence stays answered across a restart', () => {
    const now = at('2026-11-05', '12:00');
    const answered = rang(rolled(daily, now, RULES), now);
    expect(rolled(answered, now + 1000, RULES)).toBe(answered);
  });

  test('done moves on to the next occurrence still ahead', () => {
    expect(completed(daily, at('2026-11-05', '12:00'), RULES).when).toEqual({ day: '2026-11-06', time: '08:00' });
    expect(completed(reminder({}), 5, RULES).doneAt).toBe(5);
  });

  test('checking off early skips that occurrence', () => {
    const later = reminder({ when: { day: '2026-11-20', time: null }, repeat: { unit: 'month', every: 1, date: 20 } });
    expect(completed(later, at('2026-11-05', '12:00'), RULES).when?.day).toBe('2026-12-20');
  });

  test('an unanswered birthday gives way to next year’s heads-up', () => {
    const birthday = rang(reminder({ kind: 'birthday', when: { day: '2026-03-14', time: null }, repeat: { unit: 'year', every: 1, date: 14 }, headsUp: 3 }), at('2026-03-14', '09:00'));
    const moved = rolled(birthday, at('2027-03-11', '09:00'), RULES);
    expect(moved).toMatchObject({ when: { day: '2027-03-14' }, rung: null, warned: false });
    expect(momentsOf(moved, at('2027-03-11', '09:00'), RULES)[0]?.kind).toBe('warn');
  });
});

describe('daylight saving', () => {
  const brussels = process.env.TZ === 'Europe/Brussels';

  test.if(brussels)('a time the clocks skip lands just after them, once', () => {
    const skipped = dueAt({ day: '2027-03-28', time: '02:30' }, RULES);
    expect(new Date(skipped).toTimeString().slice(0, 5)).toBe('03:30');
    const daily = reminder({ when: { day: '2027-03-27', time: '02:30' }, repeat: { unit: 'day', every: 1 } });
    const moved = rolled(daily, skipped, RULES);
    expect(moved.when?.day).toBe('2027-03-28');
    expect(dueAt({ day: '2027-03-29', time: '02:30' }, RULES) - skipped).toBe(23 * 3_600_000);
  });

  test.if(brussels)('a time the clocks repeat rings only for the first one', () => {
    const repeated = dueAt({ day: '2026-10-25', time: '02:30' }, RULES);
    const offset = new Date(repeated).getTimezoneOffset();
    expect(offset).toBe(-120);
    const rung = rang(reminder({ when: { day: '2026-10-25', time: '02:30' } }), repeated);
    expect(momentsOf({ ...rung, persistent: false }, repeated + 3_600_000, RULES)).toEqual([]);
  });

  test.if(brussels)('a day keeps its wall clock across the change', () => {
    const before = at('2026-10-24', '09:00');
    const after = at('2026-10-25', '09:00');
    expect(after - before).toBe(25 * 3_600_000);
    expect(addDays(dayOf(before), 1)).toBe('2026-10-25');
    expect(nextMidnight(at('2026-10-24', '12:00'))).toBe(at('2026-10-25', '00:00'));
  });

  test('tests are run in a zone with daylight saving', () => {
    expect(brussels).toBe(true);
  });
});
