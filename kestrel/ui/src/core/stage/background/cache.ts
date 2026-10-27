import GDesktopEnums from 'gi://GDesktopEnums';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type GObject from 'gi://GObject';

import { EventEmitter } from '../../runtime/signals.js';
import type { LayoutManager } from '../layout.js';
import { FOCUS_DARK_KEY, FOCUS_KEY, INTERFACE_SCHEMA, BACKGROUND_STYLE_KEY, PICTURE_URI_DARK_KEY, PICTURE_URI_KEY } from './schemas.js';
import { Background } from './wallpaper.js';

interface BackgroundCacheSignals {
  'file-changed': (file: Gio.File) => void;
}

class BackgroundSource {
  useCount = 1;
  private readonly overrideImage = GLib.getenv('SHELL_BACKGROUND_IMAGE');
  private readonly settings: Gio.Settings;
  private readonly interfaceSettings = new Gio.Settings({ schema_id: INTERFACE_SCHEMA });
  private background: Background | null = null;
  private changedId = 0;
  private readonly monitorsChangedId: number;

  constructor(private readonly layoutManager: LayoutManager, settingsSchema: string) {
    this.settings = new Gio.Settings({ schema_id: settingsSchema });
    this.monitorsChangedId = global.backend.get_monitor_manager().connect('monitors-changed', () => this.background?.updateResolution());
  }

  getBackground(): Background {
    if (this.background) return this.background;

    let file = null;
    let style;
    let focusKey = null;

    if (this.overrideImage !== null) {
      file = Gio.File.new_for_path(this.overrideImage);
      style = GDesktopEnums.BackgroundStyle.ZOOM;
    } else {
      style = this.settings.get_enum(BACKGROUND_STYLE_KEY) as GDesktopEnums.BackgroundStyle;
      if (style !== GDesktopEnums.BackgroundStyle.NONE) {
        const dark = this.interfaceSettings.get_enum('color-scheme') === GDesktopEnums.ColorScheme.PREFER_DARK;
        file = Gio.File.new_for_commandline_arg(this.settings.get_string(dark ? PICTURE_URI_DARK_KEY : PICTURE_URI_KEY));
        focusKey = dark ? FOCUS_DARK_KEY : FOCUS_KEY;
      }
    }

    const background = new Background({
      layoutManager: this.layoutManager,
      settings: this.settings,
      file,
      style,
      focusKey,
    });
    this.changedId = background.connect('bg-changed', () => {
      background.disconnect(this.changedId);
      background.destroy();
      this.background = null;
    });
    this.background = background;
    return background;
  }

  destroy(): void {
    global.backend.get_monitor_manager().disconnect(this.monitorsChangedId);

    if (!this.background) return;
    this.background.disconnect(this.changedId);
    this.background.destroy();
    this.background = null;
  }
}

class BackgroundCache extends EventEmitter {
  declare connect: GObject.SignalMethods<this, BackgroundCacheSignals>['connect'];
  declare emit: GObject.SignalMethods<this, BackgroundCacheSignals>['emit'];
  declare disconnect: (id: number) => void;

  private readonly fileMonitors = new Map<number, Gio.FileMonitor>();
  private readonly backgroundSources = new Map<string, BackgroundSource>();

  monitorFile(file: Gio.File): void {
    const key = file.hash();
    if (this.fileMonitors.has(key)) return;

    const monitor = file.monitor(Gio.FileMonitorFlags.NONE, null);
    monitor.connect('changed', (_monitor, _file, _otherFile, eventType) => {
      if (eventType !== Gio.FileMonitorEvent.CHANGED && eventType !== Gio.FileMonitorEvent.CREATED)
        this.emit('file-changed', file);
    });

    this.fileMonitors.set(key, monitor);
  }

  getBackgroundSource(layoutManager: LayoutManager, settingsSchema: string): BackgroundSource {
    const existing = this.backgroundSources.get(settingsSchema);
    if (existing) {
      existing.useCount++;
      return existing;
    }

    const source = new BackgroundSource(layoutManager, settingsSchema);
    this.backgroundSources.set(settingsSchema, source);
    return source;
  }

  releaseBackgroundSource(settingsSchema: string): void {
    const source = this.backgroundSources.get(settingsSchema);
    if (!source) return;

    source.useCount--;
    if (source.useCount === 0) {
      this.backgroundSources.delete(settingsSchema);
      source.destroy();
    }
  }
}

let backgroundCache: BackgroundCache | null = null;

export function getBackgroundCache(): BackgroundCache {
  backgroundCache ??= new BackgroundCache();
  return backgroundCache;
}

export type { BackgroundSource };
