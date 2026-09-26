import type Clutter from 'gi://Clutter';
import { navigateWithKeyboard } from './keyboardNavigation.js';
import { KestrelPanel, type Monitor, type PanelActions } from './panel.js';
import type { ContextMenus } from './contextMenus.js';
import type { WindowPreviews } from './windowPreviews.js';

export interface PanelLayoutManager {
  primaryMonitor: Monitor | null;
  monitors: Monitor[];
  addChrome(actor: Clutter.Actor, params?: Record<string, boolean>): void;
  removeChrome(actor: Clutter.Actor): void;
}

export class PanelSet {
  readonly primary: KestrelPanel;
  private secondary: KestrelPanel[] = [];

  constructor(
    private readonly layoutManager: PanelLayoutManager,
    private readonly actions: (monitor: () => Monitor) => PanelActions,
    private readonly menus: ContextMenus,
    private readonly previews: WindowPreviews,
  ) {
    this.primary = this.create(() => layoutManager.primaryMonitor!, layoutManager.primaryMonitor, true);
    this.sync();
  }

  get all(): KestrelPanel[] {
    return [this.primary, ...this.secondary];
  }

  forMonitor(monitor: Monitor): KestrelPanel {
    return this.all.find(panel => panel.monitor?.index === monitor.index) ?? this.primary;
  }

  contains(actor: Clutter.Actor | null): boolean {
    return !!actor && this.all.some(panel => panel.actor.contains(actor));
  }

  sync(): void {
    const primary = this.layoutManager.primaryMonitor;
    if (!primary) return;
    this.primary.monitor = primary;
    this.primary.place();
    for (const panel of this.secondary) {
      this.layoutManager.removeChrome(panel.actor);
      panel.destroy();
    }
    this.secondary = this.layoutManager.monitors
      .filter(monitor => monitor.index !== primary.index)
      .map(monitor => {
        const panel = this.create(() => monitor, monitor, false);
        panel.place();
        return panel;
      });
  }

  setActive(surface: string | null, monitor: Monitor | null): void {
    for (const panel of this.all) panel.setActive(monitor && panel.monitor?.index === monitor.index ? surface : null);
  }

  shutdown(): void {
    for (const panel of this.all) panel.shutdown();
  }

  private create(monitor: () => Monitor, initial: Monitor | null, primary: boolean): KestrelPanel {
    const panel = new KestrelPanel(this.actions(monitor), this.menus, this.previews, initial, primary);
    this.layoutManager.addChrome(panel.actor, { affectsStruts: true, trackFullscreen: false });
    navigateWithKeyboard(panel.actor);
    return panel;
  }
}
