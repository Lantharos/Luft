import type Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

class AdjustmentRegistry {
  private count = 0;
  private readonly adjustments = new Map<number, WeakRef<St.Adjustment>>();
  private readonly registry = new FinalizationRegistry<number>(key => {
    this.adjustments.delete(key);
  });

  register(adj: St.Adjustment): void {
    const key = this.count++;
    this.adjustments.set(key, new WeakRef(adj));
    this.registry.register(adj, key);
  }

  forEach(callback: (adj: St.Adjustment) => void): void {
    this.adjustments.forEach((ref, key) => {
      const adj = ref.deref();
      if (adj)
        callback(adj);
      else
        this.adjustments.delete(key);
    });
  }
}

let workspacesAdjustment: St.Adjustment;
let workspaceAdjustmentRegistry: AdjustmentRegistry;

export function loadWorkspacesAdjustment(): void {
  const { workspaceManager } = global;
  const activeWorkspaceIndex = workspaceManager.get_active_workspace_index();

  workspacesAdjustment = new St.Adjustment({
    value: activeWorkspaceIndex,
    lower: 0,
    page_increment: 1,
    page_size: 1,
    step_increment: 0,
    upper: workspaceManager.n_workspaces,
  });

  workspaceManager.bind_property('n-workspaces', workspacesAdjustment, 'upper', GObject.BindingFlags.SYNC_CREATE);

  workspacesAdjustment.connect('notify::upper', () => {
    const newActiveIndex = workspaceManager.get_active_workspace_index();

    workspaceAdjustmentRegistry.forEach(c => c.remove_transition('value'));
    workspacesAdjustment.remove_transition('value');
    workspacesAdjustment.value = newActiveIndex;
  });

  workspaceAdjustmentRegistry = new AdjustmentRegistry();
}

const BOUND_PROPERTIES: [string, GObject.BindingFlags][] = [
  ['lower', GObject.BindingFlags.SYNC_CREATE],
  ['page-increment', GObject.BindingFlags.SYNC_CREATE],
  ['page-size', GObject.BindingFlags.SYNC_CREATE],
  ['step-increment', GObject.BindingFlags.SYNC_CREATE],
  ['upper', GObject.BindingFlags.SYNC_CREATE],
  ['value', GObject.BindingFlags.SYNC_CREATE | GObject.BindingFlags.BIDIRECTIONAL],
];

export function createWorkspacesAdjustment(actor: Clutter.Actor): St.Adjustment {
  const adjustment = new St.Adjustment({ actor });

  for (const [propName, flags] of BOUND_PROPERTIES)
    workspacesAdjustment.bind_property(propName, adjustment, propName, flags);

  workspaceAdjustmentRegistry.register(adjustment);

  return adjustment;
}
