import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';

import * as KestrelUi from '../../../kestrelUi.js';
import type { BoardFrame } from '../../../desktop/board/board.js';
import { BackgroundManager } from '../../stage/background.js';
import type { Monitor } from '../../stage/layout.js';

interface WindowRecord {
  windowActor: Meta.WindowActor;
  clone: Clutter.Clone;
}

const isDesktopWindow = (window: Meta.Window) => window.get_window_type() === Meta.WindowType.DESKTOP;

function isOnMonitor(window: Meta.Window, monitor: Monitor): boolean {
  const geometry = global.display.get_monitor_geometry(monitor.index);
  const [intersects] = window.get_frame_rect().intersect(geometry);
  return intersects;
}

class WindowClones {
  private records: WindowRecord[] = [];

  constructor(private readonly owner: Clutter.Actor, private readonly layer: Clutter.Actor, originX: number, originY: number, shows: (window: Meta.Window) => boolean) {
    for (const windowActor of global.get_window_actors()) {
      if (shows(windowActor.meta_window!)) layer.add_child(this.clone(windowActor, originX, originY));
    }
    owner.connect('destroy', () => this.destroy());
  }

  private clone(windowActor: Meta.WindowActor, originX: number, originY: number): Clutter.Clone {
    const clone = new Clutter.Clone({
      source: windowActor,
      x: windowActor.x - originX,
      y: windowActor.y - originY,
    });

    const record = { windowActor, clone };

    windowActor.connectObject('destroy', () => {
      clone.destroy();
      this.records.splice(this.records.indexOf(record), 1);
    }, this.owner);

    const window = windowActor.meta_window!;
    const syncVisibility = () => (clone.visible = window.showing_on_its_workspace());
    window.connectObject('notify::minimized', syncVisibility, this.owner);
    syncVisibility();

    this.records.push(record);
    return clone;
  }

  stackAbove(bottom: Clutter.Actor | null): void {
    const stackIndices = new Map(global.get_window_actors().map((actor, i) => [actor, i]));
    this.records.sort((a, b) => stackIndices.get(a.windowActor)! - stackIndices.get(b.windowActor)!);

    let below = bottom;
    for (const { clone } of this.records) {
      this.layer.set_child_above_sibling(clone, below);
      below = clone;
    }
  }

  private destroy(): void {
    for (const record of this.records) record.clone.destroy();
    this.records = [];
  }
}

const WorkspaceBackground = GObject.registerClass(
class WorkspaceBackground extends Clutter.Actor {
  constructor(monitor: Monitor) {
    super({ width: monitor.width, height: monitor.height, clip_to_allocation: true });

    const background = new Meta.BackgroundGroup();
    this.add_child(background);
    const manager = new BackgroundManager({
      container: background,
      monitorIndex: monitor.index,
      controlPosition: false,
    });

    new WindowClones(this, this, monitor.x, monitor.y, window => isDesktopWindow(window) && isOnMonitor(window, monitor));
    this.connect('destroy', () => manager.destroy());
  }
});

export const WorkspaceGroup = GObject.registerClass(
class WorkspaceGroup extends Clutter.Actor {
  readonly background: Clutter.Actor | null = null;
  private readonly board: BoardFrame | null;
  private readonly windowLayer: Clutter.Actor = this;
  private readonly clones: WindowClones;

  constructor(readonly workspace: Meta.Workspace | null, private readonly monitor: Monitor, private readonly movingWindow: Meta.Window | null) {
    super({ width: monitor.width, height: monitor.height, clip_to_allocation: true });

    this.board = workspace ? KestrelUi.boardView(workspace) : null;
    if (workspace) {
      this.background = this.board ? KestrelUi.boardBackdrop(workspace, monitor)! : new WorkspaceBackground(monitor);
      this.add_child(this.background);
    }
    if (this.board) {
      const { x, y, scale, viewportX, viewportY } = this.board;
      this.windowLayer = new Clutter.Actor({
        scale_x: scale,
        scale_y: scale,
        translation_x: viewportX - monitor.x - x * scale,
        translation_y: viewportY - monitor.y - y * scale,
      });
      this.add_child(this.windowLayer);
    }
    const [originX, originY] = this.board ? [0, 0] : [monitor.x, monitor.y];
    this.clones = new WindowClones(this, this.windowLayer, originX, originY, window => this.shows(window));

    global.display.connectObject('restacked', () => this.clones.stackAbove(this.board ? null : this.background), this);
  }

  private shows(window: Meta.Window): boolean {
    if (isDesktopWindow(window) || window.is_override_redirect()) return false;
    if (!this.board && !isOnMonitor(window, this.monitor)) return false;

    const sticky = window.is_on_all_workspaces() || window === this.movingWindow;
    if (!this.workspace) return sticky;
    return !sticky && window.located_on_workspace(this.workspace);
  }
});
export type WorkspaceGroup = InstanceType<typeof WorkspaceGroup>;
