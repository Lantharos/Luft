import type Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import Shell from 'gi://Shell';
import { WorkspaceSwitcherPopup } from 'resource:///com/lantharos/kestrel/ui/workspaceSwitcherPopup.js';

import { ScrollSteps } from '../shared/scrollSteps.js';

export class Workspaces {
  private popup: WorkspaceSwitcherPopup | null = null;
  private readonly steps = new ScrollSteps();

  constructor(private readonly enabled: () => boolean, private readonly beforeSwitch: () => void) {
    new Gio.Settings({ schema_id: 'org.gnome.mutter' }).set_boolean('dynamic-workspaces', true);
  }

  switchTo(index: number): void {
    if (!this.enabled()) return;
    const shell = global as unknown as Shell.Global;
    const manager = shell.workspace_manager;
    if (index < 0 || index >= manager.n_workspaces || index === manager.get_active_workspace_index()) return;
    this.beforeSwitch();
    manager.get_workspace_by_index(index)!.activate(shell.get_current_time());
    if (!this.popup) {
      this.popup = new WorkspaceSwitcherPopup();
      this.popup.connect('destroy', () => { this.popup = null; });
    }
    this.popup.display(index);
  }

  scroll(event: Clutter.Event): boolean {
    if (!this.enabled()) return false;
    const step = this.steps.step(event);
    if (step) this.switchTo((global as unknown as Shell.Global).workspace_manager.get_active_workspace_index() + step);
    return true;
  }
}
