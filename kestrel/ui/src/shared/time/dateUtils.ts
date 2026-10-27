import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { formatsLocale, t } from '../i18n/index.js';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 52 * WEEK;

const formatters = new Map<string, Intl.DateTimeFormat | Intl.RelativeTimeFormat>();
let interfaceSettings: Gio.Settings | null = null;

function formatter<T extends Intl.DateTimeFormat | Intl.RelativeTimeFormat>(key: string, create: (locale: string) => T): T {
  const locale = formatsLocale();
  const cacheKey = `${locale}|${key}`;
  let format = formatters.get(cacheKey) as T | undefined;
  if (!format) {
    format = create(locale);
    formatters.set(cacheKey, format);
  }
  return format;
}

function prefersTwelveHour(): boolean {
  interfaceSettings ??= new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  return interfaceSettings.get_string('clock-format') === '12h';
}

function wallTime(dateTime: GLib.DateTime): number {
  return Date.UTC(dateTime.get_year(), dateTime.get_month() - 1, dateTime.get_day_of_month(),
    dateTime.get_hour(), dateTime.get_minute(), dateTime.get_second());
}

export function formatTime(dateTime: GLib.DateTime, { twelveHour = prefersTwelveHour(), seconds = false } = {}): string {
  return formatter(`time|${twelveHour}|${seconds}`, locale => new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    second: seconds ? '2-digit' : undefined,
    hourCycle: twelveHour ? 'h12' : 'h23',
    timeZone: 'UTC',
  })).format(wallTime(dateTime));
}

export function formatLongDate(dateTime: GLib.DateTime): string {
  return formatter('long-date', locale => new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })).format(wallTime(dateTime));
}

export function formatTimeSpan(date: GLib.DateTime): string {
  const elapsed = Number(GLib.DateTime.new_now_utc().difference(date)) / 1000;
  if (elapsed < 5 * MINUTE) return t('date-just-now');

  const relative = formatter('relative', locale => new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }));
  if (elapsed < HOUR) return relative.format(-Math.floor(elapsed / MINUTE), 'minute');
  if (elapsed < DAY) return relative.format(-Math.floor(elapsed / HOUR), 'hour');
  if (elapsed < 15 * DAY) return relative.format(-Math.floor(elapsed / DAY), 'day');
  if (elapsed < 8 * WEEK) return relative.format(-Math.floor(elapsed / WEEK), 'week');
  if (elapsed < YEAR) return relative.format(-Math.floor(elapsed / MONTH), 'month');
  return relative.format(-Math.floor(elapsed / YEAR), 'year');
}
