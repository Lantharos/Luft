import type GLib from 'gi://GLib';

import { formatsLocale } from '../../../shared/i18n/index.js';

const formatters = new Map<string, Intl.DateTimeFormat>();
const NARROW_TIME = new Set<Intl.DateTimeFormatPartTypes>(['hour', 'minute']);

function formatter(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const locale = formatsLocale();
  const key = `${locale}${JSON.stringify(options)}`;
  let found = formatters.get(key);
  if (!found) formatters.set(key, found = new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }));
  return found;
}

const stamp = (now: GLib.DateTime) =>
  Date.UTC(now.get_year(), now.get_month() - 1, now.get_day_of_month(), now.get_hour(), now.get_minute(), now.get_second());

const timeOptions = (twelveHour: boolean, seconds: boolean): Intl.DateTimeFormatOptions => ({
  hour: twelveHour ? 'numeric' : '2-digit',
  minute: '2-digit',
  ...seconds ? { second: '2-digit' } : {},
  hourCycle: twelveHour ? 'h12' : 'h23',
});

export function timeText(now: GLib.DateTime, twelveHour: boolean, seconds = false): string {
  return formatter(timeOptions(twelveHour, seconds)).format(stamp(now));
}

export function dateText(now: GLib.DateTime, weekday: boolean): string {
  return formatter({ ...weekday ? { weekday: 'short' } : {}, day: 'numeric', month: 'short' }).format(stamp(now));
}

function narrowTimeLines(now: GLib.DateTime, twelveHour: boolean, seconds: boolean): string[] {
  const parts = formatter(timeOptions(twelveHour, seconds)).formatToParts(stamp(now));
  const time = parts.filter((part, index) => NARROW_TIME.has(part.type) ||
    (part.type === 'literal' && NARROW_TIME.has(parts[index - 1]?.type) && NARROW_TIME.has(parts[index + 1]?.type)));
  const second = parts.find(part => part.type === 'second');
  const period = parts.find(part => part.type === 'dayPeriod');
  return [time.map(part => part.value).join(''), ...second ? [`:${second.value}`] : [], ...period ? [period.value] : []];
}

function stackedDate(now: GLib.DateTime): string[] {
  const parts = formatter({ day: 'numeric', month: 'short' }).formatToParts(stamp(now));
  if (!parts.some(part => /\p{L}/u.test(part.value))) return [parts.map(part => part.value).join('')];
  const lines: string[] = [];
  for (const part of parts) {
    if (part.type !== 'literal') lines.push(part.value);
    else if (lines.length) lines[lines.length - 1] += part.value.trim();
  }
  return lines;
}

export function narrowText(now: GLib.DateTime, twelveHour: boolean, seconds: boolean, weekday: boolean): string {
  const date = [...weekday ? [formatter({ weekday: 'short' }).format(stamp(now))] : [], ...stackedDate(now)];
  return [...narrowTimeLines(now, twelveHour, seconds), ...date].join('\n');
}
