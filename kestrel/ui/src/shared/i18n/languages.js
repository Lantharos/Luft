import * as Gettext from 'gettext';
import GLib from 'gi://GLib';

const ISO_CODES = '/usr/share/iso-codes/json';
const CODE_FIELDS = {
    '639-2': ['alpha_2', 'alpha_3', 'bibliographic'],
    '639-3': ['alpha_3'],
};

const tables = new Map();

function table(standard) {
    let names = tables.get(standard);
    if (names)
        return names;

    names = new Map();
    const [, contents] = GLib.file_get_contents(`${ISO_CODES}/iso_${standard}.json`);
    for (const entry of JSON.parse(new TextDecoder().decode(contents))[standard]) {
        const name = entry.common_name ?? entry.inverted_name ?? entry.name;
        for (const field of CODE_FIELDS[standard]) {
            if (entry[field])
                names.set(entry[field], name);
        }
    }
    tables.set(standard, names);
    return names;
}

/**
 * @param {string} code an ISO 639 language code
 * @returns {string|null} the language's name in the current locale
 */
export function getLanguageName(code) {
    let name, domain;
    if (code.length === 2) {
        name = table('639-2').get(code);
        domain = 'iso_639-2';
    } else if (code.length === 3) {
        name = table('639-3').get(code) ?? table('639-2').get(code);
        domain = 'iso_639-3';
    }
    if (!name)
        return null;

    const [first, ...rest] = Gettext.dgettext(domain, name).split('; ')[0];
    return first.toUpperCase() + rest.join('');
}
