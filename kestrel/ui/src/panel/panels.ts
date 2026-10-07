import type Clutter from 'gi://Clutter';
import { navigateWithKeyboard } from '../shared/keyboardNavigation.js';
import { KestrelPanel, type Monitor, type PanelActions } from './panel.js';
import type { ContextMenus } from '../menus/contextMenus.js';
import type { WindowPreviews } from './windowPreviews.js';
import { taskbarPreferences, type TaskbarKey } from './preferences/taskbarPreferences.js';
import { WindowOverlap } from './autoHide/windowOverlap.js';

export interface PanelLayoutManager {
  primaryMonitor: Monitor | null;
  monitors: Monitor[];
  addChrome(actor: Clutter.Actor, params?: Record<string, boolean>): void;
  removeChrome(actor: Clutter.Actor): void;
}

export class PanelSet {
  readonly primary: KestrelPanel;
  private secondary: KestrelPanel[] = [];
  private overlap: WindowOverlap | null = null;
  private readonly unwatchPreferences: () => void;

  constructor(
    private readonly layoutManager: PanelLayoutManager,
    private readonly actions: (monitor: () => Monitor) => PanelActions,
    private readonly menus: ContextMenus,
    private readonly previews: WindowPreviews,
    private readonly changed: () => void,
  ) {
    this.primary = this.create(() => layoutManager.primaryMonitor!, layoutManager.primaryMonitor, true);
    this.unwatchPreferences = taskbarPreferences.watch(key => this.preferenceChanged(key));
    this.syncAutoHide();
    this.sync();
  }

  get all(): KestrelPanel[] {
    return [this.primary, ...this.secondary];
  }

  panelOn(monitor: Monitor): KestrelPanel | null {
    return this.all.find(panel => panel.monitor?.index === monitor.index) ?? null;
  }

  forMonitor(monitor: Monitor): KestrelPanel {
    return this.panelOn(monitor) ?? this.primary;
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
      this.remove(panel);
      panel.destroy();
    }
    const others = taskbarPreferences.displays === 'all' ? this.layoutManager.monitors.filter(monitor => monitor.index !== primary.index) : [];
    this.secondary = others.map(monitor => {
      const panel = this.create(() => monitor, monitor, false);
      panel.place();
      return panel;
    });
  }

  setActive(surface: string | null, monitor: Monitor | null): void {
    for (const panel of this.all) panel.setActive(monitor && panel.monitor?.index === monitor.index ? surface : null);
  }

  hold(held: boolean): void {
    for (const panel of this.all) panel.autoHide.hold(held);
  }

  shutdown(): void {
    this.unwatchPreferences();
    this.overlap?.destroy();
    this.overlap = null;
    for (const panel of this.all) panel.shutdown();
  }

  private preferenceChanged(key: TaskbarKey): void {
    if (key === 'taskbar-displays') {
      this.sync();
      this.changed();
    }
    if (key === 'taskbar-auto-hide') this.syncAutoHide();
  }

  private syncAutoHide(): void {
    const mode = taskbarPreferences.autoHide;
    if (mode === 'windows') this.overlap ??= new WindowOverlap(() => this.all.forEach(panel => panel.autoHide.sync()));
    else {
      this.overlap?.destroy();
      this.overlap = null;
    }
    for (const panel of this.all) {
      this.syncStrut(panel);
      panel.autoHide.watch(this.overlap);
    }
  }

  private syncStrut(panel: KestrelPanel): void {
    const reserved = panel.strut.get_parent() !== null;
    const wanted = taskbarPreferences.autoHide === 'never';
    if (wanted && !reserved) this.layoutManager.addChrome(panel.strut, { affectsStruts: true });
    if (!wanted && reserved) this.layoutManager.removeChrome(panel.strut);
  }

  private remove(panel: KestrelPanel): void {
    this.layoutManager.removeChrome(panel.actor);
    this.layoutManager.removeChrome(panel.autoHide.edge);
    if (panel.strut.get_parent()) this.layoutManager.removeChrome(panel.strut);
  }

  private create(monitor: () => Monitor, initial: Monitor | null, primary: boolean): KestrelPanel {
    const panel = new KestrelPanel(this.actions(monitor), this.menus, this.previews, initial, primary);
    this.layoutManager.addChrome(panel.autoHide.edge);
    this.layoutManager.addChrome(panel.actor);
    this.syncStrut(panel);
    panel.autoHide.watch(this.overlap);
    navigateWithKeyboard(panel.actor);
    return panel;
  }
}
