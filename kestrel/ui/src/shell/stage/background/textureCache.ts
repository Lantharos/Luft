import type Clutter from 'gi://Clutter';
import type Cogl from 'gi://Cogl';
import type GDesktopEnums from 'gi://GDesktopEnums';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import System from 'system';

import type { Rgb } from '../../../appearance/color.js';
import * as BackgroundStore from '../backgroundStore.js';
import { createTexture, fitTexture, loadFrame } from './decode.js';
import { EIGHT_BIT_CHANNELS, packSamples, sampleColors, unpackSamples } from './samples.js';
import { BACKGROUND_SCHEMA, BACKGROUND_STYLE_KEY, PICTURE_URI_DARK_KEY, PICTURE_URI_KEY } from './schemas.js';
import { fittedSize, storeKey, textureKey, type MonitorGeometry } from './sizing.js';

interface LoadedTexture {
  texture: Cogl.Texture;
  colorState: Clutter.ColorState | null;
  samples: Rgb[];
}

export interface TextureEntry extends LoadedTexture {
  key: string;
}

export function graphicsRecovery(): Clutter.GraphicsRecoveryContext {
  return global.stage.context.get_backend().get_graphics_recovery_context();
}

async function loadStored(key: string, cancellable: Gio.Cancellable | null): Promise<LoadedTexture | null> {
  const stored = await BackgroundStore.load(key, GLib.PRIORITY_LOW, cancellable);
  return stored && { texture: stored.texture, colorState: null, samples: unpackSamples(stored.metadata) };
}

async function decode(file: Gio.File, style: GDesktopEnums.BackgroundStyle, monitors: MonitorGeometry[], storedKey: string, cancellable: Gio.Cancellable | null): Promise<LoadedTexture> {
  const [frameData, colorState] = await loadFrame(file, cancellable);
  const data = frameData.bytes.get_data() as Uint8Array<ArrayBuffer>;
  const samples = sampleColors(frameData, data);
  const texture = fitTexture(createTexture(frameData, data), fittedSize(frameData.width, frameData.height, style, monitors));
  GLib.idle_add_once(GLib.PRIORITY_LOW, () => System.gc());

  if (!colorState && EIGHT_BIT_CHANNELS.has(frameData.format))
    BackgroundStore.store(storedKey, () => texture, packSamples(samples));
  return { texture, colorState, samples };
}

class BackgroundTextureCache {
  private readonly textures = new Map<string, TextureEntry>();
  private readonly holders = new Map<object, string[]>();
  private monitors: MonitorGeometry[] = [];
  private readonly settings = new Gio.Settings({ schema_id: BACKGROUND_SCHEMA });

  constructor() {
    graphicsRecovery().connect('graphics-restored', () => this.textures.clear());
  }

  async load(file: Gio.File, cancellable: Gio.Cancellable | null, style: GDesktopEnums.BackgroundStyle, monitors: MonitorGeometry[]): Promise<TextureEntry> {
    this.monitors = monitors;
    const key = textureKey(file, style, monitors);

    const cached = this.textures.get(key);
    if (cached) return cached;

    const stored = await storeKey(file, style, monitors, cancellable);
    const entry = {
      key,
      ...await loadStored(stored, cancellable) ?? await decode(file, style, monitors, stored, cancellable),
    };
    this.textures.set(key, entry);
    return entry;
  }

  hold(holder: object, entries: TextureEntry[]): void {
    this.holders.set(holder, entries.map(entry => entry.key));
    this.dropUnused();
  }

  release(holder: object): void {
    if (this.holders.delete(holder)) this.dropUnused();
  }

  purge(file: Gio.File): void {
    const uri = file.get_uri();
    for (const key of this.textures.keys()) {
      if (key.startsWith(`${uri} `)) this.textures.delete(key);
    }
  }

  private dropUnused(): void {
    const style = this.settings.get_enum(BACKGROUND_STYLE_KEY);
    const wallpapers = [PICTURE_URI_KEY, PICTURE_URI_DARK_KEY].map(name =>
      textureKey(Gio.File.new_for_commandline_arg(this.settings.get_string(name)), style, this.monitors));
    const used = new Set([...wallpapers, ...[...this.holders.values()].flat()]);
    for (const key of this.textures.keys()) {
      if (!used.has(key)) this.textures.delete(key);
    }
  }
}

let textureCache: BackgroundTextureCache | null = null;

export function getBackgroundTextureCache(): BackgroundTextureCache {
  textureCache ??= new BackgroundTextureCache();
  return textureCache;
}
