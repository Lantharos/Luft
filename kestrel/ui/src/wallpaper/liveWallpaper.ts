import Gio from 'gi://Gio';

import type { Monitor } from '../panel/panel.js';
import { visibleWallpaperMonitors } from '../panel/coverage.js';
import { PlaybackConditions } from './conditions.js';
import { Renderer } from './renderer.js';
import { keepStills, prepareStill, stillUri } from './still.js';

interface Mode {
  live: string;
  picture: string;
}

const LIGHT: Mode = { live: 'live-wallpaper', picture: 'picture-uri' };
const DARK: Mode = { live: 'live-wallpaper-dark', picture: 'picture-uri-dark' };
const MODES = [LIGHT, DARK];

export class LiveWallpaper {
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private readonly background = new Gio.Settings({ schema_id: 'org.gnome.desktop.background' });
  private readonly interfaceSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  private readonly conditions = new PlaybackConditions(() => this.sync());
  private readonly signals: [Gio.Settings, number][];
  private renderer: Renderer | null = null;
  private desktopVisible = false;

  constructor(private readonly monitors: () => Monitor[]) {
    this.signals = [
      [this.interfaceSettings, this.interfaceSettings.connect('changed::color-scheme', () => this.load())],
      ...MODES.flatMap(mode => [
        [this.settings, this.settings.connect(`changed::${mode.live}`, () => this.liveChanged(mode))],
        [this.background, this.background.connect(`changed::${mode.picture}`, () => this.followPicture(mode))],
      ] as [Gio.Settings, number][]),
    ];
    for (const mode of MODES) void this.showStill(mode);
    this.load();
  }

  private get mode(): Mode {
    return this.interfaceSettings.get_string('color-scheme') === 'prefer-dark' ? DARK : LIGHT;
  }

  private liveUri(mode: Mode): string {
    return this.settings.get_string(mode.live);
  }

  private liveChanged(mode: Mode): void {
    void this.showStill(mode);
    this.load();
  }

  private load(): void {
    const uri = this.liveUri(this.mode);
    if (this.renderer?.uri === uri) return;
    this.renderer?.stop();
    this.renderer = uri ? new Renderer(uri, this.monitors, () => this.sync()) : null;
    this.sync();
  }

  private async showStill(mode: Mode): Promise<void> {
    const uri = this.liveUri(mode);
    if (!uri) return;
    const still = await prepareStill(uri);
    if (!still || this.liveUri(mode) !== uri) return;
    keepStills(MODES.map(other => this.liveUri(other)).filter(Boolean));
    if (this.background.get_string(mode.picture) !== still) this.background.set_string(mode.picture, still);
  }

  private followPicture(mode: Mode): void {
    const uri = this.liveUri(mode);
    if (uri && this.background.get_string(mode.picture) !== stillUri(uri))
      this.settings.set_string(mode.live, '');
  }

  sync(desktopVisible = this.desktopVisible): void {
    this.desktopVisible = desktopVisible;
    this.renderer?.play(desktopVisible && this.conditions.allowed ? visibleWallpaperMonitors(this.monitors()) : new Set());
  }

  monitorsChanged(): void {
    this.renderer?.placeAll();
  }

  destroy(): void {
    for (const [settings, id] of this.signals) settings.disconnect(id);
    this.conditions.destroy();
    this.renderer?.stop();
  }
}
