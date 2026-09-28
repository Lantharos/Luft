import Gio from 'gi://Gio';

import type { Monitor } from '../panel/panel.js';
import { visibleWallpaperMonitors } from '../panel/coverage.js';
import { PlaybackConditions } from './conditions.js';
import { Renderer } from './renderer.js';
import { showStill, stillUri } from './still.js';

export class LiveWallpaper {
  private readonly settings = new Gio.Settings({ schema_id: 'dev.lantharos.kestrel' });
  private readonly background = new Gio.Settings({ schema_id: 'org.gnome.desktop.background' });
  private readonly conditions = new PlaybackConditions(() => this.sync());
  private readonly signals: [Gio.Settings, number][];
  private renderer: Renderer | null = null;
  private desktopVisible = false;

  constructor(private readonly monitors: () => Monitor[]) {
    this.signals = [
      [this.settings, this.settings.connect('changed::live-wallpaper', () => this.load())],
      [this.background, this.background.connect('changed::picture-uri', () => this.followPicture())],
    ];
    this.load();
  }

  private get uri(): string {
    return this.settings.get_string('live-wallpaper');
  }

  private load(): void {
    const uri = this.uri;
    if (this.renderer?.uri === uri) return;
    this.renderer?.stop();
    this.renderer = uri ? new Renderer(uri, this.monitors, () => this.sync()) : null;
    if (uri) void showStill(uri, this.background, () => this.uri === uri);
    this.sync();
  }

  private followPicture(): void {
    if (this.uri && this.background.get_string('picture-uri') !== stillUri(this.uri))
      this.settings.set_string('live-wallpaper', '');
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
