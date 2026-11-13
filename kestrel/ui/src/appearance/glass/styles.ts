import Gio from 'gi://Gio';
import Mtk from 'gi://Mtk';
import Shell from 'gi://Shell';

import { WallpaperFrost } from '../../core/stage/background/wallpaperFrost.js';
import { PlaybackConditions } from '../../desktop/wallpaper/conditions.js';
import { repaintWallpaperGlass, setGlassStyle, type GlassKind } from './kestrelGlass.js';

const KINDS: GlassKind[] = ['taskbar', 'surfaces', 'windows'];
const POWER_SAVER = 'maris-on-power-saver';

export class GlassStyles {
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.glass' });
  private readonly changed = this.settings.connect('changed', () => this.sync());
  private readonly conditions = new PlaybackConditions(() => this.sync(), null);
  private frost: WallpaperFrost | null = null;

  constructor() {
    this.sync();
  }

  private wantsMaris(kind: GlassKind): boolean {
    return (this.conditions.powerSaving && this.settings.get_boolean(POWER_SAVER)) ||
      this.settings.get_string(kind) === 'maris';
  }

  private sync(): void {
    const maris = KINDS.filter(kind => this.wantsMaris(kind));
    if (maris.length && !this.frost) this.frost = new WallpaperFrost(true, () => this.publish());
    if (!maris.length && this.frost) {
      this.frost.destroy();
      this.frost = null;
      global.compositor.clear_frosted_wallpaper();
    }
    const ready = !!this.frost?.pieces.length;
    for (const kind of KINDS)
      setGlassStyle(kind, ready && maris.includes(kind) ? Shell.BlurStyle.MARIS : Shell.BlurStyle.LUCA);
    global.compositor.set_background_blur_from_wallpaper(ready && maris.includes('windows'));
  }

  private publish(): void {
    global.compositor.clear_frosted_wallpaper();
    for (const { monitor: { x, y, width, height }, texture } of this.frost!.pieces)
      global.compositor.add_frosted_wallpaper(new Mtk.Rectangle({ x, y, width, height }), texture);
    this.sync();
    repaintWallpaperGlass();
  }

  destroy(): void {
    this.settings.disconnect(this.changed);
    this.conditions.destroy();
    this.frost?.destroy();
    global.compositor.clear_frosted_wallpaper();
    global.compositor.set_background_blur_from_wallpaper(false);
  }
}
