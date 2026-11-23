import Cogl from 'gi://Cogl';
import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import Mtk from 'gi://Mtk';
import Shell from 'gi://Shell';

import { fromHex } from '../color.js';
import { WallpaperFrost, type FrostKind } from '../../core/stage/background/wallpaperFrost.js';
import { PlaybackConditions } from '../../desktop/wallpaper/conditions.js';
import { repaintWallpaperGlass, setGlassStyle, type GlassKind } from './kestrelGlass.js';

const KINDS: GlassKind[] = ['taskbar', 'surfaces', 'windows', 'see-through'];
const MARIS = { luminosity: 1, cover: { dark: 0.8, light: 0.5 } };

class FrostPieces {
  private frost: WallpaperFrost | null = null;

  constructor(private readonly kind: FrostKind, private readonly target: Meta.WallpaperFrost, private readonly changed: () => void) {}

  get ready(): boolean {
    return !!this.frost?.pieces.length;
  }

  want(wanted: boolean): void {
    if (wanted && !this.frost) this.frost = new WallpaperFrost(this.kind, () => this.publish());
    if (wanted || !this.frost) return;
    this.frost.destroy();
    this.frost = null;
    global.compositor.clear_frosted_wallpaper(this.target);
  }

  private publish(): void {
    global.compositor.clear_frosted_wallpaper(this.target);
    for (const { monitor: { x, y, width, height }, texture } of this.frost!.pieces)
      global.compositor.add_frosted_wallpaper(this.target, new Mtk.Rectangle({ x, y, width, height }), texture);
    this.changed();
  }

  destroy(): void {
    this.want(false);
  }
}

export class GlassStyles {
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.glass' });
  private readonly changed = this.settings.connect('changed', () => this.sync());
  private readonly conditions = new PlaybackConditions(() => this.sync(), null);
  private readonly glassChanged = global.compositor.connect('glass-changed', () => this.sync());
  private readonly blurred = new FrostPieces('blurred', Meta.WallpaperFrost.BLURRED, () => this.published());
  private readonly wide = new FrostPieces('wide', Meta.WallpaperFrost.WIDE, () => this.published());

  constructor() {
    this.sync();
  }

  private chosen(kind: GlassKind): Meta.GlassStyle {
    return this.settings.get_string(kind) === 'maris' ? Meta.GlassStyle.MARIS : Meta.GlassStyle.LUCA;
  }

  private wallpaperOnly(): boolean {
    return this.settings.get_string('luca-blurs') === 'wallpaper' ||
      (this.conditions.powerSaving && this.settings.get_boolean('wallpaper-on-power-saver'));
  }

  private shellStyle(kind: GlassKind, wallpaperOnly: boolean): Shell.BlurStyle {
    if (this.chosen(kind) === Meta.GlassStyle.MARIS)
      return this.wide.ready ? Shell.BlurStyle.MARIS : Shell.BlurStyle.LUCA;
    return wallpaperOnly && this.blurred.ready ? Shell.BlurStyle.WALLPAPER : Shell.BlurStyle.LUCA;
  }

  private sync(): void {
    const wallpaperOnly = this.wallpaperOnly();
    this.blurred.want(wallpaperOnly);
    this.wide.want(KINDS.some(kind => this.chosen(kind) === Meta.GlassStyle.MARIS) || global.compositor.get_maris_requested());
    for (const kind of KINDS) setGlassStyle(kind, this.shellStyle(kind, wallpaperOnly));
    global.compositor.set_glass(this.chosen('windows'), this.chosen('surfaces'), wallpaperOnly);
  }

  private published(): void {
    this.sync();
    repaintWallpaperGlass();
  }

  setSurface(color: string, scheme: 'dark' | 'light'): void {
    const [red, green, blue] = fromHex(color);
    global.compositor.set_glass_surface(new Cogl.Color({ red, green, blue, alpha: Math.round(MARIS.cover[scheme] * 255) }), MARIS.luminosity);
    repaintWallpaperGlass();
  }

  destroy(): void {
    this.settings.disconnect(this.changed);
    global.compositor.disconnect(this.glassChanged);
    this.conditions.destroy();
    this.blurred.destroy();
    this.wide.destroy();
  }
}
