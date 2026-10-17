import * as Gettext from 'gettext';
import GLib from 'gi://GLib';

let _localTimeZone = null;

/**
 * @private
 *
 * @param {Date} date a Date object
 * @returns {GLib.DateTime | null}
 */
function _convertJSDateToGLibDateTime(date) {
    if (_localTimeZone === null)
        _localTimeZone = GLib.TimeZone.new_local();

    const dt = GLib.DateTime.new(_localTimeZone,
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds());

    return dt;
}

/**
 * Formats a Date object according to a C sprintf-style string using
 * the cached local timezone.
 *
 * @param {Date} date a Date object
 * @param {string} format a format String for the date
 * @returns {string}
 */
export function formatDateWithCFormatString(date, format) {
    const dt = _convertJSDateToGLibDateTime(date);

    return dt?.format(format) ?? '';
}

/**
 * Formats a time span string representing the
 * date passed in to the current time.
 *
 * @param {Date} date the start of the time span
 * @returns {string}
 */
export function formatTimeSpan(date) {
    if (_localTimeZone === null)
        _localTimeZone = GLib.TimeZone.new_local();

    const now = GLib.DateTime.new_now(_localTimeZone);
    const timespan = now.difference(date);

    const minutesAgo = timespan / GLib.TIME_SPAN_MINUTE;
    const hoursAgo = timespan / GLib.TIME_SPAN_HOUR;
    const daysAgo = timespan / GLib.TIME_SPAN_DAY;
    const weeksAgo = daysAgo / 7;
    const monthsAgo = daysAgo / 30;
    const yearsAgo = weeksAgo / 52;

    if (minutesAgo < 5)
        return _('Just now');
    if (hoursAgo < 1) {
        return Gettext.ngettext(
            '%d minute ago',
            '%d minutes ago',
            minutesAgo
        ).format(minutesAgo);
    }
    if (daysAgo < 1) {
        return Gettext.ngettext(
            '%d hour ago',
            '%d hours ago',
            hoursAgo
        ).format(hoursAgo);
    }
    if (daysAgo < 2)
        return _('Yesterday');
    if (daysAgo < 15) {
        return Gettext.ngettext(
            '%d day ago',
            '%d days ago',
            daysAgo
        ).format(daysAgo);
    }
    if (weeksAgo < 8) {
        return Gettext.ngettext(
            '%d week ago',
            '%d weeks ago',
            weeksAgo
        ).format(weeksAgo);
    }
    if (yearsAgo < 1) {
        return Gettext.ngettext(
            '%d month ago',
            '%d months ago',
            monthsAgo
        ).format(monthsAgo);
    }
    return Gettext.ngettext(
        '%d year ago',
        '%d years ago',
        yearsAgo
    ).format(yearsAgo);
}
