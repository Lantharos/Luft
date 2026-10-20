import type GLib from 'gi://GLib';

import { formatsLocale } from '../../../shared/i18n/index.js';

const formatters = new Map<string, Intl.DateTimeFormat>();

function format(now: GLib.DateTime, options: Intl.DateTimeFormatOptions): string {
  const locale = formatsLocale();
  const key = `${locale}${JSON.stringify(options)}`;
  let formatter = formatters.get(key);
  if (!formatter) formatters.set(key, formatter = new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }));
  return formatter.format(Date.UTC(now.get_year(), now.get_month() - 1, now.get_day_of_month(), now.get_hour(), now.get_minute(), now.get_second()));
}

export function timeText(now: GLib.DateTime, twelveHour: boolean, seconds = false): string {
  return format(now, {
    hour: twelveHour ? 'numeric' : '2-digit',
    minute: '2-digit',
    ...seconds ? { second: '2-digit' } : {},
    hourCycle: twelveHour ? 'h12' : 'h23',
  });
}

export function dateText(now: GLib.DateTime, weekday: boolean): string {
  return format(now, { ...weekday ? { weekday: 'short' } : {}, day: 'numeric', month: 'short' });
}
