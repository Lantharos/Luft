import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {named, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {property} from '../lib/dbus.js';
import {capture} from '../lib/screenshots.js';
import {contrast} from './lib/colors.js';

const {require, eventually} = checks('appearance');
const ROLES = ['primary', 'onPrimary', 'secondary', 'tertiary', 'error', 'surface', 'onSurface', 'surfaceContainerHighest', 'onSurfaceVariant', 'outline'];
const USER_CSS = 'window { opacity: 1; }\n';

const appearance = name => property('com.lantharos.Kestrel', '/com/lantharos/Kestrel/Appearance', 'com.lantharos.Kestrel.Appearance', name);
const configFile = (...parts) => Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_config_dir(), ...parts]));
const dataFile = (...parts) => Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_data_dir(), ...parts]));
const read = file => file.query_exists(null) ? new TextDecoder().decode(file.load_contents(null)[1]) : null;

function write(file, contents) {
  GLib.mkdir_with_parents(file.get_parent().get_path(), 0o755);
  file.replace_contents(new TextEncoder().encode(contents), null, false, Gio.FileCreateFlags.NONE, null);
}

async function checkPalette() {
  const colors = await appearance('Colors');
  require(ROLES.every(role => /^#[0-9a-f]{6}$/.test(colors[role] ?? '')), 'apps get the full wallpaper palette');
  require(contrast(colors.onSurface, colors.surface) >= 4.5 && contrast(colors.onPrimary, colors.primary) >= 4.5 &&
    contrast(colors.onSurfaceVariant, colors.surfaceContainerHighest) >= 4.5 && contrast(colors.outline, colors.surface) >= 3,
  'palette text and outlines stay readable');
  const terminal = await appearance('TerminalColors');
  require(Array.from({length: 16}, (_, index) => terminal[`color${index}`]).every(Boolean) && terminal.background === colors.surface,
    'terminals get sixteen colors on the palette background');
  const saved = JSON.parse(read(configFile('kestrel', 'appearance.json')));
  require(saved.colors.primary === colors.primary && !!saved.schemes.light.terminal.color1 && !!saved.schemes.dark.colors.surface,
    'the palette is saved for apps that read files');
}

async function checkAppColors(settings) {
  const gtk4 = configFile('gtk-4.0', 'gtk.css');
  const gtk3 = configFile('gtk-3.0', 'gtk.css');
  const generated = [
    ...GLib.find_program_in_path('ghostty') ? [configFile('ghostty', 'themes', 'Kestrel Light'), configFile('ghostty', 'themes', 'Kestrel Dark')] : [],
    configFile('qt6ct', 'colors', 'Kestrel.conf'),
    dataFile('color-schemes', 'Kestrel.colors'),
  ];
  write(gtk4, USER_CSS);
  try {
    settings.set_boolean('theme-apps', true);
    await eventually(() => read(gtk4).includes('--accent-bg-color') && read(gtk4).endsWith(USER_CSS) &&
      read(gtk3)?.includes('@define-color accent_bg_color') && generated.every(file => file.query_exists(null)),
    'other apps get wallpaper colors next to their own styles');
    settings.set_boolean('theme-apps', false);
    await eventually(() => read(gtk4) === USER_CSS && !gtk3.query_exists(null) && !generated.some(file => file.query_exists(null)),
      'turning app colors off removes only what was generated');
  } finally {
    settings.reset('theme-apps');
    gtk4.delete(null);
  }
}

async function showSurface(surface, name, screenshot) {
  toggleSurface(surface);
  await eventually(() => shown(named(name)), `${surface} opens`);
  await capture(screenshot);
  toggleSurface(surface);
  await eventually(() => !named(name).visible, `${surface} closes`);
}

async function checkPureBlack(settings, interfaceSettings) {
  interfaceSettings.set_string('color-scheme', 'prefer-dark');
  settings.set_boolean('pure-black', true);
  await eventually(async () => (await appearance('DarkColors')).surface === '#000000' && await appearance('PureBlack'),
    'pure black makes dark surfaces black');
  await showSurface('start', 'kestrel-start', 'pure-black-start');
  settings.reset('pure-black');
  await eventually(async () => !await appearance('PureBlack'), 'pure black can be turned off');
}

async function checkWhiteAccent(settings) {
  settings.set_string('accent', 'white');
  await eventually(async () => await appearance('AccentColor') === '#ffffff', 'a white accent can be chosen');
  const [light, dark] = [await appearance('LightColors'), await appearance('DarkColors')];
  require(dark.primary === '#ffffff' && contrast(light.primary, light.surface) >= 4.5 &&
    contrast(dark.onPrimary, dark.primary) >= 4.5 && contrast(light.onPrimary, light.primary) >= 4.5,
  'a white accent stays readable in both styles');
  const accent = () => St.ThemeContext.get_for_stage(global.stage).get_accent_color();
  await eventually(() => accent()[0].to_string().startsWith('#ffffff'), 'the shell takes the white accent');
  require(contrast(accent()[1].to_string().slice(0, 7), '#ffffff') >= 4.5, 'the shell draws dark text on a white accent');
  await showSurface('quick', 'kestrel-quick-settings', 'quick-settings-white-accent');
  settings.reset('accent');
}

async function checkSchedule(settings, interfaceSettings) {
  const hour = GLib.DateTime.new_now_local().get_hour();
  settings.set_double('dark-schedule-from', (hour + 23) % 24);
  settings.set_double('dark-schedule-to', (hour + 1) % 24);
  interfaceSettings.set_string('color-scheme', 'default');
  settings.set_string('dark-schedule', 'custom');
  await eventually(() => interfaceSettings.get_string('color-scheme') === 'prefer-dark', 'a custom schedule turns the dark style on during its hours');
  settings.set_double('dark-schedule-from', (hour + 1) % 24);
  settings.set_double('dark-schedule-to', (hour + 23) % 24);
  await eventually(() => interfaceSettings.get_string('color-scheme') === 'default', 'the light style returns outside the scheduled hours');
}

export async function run() {
  const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const colorScheme = interfaceSettings.get_string('color-scheme');
  await checkPalette();
  try {
    await checkAppColors(settings);
    await checkPureBlack(settings, interfaceSettings);
    await checkWhiteAccent(settings);
    await checkSchedule(settings, interfaceSettings);
  } finally {
    for (const key of ['pure-black', 'accent', 'dark-schedule', 'dark-schedule-from', 'dark-schedule-to']) settings.reset(key);
    interfaceSettings.set_string('color-scheme', colorScheme);
  }
}
