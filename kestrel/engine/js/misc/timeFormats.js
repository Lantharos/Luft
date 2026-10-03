import GLib from 'gi://GLib';

const DEFAULT_FORMATS = ['%R', '%R:%S', '%l:%M %p', '%l:%M:%S %p'];
const LOCALE_FORMATS = new Map([
    ['ab', [null, null, null, '%l\u2236%M\u2236%S %p']],
    ['ar', ['%OH:%OM', '%OH:%OM:%OS', '%-Ol:%OM %p', '%-Ol:%OM:%OS %p']],
    ['ca', ['%-H:%M', '%-H:%M:%S', null, null]],
    ['ca@valencia', ['%R', '%R:%S', null, null]],
    ['cs', ['%k\u2236%M', '%k\u2236%M\u2236%S', '%l\u2236%M %p', '%l\u2236%M\u2236%S %p']],
    ['en', ['%H\u2236%M', '%H\u2236%M\u2236%S', '%l\u2236%M %p', '%l\u2236%M\u2236%S %p']],
    ['en_GB', ['%R', '%R:%S', '%l:%M %p', '%l:%M:%S %p']],
    ['fa', ['\u2066%OH:%OM\u2069', '\u2066%OH:%OM:%OS\u2069', '\u2066%OI:%OM\u2069 %p', '\u2066%OI:%OM:%OS\u2069 %p']],
    ['fi', ['%H.%M', '%H.%M.%S', '%l.%M %p', '%l.%M.%S %p']],
    ['fur', ['%k:%M', '%k:%M:%S', null, null]],
    ['he', [null, null, '\u200f\u200e%l:%M \u200f\u200f%p', '\u200f\u200e%l:%M:%S \u200f\u200f%p']],
    ['hu', [null, null, '%H:%M', '%H:%M:%S']],
    ['is', [null, null, '%H:%M', null]],
    ['it', [null, null, null, '%l:%M:%S %P']],
    ['ja', ['%H:%M', '%H:%M:%S', '%p %l:%M', '%p %l:%M:%S']],
    ['kk', [null, null, '%H:%M', '%H:%M:%S']],
    ['ko', [null, null, '%p %l:%M', '%p %l:%M:%S']],
    ['lv', [null, null, '%H.%M', '%H.%M.%S']],
    ['ne', [null, null, '%l\u2236%M %p', null]],
    ['pl', ['%H\u2236%M', '%H\u2236%M\u2236%S', '%-l\u2236%M\u2009%p', '%-l\u2236%M\u2236%S\u2009%p']],
    ['ru', [null, null, '%l:%M\u2009%p', '%l:%M:%S\u2009%p']],
    ['sk', [null, null, '%k:%M', '%k:%M:%S']],
    ['ug', [null, null, '%p %-l:%M', '%p %-l:%M:%S']],
    ['zh_CN', [null, null, '%p %-l:%M', '%p %-l:%M:%S']],
    ['zh_HK', [null, null, '%p%l:%M', '%p%l:%M:%S']],
    ['zh_TW', [null, null, '%p %I:%M', '%p %I:%M:%S']],
]);

/**
 * @param {boolean} twelveHour
 * @param {boolean} seconds
 * @returns {string} the time format for the current locale
 */
export function timeFormat(twelveHour, seconds) {
    const index = (twelveHour ? 2 : 0) + (seconds ? 1 : 0);
    const names = GLib.get_language_names_with_category('LC_TIME');
    const language = names[0].split(/[_.@]/)[0];
    for (const name of names.filter(candidate => candidate.split(/[_.@]/)[0] === language)) {
        const format = LOCALE_FORMATS.get(name)?.[index];
        if (format)
            return format;
    }
    return DEFAULT_FORMATS[index];
}
