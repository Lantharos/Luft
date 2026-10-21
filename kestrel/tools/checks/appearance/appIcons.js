import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {appIcons, toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {descendants, named, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {property} from '../lib/dbus.js';
import {scratch} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {contrast, luminance} from './lib/colors.js';

const {require, eventually} = checks('app icon');
const WALLPAPERS = [['lavender', 'Night lavender.jpg', [88, 52, 140]], ['forest', 'Autumn forest bench.jpg', [62, 108, 40]]];
const STYLES = ['default', 'tinted', 'clear'];
const SCHEMES = [['dark', 'prefer-dark'], ['light', 'default']];
const PALETTE_TIMEOUT = 10000;

const appearance = name => property('com.lantharos.Kestrel', '/com/lantharos/Kestrel/Appearance', 'com.lantharos.Kestrel.Appearance', name);
const lightPrimary = async () => (await appearance('LightColors')).primary;

function wallpaperFile(name, fallback, [red, green, blue]) {
  const pictures = GLib.get_user_special_dir(GLib.UserDirectory.DIRECTORY_PICTURES) ?? GLib.build_filenamev([GLib.get_home_dir(), 'Pictures']);
  const owned = Gio.File.new_build_filenamev([pictures, 'Wallpapers', name]);
  if (owned.query_exists(null)) return owned;
  const path = scratch(`app-icons-${fallback}.png`);
  const pixbuf = GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.RGB, false, 8, 64, 40);
  pixbuf.fill(((red << 24) | (green << 16) | (blue << 8) | 0xff) >>> 0);
  pixbuf.savev(path, 'png', [], []);
  return Gio.File.new_for_path(path);
}

function inAppButton(actor) {
  for (let parent = actor.get_parent(); parent; parent = parent.get_parent())
    if (parent.name?.startsWith('kestrel-app-') || parent.name?.startsWith('kestrel-start-item-')) return true;
  return false;
}

function shownIcons() {
  return [named('kestrel-panel'), named('kestrel-start')].flatMap(descendants)
    .filter(actor => actor instanceof St.Icon && actor.mapped && inAppButton(actor));
}

const loaded = icon => icon.get_children().some(child => child.content && child.opacity > 0);
const painted = (icon, paint) => paint ? icon.gicon instanceof St.StyledIcon && icon.gicon.ink.to_string() === paint.ink : !(icon.gicon instanceof St.StyledIcon);

async function checkStyles(settings, slug, scheme) {
  const setting = `${slug}, ${scheme}`;
  toggleSurface('start');
  await eventually(() => shown(named('kestrel-start')), 'Start opens');
  for (const style of STYLES) {
    settings.set_string('app-icon-style', style);
    await eventually(() => appIcons.style === style, `${style} icons are chosen (${setting})`);
    const icons = shownIcons();
    require(icons.length > 0, `the taskbar and Start show app icons (${setting})`);
    await eventually(() => icons.every(icon => loaded(icon) && painted(icon, appIcons.paint)), `${style} reaches every taskbar and Start icon (${setting})`);
    await capture(`icons-${style}-${scheme}-${slug}`);
  }
  toggleSurface('start');
  await eventually(() => !named('kestrel-start').visible, 'Start closes');
}

async function checkWallpaper(settings, interfaceSettings, slug) {
  const inks = {};
  for (const [scheme, colorScheme] of SCHEMES) {
    interfaceSettings.set_string('color-scheme', colorScheme);
    const plate = async () => (await appearance('AppIcons'))['tinted-plate'];
    await eventually(async () => (scheme === 'dark') === (luminance(await plate()) < 0.2), `tinted plates follow the ${scheme} style (${slug})`);
    const {'tinted-plate': tintedPlate, 'tinted-ink': ink} = await appearance('AppIcons');
    require(contrast(ink, tintedPlate) >= 4.5, `tinted glyphs stay readable on a ${scheme} plate (${slug})`);
    inks[scheme] = ink;
    await checkStyles(settings, slug, scheme);
  }
  return inks;
}

async function showWallpaper(background, file) {
  const before = await lightPrimary();
  background.set_string('picture-uri', file.get_uri());
  background.set_string('picture-uri-dark', file.get_uri());
  await eventually(async () => await lightPrimary() !== before, `the palette follows ${file.get_basename()}`, PALETTE_TIMEOUT);
}

async function checkTint(settings, inks) {
  settings.set_string('app-icon-style', 'tinted');
  settings.set_string('app-icon-tint', '#3a944a');
  await eventually(async () => (await appearance('AppIcons'))['tinted-ink'] !== inks.light, 'a chosen tint replaces the wallpaper accent');
  const {glyphs} = await appearance('AppIcons');
  const favorites = settings.get_strv('favorite-apps').filter(id => Gio.DesktopAppInfo.new(id));
  require(glyphs === scratch('kestrel', 'app-glyphs') && favorites.every(id => GLib.file_test(`${glyphs}/${id.replace(/\.desktop$/, '')}.png`, GLib.FileTest.EXISTS)),
    'Luft apps find glyphs for pinned apps');
}

export async function run() {
  const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});
  const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const saved = {uri: background.get_string('picture-uri'), dark: background.get_string('picture-uri-dark'), scheme: interfaceSettings.get_string('color-scheme')};
  const original = await lightPrimary();
  const inks = {};
  try {
    for (const [slug, name, color] of WALLPAPERS) {
      await showWallpaper(background, wallpaperFile(name, slug, color));
      inks[slug] = await checkWallpaper(settings, interfaceSettings, slug);
    }
    require(inks.lavender.dark !== inks.forest.dark && inks.lavender.light !== inks.forest.light, 'tinted icons follow the wallpaper');
    await checkTint(settings, inks.forest);
  } finally {
    settings.reset('app-icon-style');
    settings.reset('app-icon-tint');
    background.set_string('picture-uri', saved.uri);
    background.set_string('picture-uri-dark', saved.dark);
    interfaceSettings.set_string('color-scheme', saved.scheme);
  }
  await eventually(async () => await lightPrimary() === original, 'the palette returns to the original wallpaper', PALETTE_TIMEOUT);
}
