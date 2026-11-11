import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';
import St from 'gi://St';

import { visibleWallpaperMonitors } from '../../../../../desktop/panel/coverage.js';
import type { Monitor } from '../../../../../desktop/panel/panel.js';
import { PlaybackConditions } from '../../../../../desktop/wallpaper/conditions.js';
import { showsWallpaper } from '../../../../../desktop/wallpaper/pictures.js';
import { reducedMotion } from '../../../../../shared/motion/motion.js';
import type { ExtensionHost } from '../../../../host.js';
import type { LayerOptions, Rect, TaskbarOutline } from '../../types.js';
import { DesktopPointers } from './pointers.js';
import { SurfaceWatch } from './surfaces.js';

interface StagedLayer {
  sync(): void;
  monitorsChanged(): void;
}

export class LayerStage {
  private readonly layers = new Set<StagedLayer>();
  private readonly shell = St.Settings.get();
  private conditions: PlaybackConditions | null = null;
  private disconnectors: (() => void)[] = [];
  private belowWindows: Clutter.Actor | null = null;
  private forgetPicture: (() => void) | null = null;
  readonly surfaces: SurfaceWatch;
  readonly pointers: DesktopPointers;

  constructor(readonly host: ExtensionHost) {
    this.surfaces = new SurfaceWatch(host);
    this.pointers = new DesktopPointers(host);
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
    if (depth === 'below-windows') this.belowWindowsGroup().add_child(actor);
    else global.window_group.get_parent()!.insert_child_above(actor, global.window_group);
  }

  private belowWindowsGroup(): Clutter.Actor {
    if (!this.belowWindows) {
      this.belowWindows = new Clutter.Actor();
      global.display.connect('restacked', () => this.stackOverWallpaper());
      this.stackOverWallpaper();
    }
    return this.belowWindows;
  }

  private stackOverWallpaper(): void {
    const group = this.belowWindows!;
    const video = global.get_window_actors().findLast(actor => actor.meta_window?.get_window_type() === Meta.WindowType.DESKTOP);
    const parent = video ? global.window_group : this.host.desktopLayer;
    if (group.get_parent() !== parent) {
      group.get_parent()?.remove_child(group);
      parent.add_child(group);
      this.forgetPicture?.();
      this.forgetPicture = video ? showsWallpaper(group, true) : null;
    }
    if (video) global.window_group.set_child_above_sibling(group, video);
  }

  taskbar(monitor: Monitor): Rect | null {
    return this.host.taskbar(monitor);
  }

  taskbarOutlines(monitor: Monitor): TaskbarOutline[] {
    return this.host.taskbarIslands(monitor).map(({ x, y, width, height, edge, radius }) => ({ x, y, width, height, edge, radii: [radius, radius, radius, radius] }));
  }
}
