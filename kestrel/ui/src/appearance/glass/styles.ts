import Cogl from 'gi://Cogl';
import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import Mtk from 'gi://Mtk';
import Shell from 'gi://Shell';

import { fromHex, type Rgb } from '../color.js';
import { setLuminosity, type Channels } from './blend.js';
import { WallpaperFrost, type FrostKind } from '../../core/stage/background/wallpaperFrost.js';
import { PlaybackConditions } from '../../desktop/wallpaper/conditions.js';
import { repaintWallpaperGlass, setGlassStyle, type GlassKind } from './kestrelGlass.js';

const KINDS: GlassKind[] = ['taskbar', 'surfaces', 'windows', 'see-through'];
const MARIS = { luminosity: 1, cover: { dark: 0.8, light: 0.5 } };
const NIKO = {
  dark: { tint: 0.15, luminosity: 0.96, lightness: 0x2c / 255 },
  light: { tint: 0, luminosity: 0.85 },
};
const STYLES: Record<string, Meta.GlassStyle> = {
  luca: Meta.GlassStyle.LUCA,
  maris: Meta.GlassStyle.MARIS,
  niko: Meta.GlassStyle.NIKO,
};

type Scheme = keyof typeof NIKO;

export interface NikoGlass {
  tint: Rgb;
  share: number;
  luminosity: number;
}

const glassColor = ([red, green, blue]: Rgb, share: number) => new Cogl.Color({ red, green, blue, alpha: Math.round(share * 255) });

function nikoTint(surface: Rgb, niko: (typeof NIKO)[Scheme]): Rgb {
  if (!('lightness' in niko)) return surface;
  return setLuminosity(surface.map(channel => channel / 255) as Channels, niko.lightness).map(channel => Math.round(channel * 255)) as Rgb;
}

export function nikoGlass(color: string, scheme: Scheme, castScale: number): NikoGlass {
  const niko = NIKO[scheme];
  return { tint: nikoTint(fromHex(color), niko), share: 1 - (1 - niko.tint) * castScale, luminosity: niko.luminosity };
}

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
    return STYLES[this.settings.get_string(kind)];
  }

  private savingPower(): boolean {
    return this.conditions.powerSaving && this.settings.get_boolean('wallpaper-on-power-saver');
  }

  private wallpaperOnly(): boolean {
    return this.settings.get_string('blurs') === 'wallpaper' || this.savingPower();
  }

  private blursWallpaperOnly(kind: GlassKind, wallpaperOnly: boolean): boolean {
    return kind === 'see-through' ? this.savingPower() : wallpaperOnly;
  }

  private shellStyle(kind: GlassKind, wallpaperOnly: boolean): Shell.BlurStyle {
    const frosted = wallpaperOnly && this.blurred.ready;
    switch (this.chosen(kind)) {
      case Meta.GlassStyle.MARIS:
        return this.wide.ready ? Shell.BlurStyle.MARIS : Shell.BlurStyle.LUCA;
      case Meta.GlassStyle.NIKO:
        return frosted ? Shell.BlurStyle.NIKO_WALLPAPER : Shell.BlurStyle.NIKO;
      default:
        return frosted ? Shell.BlurStyle.WALLPAPER : Shell.BlurStyle.LUCA;
    }
  }

  private sync(): void {
    const wallpaperOnly = this.wallpaperOnly();
    this.blurred.want(wallpaperOnly);
    this.wide.want(KINDS.some(kind => this.chosen(kind) === Meta.GlassStyle.MARIS) || global.compositor.get_maris_requested());
    for (const kind of KINDS) setGlassStyle(kind, this.shellStyle(kind, this.blursWallpaperOnly(kind, wallpaperOnly)));
    global.compositor.set_glass(this.chosen('windows'), this.chosen('surfaces'), wallpaperOnly);
  }

  private published(): void {
    this.sync();
    repaintWallpaperGlass();
  }

  setSurface(color: string, scheme: Scheme, castScale: number): void {
    const niko = nikoGlass(color, scheme, castScale);
    global.compositor.set_glass_surface(glassColor(fromHex(color), MARIS.cover[scheme]), MARIS.luminosity);
    global.compositor.set_niko_tint(glassColor(niko.tint, niko.share), niko.luminosity);
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
