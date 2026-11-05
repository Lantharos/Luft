import { addDays, clampedDay, type Day, daysInMonth, makeDay, partsOf, weekdayOf } from './days.js';
import type { Repeat } from './types.js';

const MONDAY_FIRST = (weekday: number) => (weekday + 6) % 7;

function nthWeekday(year: number, month: number, { week, weekday }: NonNullable<Repeat['nth']>): Day {
  if (week < 0) {
    const last = makeDay(year, month, daysInMonth(year, month));
    return addDays(last, -((weekdayOf(last) - weekday + 7) % 7));
  }
  const first = makeDay(year, month, 1);
  return addDays(first, (weekday - weekdayOf(first) + 7) % 7 + (week - 1) * 7);
}

function nextWeekly(repeat: Repeat, day: Day): Day {
  const { every, weekdays } = repeat;
  if (!weekdays?.length) return addDays(day, every * 7);
  const position = MONDAY_FIRST(weekdayOf(day));
  for (let ahead = 1; ; ahead++) {
    const candidate = addDays(day, ahead);
    const week = Math.floor((position + ahead) / 7);
    if (week % every === 0 && weekdays.includes(weekdayOf(candidate))) return candidate;
  }
}

function nextMonthly(repeat: Repeat, day: Day): Day {
  const { year, month, day: date } = partsOf(day);
  const months = year * 12 + month - 1 + repeat.every;
  const nextYear = Math.floor(months / 12);
  const nextMonth = months % 12 + 1;
  return repeat.nth ? nthWeekday(nextYear, nextMonth, repeat.nth) : clampedDay(nextYear, nextMonth, repeat.date ?? date);
}

/** The first day it falls on after `day`. */
export function following(repeat: Repeat, day: Day): Day {
  switch (repeat.unit) {
    case 'day': return addDays(day, repeat.every);
    case 'week': return nextWeekly(repeat, day);
    case 'month': return nextMonthly(repeat, day);
    case 'year': {
      const { year, month, day: date } = partsOf(day);
      return clampedDay(year + repeat.every, month, repeat.date ?? date);
    }
  }
}

/** The first day from `day` on that it falls on, for a repeat that names its days. */
export function firstFrom(repeat: Repeat, day: Day): Day {
  if (repeat.weekdays?.length && !repeat.weekdays.includes(weekdayOf(day))) return nextWeekly({ ...repeat, every: 1 }, day);
  const { year, month, day: date } = partsOf(day);
  if (repeat.unit === 'month' && repeat.nth) {
    const inMonth = nthWeekday(year, month, repeat.nth);
    return inMonth >= day ? inMonth : nextMonthly(repeat, day);
  }
  if (repeat.unit === 'month' && repeat.date) {
    const inMonth = clampedDay(year, month, repeat.date);
    return inMonth >= day ? inMonth : nextMonthly(repeat, day);
  }
  return makeDay(year, month, date);
}
