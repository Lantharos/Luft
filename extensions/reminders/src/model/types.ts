import type { Day } from './days.js';

/** A birthday is any yearly day to remember, anniversaries too. A to-do is a reminder with no date. */
export type Kind = 'reminder' | 'birthday' | 'goal';

/** Local time, kept as it reads on the wall, so it stays right across daylight saving and travel. */
export interface When {
  day: Day;
  /** `HH:MM`, or `null` for the whole day, which rings at the time set in Settings. */
  time: string | null;
}

export interface Repeat {
  unit: 'day' | 'week' | 'month' | 'year';
  every: number;
  /** For weeks: the days it falls on, 0 for Sunday. */
  weekdays?: readonly number[];
  /** For months: a weekday instead of a date, such as the last Friday (`week` -1). */
  nth?: { week: number; weekday: number };
  /** For months and years: the date asked for, kept while a shorter month makes do with its last day. */
  date?: number;
}

export interface Rung {
  /** How many times it has rung for this occurrence. */
  count: number;
  last: number;
}

export interface Reminder {
  /** Stays the same for good, and is the `UID` in a calendar file. */
  id: string;
  title: string;
  kind: Kind;
  when: When | null;
  repeat: Repeat | null;
  /** Days ahead of it to give a heads-up, 0 for none. */
  headsUp: number;
  /** Whether it keeps coming back until it's answered. Goals are nudged instead. */
  persistent: boolean;
  /** A goal's nudges: days between them, `null` for what Settings says, 0 for none. */
  nudgeDays: number | null;
  /** Set when it rang and nobody pressed Done yet. */
  rung: Rung | null;
  snoozedUntil: number | null;
  /** Whether the heads-up went out for this occurrence. */
  warned: boolean;
  doneAt: number | null;
  createdAt: number;
  /** Changes whenever it does, for telling two copies of it apart. */
  updatedAt: number;
}

/** What people decide about a reminder when they add or edit it. */
export type Draft = Pick<Reminder, 'title' | 'kind' | 'when' | 'repeat' | 'headsUp' | 'persistent' | 'nudgeDays'>;
