import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {toggleSurface} from 'resource:///org/gnome/shell/ui/kestrelUi.js';

const ROLES = ['primary', 'onPrimary', 'secondary', 'tertiary', 'error', 'surface', 'onSurface', 'surfaceContainerHighest', 'onSurfaceVariant', 'outline'];
const USER_CSS = 'window { opacity: 1; }\n';

const linear = channel => {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};
const luminance = hex => {
  const [red, green, blue] = [1, 3, 5].map(offset => linear(parseInt(hex.slice(offset, offset + 2), 16)));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};
const contrast = (first, second) => {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
};

function readProperty(name) {
  return new Promise((resolve, reject) => Gio.DBus.session.call('dev.lantharos.Kestrel', '/dev/lantharos/Kestrel/Appearance',
    'org.freedesktop.DBus.Properties', 'Get', new GLib.Variant('(ss)', ['dev.lantharos.Kestrel.Appearance', name]),
    new GLib.VariantType('(v)'), Gio.DBusCallFlags.NONE, -1, null, (connection, result) => {
      try {
        resolve(connection.call_finish(result).recursiveUnpack()[0]);
      } catch (error) {
        reject(error);
      }
    }));
}

const configFile = (...parts) => Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_config_dir(), ...parts]));
const dataFile = (...parts) => Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_data_dir(), ...parts]));
const read = file => file.query_exists(null) ? new TextDecoder().decode(file.load_contents(null)[1]) : null;
const write = (file, contents) => {
  GLib.mkdir_with_parents(file.get_parent().get_path(), 0o755);
  file.replace_contents(new TextEncoder().encode(contents), null, false, Gio.FileCreateFlags.NONE, null);
};

export async function checkAppearance({pause, capture, output}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel appearance check failed: ${label}`);
    console.log(`Kestrel appearance check: ${label}`);
  };
  const settings = new Gio.Settings({schema_id: 'dev.lantharos.kestrel'});
  const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const colorScheme = interfaceSettings.get_string('color-scheme');
  const gtk4 = configFile('gtk-4.0', 'gtk.css');
  const gtk3 = configFile('gtk-3.0', 'gtk.css');
  const generated = [
    configFile('ghostty', 'themes', 'Kestrel Light'),
    configFile('ghostty', 'themes', 'Kestrel Dark'),
    configFile('qt6ct', 'colors', 'Kestrel.conf'),
    dataFile('color-schemes', 'Kestrel.colors'),
  ];

  const colors = await readProperty('Colors');
  require(ROLES.every(role => /^#[0-9a-f]{6}$/.test(colors[role] ?? '')), 'apps get the full wallpaper palette');
  require(contrast(colors.onSurface, colors.surface) >= 4.5 && contrast(colors.onPrimary, colors.primary) >= 4.5 &&
    contrast(colors.onSurfaceVariant, colors.surfaceContainerHighest) >= 4.5 && contrast(colors.outline, colors.surface) >= 3,
  'palette text and outlines stay readable');
  const terminal = await readProperty('TerminalColors');
  require(Array.from({length: 16}, (_, index) => terminal[`color${index}`]).every(Boolean) && terminal.background === colors.surface,
    'terminals get sixteen colors on the palette background');
  const saved = JSON.parse(read(configFile('kestrel', 'appearance.json')));
  require(saved.colors.primary === colors.primary && !!saved.schemes.light.terminal.color1 && !!saved.schemes.dark.colors.surface,
    'the palette is saved for apps that read files');

  try {
    write(gtk4, USER_CSS);
    settings.set_boolean('theme-apps', true);
    await pause(1200);
    const css = read(gtk4);
    require(css.includes('--accent-bg-color') && css.endsWith(USER_CSS) && read(gtk3).includes('@define-color accent_bg_color') &&
      generated.every(file => file.query_exists(null)), 'other apps get wallpaper colors next to their own styles');
    settings.set_boolean('theme-apps', false);
    await pause(1200);
    require(read(gtk4) === USER_CSS && !gtk3.query_exists(null) && !generated.some(file => file.query_exists(null)),
      'turning app colors off removes only what was generated');

    interfaceSettings.set_string('color-scheme', 'prefer-dark');
    settings.set_boolean('pure-black', true);
    await pause(400);
    require((await readProperty('DarkColors')).surface === '#000000' && (await readProperty('PureBlack')),
      'pure black makes dark surfaces black');
    toggleSurface('start');
    await pause(500);
    await capture(`${output}/pure-black-start.png`);
    toggleSurface('start');
    await pause(300);
    settings.set_boolean('pure-black', false);
    await pause(300);

    const hour = GLib.DateTime.new_now_local().get_hour();
    settings.set_double('dark-schedule-from', (hour + 23) % 24);
    settings.set_double('dark-schedule-to', (hour + 1) % 24);
    interfaceSettings.set_string('color-scheme', 'default');
    settings.set_string('dark-schedule', 'custom');
    await pause(300);
    require(interfaceSettings.get_string('color-scheme') === 'prefer-dark', 'a custom schedule turns the dark style on during its hours');
    settings.set_double('dark-schedule-from', (hour + 1) % 24);
    settings.set_double('dark-schedule-to', (hour + 23) % 24);
    await pause(300);
    require(interfaceSettings.get_string('color-scheme') === 'default', 'the light style returns outside the scheduled hours');
  } finally {
    for (const key of ['theme-apps', 'pure-black', 'dark-schedule', 'dark-schedule-from', 'dark-schedule-to']) settings.reset(key);
    interfaceSettings.set_string('color-scheme', colorScheme);
    await pause(1200);
    gtk4.delete(null);
  }
}
