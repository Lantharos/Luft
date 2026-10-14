import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { seedFromSamples, type Rgb } from '../../appearance/color.js';
import { buildPalette } from '../../appearance/palette.js';
import { AccentStylesheet } from '../../appearance/stylesheet.js';
import { stateFile } from './config.js';
import { applyDesktopDefaults } from './desktopDefaults.js';

const CENTER: [number, number] = [0.5, 0.5];

function focusOf(wallpaper: Gio.File): [number, number] {
  try {
    const details = wallpaper.get_parent()!.get_child('wallpaper.json');
    const { focus } = JSON.parse(new TextDecoder().decode(details.load_contents(null)[1]));
    return [Number(focus[0]), Number(focus[1])];
  } catch {
    return CENTER;
  }
}

export class LoginAppearance {
  private readonly background = new Gio.Settings({ schema_id: 'org.gnome.desktop.background' });
  private readonly kestrel = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private readonly stylesheet = new AccentStylesheet('greeter-accent.css');

  constructor() {
    applyDesktopDefaults();
    new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' }).set_string('color-scheme', 'prefer-dark');
  }

  showWallpaperOf(uid: number | null): void {
    const candidates = [stateFile('shared', 'wallpaper.jpg'), ...uid === null ? [] : [stateFile('users', `${uid}`, 'wallpaper.jpg')]];
    const wallpaper = candidates.find(file => file.query_exists(null));
    const uri = wallpaper?.get_uri() ?? '';
    const options = uri ? 'zoom' : 'none';
    const focus = new GLib.Variant('(dd)', wallpaper ? focusOf(wallpaper) : CENTER);
    if (!this.kestrel.get_value('wallpaper-focus-dark').equal(focus)) this.kestrel.set_value('wallpaper-focus-dark', focus);
    if (this.background.get_string('picture-uri-dark') === uri && this.background.get_string('picture-options') === options) return;
    this.background.set_string('picture-options', options);
    this.background.set_string('picture-uri', uri);
    this.background.set_string('picture-uri-dark', uri);
  }

  wallpaperSampled(samples: Rgb[]): void {
    const seed = seedFromSamples(samples);
    this.stylesheet.apply(seed, buildPalette(seed, false));
  }
}
