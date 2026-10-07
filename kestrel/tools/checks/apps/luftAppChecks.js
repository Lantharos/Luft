import Cairo from 'cairo';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {LuftApp, startSabineService, waitFor} from './luftApp.js';
import {checkDisks} from './disksChecks.js';
import {checkFonts} from './fontChecks.js';
import {checkFontViewer} from './fontViewer.js';
import {checkRoverNetwork} from './roverNetworkChecks.js';
import {checkSettingsAccessibility} from './settingsAccessibility.js';
import {checkSettingsHardware} from './settingsHardware.js';
import {checkSettingsPages} from './settingsPages.js';
import {checkSettingsUpdates} from './settingsUpdates.js';
import {checkTern} from './ternChecks.js';

const APPS = ['rover', 'settings', 'disks', 'draft', 'tern', 'magpie', 'mailman', 'barometer', 'schelf', 'keys'];
const TRANSLUCENT = {tern: 40};
const OPAQUE = 2;
const SURFACES = ['surface', 'surfaceContainerLowest', 'surfaceContainerLow', 'surfaceContainer', 'surfaceContainerHigh', 'surfaceContainerHighest'];
const SURFACE_SHARE = 0.5;
const ACCENTED = ['rover', 'magpie', 'mailman'];
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
  const covers = colors => frame => frame.share(colors, tolerance) >= SURFACE_SHARE;
  const surfaces = colors => SURFACES.map(role => colors[role]);
  const accented = accent => frame => frame.count([accent], ACCENT_TOLERANCE) >= ACCENT_SAMPLES;
  const accentShown = ACCENTED.includes(name);
  styles.interface.set_string('color-scheme', 'prefer-dark');
  const app = new LuftApp(name);
  try {
    const opened = await app.open();
    const dark = await app.settle(covers(surfaces(palette.dark)));
    dark.save(`${output}/${name}-dark.png`);
    require(covers(surfaces(palette.dark))(dark), `${name} opens in ${Math.round(opened)} ms on the dark palette surface`);
    if (accentShown) require(accented(palette.dark.primary)(dark), `${name} draws the dark accent`);

    styles.kestrel.set_boolean('pure-black', true);
    require(covers([PURE_BLACK])(await app.settle(covers([PURE_BLACK]))), `${name} turns pure black with the desktop`);
    styles.kestrel.set_boolean('pure-black', false);

    styles.interface.set_string('color-scheme', 'prefer-light');
    const light = await app.settle(covers(surfaces(palette.light)));
    light.save(`${output}/${name}-light.png`);
    require(covers(surfaces(palette.light))(light), `${name} follows the desktop into the light style`);
    if (accentShown) require(accented(palette.light.primary)(light), `${name} draws the light accent`);
    return dark;
  } finally {
    await app.close();
  }
}

export async function checkLuftApps({output, pointer}) {
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
    const context = {palette, styles, require, output, pointer};
    const darkFrames = {};
    for (const name of APPS) darkFrames[name] = await checkApp(name, context);
    await checkSettingsPages(darkFrames.settings, context);
    await checkSettingsAccessibility(context);
    await checkSettingsHardware(context);
    await checkSettingsUpdates(context);
    await checkFontViewer(darkFrames.magpie, context);
    await checkDisks(context);
    await checkRoverNetwork(context);
    await checkTern(context);
    await checkFonts(context);
  } finally {
    styles.interface.set_string('color-scheme', saved.scheme);
    styles.kestrel.set_boolean('pure-black', saved.pureBlack);
    for (const [key, value] of saved.pictures) background.set_string(key, value);
    await service.stop();
  }
}
