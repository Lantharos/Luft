import type Cogl from 'gi://Cogl';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

const SCHEME_SUFFIX = /-(light|dark)\.css$/;
const SQUARE_CORNERS = 'square-corners.css';

type StyleVariant = 'light' | 'dark';

interface ThemeSessionMode {
  readonly stylesheetName: string;
}

interface LoadedTheme {
  base: Gio.File;
  variant: StyleVariant;
}

let sessionMode!: ThemeSessionMode;
let loaded: LoadedTheme | null = null;
let themed = false;
let sourceMonitor: Gio.FileMonitor | null = null;

function sourceDirectories(): Gio.File[] {
  const source = GLib.getenv('KESTREL_THEME_DIR');
  return [
    ...source ? [Gio.File.new_for_path(source)] : [],
    Gio.File.new_for_uri('resource:///com/lantharos/kestrel/theme'),
  ];
}

function findStylesheet(name: string): Gio.File {
  for (const directory of sourceDirectories()) {
    const stylesheet = directory.get_child(name);
    if (stylesheet.query_exists(null)) return stylesheet;
  }
  throw new Error(`No stylesheet named ${name}`);
}

export function getStyleVariant(): StyleVariant {
  const settings = St.Settings.get();
  if (settings.high_contrast) return 'dark';
  return settings.color_scheme === St.SystemColorScheme.PREFER_DARK ? 'dark' : 'light';
}

function baseStylesheet(): Gio.File {
  const base = St.Settings.get().high_contrast ? 'high-contrast' : getStyleVariant();
  return findStylesheet(sessionMode.stylesheetName.replace('.css', `-${base}.css`));
}

function inVariant(stylesheet: Gio.File, variant: StyleVariant): Gio.File {
  const name = stylesheet.get_basename()!;
  if (!SCHEME_SUFFIX.test(name)) return stylesheet;
  return stylesheet.get_parent()!.get_child(name.replace(SCHEME_SUFFIX, `-${variant}.css`));
}

function customStylesheets(themeContext: St.ThemeContext): Gio.File[] {
  if (!themed) {
    themed = true;
    return [findStylesheet('kestrel-dark.css')];
  }
  return themeContext.get_theme().get_custom_stylesheets().reverse();
}

function buildTheme(stylesheets: Gio.File[]): St.Theme {
  const { base, variant } = loaded!;
  const theme = new St.Theme({ default_stylesheet: base });
  for (const stylesheet of stylesheets) theme.load_stylesheet(inVariant(stylesheet, variant));
  return theme;
}

function loadTheme(): void {
  const themeContext = St.ThemeContext.get_for_stage(global.stage);
  themeContext.set_theme(buildTheme(customStylesheets(themeContext)));
}

export function setAccent(stylesheet: Gio.File, color: Cogl.Color, fgColor: Cogl.Color): void {
  const themeContext = St.ThemeContext.get_for_stage(global.stage);
  const current = themeContext.get_theme().get_custom_stylesheets().reverse();
  const stylesheets = current.some(file => file.equal(stylesheet)) ? current : [...current, stylesheet];
  themeContext.set_theme_and_accent_color(buildTheme(stylesheets), color, fgColor);
}

export function setSquareCorners(square: boolean): void {
  const themeContext = St.ThemeContext.get_for_stage(global.stage);
  const stylesheet = findStylesheet(SQUARE_CORNERS);
  const current = themeContext.get_theme().get_custom_stylesheets().reverse();
  if (current.some(file => file.equal(stylesheet)) === square) return;
  const others = current.filter(file => !file.equal(stylesheet));
  themeContext.set_theme(buildTheme(square ? [...others, stylesheet] : others));
}

export function updateTheme(): void {
  const next = { base: baseStylesheet(), variant: getStyleVariant() };
  if (loaded?.base.equal(next.base) && loaded.variant === next.variant) return;
  loaded = next;
  loadTheme();
}

function watchSources(): void {
  const source = GLib.getenv('KESTREL_THEME_DIR');
  if (!source) return;
  sourceMonitor = Gio.File.new_for_path(source).monitor_directory(Gio.FileMonitorFlags.NONE, null);
  sourceMonitor.connect('changed', (_monitor, file, _other, event) => {
    if (event === Gio.FileMonitorEvent.CHANGES_DONE_HINT && file.get_basename()!.endsWith('.css'))
      loadTheme();
  });
}

export function initTheme(mode: ThemeSessionMode): void {
  sessionMode = mode;
  const settings = St.Settings.get();
  settings.connect('notify::high-contrast', updateTheme);
  settings.connect('notify::color-scheme', updateTheme);
  watchSources();
}
