import { dayOf } from './days.js';
import { dueAt, type Rules } from './moments.js';
import type { Reminder } from './types.js';

export interface Sections {
  overdue: Reminder[];
  today: Reminder[];
  upcoming: Reminder[];
  undated: Reminder[];
}

const soonestFirst = (rules: Rules) => (a: Reminder, b: Reminder) => dueAt(a.when!, rules) - dueAt(b.when!, rules);

const isOverdue = ({ when }: Reminder, now: number, today: string, rules: Rules) =>
  !!when && (when.time ? dueAt(when, rules) <= now : when.day < today);

/** Open reminders sorted into the lists people see. */
export function sectionsOf(reminders: readonly Reminder[], now: number, rules: Rules): Sections {
  const today = dayOf(now);
  const open = reminders.filter(reminder => reminder.doneAt === null);
  const sections: Sections = { overdue: [], today: [], upcoming: [], undated: [] };
  for (const reminder of open.filter(({ when }) => when).sort(soonestFirst(rules))) {
    if (isOverdue(reminder, now, today, rules)) sections.overdue.push(reminder);
    else if (reminder.when!.day === today) sections.today.push(reminder);
    else sections.upcoming.push(reminder);
  }
  sections.undated = open.filter(({ when }) => !when).sort((a, b) => a.createdAt - b.createdAt);
  return sections;
}

/** How many are waiting for an answer now: overdue, or today's that already rang. */
export function dueCount(sections: Sections, now: number, rules: Rules): number {
  return sections.overdue.length + sections.today.filter(reminder => dueAt(reminder.when!, rules) <= now).length;
}
