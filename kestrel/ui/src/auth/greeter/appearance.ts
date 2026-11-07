import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { seedFromSamples, type Rgb } from '../../appearance/color.js';
import { buildPalette } from '../../appearance/palette.js';
import { AccentStylesheet } from '../../appearance/stylesheet.js';
import { getLoginManager } from '../../session/actions/loginManager.js';
import { stateFile } from './config.js';
import { applyDesktopDefaults } from './desktopDefaults.js';

const CENTER: [number, number] = [0.5, 0.5];
const STYLE_TIMEOUT = 2000;

interface Wallpaper {
  picture: Gio.File;
  details: Gio.File;
}

type Wallpapers = Record<'light' | 'dark', Wallpaper>;

function stored(folder: string[], name: string): Wallpaper {
  return { picture: stateFile(...folder, `${name}.jpg`), details: stateFile(...folder, `${name}.json`) };
}

function storedPair(...folder: string[]): Wallpapers | null {
  const light = stored(folder, 'wallpaper');
  if (!light.picture.query_exists(null)) return null;
  const dark = stored(folder, 'wallpaper-dark');
  return { light, dark: dark.picture.query_exists(null) ? dark : light };
}

function luftDefault(background: Gio.Settings, key: 'picture-uri' | 'picture-uri-dark'): Wallpaper {
  const picture = Gio.File.new_for_uri(background.get_default_value(key)!.unpack() as string);
  const details = picture.get_basename()!.replace(/\.[^.]+$/, '.json');
  return { picture, details: picture.get_parent()!.get_child(details) };
}

function focusOf(details: Gio.File): GLib.Variant {
  try {
    const { focus } = JSON.parse(new TextDecoder().decode(details.load_contents(null)[1]));
    return new GLib.Variant('(dd)', [Number(focus[0]), Number(focus[1])]);
  } catch {
    return new GLib.Variant('(dd)', CENTER);
  }
}

function currentStyle(uid: number): Promise<[style: string, secondsUntilChange: number]> {
  return new Promise(resolve => Gio.DBus.system.call(
    'com.lantharos.Greeter1', '/com/lantharos/Greeter1', 'com.lantharos.Greeter1', 'CurrentStyle',
    new GLib.Variant('(u)', [uid]), new GLib.VariantType('(su)'), Gio.DBusCallFlags.NONE, STYLE_TIMEOUT, null,
    (connection, result) => {
      try {
        resolve(connection!.call_finish(result).deepUnpack<[string, number]>());
      } catch (error) {
        console.warn(`The login screen style is unknown: ${error}`);
        resolve(['dark', 0]);
      }
    }));
}

export class LoginAppearance {
  private readonly background = new Gio.Settings({ schema_id: 'org.gnome.desktop.background' });
  private readonly kestrel = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private readonly interfaceSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  private readonly stylesheet = new AccentStylesheet('greeter-accent');
  private shownUid: number | null = null;
  private request = 0;
  private styleChange = 0;

  constructor() {
    applyDesktopDefaults();
    getLoginManager().connect('prepare-for-sleep', (_manager, aboutToSuspend) => {
      if (!aboutToSuspend) void this.showWallpaperOf(this.shownUid);
    });
  }

  async showWallpaperOf(uid: number | null): Promise<void> {
    const request = ++this.request;
    this.shownUid = uid;
    if (this.styleChange) GLib.source_remove(this.styleChange);
    this.styleChange = 0;
    const style = uid === null ? null : await currentStyle(uid);
    if (request !== this.request) return;
    const shared = storedPair('shared');
    const own = uid === null ? null : storedPair('users', `${uid}`);
    this.showWallpapers(shared ?? own ?? {
      light: luftDefault(this.background, 'picture-uri'),
      dark: luftDefault(this.background, 'picture-uri-dark'),
    });
    if (!style) return;
    const [name, secondsUntilChange] = style;
    this.showStyle(name);
    if (secondsUntilChange) this.styleChange = GLib.timeout_add_seconds(GLib.PRIORITY_LOW, secondsUntilChange, () => {
      this.styleChange = 0;
      void this.showWallpaperOf(uid);
      return GLib.SOURCE_REMOVE;
    });
  }

  private showWallpapers({ light, dark }: Wallpapers): void {
    for (const [key, wallpaper] of [['wallpaper-focus', light], ['wallpaper-focus-dark', dark]] as const) {
      const focus = focusOf(wallpaper.details);
      if (!this.kestrel.get_value(key).equal(focus)) this.kestrel.set_value(key, focus);
    }
    const [lightUri, darkUri] = [light.picture.get_uri(), dark.picture.get_uri()];
    if (this.background.get_string('picture-uri') === lightUri && this.background.get_string('picture-uri-dark') === darkUri &&
      this.background.get_string('picture-options') === 'zoom') return;
    this.background.delay();
    this.background.set_string('picture-options', 'zoom');
    this.background.set_string('picture-uri', lightUri);
    this.background.set_string('picture-uri-dark', darkUri);
    this.background.apply();
  }

  private showStyle(style: string): void {
    const scheme = style === 'light' ? 'default' : 'prefer-dark';
    if (this.interfaceSettings.get_string('color-scheme') !== scheme) this.interfaceSettings.set_string('color-scheme', scheme);
  }

  wallpaperSampled(samples: Rgb[]): void {
    const seed = seedFromSamples(samples);
    this.stylesheet.apply(seed, buildPalette(seed, false));
  }
}
