import Cogl from 'gi://Cogl';
import type GDesktopEnums from 'gi://GDesktopEnums';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';

import * as KestrelUi from '../../../kestrelUi.js';
import type { LayoutManager } from '../layout.js';
import { getBackgroundCache } from './cache.js';
import { BACKGROUND_SCHEMA, COLOR_SCHEME_KEY, INTERFACE_SCHEMA, KESTREL_SCHEMA } from './schemas.js';
import { displaySignature, storeKey } from './sizing.js';
import { getBackgroundTextureCache, graphicsRecovery } from './textureCache.js';

export const DEFAULT_BACKGROUND_COLOR = new Cogl.Color({ red: 0, green: 0, blue: 0, alpha: 255 });

export interface BackgroundOptions {
  layoutManager: LayoutManager;
  settings: Gio.Settings;
  file: Gio.File | null;
  style: GDesktopEnums.BackgroundStyle;
  focusKey: string | null;
}

export namespace Background {
  export interface Signals extends Meta.Background.SignalSignatures {
    'loaded': () => void;
    'bg-changed': () => void;
    'focus-changed': () => void;
  }
}

export const Background = GObject.registerClass({
  Signals: { 'loaded': {}, 'bg-changed': {}, 'focus-changed': {} },
}, class Background extends Meta.Background {
  declare connect: GObject.SignalMethods<this, Background.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, Background.Signals>['emit'];

  declare focus: [number, number];
  declare isLoaded: boolean;
  declare private settings: Gio.Settings;
  declare private file: Gio.File | null;
  declare private style: GDesktopEnums.BackgroundStyle;
  declare private focusKey: string | null;
  declare private layoutManager: LayoutManager;
  declare private fileWatches: Map<number, number>;
  declare private cancellable: Gio.Cancellable;
  declare private interfaceSettings: Gio.Settings;
  declare private kestrelSettings: Gio.Settings;
  declare private changedIdleId: number;
  declare private loadedSignature: string;

  _init({ layoutManager, settings, file, style, focusKey }: BackgroundOptions): void {
    super._init({ meta_display: global.display });

    this.settings = settings;
    this.file = file;
    this.style = style;
    this.focus = [0.5, 0.5];
    this.focusKey = focusKey;
    this.layoutManager = layoutManager;
    this.fileWatches = new Map();
    this.cancellable = new Gio.Cancellable();
    this.isLoaded = false;
    this.changedIdleId = 0;

    this.interfaceSettings = new Gio.Settings({ schema_id: INTERFACE_SCHEMA });
    this.kestrelSettings = new Gio.Settings({ schema_id: KESTREL_SCHEMA });

    this.settings.connectObject('changed', () => this.emitChangedSignal(), this);
    this.interfaceSettings.connectObject(`changed::${COLOR_SCHEME_KEY}`, () => this.emitChangedSignal(), this);

    if (focusKey) {
      this.kestrelSettings.connectObject(`changed::${focusKey}`, () => {
        this.readFocus(focusKey);
        this.emit('focus-changed');
      }, this);
    }

    graphicsRecovery().connectObject('graphics-restored', () => this.emitChangedSignal(), this);

    this.load();
  }

  destroy(): void {
    this.cancellable.cancel();

    const cache = getBackgroundCache();
    for (const signalId of this.fileWatches.values()) cache.disconnect(signalId);
    this.fileWatches.clear();

    this.settings.disconnectObject(this);
    this.interfaceSettings.disconnectObject(this);
    this.kestrelSettings.disconnectObject(this);
    graphicsRecovery().disconnectObject(this);
    getBackgroundTextureCache().release(this);

    if (this.changedIdleId) {
      GLib.source_remove(this.changedIdleId);
      this.changedIdleId = 0;
    }
  }

  updateResolution(): void {
    if (this.file && this.loadedSignature !== displaySignature(this.layoutManager.monitors)) this.emit('bg-changed');
  }

  storeKey(cancellable: Gio.Cancellable | null): Promise<string | null> {
    if (!this.file) return Promise.resolve(null);
    return storeKey(this.file, this.style, this.layoutManager.monitors, cancellable);
  }

  private emitChangedSignal(): void {
    if (this.changedIdleId) return;

    this.changedIdleId = GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => {
      this.changedIdleId = 0;
      this.emit('bg-changed');
    });
    GLib.Source.set_name_by_id(this.changedIdleId, '[kestrel] Background._emitChangedSignal');
  }

  private setLoaded(): void {
    if (this.isLoaded) return;

    this.isLoaded = true;
    if (this.cancellable.is_cancelled()) return;

    const id = GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => this.emit('loaded'));
    GLib.Source.set_name_by_id(id, '[kestrel] Background._setLoaded Idle');
  }

  private watchFile(file: Gio.File): void {
    const key = file.hash();
    if (this.fileWatches.has(key)) return;

    const cache = getBackgroundCache();
    cache.monitorFile(file);
    this.fileWatches.set(key, cache.connect('file-changed', (_cache, changedFile) => {
      if (!changedFile.equal(file)) return;
      getBackgroundTextureCache().purge(changedFile);
      this.emitChangedSignal();
    }));
  }

  private async loadImage(file: Gio.File): Promise<void> {
    this.watchFile(file);
    const { monitors } = this.layoutManager;
    this.loadedSignature = displaySignature(monitors);

    const cache = getBackgroundTextureCache();

    try {
      const entry = await cache.load(file, this.cancellable, this.style, monitors);
      cache.hold(this, [entry]);
      const { texture, colorState, samples } = entry;
      this.set_texture(texture, this.style, colorState);
      if (this.settings.schema_id === BACKGROUND_SCHEMA) KestrelUi.wallpaperSampled(samples);
      this.setLoaded();
    } catch (err) {
      if (!(err as GLib.Error).matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)) logError(err as Error, 'Failed to load background');
      this.setLoaded();
    }
  }

  private readFocus(focusKey: string): void {
    this.focus = this.kestrelSettings.get_value(focusKey).deepUnpack<[number, number]>();
    this.set_focus(...this.focus);
  }

  private load(): void {
    this.set_color(DEFAULT_BACKGROUND_COLOR);
    if (this.focusKey) this.readFocus(this.focusKey);

    if (!this.file) {
      this.setLoaded();
      return;
    }

    this.loadImage(this.file).catch(logError);
  }
});
export type Background = InstanceType<typeof Background>;
