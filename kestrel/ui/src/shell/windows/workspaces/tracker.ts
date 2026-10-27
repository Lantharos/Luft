import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import * as Main from '../../main.js';

const MIN_NUM_WORKSPACES = 1;
export const MAX_NUM_WORKSPACES = 10;
const LAST_WINDOW_GRACE_TIME = 1000;
const GRACE_WINDOW_TYPES = [Meta.WindowType.SPLASHSCREEN, Meta.WindowType.DIALOG, Meta.WindowType.MODAL_DIALOG];

export class WorkspaceTracker {
  private workspaces: Meta.Workspace[] = [];
  private readonly lastRemoved = new WeakMap<Meta.Workspace, Meta.Window>();
  private checkWorkspacesId = 0;
  private paused = false;

  constructor() {
    Shell.WindowTracker.get_default().connect('startup-sequence-changed', () => this.queueCheckWorkspaces());

    const workspaceManager = global.workspace_manager;
    workspaceManager.connect('notify::n-workspaces', () => this.nWorkspacesChanged());
    workspaceManager.connect('workspaces-reordered', () => {
      this.workspaces.sort((a, b) => a.index() - b.index());
    });
    global.window_manager.connect('switch-workspace', () => this.queueCheckWorkspaces());

    global.display.connect('window-entered-monitor', (_display, monitorIndex) => this.windowCrossedMonitor(monitorIndex));
    global.display.connect('window-left-monitor', (_display, monitorIndex) => this.windowCrossedMonitor(monitorIndex));

    this.nWorkspacesChanged();
  }

  blockUpdates(): void {
    this.paused = true;
  }

  unblockUpdates(): void {
    this.paused = false;
  }

  private inGracePeriod(workspace: Meta.Workspace): boolean {
    const lastRemoved = this.lastRemoved.get(workspace);
    return !!lastRemoved && GRACE_WINDOW_TYPES.includes(lastRemoved.get_window_type());
  }

  private checkWorkspaces(): boolean {
    if (this.paused) return GLib.SOURCE_CONTINUE;

    const workspaceManager = global.workspace_manager;
    const emptyWorkspaces = this.workspaces.map(workspace => !this.inGracePeriod(workspace));

    for (const sequence of Shell.WindowTracker.get_default().get_startup_sequences()) {
      const index = sequence.get_workspace();
      if (index >= 0 && index <= workspaceManager.n_workspaces) emptyWorkspaces[index] = false;
    }

    for (const actor of global.get_window_actors()) {
      const window = actor.get_meta_window()!;
      if (window.is_on_all_workspaces()) continue;
      emptyWorkspaces[window.get_workspace().index()] = false;
    }

    if (!emptyWorkspaces[emptyWorkspaces.length - 1] && workspaceManager.n_workspaces < MAX_NUM_WORKSPACES) {
      workspaceManager.append_new_workspace(false, global.get_current_time());
      emptyWorkspaces.push(true);
    }

    while (emptyWorkspaces.length < MIN_NUM_WORKSPACES) {
      workspaceManager.append_new_workspace(false, global.get_current_time());
      emptyWorkspaces.push(true);
    }

    const lastIndex = emptyWorkspaces.length - 1;
    const activeWorkspaceIndex = workspaceManager.get_active_workspace_index();
    const lastEmptyIndex = emptyWorkspaces[activeWorkspaceIndex]
      ? activeWorkspaceIndex
      : emptyWorkspaces.lastIndexOf(false) + 1;
    emptyWorkspaces[activeWorkspaceIndex] = false;

    for (let i = lastIndex; i >= 0; i--) {
      if (workspaceManager.n_workspaces === MIN_NUM_WORKSPACES) break;
      if (emptyWorkspaces[i] && i !== lastEmptyIndex)
        workspaceManager.remove_workspace(this.workspaces[i], global.get_current_time());
    }

    this.checkWorkspacesId = 0;
    return GLib.SOURCE_REMOVE;
  }

  private windowRemoved(workspace: Meta.Workspace, window: Meta.Window): void {
    this.lastRemoved.set(workspace, window);
    this.queueCheckWorkspaces();
    const id = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, LAST_WINDOW_GRACE_TIME, () => {
      if (this.lastRemoved.get(workspace) !== window) return;
      this.lastRemoved.delete(workspace);
      this.queueCheckWorkspaces();
    });
    GLib.Source.set_name_by_id(id, '[kestrel] this._queueCheckWorkspaces');
  }

  private windowCrossedMonitor(monitorIndex: number): void {
    if (monitorIndex === Main.layoutManager.primaryIndex) this.queueCheckWorkspaces();
  }

  private queueCheckWorkspaces(): void {
    if (this.checkWorkspacesId !== 0) return;
    this.checkWorkspacesId = global.compositor.get_laters().add(Meta.LaterType.BEFORE_REDRAW, () => this.checkWorkspaces());
  }

  private nWorkspacesChanged(): void {
    const workspaceManager = global.workspace_manager;
    const oldNumWorkspaces = this.workspaces.length;
    const newNumWorkspaces = workspaceManager.n_workspaces;

    if (oldNumWorkspaces === newNumWorkspaces) return;

    if (newNumWorkspaces > oldNumWorkspaces) {
      for (let w = oldNumWorkspaces; w < newNumWorkspaces; w++) {
        const workspace = workspaceManager.get_workspace_by_index(w)!;
        this.workspaces[w] = workspace;
        workspace.connectObject(
          'window-added', () => this.queueCheckWorkspaces(),
          'window-removed', (_workspace: Meta.Workspace, window: Meta.Window) => this.windowRemoved(workspace, window), this);
      }
    } else {
      const removedIndex = this.workspaces.findIndex((workspace, w) => workspaceManager.get_workspace_by_index(w) !== workspace);
      const lostWorkspaces = this.workspaces.splice(removedIndex, oldNumWorkspaces - newNumWorkspaces);
      for (const workspace of lostWorkspaces) workspace.disconnectObject(this);
    }

    this.queueCheckWorkspaces();
  }
}
