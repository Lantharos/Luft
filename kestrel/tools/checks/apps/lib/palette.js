import Cairo from 'cairo';
import Gio from 'gi://Gio';

import {checks} from '../../lib/check.js';
import {property} from '../../lib/dbus.js';
import {scratch} from '../../lib/processes.js';
import {waitUntil} from '../../lib/wait.js';

const {require} = checks('Luft app');
const OPAQUE = 2;
const SURFACES = ['surface', 'surfaceContainerLowest', 'surfaceContainerLow', 'surfaceContainer', 'surfaceContainerHigh', 'surfaceContainerHighest'];
const SURFACE_SHARE = 0.5;
const ACCENT_TOLERANCE = 6;
const ACCENT_SAMPLES = 20;
const PURE_BLACK = '#000000';

const styles = {
  interface: new Gio.Settings({schema_id: 'org.gnome.desktop.interface'}),
  kestrel: new Gio.Settings({schema_id: 'com.lantharos.kestrel'}),
};
const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});

export const useScheme = scheme => styles.interface.set_string('color-scheme', `prefer-${scheme}`);
const appearance = name => property('com.lantharos.Kestrel', '/com/lantharos/Kestrel/Appearance', 'com.lantharos.Kestrel.Appearance', name);

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

async function showTestWallpaper() {
  const uri = writeWallpaper(scratch('luft-app-wallpaper.png'));
  const before = await appearance('WallpaperAccentColor');
  background.set_string('picture-uri', uri);
  background.set_string('picture-uri-dark', uri);
  await waitUntil(async () => await appearance('WallpaperAccentColor') !== before, 'Kestrel takes its palette from the new wallpaper');
}

export async function withPalette(check) {
  const saved = {
    scheme: styles.interface.get_string('color-scheme'),
    pureBlack: styles.kestrel.get_boolean('pure-black'),
    pictures: ['picture-uri', 'picture-uri-dark'].map(key => [key, background.get_string(key)]),
  };
  try {
    styles.kestrel.set_boolean('pure-black', false);
    useScheme('dark');
    await showTestWallpaper();
    await check({dark: await appearance('DarkColors'), light: await appearance('LightColors')});
  } finally {
    styles.interface.set_string('color-scheme', saved.scheme);
    styles.kestrel.set_boolean('pure-black', saved.pureBlack);
    for (const [key, value] of saved.pictures) background.set_string(key, value);
  }
}

const covering = tolerance => colors => frame => frame.share(colors, tolerance) >= SURFACE_SHARE;
const surfaces = colors => SURFACES.map(role => colors[role]);

async function showScheme(app, palette, scheme, tolerance = OPAQUE) {
  useScheme(scheme);
  return app.settle(covering(tolerance)(surfaces(palette[scheme])));
}

export const showDark = (app, palette) => showScheme(app, palette, 'dark');

export async function saveBothStyles(app, palette, name) {
  (await showScheme(app, palette, 'light')).save(`${name}-light`);
  (await showScheme(app, palette, 'dark')).save(`${name}-dark`);
}

export async function checkPalette(app, palette, {accent = false, tolerance = OPAQUE} = {}) {
  const covers = covering(tolerance);
  const accented = color => frame => frame.count([color], ACCENT_TOLERANCE) >= ACCENT_SAMPLES;

  const dark = await app.settle(covers(surfaces(palette.dark)));
  dark.save(`${app.name}-dark`);
  require(covers(surfaces(palette.dark))(dark), `${app.name} opens on the dark palette surface`);
  if (accent) require(accented(palette.dark.primary)(dark), `${app.name} draws the dark accent`);

  styles.kestrel.set_boolean('pure-black', true);
  require(covers([PURE_BLACK])(await app.settle(covers([PURE_BLACK]))), `${app.name} turns pure black with the desktop`);
  styles.kestrel.set_boolean('pure-black', false);

  const light = await showScheme(app, palette, 'light', tolerance);
  light.save(`${app.name}-light`);
  require(covers(surfaces(palette.light))(light), `${app.name} follows the desktop into the light style`);
  if (accent) require(accented(palette.light.primary)(light), `${app.name} draws the light accent`);
  return dark;
}
