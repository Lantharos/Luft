import type Clutter from 'gi://Clutter';
import St from 'gi://St';

import { visibleWallpaperMonitors } from '../../../../desktop/panel/coverage.js';
import type { Monitor } from '../../../../desktop/panel/panel.js';
import { PlaybackConditions } from '../../../../desktop/wallpaper/conditions.js';
import { reducedMotion } from '../../../../shared/motion/motion.js';
import type { ExtensionHost } from '../../../host.js';
import type { LayerOptions, Outline, Rect } from '../types.js';
import { SurfaceWatch } from './surfaces.js';

export interface StagedLayer {
  sync(): void;
  monitorsChanged(): void;
}

/** What every wallpaper layer depends on, watched once for all of them and only while one exists. */
export class LayerStage {
  private readonly layers = new Set<StagedLayer>();
  private readonly shell = St.Settings.get();
  private conditions: PlaybackConditions | null = null;
  private disconnectors: (() => void)[] = [];
  readonly surfaces: SurfaceWatch;

  constructor(readonly host: ExtensionHost) {
    this.surfaces = new SurfaceWatch(host);
  }

  add(layer: StagedLayer): () => void {
    if (!this.layers.size) this.start();
    this.layers.add(layer);
    return () => {
      this.layers.delete(layer);
      if (!this.layers.size) this.stop();
    };
  }

  private start(): void {
    const sync = () => this.layers.forEach(layer => layer.sync());
    this.conditions = new PlaybackConditions(sync, null);
    const shellSignals = [this.shell.connect('notify::enable-animations', sync), this.shell.connect('notify::reduced-motion', sync)];
    this.disconnectors = [
      this.host.desktop.watch(sync),
      this.host.watchMonitors(() => this.layers.forEach(layer => layer.monitorsChanged())),
      () => shellSignals.forEach(id => this.shell.disconnect(id)),
    ];
  }

  private stop(): void {
    for (const disconnect of this.disconnectors.splice(0)) disconnect();
    this.conditions?.destroy();
    this.conditions = null;
  }

  visibleMonitors(): Set<number> {
    const allowed = this.host.desktop.wallpaperShown && !!this.conditions?.allowed && this.shell.enable_animations && !reducedMotion();
    return allowed ? visibleWallpaperMonitors(this.host.monitors()) : new Set();
  }

  monitors(): Monitor[] {
    return this.host.monitors();
  }

  primaryIndex(): number {
    return this.host.primaryIndex();
  }

  place(actor: Clutter.Actor, depth: NonNullable<LayerOptions['depth']>): void {
    actor.get_parent()?.remove_child(actor);
    if (depth === 'below-windows') global.window_group.insert_child_above(actor, this.host.wallpaper);
    else global.window_group.get_parent()!.insert_child_above(actor, global.window_group);
  }

  taskbar(monitor: Monitor): Rect | null {
    return this.host.taskbar(monitor);
  }

  taskbarOutlines(monitor: Monitor): Outline[] {
    return this.host.taskbarIslands(monitor).map(({ x, y, width, height, radius }) => ({ x, y, width, height, radii: [radius, radius, radius, radius] }));
  }
}
