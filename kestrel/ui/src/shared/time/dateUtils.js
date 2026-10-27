import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import * as KestrelUi from '../../kestrelUi.js';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 52 * WEEK;

const formatters = new Map();
let interfaceSettings = null;

function formatter(key, create) {
    const locale = KestrelUi.formatsLocale();
    const cacheKey = `${locale}|${key}`;
    let format = formatters.get(cacheKey);
    if (!format) {
        format = create(locale);
        formatters.set(cacheKey, format);
    }
    return format;
}

function prefersTwelveHour() {
    interfaceSettings ??= new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
    return interfaceSettings.get_string('clock-format') === '12h';
}

function wallTime(dateTime) {
    return Date.UTC(dateTime.get_year(), dateTime.get_month() - 1, dateTime.get_day_of_month(),
        dateTime.get_hour(), dateTime.get_minute(), dateTime.get_second());
}

/**
 * Formats the time of day in the clock's 12 or 24-hour style.
 *
 * @param {GLib.DateTime} dateTime the time to format
 * @param {object} [options]
 * @param {boolean} [options.twelveHour] the hour style, the clock's setting by default
 * @param {boolean} [options.seconds] whether to show seconds
 * @returns {string}
 */
export function formatTime(dateTime, {twelveHour = prefersTwelveHour(), seconds = false} = {}) {
    return formatter(`time|${twelveHour}|${seconds}`, locale => new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        minute: '2-digit',
        second: seconds ? '2-digit' : undefined,
        hourCycle: twelveHour ? 'h12' : 'h23',
        timeZone: 'UTC',
    })).format(wallTime(dateTime));
}

/**
 * @param {GLib.DateTime} dateTime the day to format
 * @returns {string} the weekday, month and day, like "Tuesday, October 20"
 */
export function formatLongDate(dateTime) {
    return formatter('long-date', locale => new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    })).format(wallTime(dateTime));
}

/**
 * Formats a time span string representing the
 * date passed in to the current time.
 *
 * @param {GLib.DateTime} date the start of the time span
 * @returns {string}
 */
export function formatTimeSpan(date) {
    const elapsed = GLib.DateTime.new_now_utc().difference(date) / 1000;
    if (elapsed < 5 * MINUTE)
        return KestrelUi.t('date-just-now');

    const relative = formatter('relative', locale => new Intl.RelativeTimeFormat(locale, {numeric: 'auto'}));
    if (elapsed < HOUR)
        return relative.format(-Math.floor(elapsed / MINUTE), 'minute');
    if (elapsed < DAY)
        return relative.format(-Math.floor(elapsed / HOUR), 'hour');
    if (elapsed < 15 * DAY)
        return relative.format(-Math.floor(elapsed / DAY), 'day');
    if (elapsed < 8 * WEEK)
        return relative.format(-Math.floor(elapsed / WEEK), 'week');
    if (elapsed < YEAR)
        return relative.format(-Math.floor(elapsed / MONTH), 'month');
    return relative.format(-Math.floor(elapsed / YEAR), 'year');
}
