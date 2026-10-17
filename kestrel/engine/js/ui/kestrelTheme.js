import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

const SCHEME_SUFFIX = /-(light|dark)\.css$/;

let _sessionMode = null;
let _loaded = null;
let _themed = false;
let _sourceMonitor = null;

function _sourceDirectories() {
    const source = GLib.getenv('KESTREL_THEME_DIR');
    return [
        ...source ? [Gio.File.new_for_path(source)] : [],
        Gio.File.new_for_uri('resource:///com/lantharos/kestrel/theme'),
    ];
}

function _findStylesheet(name) {
    for (const directory of _sourceDirectories()) {
        const stylesheet = directory.get_child(name);
        if (stylesheet.query_exists(null))
            return stylesheet;
    }
    throw new Error(`No stylesheet named ${name}`);
}

export function getStyleVariant() {
    const settings = St.Settings.get();
    if (settings.high_contrast || _sessionMode.colorScheme === 'dark')
        return 'dark';
    return settings.color_scheme === St.SystemColorScheme.PREFER_DARK ? 'dark' : 'light';
}

function _baseStylesheet() {
    const base = St.Settings.get().high_contrast ? 'high-contrast' : getStyleVariant();
    return _findStylesheet(_sessionMode.stylesheetName.replace('.css', `-${base}.css`));
}

function _inVariant(stylesheet, variant) {
    const name = stylesheet.get_basename();
    if (!SCHEME_SUFFIX.test(name))
        return stylesheet;
    return stylesheet.get_parent().get_child(name.replace(SCHEME_SUFFIX, `-${variant}.css`));
}

function _customStylesheets(themeContext) {
    if (!_themed) {
        _themed = true;
        return [_findStylesheet('kestrel-dark.css')];
    }
    return themeContext.get_theme().get_custom_stylesheets().reverse();
}

function _buildTheme(stylesheets) {
    const theme = new St.Theme({default_stylesheet: _loaded.base});
    for (const stylesheet of stylesheets)
        theme.load_stylesheet(_inVariant(stylesheet, _loaded.variant));
    return theme;
}

function _loadTheme() {
    const themeContext = St.ThemeContext.get_for_stage(global.stage);
    themeContext.set_theme(_buildTheme(_customStylesheets(themeContext)));
}

export function setAccent(stylesheet, color, fgColor) {
    const themeContext = St.ThemeContext.get_for_stage(global.stage);
    const loaded = themeContext.get_theme().get_custom_stylesheets().reverse();
    const stylesheets = loaded.some(file => file.equal(stylesheet)) ? loaded : [...loaded, stylesheet];
    themeContext.set_theme_and_accent_color(_buildTheme(stylesheets), color, fgColor);
}

export function updateTheme() {
    const loaded = {base: _baseStylesheet(), variant: getStyleVariant()};
    if (_loaded?.base.equal(loaded.base) && _loaded.variant === loaded.variant)
        return;
    _loaded = loaded;
    _loadTheme();
}

function _watchSources() {
    const source = GLib.getenv('KESTREL_THEME_DIR');
    if (!source)
        return;
    _sourceMonitor = Gio.File.new_for_path(source).monitor_directory(Gio.FileMonitorFlags.NONE, null);
    _sourceMonitor.connect('changed', (_monitor, file, _other, event) => {
        if (event === Gio.FileMonitorEvent.CHANGES_DONE_HINT && file.get_basename().endsWith('.css'))
            _loadTheme();
    });
}

export function initTheme(sessionMode) {
    _sessionMode = sessionMode;
    const settings = St.Settings.get();
    settings.connect('notify::high-contrast', updateTheme);
    settings.connect('notify::color-scheme', updateTheme);
    _watchSources();
}
