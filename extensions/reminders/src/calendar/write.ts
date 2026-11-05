import type { Repeat, Reminder, When } from '../model/types.js';
import { escaped, folded } from './lines.js';

export const WEEKDAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const FREQUENCIES = { day: 'DAILY', week: 'WEEKLY', month: 'MONTHLY', year: 'YEARLY' } as const;

const stamp = (at: number) => `${new Date(at).toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`;
const compactDay = (day: string) => day.replace(/-/g, '');

function dated(name: string, { day, time }: When): string {
  return time ? `${name}:${compactDay(day)}T${time.replace(':', '')}00` : `${name};VALUE=DATE:${compactDay(day)}`;
}

function rule({ unit, every, weekdays, nth, date }: Repeat): string {
  const parts = [`FREQ=${FREQUENCIES[unit]}`];
  if (every > 1) parts.push(`INTERVAL=${every}`);
  if (weekdays?.length) parts.push(`BYDAY=${weekdays.map(weekday => WEEKDAY_CODES[weekday]).join(',')}`);
  if (nth) parts.push(`BYDAY=${nth.week}${WEEKDAY_CODES[nth.weekday]}`);
  if (unit === 'month' && date) parts.push(`BYMONTHDAY=${date}`);
  return `RRULE:${parts.join(';')}`;
}

function component(reminder: Reminder, now: number): string[] {
  const { id, title, kind, when, repeat, headsUp } = reminder;
  const name = when && kind !== 'goal' ? 'VEVENT' : 'VTODO';
  return [
    `BEGIN:${name}`,
    `UID:${id}`,
    `DTSTAMP:${stamp(now)}`,
    `LAST-MODIFIED:${stamp(reminder.updatedAt)}`,
    `SUMMARY:${escaped(title)}`,
    `X-LUFT-KIND:${kind}`,
    ...when ? [dated(name === 'VEVENT' ? 'DTSTART' : 'DUE', when)] : [],
    ...repeat ? [rule(repeat)] : [],
    ...headsUp ? ['BEGIN:VALARM', 'ACTION:DISPLAY', `TRIGGER:-P${headsUp}D`, `DESCRIPTION:${escaped(title)}`, 'END:VALARM'] : [],
    `END:${name}`,
  ];
}

/** An iCalendar file of open reminders: dated ones as events, goals and to-dos as tasks, in local time. */
export function writeCalendar(reminders: readonly Reminder[], now: number): string {
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lantharos//Luft Reminders//EN', 'CALSCALE:GREGORIAN',
    ...reminders.filter(reminder => reminder.doneAt === null).flatMap(reminder => component(reminder, now)),
    'END:VCALENDAR',
  ];
  return `${lines.map(folded).join('\r\n')}\r\n`;
}
