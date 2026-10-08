import Meta from 'gi://Meta';
import type Shell from 'gi://Shell';

import type { Board, Canvas } from '../board.js';
import { intersection, screenBox } from '../view/geometry.js';
import { frameBox, isBoardWindow } from './windows.js';

const HIDDEN_FRACTION = 0.3;

function shell(): Shell.Global {
  return global as unknown as Shell.Global;
}

function later(run: () => void): void {
  shell().compositor.get_laters().add(Meta.LaterType.BEFORE_REDRAW, () => {
    run();
    return false;
  });
}

export class Follower {
  private readonly pending = new Set<Meta.Window>();
  private readonly unplaced = new Set<Meta.Window>();
  private readonly workspaceSignals = new Map<Meta.Workspace, number[]>();
  private readonly signals: [{ disconnect(id: number): void }, number][];

  constructor(private readonly board: Board) {
    const { window_manager: wm, display, workspace_manager: manager } = shell();
    this.signals = [
      [wm, wm.connect('map', (_wm, actor: Meta.WindowActor) => this.mapped(actor.meta_window))],
      [wm, wm.connect('size-change', (_wm, actor: Meta.WindowActor, change: Meta.SizeChange) => this.sizeChanged(actor.meta_window, change))],
      [display, display.connect('notify::focus-window', () => this.focused(display.focus_window))],
      [manager, manager.connect('workspace-removed', () => this.prune())],
    ];
  }

  watch(workspace: Meta.Workspace, canvas: Canvas): void {
    this.workspaceSignals.set(workspace, [
      workspace.connect('window-added', (_workspace, window: Meta.Window) => this.added(window, canvas)),
      workspace.connect('window-removed', (_workspace, window: Meta.Window) => this.removed(window, canvas)),
    ]);
  }

  unwatch(workspace: Meta.Workspace): void {
    for (const id of this.workspaceSignals.get(workspace) ?? []) workspace.disconnect(id);
    this.workspaceSignals.delete(workspace);
  }

  destroy(): void {
    for (const [object, id] of this.signals) object.disconnect(id);
    for (const workspace of [...this.workspaceSignals.keys()]) this.unwatch(workspace);
    this.pending.clear();
    this.unplaced.clear();
  }

  private added(window: Meta.Window, canvas: Canvas): void {
    if (!canvas.shown || !isBoardWindow(window)) return;
    this.unplaced.add(window);
    if ((window as Meta.Window & { mapped: boolean }).mapped) later(() => this.place(window, canvas));
    else this.pending.add(window);
  }

  private mapped(window: Meta.Window | null): void {
    if (!window || !this.pending.delete(window)) return;
    const canvas = this.board.canvasOf(window.get_workspace());
    if (canvas?.shown) this.place(window, canvas);
  }

  private place(window: Meta.Window, canvas: Canvas): void {
    if (!this.unplaced.delete(window)) return;
    if (!canvas.shown || !window.get_workspace() || this.board.canvasOf(window.get_workspace()) !== canvas) return;
    this.board.place(window, canvas);
    if (shell().display.focus_window === window) this.focused(window);
  }

  private removed(window: Meta.Window, canvas: Canvas): void {
    this.pending.delete(window);
    this.unplaced.delete(window);
    later(() => this.board.release(window, canvas));
  }

  private sizeChanged(window: Meta.Window | null, change: Meta.SizeChange): void {
    const workspace = this.board.presentedWorkspace();
    if (!window || !workspace || !isBoardWindow(window) || !window.located_on_workspace(workspace)) return;
    if (change === Meta.SizeChange.MAXIMIZE) {
      later(() => {
        if (!window.located_on_workspace(workspace)) return;
        window.unmaximize();
        this.board.enterWindow(window);
      });
    } else if (change === Meta.SizeChange.FULLSCREEN) {
      later(() => this.board.exit());
    }
  }

  private focused(window: Meta.Window | null): void {
    const workspace = this.board.presentedWorkspace();
    if (!window || !workspace || this.unplaced.has(window) || !isBoardWindow(window) || !window.located_on_workspace(workspace)) return;
    const entered = this.board.enteredWindow();
    if (entered) {
      if (entered !== window) this.board.enterWindow(window);
      return;
    }
    const onScreen = screenBox(this.board.camera.view, this.board.viewport, frameBox(window));
    if (intersection(onScreen, this.board.viewport) < onScreen.width * onScreen.height * HIDDEN_FRACTION) this.board.reveal(window);
  }

  private prune(): void {
    const manager = shell().workspace_manager;
    const current = new Set(Array.from({ length: manager.n_workspaces }, (_, index) => manager.get_workspace_by_index(index)));
    for (const workspace of [...this.workspaceSignals.keys()]) {
      if (!current.has(workspace)) this.board.forget(workspace);
    }
  }
}
