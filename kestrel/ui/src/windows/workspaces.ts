import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import { WorkspaceSwitcherPopup } from 'resource:///org/gnome/shell/ui/workspaceSwitcherPopup.js';

export class Workspaces {
  private popup: WorkspaceSwitcherPopup | null = null;
  private lastSwitch = 0;
  private lastScroll = 0;
  private accumulated = 0;

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
    const direction = event.get_scroll_direction();
    const now = GLib.get_monotonic_time() / 1000;
    let step: number;
    if (direction === Clutter.ScrollDirection.SMOOTH) {
      if (now - this.lastScroll > 180) this.accumulated = 0;
      this.lastScroll = now;
      const [dx, dy] = event.get_scroll_delta();
      this.accumulated += Math.abs(dy) >= Math.abs(dx) ? dy : dx;
      if (Math.abs(this.accumulated) < 1 || now - this.lastSwitch < 200) return true;
      step = Math.sign(this.accumulated);
      this.accumulated = 0;
    } else {
      if (now - this.lastSwitch < 160) return true;
      step = [Clutter.ScrollDirection.UP, Clutter.ScrollDirection.LEFT].includes(direction) ? -1 : 1;
    }
    this.lastSwitch = now;
    this.switchTo((global as unknown as Shell.Global).workspace_manager.get_active_workspace_index() + step);
    return true;
  }
}
