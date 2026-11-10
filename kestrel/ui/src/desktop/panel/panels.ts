import type Clutter from 'gi://Clutter';
import { navigateWithKeyboard } from '../../shared/input/keyboardNavigation.js';
import { KestrelPanel, type Monitor, type PanelActions } from './panel.js';
import type { ContextMenus } from '../menus/contextMenus.js';
import type { WindowPreviews } from './windowPreviews.js';
import { taskbarPreferences, type TaskbarKey } from './preferences/taskbarPreferences.js';
import { WindowOverlap } from './autoHide/windowOverlap.js';
import { EdgeSwipe } from './tablet/edgeSwipe.js';
import { StatusCorner } from './widgets/statusCorner.js';
import { EDGE_MARGIN, NO_DEPTHS, type Anchor, type Depths } from '../../shared/layout/anchor.js';
import { isVertical, rightToLeft } from '../../shared/layout/edge.js';


interface PanelLayoutManager {
  primaryMonitor: Monitor | null;
  monitors: Monitor[];
  addChrome(actor: Clutter.Actor, params?: Record<string, boolean>): void;
  removeChrome(actor: Clutter.Actor): void;
  connect(signal: 'startup-complete', callback: () => void): number;
  disconnect(id: number): void;
}

export class PanelSet {
  readonly primary: KestrelPanel;
  private readonly corner: StatusCorner;
  private secondary: KestrelPanel[] = [];
  private overlap: WindowOverlap | null = null;
  private edgeSwipe: EdgeSwipe | null = null;
  private suppressed = false;
  private arriving = true;
  private readonly unwatchPreferences: () => void;

  constructor(
    private readonly layoutManager: PanelLayoutManager,
    private readonly actions: (monitor: () => Monitor) => PanelActions,
    private readonly menus: ContextMenus,
    private readonly previews: WindowPreviews,
    private readonly changed: () => void,
  ) {
    this.primary = this.create(() => layoutManager.primaryMonitor!, layoutManager.primaryMonitor, true);
    this.corner = new StatusCorner(actions(() => layoutManager.primaryMonitor!));
    layoutManager.addChrome(this.corner.actor);
    navigateWithKeyboard(this.corner.actor);
    this.unwatchPreferences = taskbarPreferences.watch(key => this.preferenceChanged(key));
    this.syncAutoHide();
    this.syncEdgeSwipe();
    this.sync();
    const startup = layoutManager.connect('startup-complete', () => {
      layoutManager.disconnect(startup);
      this.arrive();
    });
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
    return this.containing(actor) !== null;
  }

  containing(actor: Clutter.Actor | null): KestrelPanel | null {
    return actor ? this.all.find(panel => panel.actor.contains(actor)) ?? null : null;
  }

  depthsOn(monitor: Monitor): Depths {
    const screen = taskbarPreferences.on(monitor.index);
    if (screen.shown) return this.panelOn(monitor)?.depths ?? NO_DEPTHS;
    return { ...NO_DEPTHS, [screen.edge]: this.corner.clearance };
  }

  anchorFor(surface: string, monitor: Monitor): Anchor {
    const screen = taskbarPreferences.on(monitor.index);
    const anchor = screen.shown ? this.panelOn(monitor)?.anchorFor(surface) : null;
    if (anchor) return anchor;
    const edge = screen.edge;
    const button = screen.shown ? null : this.corner.buttonFor(surface);
    if (isVertical(edge) && button?.mapped) {
      const [, y] = button.get_transformed_position();
      return { edge, target: y + button.get_transformed_size()[1] / 2, align: 0 };
    }
    if (surface === 'start') return { edge, target: monitor.x + monitor.width / 2, align: 0 };
    return rightToLeft() ? { edge, target: monitor.x + EDGE_MARGIN, align: -1 } : { edge, target: monitor.x + monitor.width - EDGE_MARGIN, align: 1 };
  }

  showCorner(shown: boolean): void {
    this.corner.setShown(shown);
  }

  updateStatus(iconNames: string[]): void {
    this.primary.updateStatus(iconNames);
    this.corner.showStatus(iconNames);
  }

  sync(): void {
    const primary = this.layoutManager.primaryMonitor;
    if (!primary) return;
    this.primary.follow(primary);
    this.placeCorner();
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
    this.corner.setActive(surface);
  }

  suppress(suppressed: boolean): void {
    this.suppressed = suppressed;
    for (const panel of this.all) panel.autoHide.suppress(suppressed);
  }

  hold(held: boolean): void {
    for (const panel of this.all) panel.hold(held);
  }

  shutdown(): void {
    this.unwatchPreferences();
    this.overlap?.destroy();
    this.overlap = null;
    this.edgeSwipe?.destroy();
    this.edgeSwipe = null;
    this.corner.destroy();
    for (const panel of this.all) panel.shutdown();
  }

  private arrive(): void {
    this.arriving = false;
    for (const panel of this.all) panel.autoHide.arrive();
  }

  private preferenceChanged(key: TaskbarKey): void {
    if (key === 'taskbar-displays') {
      this.sync();
      this.changed();
    }
    if (key === 'tablet') this.placeCorner();
    if (key === 'taskbar-auto-hide' || key === 'taskbar-shown' || key === 'tablet') this.syncAutoHide();
    if (key === 'tablet' || key === 'taskbar-shown') this.syncEdgeSwipe();
    if (key === 'tablet' || key === 'taskbar-shown') this.changed();
  }

  private placeCorner(): void {
    const primary = this.layoutManager.primaryMonitor;
    if (primary) this.corner.place(primary);
  }

  private syncAutoHide(): void {
    if (this.all.some(panel => panel.screen.autoHide === 'windows')) this.overlap ??= new WindowOverlap(() => this.all.forEach(panel => panel.autoHide.sync()));
    else {
      this.overlap?.destroy();
      this.overlap = null;
    }
    for (const panel of this.all) {
      this.syncStrut(panel);
      panel.autoHide.watch(this.overlap);
    }
  }

  private syncEdgeSwipe(): void {
    if (this.all.some(panel => panel.screen.touch)) this.edgeSwipe ??= new EdgeSwipe((x, y) => this.panelAt(x, y)?.tablet ?? null);
    else {
      this.edgeSwipe?.destroy();
      this.edgeSwipe = null;
    }
  }

  private panelAt(x: number, y: number): KestrelPanel | null {
    return this.all.find(({ monitor }) => !!monitor &&
      x >= monitor.x && x < monitor.x + monitor.width && y >= monitor.y && y < monitor.y + monitor.height) ?? null;
  }

  private syncStrut(panel: KestrelPanel): void {
    const wanted = panel.screen.shown && panel.screen.autoHide === 'never' ? panel.wantedStruts : [];
    for (const strut of panel.struts.values()) {
      const reserved = strut.get_parent() !== null;
      if (wanted.includes(strut) && !reserved) this.layoutManager.addChrome(strut, { affectsStruts: true });
      if (!wanted.includes(strut) && reserved) this.layoutManager.removeChrome(strut);
    }
  }

  private remove(panel: KestrelPanel): void {
    this.layoutManager.removeChrome(panel.actor);
    for (const sensor of panel.autoHide.sensors.values()) this.layoutManager.removeChrome(sensor);
    for (const strut of panel.struts.values()) if (strut.get_parent()) this.layoutManager.removeChrome(strut);
  }

  private create(monitor: () => Monitor, initial: Monitor | null, primary: boolean): KestrelPanel {
    const panel = new KestrelPanel(this.actions(monitor), this.menus, this.previews, initial, primary);
    panel.arranged = () => {
      this.syncStrut(panel);
      if (panel === this.primary) this.placeCorner();
      this.changed();
    };
    for (const sensor of panel.autoHide.sensors.values()) this.layoutManager.addChrome(sensor);
    this.layoutManager.addChrome(panel.actor);
    this.syncStrut(panel);
    panel.autoHide.watch(this.overlap);
    panel.autoHide.suppress(this.suppressed);
    if (this.arriving) panel.autoHide.holdBack();
    navigateWithKeyboard(panel.actor);
    return panel;
  }
}
