import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import type { Box } from '../../../shared/placement.js';
import { FULL_SIZE, intersection, pushApart, screenBox, snapEdges, type View } from '../view/geometry.js';

const SNAP_DISTANCE = 12;
const MOVE_OPS = [Meta.GrabOp.MOVING, Meta.GrabOp.MOVING_UNCONSTRAINED, Meta.GrabOp.KEYBOARD_MOVING];

type FreeWindow = Meta.Window & { unconstrained: boolean; magnification: number };

function shell(): Shell.Global {
  return global as unknown as Shell.Global;
}

export function setUnconstrained(window: Meta.Window, unconstrained: boolean): void {
  (window as FreeWindow).unconstrained = unconstrained;
}

export function setMagnification(window: Meta.Window, magnification: number): void {
  const free = window as FreeWindow;
  if (free.magnification !== magnification) free.magnification = magnification;
}

export function magnify(windows: readonly Meta.Window[], view: View, viewport: Box): void {
  for (const window of windows) {
    const shown = view.scale > FULL_SIZE && intersection(screenBox(view, viewport, frameBox(window)), viewport) > 0;
    setMagnification(window, shown ? view.scale : FULL_SIZE);
  }
}

export function frameBox(window: Meta.Window): Box {
  const { x, y, width, height } = window.get_frame_rect();
  return { x, y, width, height };
}

export function isBoardWindow(window: Meta.Window): boolean {
  return window.window_type === Meta.WindowType.NORMAL && !window.get_transient_for() &&
    !window.is_on_all_workspaces() && !window.skip_taskbar;
}

export function boardWindows(workspace: Meta.Workspace): Meta.Window[] {
  return shell().display.sort_windows_by_stacking(workspace.list_windows().filter(isBoardWindow)).reverse();
}

export function byOpening(a: Meta.Window, b: Meta.Window): number {
  return a.get_stable_sequence() - b.get_stable_sequence();
}

export function appWindowAfter(app: Shell.App, workspace: Meta.Workspace, entered: Meta.Window | null): Meta.Window | null {
  const tracker = Shell.WindowTracker.get_default();
  const windows = shell().display.get_tab_list(Meta.TabList.NORMAL, workspace)
    .filter(window => isBoardWindow(window) && tracker.get_window_app(window) === app);
  if (!entered || !windows.includes(entered)) return windows[0] ?? null;
  windows.sort(byOpening);
  return windows[(windows.indexOf(entered) + 1) % windows.length]!;
}

export class Collisions {
  private moving: Meta.Window | null = null;
  private others: Meta.Window[] = [];
  private start: Box[] = [];
  private boxes: Box[] = [];
  private readonly movingBox: Box = { x: 0, y: 0, width: 0, height: 0 };
  private intendedX = 0;
  private intendedY = 0;
  private snapping = false;
  private later = 0;
  private signals: number[] = [];
  private readonly displaySignals: number[];

  constructor(private readonly workspace: () => Meta.Workspace | null, private readonly scale: () => number) {
    const display = shell().display;
    this.displaySignals = [
      display.connect('grab-op-begin', (_display, window: Meta.Window, op: Meta.GrabOp) => this.grabBegan(window, op)),
      display.connect('grab-op-end', (_display, window: Meta.Window) => {
        if (window === this.moving) this.end();
      }),
    ];
  }

  get window(): Meta.Window | null {
    return this.moving;
  }

  begin(window: Meta.Window, snapping: boolean): void {
    this.end();
    const workspace = this.workspace();
    if (!workspace || !isBoardWindow(window) || !window.located_on_workspace(workspace)) return;
    this.moving = window;
    this.snapping = snapping;
    this.others = boardWindows(workspace).filter(other => other !== window && !other.minimized);
    this.start = this.others.map(frameBox);
    this.boxes = this.start.map(box => ({ ...box }));
    this.boxes.push(this.movingBox);
    ({ x: this.intendedX, y: this.intendedY } = window.get_frame_rect());
    this.signals = (['position-changed', 'size-changed'] as const).map(signal => window.connect(signal, () => this.queue()));
  }

  moveBy(canvasDx: number, canvasDy: number): void {
    if (!this.moving) return;
    this.intendedX += canvasDx;
    this.intendedY += canvasDy;
    this.moving.move_frame(true, Math.round(this.intendedX), Math.round(this.intendedY));
  }

  end(): void {
    if (!this.moving) return;
    if (this.later) shell().compositor.get_laters().remove(this.later);
    this.later = 0;
    this.resolve();
    for (const id of this.signals) this.moving.disconnect(id);
    this.signals = [];
    this.moving = null;
    this.others = [];
  }

  destroy(): void {
    this.end();
    for (const id of this.displaySignals) shell().display.disconnect(id);
  }

  private grabBegan(window: Meta.Window, op: Meta.GrabOp): void {
    const workspace = this.workspace();
    if (workspace && window.located_on_workspace(workspace)) this.begin(window, MOVE_OPS.includes(op));
  }

  private queue(): void {
    if (this.later) return;
    this.later = shell().compositor.get_laters().add(Meta.LaterType.BEFORE_REDRAW, () => {
      this.later = 0;
      this.resolve();
      return false;
    });
  }

  private resolve(): void {
    const moving = this.moving;
    if (!moving) return;
    const rect = moving.get_frame_rect();
    const box = this.movingBox;
    box.x = rect.x;
    box.y = rect.y;
    box.width = rect.width;
    box.height = rect.height;
    if (this.snapping) {
      snapEdges(box, this.start, SNAP_DISTANCE / this.scale());
      if (box.x !== rect.x || box.y !== rect.y) moving.move_frame(true, Math.round(box.x), Math.round(box.y));
    }
    for (let index = 0; index < this.start.length; index++) {
      const target = this.boxes[index]!;
      const origin = this.start[index]!;
      target.x = origin.x;
      target.y = origin.y;
    }
    pushApart(this.boxes, this.boxes.length - 1);
    for (let index = 0; index < this.others.length; index++) {
      const window = this.others[index]!;
      const target = this.boxes[index]!;
      const current = window.get_frame_rect();
      if (current.x !== Math.round(target.x) || current.y !== Math.round(target.y))
        window.move_frame(false, Math.round(target.x), Math.round(target.y));
    }
  }
}
