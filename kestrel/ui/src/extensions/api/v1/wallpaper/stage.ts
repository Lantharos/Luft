import type Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';
import St from 'gi://St';

import { visibleWallpaperMonitors } from '../../../../desktop/panel/coverage.js';
import type { Monitor } from '../../../../desktop/panel/panel.js';
import { PlaybackConditions } from '../../../../desktop/wallpaper/conditions.js';
import { reducedMotion } from '../../../../shared/motion/motion.js';
import type { ExtensionHost } from '../../../host.js';
import type { LayerOptions, Rect } from '../types.js';

const SURFACE_TYPES = [Meta.WindowType.NORMAL, Meta.WindowType.DIALOG, Meta.WindowType.MODAL_DIALOG, Meta.WindowType.UTILITY];

function onScreen(window: Meta.Window, workspace: Meta.Workspace): boolean {
  const actor = window.get_compositor_private() as Meta.WindowActor | null;
  return !window.minimized && window.showing_on_its_workspace() && window.located_on_workspace(workspace) &&
    SURFACE_TYPES.includes(window.window_type) && !!actor?.visible && actor.opacity > 0;
}

export function stackedWindows(): Rect[] {
  const workspace = global.workspace_manager.get_active_workspace();
  return global.display.sort_windows_by_stacking(workspace.list_windows().filter(window => onScreen(window, workspace)))
    .reverse()
    .map(window => {
      const { x, y, width, height } = window.get_frame_rect();
      return { x, y, width, height };
    });
}

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

  constructor(readonly host: ExtensionHost) {}

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
    if (depth === 'below-windows') global.window_group.insert_child_above(actor, this.host.wallpaper);
    else global.window_group.get_parent()!.insert_child_above(actor, global.window_group);
  }

  taskbar(monitor: Monitor): Rect | null {
    return this.host.taskbar(monitor);
  }
}
