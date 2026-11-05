import { addDays, dayOf, instantOf } from './days.js';
import { following } from './repeats.js';
import type { Reminder, When } from './types.js';

const MINUTE_MS = 60_000;

export interface Rules {
  /** When something with no time of day rings, `HH:MM`. */
  morning: string;
  /** Minutes between coming back, or `null` to ring once. */
  nagMinutes: number | null;
  /** Days between a goal's nudges, or `null` for no nudges. */
  nudgeDays: number | null;
}

/** What happens to a reminder next. `roll` moves a repeating one on to its next occurrence. */
export type MomentKind = 'ring' | 'nag' | 'warn' | 'nudge' | 'roll';

export interface Moment {
  at: number;
  kind: MomentKind;
}

export const dueAt = (when: When, rules: Rules) => instantOf(when.day, when.time ?? rules.morning);

export const warnAt = (when: When, headsUp: number, rules: Rules) => instantOf(addDays(when.day, -headsUp), when.time ?? rules.morning);

/** When an occurrence starts to matter: its heads-up, or else the moment it's due. */
const startOf = (when: When, reminder: Reminder, rules: Rules) => (reminder.headsUp ? warnAt(when, reminder.headsUp, rules) : dueAt(when, rules));

const nextOccurrence = ({ repeat, when }: Reminder): When | null => (repeat && when ? { day: following(repeat, when.day), time: when.time } : null);

function afterRinging(reminder: Reminder, last: number, rules: Rules): Moment | null {
  if (reminder.kind === 'goal') {
    const days = reminder.nudgeDays ?? rules.nudgeDays;
    return days ? { at: instantOf(addDays(dayOf(last), days), rules.morning), kind: 'nudge' } : null;
  }
  return reminder.persistent && rules.nagMinutes ? { at: last + rules.nagMinutes * MINUTE_MS, kind: 'nag' } : null;
}

function nextForOccurrence(reminder: Reminder, when: When, now: number, rules: Rules): Moment | null {
  if (reminder.snoozedUntil !== null) return { at: reminder.snoozedUntil, kind: 'ring' };
  if (reminder.rung) return afterRinging(reminder, reminder.rung.last, rules);
  const due = dueAt(when, rules);
  if (reminder.headsUp && !reminder.warned && now < due) return { at: warnAt(when, reminder.headsUp, rules), kind: 'warn' };
  return { at: due, kind: 'ring' };
}

/** Everything still to come for a reminder, soonest first. */
export function momentsOf(reminder: Reminder, now: number, rules: Rules): Moment[] {
  if (reminder.doneAt !== null || !reminder.when) return [];
  const moments: Moment[] = [];
  const own = nextForOccurrence(reminder, reminder.when, now, rules);
  if (own) moments.push(own);
  const upcoming = nextOccurrence(reminder);
  if (upcoming) moments.push({ at: startOf(upcoming, reminder, rules), kind: 'roll' });
  return moments.sort((a, b) => a.at - b.at);
}

/**
 * Moves a repeating reminder to the latest occurrence that has started, dropping the ones between: however long the
 * computer was off, a daily reminder comes back once.
 */
export function rolled(reminder: Reminder, now: number, rules: Rules): Reminder {
  if (reminder.doneAt !== null || !reminder.when) return reminder;
  let moved = reminder;
  for (let upcoming = nextOccurrence(moved); upcoming && startOf(upcoming, moved, rules) <= now; upcoming = nextOccurrence(moved))
    moved = { ...moved, when: upcoming, rung: null, snoozedUntil: null, warned: false };
  return moved;
}

/** The reminder after people pressed Done: finished, or moved to the next occurrence still ahead. */
export function completed(reminder: Reminder, now: number, rules: Rules): Reminder {
  const fresh = { rung: null, snoozedUntil: null, warned: false, updatedAt: now };
  if (!reminder.repeat || !reminder.when) return { ...reminder, ...fresh, doneAt: now };
  let when = nextOccurrence(reminder)!;
  while (dueAt(when, rules) <= now) when = nextOccurrence({ ...reminder, when })!;
  return { ...reminder, ...fresh, when };
}

/** The reminder right after it rang. */
export const rang = (reminder: Reminder, now: number): Reminder => ({
  ...reminder,
  rung: { count: (reminder.rung?.count ?? 0) + 1, last: now },
  snoozedUntil: null,
  warned: true,
});
