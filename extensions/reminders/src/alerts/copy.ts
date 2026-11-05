import type { Extension } from '@luft/extension-api';

import { daysBetween, dayOf } from '../model/days.js';
import { dueAt, type Rules } from '../model/moments.js';
import type { Reminder } from '../model/types.js';
import type { Due, Granted } from '../reminders.js';
import { spokenWhen } from '../view/say.js';

const LATE_MS = 2 * 60_000;

export interface Message {
  title: string;
  body: string;
}

/** A goal's nudge says how long it's been, and now and then a word of comfort. It never tells anyone off. */
function nudge(extension: Extension<Granted>, reminder: Reminder, now: number): Message {
  const { t, settings } = extension;
  const days = daysBetween(reminder.when!.day, dayOf(now));
  const over = t('goal-over', { days });
  if (!settings.get<boolean>('goal-humour')) return { title: reminder.title, body: over };
  const lines = [t('nudge-1'), t('nudge-2'), t('nudge-3'), t('nudge-4'), t('nudge-5'), t('nudge-6')];
  return { title: reminder.title, body: `${over}. ${lines[reminder.rung!.count % lines.length]}` };
}

function firstRing(extension: Extension<Granted>, reminder: Reminder, now: number, rules: Rules): Message {
  const { t } = extension;
  const when = spokenWhen(extension, reminder.when!, now);
  const late = now - dueAt(reminder.when!, rules) > LATE_MS;
  if (late) return { title: reminder.title, body: t('notice-missed', { when }) };
  if (reminder.kind === 'goal') return { title: reminder.title, body: t('notice-deadline') };
  if (reminder.kind === 'birthday') return { title: reminder.title, body: t('notice-birthday') };
  return { title: reminder.title, body: when };
}

/** What a notification says, by what happened. */
export function messageFor(extension: Extension<Granted>, reminder: Reminder, kind: Due['kind'], now: number, rules: Rules): Message {
  const { t } = extension;
  const when = spokenWhen(extension, reminder.when!, now);
  const count = reminder.rung?.count ?? 0;
  if (kind === 'warn') return { title: t('notice-coming', { title: reminder.title }), body: when };
  if (kind === 'nudge' || (reminder.kind === 'goal' && count)) return nudge(extension, reminder, now);
  if (count) return { title: t('notice-again', { title: reminder.title }), body: t('notice-again-body', { count, when }) };
  return firstRing(extension, reminder, now, rules);
}
