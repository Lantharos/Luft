import { dayNumber, fromDayNumber, type Day } from '../../../shared/time/days.js';
import type { SpanUnit } from './vocabulary.js';

export interface Parts {
  years: number;
  months: number;
  weeks: number;
  days: number;
}

export const weekday = (day: Day) => (dayNumber(day) + 4) % 7;

export const addDays = (day: Day, days: number) => fromDayNumber(dayNumber(day) + days);

export function valid({ year, month, day }: Day): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

const monthLength = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();

export function addMonths({ year, month, day }: Day, months: number): Day {
  const index = year * 12 + month - 1 + months;
  const target = { year: Math.floor(index / 12), month: (index % 12 + 12) % 12 + 1 };
  return { ...target, day: Math.min(day, monthLength(target.year, target.month)) };
}

function wholeMonths(from: Day, to: Day): number {
  const months = (to.year - from.year) * 12 + to.month - from.month;
  return dayNumber(addMonths(from, months)) > dayNumber(to) ? months - 1 : months;
}

export function parts(from: Day, to: Day, unit: SpanUnit): Parts {
  const [early, late] = dayNumber(from) <= dayNumber(to) ? [from, to] : [to, from];
  const total = dayNumber(late) - dayNumber(early);
  if (unit === 'days') return { years: 0, months: 0, weeks: 0, days: total };
  if (unit === 'weeks') return { years: 0, months: 0, weeks: Math.floor(total / 7), days: total % 7 };
  const months = wholeMonths(early, late);
  const days = dayNumber(late) - dayNumber(addMonths(early, months));
  return unit === 'months'
    ? { years: 0, months, weeks: 0, days }
    : { years: Math.floor(months / 12), months: months % 12, weeks: 0, days };
}

const clocks = new Map<string, Intl.DateTimeFormat>();

function clockIn(zone: string): Intl.DateTimeFormat {
  let clock = clocks.get(zone);
  if (!clock) {
    clock = new Intl.DateTimeFormat('en-US', {
      timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric',
    });
    clocks.set(zone, clock);
  }
  return clock;
}

export function wallClock(instant: number, zone: string): Day & { hour: number; minute: number } {
  const values = Object.fromEntries(clockIn(zone).formatToParts(instant).map(({ type, value }) => [type, Number(value)]));
  return { year: values.year, month: values.month, day: values.day, hour: values.hour, minute: values.minute };
}

export function zoneOffset(zone: string, instant: number): number {
  const wall = wallClock(instant, zone);
  const asUtc = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute);
  return Math.round((asUtc - Math.floor(instant / 60_000) * 60_000) / 60_000);
}

export function instantOf(day: Day, hour: number, minute: number, zone: string): number {
  const guess = Date.UTC(day.year, day.month - 1, day.day, hour, minute);
  const first = guess - zoneOffset(zone, guess) * 60_000;
  const second = guess - zoneOffset(zone, first) * 60_000;
  return second;
}
