import Meta from 'gi://Meta';
import type Mtk from 'gi://Mtk';
import type Shell from 'gi://Shell';

const TOUCHING_TYPES = [Meta.WindowType.NORMAL, Meta.WindowType.DIALOG, Meta.WindowType.MODAL_DIALOG, Meta.WindowType.UTILITY];
const WINDOW_SIGNALS = ['position-changed', 'size-changed', 'notify::minimized', 'workspace-changed'] as const;

const shell = () => global as unknown as Shell.Global;

export class WindowOverlap {
  private readonly windows = new Map<Meta.Window, number[]>();
  private readonly signals: [{ disconnect(id: number): void }, number][];
  private later = 0;

  constructor(private readonly changed: () => void) {
    const { display, workspace_manager: workspaces } = shell();
    this.signals = [
      [display, display.connect('window-created', (_display, window: Meta.Window) => this.track(window))],
      [workspaces, workspaces.connect('active-workspace-changed', () => this.schedule())],
    ];
    for (const window of display.list_all_windows()) this.track(window);
  }

  touches(area: Mtk.Rectangle): boolean {
    const workspace = shell().workspace_manager.get_active_workspace();
    return [...this.windows.keys()].some(window => !window.minimized && window.showing_on_its_workspace() &&
      window.located_on_workspace(workspace) && TOUCHING_TYPES.includes(window.window_type) && window.get_frame_rect().overlap(area));
  }

  destroy(): void {
    if (this.later) shell().compositor.get_laters().remove(this.later);
    for (const [object, id] of this.signals) object.disconnect(id);
    for (const [window, ids] of this.windows) ids.forEach(id => window.disconnect(id));
    this.windows.clear();
  }

  private track(window: Meta.Window): void {
    if (this.windows.has(window)) return;
    const ids = WINDOW_SIGNALS.map(signal => window.connect(signal, () => this.schedule()));
    ids.push(window.connect('unmanaged', () => {
      ids.forEach(id => window.disconnect(id));
      this.windows.delete(window);
      this.schedule();
    }));
    this.windows.set(window, ids);
    this.schedule();
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
