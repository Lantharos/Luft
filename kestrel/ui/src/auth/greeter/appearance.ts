import Gio from 'gi://Gio';

import { seedFromSamples, type Rgb } from '../../appearance/color.js';
import { buildPalette } from '../../appearance/palette.js';
import { AccentStylesheet } from '../../appearance/stylesheet.js';
import { stateFile } from './config.js';
import { applyDesktopDefaults } from './desktopDefaults.js';

export class LoginAppearance {
  private readonly background = new Gio.Settings({ schema_id: 'org.gnome.desktop.background' });
  private readonly stylesheet = new AccentStylesheet('greeter-accent.css');

  constructor() {
    applyDesktopDefaults();
    new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' }).set_string('color-scheme', 'prefer-dark');
  }

  showWallpaperOf(uid: number | null): void {
    const candidates = [stateFile('shared', 'wallpaper.jpg'), ...uid === null ? [] : [stateFile('users', `${uid}`, 'wallpaper.jpg')]];
    const uri = candidates.find(file => file.query_exists(null))?.get_uri() ?? '';
    const options = uri ? 'zoom' : 'none';
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
