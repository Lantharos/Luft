import type Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Mtk from 'gi://Mtk';

import type { Monitor } from './monitor.js';

export interface ChromeOptions {
  trackFullscreen?: boolean;
  affectsStruts?: boolean;
}

interface TrackedActor extends Required<ChromeOptions> {
  actor: Clutter.Actor;
}

const DEFAULT_OPTIONS: Required<ChromeOptions> = {
  trackFullscreen: false,
  affectsStruts: false,
};

function strutSide(monitor: Monitor, x1: number, y1: number, x2: number, y2: number): Meta.Side | null {
  if (x1 <= monitor.x && x2 >= monitor.x + monitor.width) {
    if (y1 <= monitor.y) return Meta.Side.TOP;
    if (y2 >= monitor.y + monitor.height) return Meta.Side.BOTTOM;
    return null;
  }
  if (y1 <= monitor.y && y2 >= monitor.y + monitor.height) {
    if (x1 <= monitor.x) return Meta.Side.LEFT;
    if (x2 >= monitor.x + monitor.width) return Meta.Side.RIGHT;
    return null;
  }
  if (x1 <= monitor.x) return Meta.Side.LEFT;
  if (y1 <= monitor.y) return Meta.Side.TOP;
  if (x2 >= monitor.x + monitor.width) return Meta.Side.RIGHT;
  if (y2 >= monitor.y + monitor.height) return Meta.Side.BOTTOM;
  return null;
}

export class ChromeTracker {
  private readonly trackedActors: TrackedActor[] = [];
  private updateRegionIdle = 0;

  constructor(private readonly findMonitorForActor: (actor: Clutter.Actor) => Monitor | null) {}

  track(actor: Clutter.Actor, options: ChromeOptions = {}): void {
    if (this.findActor(actor) !== -1) throw new Error('trying to re-track existing chrome actor');

    const actorData = { ...DEFAULT_OPTIONS, ...options, actor };
    actor.connectObject(
      'notify::visible', () => this.queueUpdateRegions(),
      'notify::allocation', () => this.queueUpdateRegions(),
      'destroy', () => this.untrack(actor), this);

    this.trackedActors.push(actorData);
    this.updateActorVisibility(actorData);
    this.queueUpdateRegions();
  }

  trackDescendant(actor: Clutter.Actor, options: ChromeOptions = {}): void {
    let ancestor = actor.get_parent();
    let index = this.findActor(ancestor);
    while (ancestor && index === -1) {
      ancestor = ancestor.get_parent();
      index = this.findActor(ancestor);
    }

    const ancestorData = ancestor ? this.trackedActors[index] : DEFAULT_OPTIONS;
    this.track(actor, {
      trackFullscreen: options.trackFullscreen ?? ancestorData.trackFullscreen,
      affectsStruts: options.affectsStruts ?? ancestorData.affectsStruts,
    });
  }

  untrack(actor: Clutter.Actor): void {
    const i = this.findActor(actor);
    if (i === -1) return;

    this.trackedActors.splice(i, 1);
    actor.disconnectObject(this);

    this.queueUpdateRegions();
  }

  updateVisibility(): void {
    for (const actorData of this.trackedActors) this.updateActorVisibility(actorData);
  }

  queueUpdateRegions(): void {
    if (this.updateRegionIdle) return;
    this.updateRegionIdle = global.compositor.get_laters().add(Meta.LaterType.BEFORE_REDRAW, () => this.updateRegions());
  }

  updateRegions(): boolean {
    if (this.updateRegionIdle) {
      global.compositor.get_laters().remove(this.updateRegionIdle);
      this.updateRegionIdle = 0;
    }

    const struts = [];
    for (const actorData of this.trackedActors) {
      if (!actorData.affectsStruts) continue;

      const monitor = this.findMonitorForActor(actorData.actor);
      if (!monitor) continue;

      const [tx, ty] = actorData.actor.get_transformed_position();
      const [tw, th] = actorData.actor.get_transformed_size();
      const x = Math.round(tx);
      const y = Math.round(ty);
      const w = Math.round(tw);
      const h = Math.round(th);

      const x1 = Math.max(x, 0);
      const x2 = Math.min(x + w, global.screen_width);
      const y1 = Math.max(y, 0);
      const y2 = Math.min(y + h, global.screen_height);

      const side = strutSide(monitor, x1, y1, x2, y2);
      if (side === null) continue;

      const rect = new Mtk.Rectangle({ x: x1, y: y1, width: x2 - x1, height: y2 - y1 });
      const strut = new Meta.Strut();
      strut.rect = rect;
      strut.side = side;
      struts.push(strut);
    }

    const workspaceManager = global.workspace_manager;
    for (let w = 0; w < workspaceManager.n_workspaces; w++)
      workspaceManager.get_workspace_by_index(w)!.set_builtin_struts(struts);

    return GLib.SOURCE_REMOVE;
  }

  private findActor(actor: Clutter.Actor | null): number {
    return this.trackedActors.findIndex(actorData => actorData.actor === actor);
  }

  private updateActorVisibility(actorData: TrackedActor): void {
    if (!actorData.trackFullscreen) return;

    const monitor = this.findMonitorForActor(actorData.actor);
    actorData.actor.visible = !(global.window_group.visible && monitor && monitor.inFullscreen);
  }
}
