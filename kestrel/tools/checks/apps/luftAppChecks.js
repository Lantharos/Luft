import Cairo from 'cairo';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {LuftApp, startSabineService, waitFor} from './luftApp.js';

const APPS = ['rover', 'settings', 'draft', 'tern', 'magpie', 'barometer', 'schelf'];
const TRANSLUCENT = {tern: 40};
const OPAQUE = 2;
const SURFACE_SHARE = 0.5;
const ACCENTED = ['rover', 'magpie'];
const ACCENT_TOLERANCE = 6;
const ACCENT_SAMPLES = 20;
const PURE_BLACK = '#000000';

function readAppearance(name) {
  return new Promise((resolve, reject) => Gio.DBus.session.call('com.lantharos.Kestrel', '/com/lantharos/Kestrel/Appearance',
    'org.freedesktop.DBus.Properties', 'Get', new GLib.Variant('(ss)', ['com.lantharos.Kestrel.Appearance', name]),
    new GLib.VariantType('(v)'), Gio.DBusCallFlags.NONE, -1, null, (connection, result) => {
      try {
        resolve(connection.call_finish(result).recursiveUnpack()[0]);
      } catch (error) {
        reject(error);
      }
    }));
}

function writeWallpaper(path) {
  const [width, height] = [1920, 1080];
  const surface = new Cairo.ImageSurface(Cairo.Format.RGB24, width, height);
  const context = new Cairo.Context(surface);
  const gradient = new Cairo.LinearGradient(0, 0, width, height);
  gradient.addColorStopRGB(0, 0.04, 0.30, 0.34);
  gradient.addColorStopRGB(1, 0.16, 0.58, 0.52);
  context.setSource(gradient);
  context.paint();
  surface.writeToPNG(path);
  return Gio.File.new_for_path(path).get_uri();
}

async function showTestWallpaper(background) {
  const uri = writeWallpaper(GLib.build_filenamev([GLib.get_user_cache_dir(), 'luft-app-wallpaper.png']));
  const before = await readAppearance('WallpaperAccentColor');
  background.set_string('picture-uri', uri);
  background.set_string('picture-uri-dark', uri);
  await waitFor(async () => await readAppearance('WallpaperAccentColor') !== before, 5000, () => 'Kestrel kept the old palette after the wallpaper changed');
}

async function checkApp(name, {palette, styles, require, output}) {
  const tolerance = TRANSLUCENT[name] ?? OPAQUE;
  const covers = surface => frame => frame.share(surface, tolerance) >= SURFACE_SHARE;
  const accented = accent => frame => frame.count(accent, ACCENT_TOLERANCE) >= ACCENT_SAMPLES;
  const accentShown = ACCENTED.includes(name);
  styles.interface.set_string('color-scheme', 'prefer-dark');
  const app = new LuftApp(name);
  try {
    const opened = await app.open();
    const dark = await app.settle(covers(palette.dark.surface));
    dark.save(`${output}/${name}-dark.png`);
    require(covers(palette.dark.surface)(dark), `${name} opens in ${Math.round(opened)} ms on the dark palette surface`);
    if (accentShown) require(accented(palette.dark.primary)(dark), `${name} draws the dark accent`);

    styles.kestrel.set_boolean('pure-black', true);
    require(covers(PURE_BLACK)(await app.settle(covers(PURE_BLACK))), `${name} turns pure black with the desktop`);
    styles.kestrel.set_boolean('pure-black', false);

    styles.interface.set_string('color-scheme', 'prefer-light');
    const light = await app.settle(covers(palette.light.surface));
    light.save(`${output}/${name}-light.png`);
    require(covers(palette.light.surface)(light), `${name} follows the desktop into the light style`);
    if (accentShown) require(accented(palette.light.primary)(light), `${name} draws the light accent`);
    return dark;
  } finally {
    await app.close();
  }
}

async function checkUpdatesPage(settingsHome, {palette, styles, require, output}) {
  const onSurface = frame => frame.share(palette.dark.surface, OPAQUE) >= SURFACE_SHARE;
  styles.interface.set_string('color-scheme', 'prefer-dark');
  const app = new LuftApp('settings', ['kestrel-settings:updates']);
  try {
    await app.open();
    const updates = await app.settle(onSurface);
    updates.save(`${output}/settings-updates.png`);
    require(onSurface(updates) && !updates.same(settingsHome), 'settings opens straight to updates from a kestrel-settings link');
  } finally {
    await app.close();
  }
}

export async function checkLuftApps({output}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel Luft app check failed: ${label}`);
    console.log(`Kestrel Luft app check: ${label}`);
  };
  const styles = {
    interface: new Gio.Settings({schema_id: 'org.gnome.desktop.interface'}),
    kestrel: new Gio.Settings({schema_id: 'com.lantharos.kestrel'}),
  };
  const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});
  const saved = {
    scheme: styles.interface.get_string('color-scheme'),
    pureBlack: styles.kestrel.get_boolean('pure-black'),
    pictures: ['picture-uri', 'picture-uri-dark'].map(key => [key, background.get_string(key)]),
  };
  const service = await startSabineService();
  try {
    styles.kestrel.set_boolean('pure-black', false);
    await showTestWallpaper(background);
    const palette = {dark: await readAppearance('DarkColors'), light: await readAppearance('LightColors')};
    const context = {palette, styles, require, output};
    const darkFrames = {};
    for (const name of APPS) darkFrames[name] = await checkApp(name, context);
    await checkUpdatesPage(darkFrames.settings, context);
  } finally {
    styles.interface.set_string('color-scheme', saved.scheme);
    styles.kestrel.set_boolean('pure-black', saved.pureBlack);
    for (const [key, value] of saved.pictures) background.set_string(key, value);
    await service.stop();
  }
}
