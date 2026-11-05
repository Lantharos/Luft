import type { Extension } from '@luft/extension-api';

import { addDays, type Day, dayOf, daysBetween, instantOf, partsOf } from '../model/days.js';
import type { Repeat, Reminder, When } from '../model/types.js';
import type { Granted } from '../reminders.js';

const NOON = '12:00';
const WEEK = 7;

const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const weekday = new Intl.DateTimeFormat(undefined, { weekday: 'long' });
const shortDay = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
const longDay = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
const longDayYear = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const monthDay = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'long' });

const noonOf = (day: Day) => instantOf(day, NOON);

export const timeText = (value: string, day: Day) => time.format(instantOf(day, value));

const SUNDAY = '2023-01-01';
export const weekdayName = (index: number) => weekday.format(noonOf(addDays(SUNDAY, index)));

/** Today, Tomorrow, a weekday within the week, or else a short date. */
export function dayText({ t }: Extension<Granted>, day: Day, now: number): string {
  const ahead = daysBetween(dayOf(now), day);
  if (ahead === 0) return t('today');
  if (ahead === 1) return t('tomorrow');
  if (ahead === -1) return t('yesterday');
  return ahead > 0 && ahead < WEEK ? weekday.format(noonOf(day)) : shortDay.format(noonOf(day));
}

export function shortWhen(extension: Extension<Granted>, { day, time: at }: When, now: number): string {
  const date = dayText(extension, day, now);
  return at ? extension.t('day-at', { day: date, time: timeText(at, day) }) : date;
}

/** Written out, for sentences and for checking what was understood. */
export function spokenWhen(extension: Extension<Granted>, { day, time: at }: When, now: number): string {
  const ahead = daysBetween(dayOf(now), day);
  const near = Math.abs(ahead) <= 1 ? dayText(extension, day, now) : null;
  const sameYear = partsOf(day).year === partsOf(dayOf(now)).year;
  const date = near ?? (sameYear ? longDay : longDayYear).format(noonOf(day));
  return at ? extension.t('day-at', { day: date, time: timeText(at, day) }) : date;
}

function everyUnit({ t }: Extension<Granted>, repeat: Repeat): string {
  const { unit, every } = repeat;
  switch (unit) {
    case 'day': return t('repeat-days', { every });
    case 'week': return t('repeat-weeks', { every });
    case 'month': return t('repeat-months', { every });
    case 'year': return t('repeat-years', { every });
  }
}

/** How often it repeats, in words. */
export function repeatText(extension: Extension<Granted>, repeat: Repeat, when: When | null): string {
  const { t } = extension;
  const list = new Intl.ListFormat(undefined, { type: 'conjunction' });
  if (repeat.weekdays?.length === 5 && !repeat.weekdays.some(day => day === 0 || day === 6)) return t('repeat-working-days');
  if (repeat.weekdays?.length) {
    const names = list.format(repeat.weekdays.map(weekdayName));
    return repeat.every > 1 ? t('repeat-weeks-on', { every: repeat.every, days: names }) : t('repeat-on', { days: names });
  }
  if (repeat.nth) {
    const name = weekdayName(repeat.nth.weekday);
    return repeat.nth.week < 0 ? t('repeat-last-weekday', { day: name }) : t('repeat-nth-weekday', { nth: repeat.nth.week, day: name });
  }
  if (repeat.unit === 'month' && repeat.date) return repeat.every > 1 ? everyUnit(extension, repeat) : t('repeat-month-date', { date: repeat.date });
  if (repeat.unit === 'year' && when) return repeat.every > 1 ? everyUnit(extension, repeat) : t('repeat-year-date', { date: monthDay.format(noonOf(when.day)) });
  return everyUnit(extension, repeat);
}

/** The line under a reminder's title in a list. */
export function rowDetail(extension: Extension<Granted>, reminder: Reminder, now: number): string {
  const { t } = extension;
  const { when, repeat, snoozedUntil, kind } = reminder;
  if (!when) return t('no-date');
  const parts: string[] = [];
  const days = daysBetween(when.day, dayOf(now));
  if (kind === 'goal' && days > 0) parts.push(t('goal-over', { days }));
  else parts.push(shortWhen(extension, when, now));
  if (snoozedUntil !== null) parts.push(t('snoozed-until', { time: shortWhen(extension, { day: dayOf(snoozedUntil), time: new Date(snoozedUntil).toTimeString().slice(0, 5) }, now) }));
  else if (repeat) parts.push(repeatText(extension, repeat, when));
  return parts.join(' · ');
}
