import Meta from 'gi://Meta';
import type Shell from 'gi://Shell';

const shell = () => global as unknown as Shell.Global;

export function activeWorkspace(): Meta.Workspace {
  return shell().workspace_manager.get_active_workspace();
}

export class WorkspaceWindows {
  private workspace: Meta.Workspace | null = null;
  private workspaceSignals: number[] = [];
  private readonly switched: number;
  private later = 0;

  constructor(private readonly changed: () => void) {
    this.switched = shell().workspace_manager.connect('active-workspace-changed', () => {
      this.follow();
      this.schedule();
    });
    this.follow();
  }

  destroy(): void {
    if (this.later) shell().compositor.get_laters().remove(this.later);
    shell().workspace_manager.disconnect(this.switched);
    this.release();
  }

  private follow(): void {
    this.release();
    const workspace = activeWorkspace();
    this.workspace = workspace;
    this.workspaceSignals = (['window-added', 'window-removed'] as const).map(signal => workspace.connect(signal, () => this.schedule()));
  }

  private release(): void {
    for (const id of this.workspaceSignals) this.workspace?.disconnect(id);
    this.workspaceSignals = [];
    this.workspace = null;
  }

  private schedule(): void {
    if (this.later) return;
    this.later = shell().compositor.get_laters().add(Meta.LaterType.BEFORE_REDRAW, () => {
      this.later = 0;
      this.changed();
      return false;
    });
  }
}
