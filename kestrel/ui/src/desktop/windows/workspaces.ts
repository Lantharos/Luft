import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import { WorkspaceSwitcherPopup } from 'resource:///com/lantharos/kestrel/ui/workspaceSwitcherPopup.js';

import { ScrollSteps } from '../../shared/input/scrollSteps.js';

export class Workspaces {
  private popup: WorkspaceSwitcherPopup | null = null;
  private readonly steps = new ScrollSteps();
  private swiping = false;

  constructor(private readonly enabled: () => boolean, private readonly beforeSwitch: () => void, private readonly swipe: (event: Clutter.Event) => boolean) {
    new Gio.Settings({ schema_id: 'org.gnome.mutter' }).set_boolean('dynamic-workspaces', true);
  }

  switchTo(index: number): void {
    if (!this.enabled()) return;
    const manager = global.workspace_manager;
    if (index < 0 || index >= manager.n_workspaces || index === manager.get_active_workspace_index()) return;
    this.beforeSwitch();
    manager.get_workspace_by_index(index)!.activate(global.get_current_time());
    if (!this.popup) {
      this.popup = new WorkspaceSwitcherPopup();
      this.popup.connect('destroy', () => { this.popup = null; });
    }
    this.popup.display(index);
  }

  scroll(event: Clutter.Event): boolean {
    if (!this.enabled()) return false;
    if (event.get_scroll_source() === Clutter.ScrollSource.FINGER && event.get_scroll_direction() === Clutter.ScrollDirection.SMOOTH) {
      const [dx, dy] = event.get_scroll_delta();
      if (!this.swiping) this.beforeSwitch();
      this.swiping = dx !== 0 || dy !== 0;
      return this.swipe(event);
    }
    const step = this.steps.step(event);
    if (step) this.switchTo(global.workspace_manager.get_active_workspace_index() + step);
    return true;
  }
}
