import GLib from 'gi://GLib';

const DATABASE = 'mobile-broadband-provider-info/serviceproviders.xml';

const ENTITIES = {amp: '&', apos: "'", quot: '"', lt: '<', gt: '>'};

let _database = null;

function _unescape(text) {
    return text.replace(/&(amp|apos|quot|lt|gt);/g, (_match, name) => ENTITIES[name]);
}

function _readDatabase() {
    for (const dir of GLib.get_system_data_dirs()) {
        const path = GLib.build_filenamev([dir, DATABASE]);
        if (GLib.file_test(path, GLib.FileTest.EXISTS))
            return new TextDecoder().decode(GLib.file_get_contents(path)[1]);
    }
    return '';
}

function _providerName(provider, languages) {
    const header = provider.split(/<(?:gsm|cdma)\b/, 1)[0];
    const names = new Map();
    for (const [, language = '', name] of header.matchAll(/<name(?:\s+xml:lang="([^"]*)")?\s*>([^<]*)<\/name>/g)) {
        if (!names.has(language))
            names.set(language, _unescape(name.trim()));
    }
    const language = languages.find(candidate => names.has(candidate)) ?? '';
    return names.get(language) ?? names.values().next().value ?? null;
}

function _loadDatabase() {
    const networks = new Map();
    const sids = new Map();
    const languages = GLib.get_language_names().map(locale => locale.split(/[_.@]/)[0]);
    const contents = _readDatabase().replace(/<!--[\s\S]*?-->/g, '');

    for (const [provider] of contents.matchAll(/<provider\b[\s\S]*?<\/provider>/g)) {
        const name = _providerName(provider, languages);
        if (!name)
            continue;

        for (const [, mcc, mnc] of provider.matchAll(/<network-id\s+mcc="(\d+)"\s+mnc="(\d+)"\s*\/>/g)) {
            const code = `${mcc}${mnc}`;
            if (!networks.has(code))
                networks.set(code, name);
        }
        for (const [, sid] of provider.matchAll(/<sid\s+value="(\d+)"\s*\/>/g)) {
            if (!sids.has(Number(sid)))
                sids.set(Number(sid), name);
        }
    }
    return {networks, sids};
}

function _getDatabase() {
    _database ??= _loadDatabase();
    return _database;
}

/**
 * @param {string} mccMnc - a 3GPP operator code, three MCC digits followed by two or three MNC digits
 * @returns {string | null} the operator's name
 */
export function lookup3gppMccMnc(mccMnc) {
    const {networks} = _getDatabase();
    const mcc = mccMnc.slice(0, 3);
    const mnc = mccMnc.slice(3);
    return networks.get(mccMnc) ??
        networks.get(`${mcc}${mnc.length === 3 ? mnc.replace(/^0/, '') : `0${mnc}`}`) ??
        null;
}

/**
 * @param {number} sid - the System Identifier of a CDMA network
 * @returns {string | null} the operator's name
 */
export function lookupCdmaSid(sid) {
    return _getDatabase().sids.get(sid) ?? null;
}
