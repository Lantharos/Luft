/** A calendar day as written on a wall calendar, `YYYY-MM-DD`, in no time zone at all. */
export type Day = string;

const DAY_MS = 86_400_000;
const pad = (value: number) => String(value).padStart(2, '0');

export interface DayParts {
  year: number;
  /** 1 to 12. */
  month: number;
  day: number;
}

export function partsOf(day: Day): DayParts {
  const [year, month, date] = day.split('-').map(Number) as [number, number, number];
  return { year, month, day: date };
}

/** The day these numbers land on; a day or month past the end carries over. */
export function makeDay(year: number, month: number, day: number): Day {
  const date = new Date(Date.UTC(year, month - 1, day));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

const utc = (day: Day) => {
  const { year, month, day: date } = partsOf(day);
  return Date.UTC(year, month - 1, date);
};

export const dayOf = (at: number): Day => {
  const date = new Date(at);
  return makeDay(date.getFullYear(), date.getMonth() + 1, date.getDate());
};

export const addDays = (day: Day, days: number): Day => {
  const { year, month, day: date } = partsOf(day);
  return makeDay(year, month, date + days);
};

export const daysBetween = (from: Day, to: Day) => Math.round((utc(to) - utc(from)) / DAY_MS);

/** 0 for Sunday. */
export const weekdayOf = (day: Day) => new Date(utc(day)).getUTCDay();

export const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();

/** That day of the month, or the month's last day when it's shorter. */
export const clampedDay = (year: number, month: number, day: number) => makeDay(year, month, Math.min(day, daysInMonth(year, month)));

/**
 * When a local time on a day happens. A time the clocks skip lands just after the skip, and a time they repeat is the
 * first of the two, so a reminder fires once whichever way daylight saving goes.
 */
export function instantOf(day: Day, time: string): number {
  const { year, month, day: date } = partsOf(day);
  const [hours, minutes] = time.split(':').map(Number) as [number, number];
  return new Date(year, month - 1, date, hours, minutes).getTime();
}

export const nextMidnight = (now: number) => instantOf(addDays(dayOf(now), 1), '00:00');
