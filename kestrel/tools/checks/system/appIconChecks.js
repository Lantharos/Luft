import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

const WALLPAPERS = [['lavender', 'Night lavender.jpg', [88, 52, 140]], ['forest', 'Autumn forest bench.jpg', [62, 108, 40]]];
const STYLES = ['default', 'tinted', 'clear'];
const SCHEMES = [['dark', 'prefer-dark'], ['light', 'default']];

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

function appIcons() {
  return new Promise((resolve, reject) => Gio.DBus.session.call('com.lantharos.Kestrel', '/com/lantharos/Kestrel/Appearance',
    'org.freedesktop.DBus.Properties', 'Get', new GLib.Variant('(ss)', ['com.lantharos.Kestrel.Appearance', 'AppIcons']),
    new GLib.VariantType('(v)'), Gio.DBusCallFlags.NONE, -1, null, (connection, result) => {
      try {
        resolve(connection.call_finish(result).recursiveUnpack()[0]);
      } catch (error) {
        reject(error);
      }
    }));
}

function wallpaperFile(name, fallback, [red, green, blue]) {
  const pictures = GLib.get_user_special_dir(GLib.UserDirectory.DIRECTORY_PICTURES) ?? GLib.build_filenamev([GLib.get_home_dir(), 'Pictures']);
  const owned = Gio.File.new_build_filenamev([pictures, 'Wallpapers', name]);
  if (owned.query_exists(null)) return owned;
  const path = GLib.build_filenamev([GLib.get_user_cache_dir(), `app-icons-${fallback}.png`]);
  const pixbuf = GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.RGB, false, 8, 64, 40);
  pixbuf.fill(((red << 24) | (green << 16) | (blue << 8) | 0xff) >>> 0);
  pixbuf.savev(path, 'png', [], []);
  return Gio.File.new_for_path(path);
}

export async function checkAppIcons({pause, capture, actorNamed, output}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel app icon check failed: ${label}`);
    console.log(`Kestrel app icon check: ${label}`);
  };
  const descendants = actor => [actor, ...actor.get_children().flatMap(descendants)];
  const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});
  const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const saved = {uri: background.get_string('picture-uri'), dark: background.get_string('picture-uri-dark'), scheme: interfaceSettings.get_string('color-scheme')};
  const panel = actorNamed(global.stage, 'kestrel-panel');
  const start = actorNamed(global.stage, 'kestrel-start');
  const appIconActor = actor => {
    for (let parent = actor.get_parent(); parent; parent = parent.get_parent())
      if (parent.name?.startsWith('kestrel-app-') || parent.name?.startsWith('kestrel-start-item-')) return true;
    return false;
  };
  const loaded = icon => icon.get_children().some(child => child.content && child.opacity > 0);
  const inks = {};

  try {
    for (const [slug, name, color] of WALLPAPERS) {
      const uri = wallpaperFile(name, slug, color).get_uri();
      background.set_string('picture-uri', uri);
      background.set_string('picture-uri-dark', uri);
      for (const [scheme, colorScheme] of SCHEMES) {
        interfaceSettings.set_string('color-scheme', colorScheme);
        for (const style of STYLES) {
          settings.set_string('app-icon-style', style);
          await pause(1500);
          toggleSurface('start');
          await pause(900);
          const shown = [panel, start].flatMap(descendants).filter(actor => actor instanceof St.Icon && actor.mapped && appIconActor(actor));
          const styled = shown.filter(icon => icon.gicon instanceof St.StyledIcon);
          require(shown.length > 0 && shown.every(loaded), `${style} icons load on the taskbar and in Start (${slug}, ${scheme})`);
          require(style === 'default' ? styled.length === 0 : styled.length === shown.length,
            `${style} reaches every taskbar and Start icon (${slug}, ${scheme})`);
          await capture(`${output}/icons-${style}-${scheme}-${slug}.png`);
          toggleSurface('start');
          await pause(300);
        }
        const {'tinted-plate': plate, 'tinted-ink': ink} = await appIcons();
        require(contrast(ink, plate) >= 4.5 && (scheme === 'dark') === (luminance(plate) < 0.2),
          `tinted glyphs stay readable on a ${scheme} plate (${slug})`);
        inks[`${slug}-${scheme}`] = ink;
      }
    }
    require(inks['lavender-dark'] !== inks['forest-dark'] && inks['lavender-light'] !== inks['forest-light'], 'tinted icons follow the wallpaper');

    settings.set_string('app-icon-style', 'tinted');
    settings.set_string('app-icon-tint', '#3a944a');
    await pause(600);
    const tinted = await appIcons();
    require(tinted['tinted-ink'] !== inks['forest-light'], 'a chosen tint replaces the wallpaper accent');

    const glyphs = GLib.build_filenamev([GLib.get_user_cache_dir(), 'kestrel', 'app-glyphs']);
    const favorites = settings.get_strv('favorite-apps').filter(id => Gio.DesktopAppInfo.new(id));
    require(tinted.glyphs === glyphs && favorites.every(id => GLib.file_test(`${glyphs}/${id.replace(/\.desktop$/, '')}.png`, GLib.FileTest.EXISTS)),
      'Luft apps find glyphs for pinned apps');
  } finally {
    settings.reset('app-icon-style');
    settings.reset('app-icon-tint');
    background.set_string('picture-uri', saved.uri);
    background.set_string('picture-uri-dark', saved.dark);
    interfaceSettings.set_string('color-scheme', saved.scheme);
    await pause(1200);
  }
}
