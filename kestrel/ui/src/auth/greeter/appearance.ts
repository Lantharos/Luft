import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { seedFromSamples, type Rgb } from '../../appearance/color.js';
import { buildPalette } from '../../appearance/palette.js';
import { AccentStylesheet } from '../../appearance/stylesheet.js';
import { stateFile } from './config.js';
import { applyDesktopDefaults } from './desktopDefaults.js';

const CENTER: [number, number] = [0.5, 0.5];

interface Wallpaper {
  picture: Gio.File;
  details: Gio.File;
}

function stored(...folder: string[]): Wallpaper {
  return { picture: stateFile(...folder, 'wallpaper.jpg'), details: stateFile(...folder, 'wallpaper.json') };
}

function luftDefault(background: Gio.Settings, dark: boolean): Wallpaper {
  const picture = Gio.File.new_for_uri(background.get_default_value(dark ? 'picture-uri-dark' : 'picture-uri')!.unpack() as string);
  const details = picture.get_basename()!.replace(/\.[^.]+$/, '.json');
  return { picture, details: picture.get_parent()!.get_child(details) };
}

function styleOf(uid: number): string {
  try {
    return new TextDecoder().decode(stateFile('users', `${uid}`, 'style').load_contents(null)[1]);
  } catch {
    return 'dark';
  }
}

function focusOf(details: Gio.File): [number, number] {
  try {
    const { focus } = JSON.parse(new TextDecoder().decode(details.load_contents(null)[1]));
    return [Number(focus[0]), Number(focus[1])];
  } catch {
    return CENTER;
  }
}

export class LoginAppearance {
  private readonly background = new Gio.Settings({ schema_id: 'org.gnome.desktop.background' });
  private readonly kestrel = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private readonly interfaceSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  private readonly stylesheet = new AccentStylesheet('greeter-accent');

  constructor() {
    applyDesktopDefaults();
  }

  showWallpaperOf(uid: number | null): void {
    if (uid !== null) this.showStyleOf(uid);
    const candidates = [stored('shared'), ...uid === null ? [] : [stored('users', `${uid}`)]];
    const dark = this.interfaceSettings.get_string('color-scheme') === 'prefer-dark';
    const wallpaper = candidates.find(candidate => candidate.picture.query_exists(null)) ?? luftDefault(this.background, dark);
    const uri = wallpaper.picture.get_uri();
    const focus = new GLib.Variant('(dd)', focusOf(wallpaper.details));
    for (const key of ['wallpaper-focus', 'wallpaper-focus-dark'])
      if (!this.kestrel.get_value(key).equal(focus)) this.kestrel.set_value(key, focus);
    if (this.background.get_string('picture-uri-dark') === uri && this.background.get_string('picture-options') === 'zoom') return;
    this.background.set_string('picture-options', 'zoom');
    this.background.set_string('picture-uri', uri);
    this.background.set_string('picture-uri-dark', uri);
  }

  private showStyleOf(uid: number): void {
    const scheme = styleOf(uid) === 'light' ? 'default' : 'prefer-dark';
    if (this.interfaceSettings.get_string('color-scheme') !== scheme) this.interfaceSettings.set_string('color-scheme', scheme);
  }

  wallpaperSampled(samples: Rgb[]): void {
    const seed = seedFromSamples(samples);
    this.stylesheet.apply(seed, buildPalette(seed, false));
  }
}
