import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import * as Signals from './signals.js';

export const DEFAULT_LOCALE = 'en_US';
export const DEFAULT_LAYOUT = 'us';
export const DEFAULT_VARIANT = '';

const USER_LAYOUT_FOLDERS = ['symbols', 'rules'];
const USER_LAYOUT_SETTLE_MS = 250;
const LOCALE_PATTERN = /^([A-Za-z][a-z]{0,2})(?:_([A-Z]{2}))?(?:\.[A-Za-z0-9][A-Za-z0-9-]*)?(?:@[a-z]*)?$/;
const LOCALE_LAYOUTS = new Map([
    ['ar_DZ', 'ara+azerty'],
    ['ast_ES', 'es+ast'],
    ['az_AZ', 'az'],
    ['be_BY', 'by'],
    ['bg_BG', 'bg+phonetic'],
    ['cat_ES', 'es+cat'],
    ['cs_CZ', 'cz'],
    ['de_CH', 'ch'],
    ['de_DE', 'de'],
    ['el_CY', 'gr'],
    ['el_GR', 'gr'],
    ['en_GB', 'gb'],
    ['en_US', 'us'],
    ['en_ZA', 'za'],
    ['es_ES', 'es'],
    ['es_GT', 'latam'],
    ['es_MX', 'latam'],
    ['es_US', 'us+intl'],
    ['fr_BE', 'be'],
    ['fr_CH', 'ch+fr'],
    ['fr_FR', 'fr+oss'],
    ['gl_ES', 'es'],
    ['he_IL', 'il'],
    ['id_ID', 'us'],
    ['it_IT', 'it'],
    ['nl_NL', 'us+altgr-intl'],
    ['pl_PL', 'pl'],
    ['pt_BR', 'br'],
    ['pt_PT', 'pt'],
    ['ru_RU', 'ru'],
    ['sk_SK', 'sk'],
    ['tr_TR', 'tr'],
]);

let _xkbInfo = null;

/**
 * @returns {Shell.XkbInfo}
 */
export function getXkbInfo() {
    if (_xkbInfo == null)
        _xkbInfo = new Shell.XkbInfo();
    return _xkbInfo;
}

/**
 * @param {(xkbInfo: Shell.XkbInfo) => void} callback
 * @returns {Gio.FileMonitor[]}
 */
export function watchUserLayouts(callback) {
    let pending = 0;
    const settled = () => {
        pending = 0;
        _xkbInfo = new Shell.XkbInfo();
        callback(_xkbInfo);
        return GLib.SOURCE_REMOVE;
    };
    return USER_LAYOUT_FOLDERS.map(folder => {
        const path = GLib.build_filenamev([GLib.get_user_config_dir(), 'xkb', folder]);
        const monitor = Gio.File.new_for_path(path).monitor_directory(Gio.FileMonitorFlags.WATCH_MOVES, null);
        monitor.connect('changed', () => {
            if (pending)
                GLib.source_remove(pending);
            pending = GLib.timeout_add(GLib.PRIORITY_DEFAULT, USER_LAYOUT_SETTLE_MS, settled);
        });
        return monitor;
    });
}

let _keyboardManager = null;

/**
 * @returns {KeyboardManager}
 */
export function getKeyboardManager() {
    if (_keyboardManager == null)
        _keyboardManager = new KeyboardManager();
    return _keyboardManager;
}

/**
 * @typedef {object} LayoutInfo
 * @property {string} layout - The XKB layout name (e.g., 'us', 'ru')
 * @property {string} variant - The XKB layout variant (e.g., 'intl' or '')
 * @property {string} [id] - The full input source ID
 * @property {string} [displayName] - The display name for the layout
 * @property {string} [shortName] - The short indicator name for the layout
 * @property {LayoutInfo[]} [group] - The chunk of layouts this layout belongs to
 * @property {number} [groupIndex] - The index of this layout within its chunk
 *
 * @typedef {object} CurrentKeymap
 * @property {string} layouts - Comma-separated layout string
 * @property {string} variants - Comma-separated variant string
 * @property {string} options - Comma-separated options string
 * @property {string} model - The XKB model
 * @property {string[]} displayNames - Array of display names
 * @property {string[]} shortNames - Array of short names
 */

class KeyboardManager extends Signals.EventEmitter {
    constructor() {
        super();

        // The XKB protocol doesn't allow for more than 4 layouts in a
        // keymap. Wayland doesn't impose this limit and libxkbcommon can
        // handle up to 32 layouts but since we need to support X clients
        // even as a Wayland compositor, we can't bump this.
        this.MAX_LAYOUTS_PER_GROUP = 4;

        this._xkbInfo = getXkbInfo();
        /** @type {LayoutInfo|null} */
        this._current = null;
        /** @type {LayoutInfo} */
        this._localeLayoutInfo = this._getLocaleLayout();
        /** @type {{[key: string]: LayoutInfo}} */
        this._layoutInfos = {};
        /** @type {CurrentKeymap|null} */
        this._currentKeymap = null;

        global.backend.connect('keymap-changed', this._onKeymapChanged.bind(this));
        global.backend.connect('keymap-layout-group-changed', this._onKeymapLayoutGroupChanged.bind(this));
        global.backend.connect('reset-keymap-description',
            () => this._ourKeymapDescription);
        global.backend.connect('reset-keymap-layout-index',
            () => this._current.groupIndex);
    }

    /**
     * @param {LayoutInfo} info
     * @returns {boolean}
     */
    _updateCurrentKeymap(info) {
        const options = this._buildOptionsString();
        const [layouts, variants] = this._buildGroupStrings(info.group);
        const model = this._xkbModel;

        if (this._currentKeymap &&
            this._currentKeymap.layouts === layouts &&
            this._currentKeymap.variants === variants &&
            this._currentKeymap.options === options &&
            this._currentKeymap.model === model)
            return false;

        const displayNames = info.group.map(g => g.displayName);
        const shortNames = info.group.map(g => g.shortName);
        this._currentKeymap = {
            layouts,
            variants,
            options,
            model,
            displayNames,
            shortNames,
        };
        return true;
    }

    /**
     * @returns {Meta.KeymapDescription}
     */
    _createKeymapDescription() {
        return Meta.KeymapDescription.new_from_rules(this._currentKeymap.model,
            this._currentKeymap.layouts,
            this._currentKeymap.variants,
            this._currentKeymap.options,
            this._currentKeymap.displayNames,
            this._currentKeymap.shortNames
        );
    }

    _onKeymapChanged() {
        this._keymapDescription = global.backend.get_keymap_description();
        this.emit('keymap-changed');
    }

    _onKeymapLayoutGroupChanged() {
        this.emit('keymap-changed');
    }

    /**
     * @param {string} id
     */
    async _doApply(id) {
        const info = this._layoutInfos[id];
        if (!info)
            return;

        let recreate;
        if (this._updateCurrentKeymap(info))
            recreate = true;
        else if (this.isExternal())
            recreate = true;
        else
            recreate = false;

        if (recreate)
            this._ourKeymapDescription = this._createKeymapDescription();

        if (recreate || !this._current || this._current.groupIndex !== info.groupIndex) {
            await global.backend.set_keymap_async(
                this._ourKeymapDescription, info.groupIndex, null);
        }

        this._current = info;
    }

    /**
     * @param {string} id
     */
    apply(id) {
        this._doApply(id).catch(logError);
    }

    reapply() {
        if (!this._current)
            return;

        this._doApply(this._current.id).catch(logError);
    }

    /**
     * @param {Shell.XkbInfo} xkbInfo
     */
    reloadLayouts(xkbInfo) {
        this._xkbInfo = xkbInfo;
        this._currentKeymap = null;
    }

    /**
     * @param {string[]} ids
     */
    setUserLayouts(ids) {
        this._current = null;
        this._layoutInfos = {};

        for (const id of ids) {
            const [found, displayName, shortName, layout, variant] =
                this._xkbInfo.get_layout_info(id);
            if (found) {
                this._layoutInfos[id] = {
                    id,
                    layout,
                    variant,
                    displayName,
                    shortName,
                };
            }
        }

        let group = [];
        for (const id of ids) {
            const info = this._layoutInfos[id];
            if (!info)
                continue;

            const isLocale = this._isLocaleLayout(info);
            const hasLocale = group.some(g => this._isLocaleLayout(g));

            // We need to leave one slot on the group free if we haven't included
            // the locale layout yet. This ensures we can add a layout containing
            // the symbols for the language used in UI strings.
            if (group.length === this.MAX_LAYOUTS_PER_GROUP ||
                (group.length === this.MAX_LAYOUTS_PER_GROUP - 1 && !hasLocale && !isLocale))
                group = [];

            const groupIndex = group.length;
            group.push(info);
            info.group = group;
            info.groupIndex = groupIndex;
        }
    }

    /**
     * @returns {LayoutInfo}
     */
    _getLocaleLayout() {
        let locale = GLib.get_language_names()[0];
        if (!locale.includes('_'))
            locale = DEFAULT_LOCALE;

        const [, language, country] = LOCALE_PATTERN.exec(locale) ?? [];
        const id = LOCALE_LAYOUTS.get(`${language}_${country}`) ?? LOCALE_LAYOUTS.get(DEFAULT_LOCALE);
        const [found, , , layout, variant] = this._xkbInfo.get_layout_info(id);
        if (found)
            return {layout, variant};
        else
            return {layout: DEFAULT_LAYOUT, variant: DEFAULT_VARIANT};
    }

    /**
     * @param {LayoutInfo} info
     * @returns {boolean}
     */
    _isLocaleLayout(info) {
        return info.layout === this._localeLayoutInfo.layout &&
            info.variant === this._localeLayoutInfo.variant;
    }

    /**
     * Builds the comma-separated layout and variant strings for a given group of layouts.
     *
     * @param {LayoutInfo[]} group - The array of layouts currently in this chunk.
     * @returns {[string, string]} A tuple containing the combined layout string and variant string.
     */
    _buildGroupStrings(group) {
        if (!group.some(g => this._isLocaleLayout(g)))
            group = group.concat(this._localeLayoutInfo);

        const layouts = group.map(g => g.layout).join(',');
        const variants = group.map(g => g.variant).join(',');
        return [layouts, variants];
    }

    /**
     * @param {string[]} options
     */
    setKeyboardOptions(options) {
        this._xkbOptions = options;
    }

    /**
     * @param {string} model
     */
    setKeyboardModel(model) {
        this._xkbModel = model;
    }

    /**
     * @returns {string}
     */
    _buildOptionsString() {
        const options = this._xkbOptions.join(',');
        return options;
    }

    get currentLayout() {
        return this._current;
    }

    get shortName() {
        const seat = global.stage.context.get_backend().get_default_seat();
        const keymap = seat.get_keymap();
        return keymap.get_current_short_name();
    }

    get displayName() {
        const seat = global.stage.context.get_backend().get_default_seat();
        const keymap = seat.get_keymap();
        return keymap.get_current_display_name();
    }

    isLocked() {
        return this._keymapDescription?.is_locked() ?? false;
    }

    isExternal() {
        if (!this._keymapDescription)
            return false;
        if (!this._ourKeymapDescription)
            return true;
        return !this._keymapDescription.direct_equal(this._ourKeymapDescription);
    }
}
