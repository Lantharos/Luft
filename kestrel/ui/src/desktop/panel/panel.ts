import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { PanelLayout } from './panelLayout.js';
import type { WindowPreviews } from './windowPreviews.js';
import { Taskbar } from './taskbar/taskbar.js';
import { takeDroppedFiles } from './taskbar/fileDrop.js';
import type { ContextMenus } from '../menus/contextMenus.js';
import { createLauncher, floorAlong, type Launcher } from './launcher/launcher.js';
import { DesktopPeek } from './widgets/desktopPeek.js';
import { systemMonitor } from './widgets/systemMonitor.js';
import { taskbarPreferences, type TaskbarKey, type TaskbarLayout } from './preferences/taskbarPreferences.js';
import { taskbarArrangement } from './preferences/arrangement.js';
import { TaskbarSurface } from './preferences/taskbarLook.js';
import { AutoHide, type Slider } from './autoHide/autoHide.js';
import { afterMotion, dropAfterMotion } from '../../shared/motion/afterMotion.js';
import { animateActor, Curve, Duration } from '../../shared/motion/motion.js';
import { activeWorkspace, WorkspaceWindows } from './taskbar/workspaceWindows.js';
import { TabletTaskbar } from './tablet/tabletTaskbar.js';
import { band, isVertical, rightToLeft, type Edge } from '../../shared/layout/edge.js';
import { EDGE_MARGIN, NO_DEPTHS, type Anchor, type Depths } from '../../shared/layout/anchor.js';
import { t } from '../../shared/i18n/index.js';
import { TaskbarElements } from './elements/panelElements.js';
import { TRAY_ICON_SIZE } from '../tray/icon.js';
import { IslandSet, type Island } from './islands/islandSet.js';
import { IslandShapes, type IslandShape, taskbarShapesChanged } from './islands/shapes.js';
import { PanelTablet } from './tablet/panelTablet.js';
import { alongOf, moveBar } from '../../../../../packages/web/ui/src/taskbar/arrangement/index';

const SHAPE_KEYS: TaskbarKey[] = ['taskbar-style', 'taskbar-size'];
const LOOK_KEYS: TaskbarKey[] = ['taskbar-look', 'taskbar-style', 'taskbar-size', 'pure-black', 'rounded-window-corners'];
const APP_KEYS: TaskbarKey[] = ['taskbar-show-pinned', 'taskbar-windows-per-display', 'taskbar-windows-per-workspace'];
const SURFACE_ELEMENTS: Record<string, string> = { start: 'start', quick: 'status', notifications: 'clock' };

export interface Monitor {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

type Rect = Omit<Monitor, 'index'>;

export interface PanelActions {
  start(): void;
  quickSettings(): void;
  notifications(): void;
  activateWindow(window: Meta.Window): void;
  stopScreencast(): void;
  arrange(): void;
}

export class KestrelPanel {
  readonly actor: St.Widget;
  readonly struts = new Map<Edge, St.Widget>();
  readonly autoHide: AutoHide;
  readonly tablet: TabletTaskbar;
  readonly elements: TaskbarElements;
  readonly islandSet: IslandSet;
  readonly shapes: IslandShapes;
  private gapMonitor: number | null = null;
  private readonly peek = new DesktopPeek();
  readonly layout = new PanelLayout();
  arranged = () => {};
  private readonly surface: TaskbarSurface;
  private readonly launcher: Launcher;
  private readonly morph: PanelTablet;
  private readonly appSystem = Shell.AppSystem.get_default();
  private readonly tracker = Shell.WindowTracker.get_default();
  private readonly favorites = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private readonly taskbar: Taskbar;
  private edge: Edge = 'bottom';
  private joined = true;
  private readonly externalSignals: [Gio.Settings | Shell.AppSystem | Shell.WindowTracker | Meta.Display, number][] = [];
  private readonly unwatchPreferences: () => void;
  private workspaceWindows: WorkspaceWindows | null = null;
  private readonly refreshAfterMotion = () => this.refreshApps();
  private readonly updateFocusAfterMotion = () => this.taskbar.updateFocus();

  constructor(actions: PanelActions, menus: ContextMenus, previews: WindowPreviews, public monitor: Monitor | null, readonly primary: boolean) {
    this.taskbar = new Taskbar(this.tracker, menus, previews, this.favorites, () => this.monitor?.index ?? -1,
      app => this.windowsOf(app), window => {
        actions.activateWindow(window);
        this.tablet.collapse();
      }, app => {
        this.open(app);
        this.tablet.collapse();
      });
    this.layout.screen = () => this.screen;
    this.layout.islands = () => this.islandSet.islands;
    this.layout.peek = this.peek.actor;
    this.actor = new St.Widget({
      name: primary ? 'kestrel-panel' : 'kestrel-secondary-panel',
      style_class: 'kestrel-panel',
      reactive: true,
      layout_manager: this.layout,
    });
    this.actor.add_child(this.peek.actor);
    this.actor.add_child(this.layout.glide);
    this.actor.connect('notify::allocation', taskbarShapesChanged);
    this.actor.connect('enter-event', () => {
      this.taskbar.holdSteady(true);
      return Clutter.EVENT_PROPAGATE;
    });
    this.actor.connect('leave-event', (_actor, event: Clutter.Event) => {
      if (!this.actor.contains(event.get_related())) this.taskbar.holdSteady(false);
      return Clutter.EVENT_PROPAGATE;
    });
    for (const edge of ['bottom', 'left', 'top', 'right'] as const) this.struts.set(edge, new St.Widget());
    this.autoHide = new AutoHide(this.actor, () => this.monitor, () => this.tablet.rest, () => this.sliders);
    this.launcher = createLauncher(actions.start, this.screen.metrics.button,
      () => this.surface?.behind(this.islandSet.islandOf('start')?.actor ?? this.actor) ?? this.actor, floorAlong(this.actor, () => this.screen));
    this.launcher.button.visible = this.screen.startButton;
    this.elements = new TaskbarElements(this.launcher.button, this.taskbar, menus, actions, primary, edge => ({
      vertical: isVertical(edge), thickness: this.screen.metrics.button, button: this.screen.metrics.button, icon: TRAY_ICON_SIZE,
    }));
    this.islandSet = new IslandSet(this.actor, this.elements, islands => {
      this.surface?.sync();
      for (const island of islands) this.autoHide.follow(island.actor);
    });
    this.surface = new TaskbarSurface(this.actor, this.peek.actor, () => this.islandSet.islands, () => this.screen);
    takeDroppedFiles(this.actor, picked => this.surface.behind(this.islandSet.containing(picked)?.actor ?? this.actor));
    this.shapes = new IslandShapes(this.actor, this.islandSet, () => this.screen, () => this.surface.radius);
    this.tablet = new TabletTaskbar(this.actor, () => this.islandSet.islands.map(island => island.actor), primary, () => this.autoHide.shown, () => this.screen);
    this.morph = new PanelTablet(this, this.surface, this.launcher, this.taskbar);
    this.arrange();

    this.externalSignals.push(
      [this.appSystem, this.appSystem.connect('app-state-changed', () => afterMotion(this.refreshAfterMotion))],
      [this.appSystem, this.appSystem.connect('installed-changed', () => this.refreshApps())],
      [this.favorites, this.favorites.connect('changed::favorite-apps', () => this.refreshApps(true))],
      [this.tracker, this.tracker.connect('notify::focus-app', () => {
        this.tablet.collapse();
        afterMotion(this.updateFocusAfterMotion);
      })],
      ...(['window-entered-monitor', 'window-left-monitor'] as const).map(signal => {
        const display = global.display;
        return [display, display.connect(signal, () => { if (taskbarPreferences.windowsPerDisplay) this.refreshApps(); })] as [Meta.Display, number];
      }),
    );
    this.unwatchPreferences = taskbarPreferences.watch(key => this.preferenceChanged(key));
    menus.bind(this.actor, () => {
      const monitor = systemMonitor();
      return [
        { label: t('taskbar-show-desktop'), run: () => this.peek.toggleDesktop() },
        ...monitor ? [{ label: t('taskbar-system-monitor'), run: () => monitor.activate() }] : [],
        ...this.screen.touch ? [] : [{ label: t('taskbar-arrange'), run: actions.arrange }],
        { label: t('taskbar-settings'), run: () => menus.settings('taskbar') },
      ];
    });
    this.syncWorkspaceWindows();
    this.refreshApps();
    this.morph.sync(true);
  }

  get screen(): TaskbarLayout {
    return taskbarPreferences.on(this.monitor?.index);
  }

  get shownEdge(): Edge {
    return this.edge;
  }

  get shownJoined(): boolean {
    return this.joined;
  }

  get edges(): Edge[] {
    return [...new Set(this.islandSet.islands.map(island => island.edge))];
  }

  edgeOf(actor: Clutter.Actor): Edge {
    return this.joined ? this.edge : this.islandSet.containing(actor)?.edge ?? this.edge;
  }

  get depths(): Depths {
    const depths = { ...NO_DEPTHS };
    for (const edge of this.edges) depths[edge] = this.screen.clearance;
    return depths;
  }

  private get sliders(): Slider[] {
    if (this.joined) return [{ actor: this.actor, edge: this.edge }];
    return this.islandSet.islands.map(({ actor, edge }) => ({ actor, edge }));
  }

  follow(monitor: Monitor): void {
    this.monitor = monitor;
    this.morph.sync(true);
    this.place();
  }

  shutdown(): void {
    dropAfterMotion(this.refreshAfterMotion, this.updateFocusAfterMotion);
    this.morph.stop();
    this.unwatchPreferences();
    this.workspaceWindows?.destroy();
    this.workspaceWindows = null;
    this.elements.shutdown();
    this.taskbar.shutdown();
    this.tablet.destroy();
    for (const [object, signal] of this.externalSignals) object.disconnect(signal);
    this.externalSignals.length = 0;
  }

  destroy(): void {
    this.shutdown();
    this.actor.destroy();
    for (const strut of this.struts.values()) strut.destroy();
    this.markGap(null);
  }

  handlesScroll(actor: Clutter.Actor | null): boolean {
    return this.elements.handlesScroll(actor);
  }

  updateStatus(iconNames: string[]): void {
    this.elements.updateStatus(iconNames);
    this.tablet.updateStatus(iconNames);
  }

  place(animate = false): void {
    if (!this.monitor) return;
    this.reserve();
    const frame = this.frame;
    if (animate) animateActor(this.actor, { ...frame, duration: Duration.standard, curve: Curve.settle });
    else {
      for (const property of ['x', 'y', 'width', 'height']) this.actor.remove_transition(property);
      this.actor.set_position(frame.x, frame.y);
      this.actor.set_size(frame.width, frame.height);
    }
    this.autoHide.place();
  }

  get frame(): Rect {
    const { x, y, width, height } = this.monitor!;
    if (!this.joined) return { x, y, width, height };
    const { thickness, margin } = this.screen.metrics;
    return band({ x: x + margin, y: y + margin, width: width - 2 * margin, height: height - 2 * margin }, this.edge, thickness);
  }

  reserve(): void {
    const edges = this.edges;
    for (const [edge, strut] of this.struts) {
      const { x, y, width, height } = band(this.monitor!, edge, edges.includes(edge) ? this.screen.reserved : 0);
      strut.set_position(x, y);
      strut.set_size(width, height);
    }
    this.markGap(this.monitor!.index);
  }

  get wantedStruts(): St.Widget[] {
    return this.edges.map(edge => this.struts.get(edge)!);
  }

  private markGap(index: number | null): void {
    if (this.gapMonitor !== null && this.gapMonitor !== index) global.compositor.set_monitor_gap(this.gapMonitor, false);
    this.gapMonitor = index;
    if (index !== null) global.compositor.set_monitor_gap(index, this.screen.gap > 0);
  }

  arrange(): void {
    this.edge = this.screen.edge;
    this.joined = this.screen.joined;
    const arrangement = this.screen.touch ? moveBar(taskbarArrangement.current, 'bottom')
      : this.joined ? moveBar(taskbarArrangement.current, this.edge) : taskbarArrangement.current;
    this.islandSet.sync(arrangement, this.peek.actor);
    this.surface.sync();
    this.autoHide.sync(true);
    this.arranged();
  }

  private rearrange(): void {
    const edge = this.screen.edge;
    const joined = this.screen.joined;
    if (!this.monitor || (joined === this.joined && (!joined || edge === this.edge))) {
      this.layout.ease();
      this.arrange();
      if (this.monitor) this.place();
      return;
    }
    this.fade(() => {
      this.arrange();
      this.place();
    });
  }

  fade(change: () => void): void {
    if (!this.monitor || !this.actor.visible) {
      change();
      return;
    }
    animateActor(this.actor, {
      opacity: 0, duration: Duration.quick, curve: Curve.decelerate,
      onStopped: () => {
        change();
        animateActor(this.actor, { opacity: 255, duration: Duration.standard, curve: Curve.decelerate });
      },
    });
  }

  islandShapes(): IslandShape[] {
    return this.shapes.shapes();
  }

  islandAnchors(): { actor: St.Widget; radius: number }[] {
    return this.shapes.anchors();
  }

  islandOf(surface: string): Island | null {
    const element = SURFACE_ELEMENTS[surface];
    return element ? this.islandSet.islandOf(element) : null;
  }

  anchorFor(surface: string): Anchor | null {
    const island = this.islandOf(surface);
    const button = this.buttonFor(surface);
    if (!island || !button?.mapped || !this.monitor) return null;
    const edge = this.edgeOf(button);
    const along = alongOf(island.spot);
    const reference = this.joined && along !== 'center' ? this.actor : island.actor;
    const [x] = reference.get_transformed_position();
    const [width] = reference.get_transformed_size();
    if (isVertical(edge)) {
      const [, buttonY] = button.get_transformed_position();
      return { edge, target: buttonY + button.get_transformed_size()[1] / 2, align: 0 };
    }
    if (along === 'center') return { edge, target: x + width / 2, align: 0 };
    const side = (along === 'end') !== rightToLeft() ? 1 : -1;
    const { x: screenX, width: screenWidth } = this.monitor;
    const end = side > 0
      ? x + width < screenX + screenWidth ? x + width : screenX + screenWidth - EDGE_MARGIN
      : x > screenX ? x : screenX + EDGE_MARGIN;
    return { edge, target: Math.round(end), align: side };
  }

  buttonFor(surface: string): Clutter.Actor | null {
    switch (surface) {
      case 'start': return this.launcher.button.visible ? this.launcher.button : null;
      case 'quick': return this.elements.quickButton;
      case 'notifications': return this.elements.clockButton;
      default: return null;
    }
  }

  hold(held: boolean): void {
    this.autoHide.hold(held);
    this.tablet.hold(held);
  }

  setActive(surface: string | null): void {
    const button = surface ? this.buttonFor(surface) : null;
    this.autoHide.setActive(button ? this.edgeOf(button) : null);
    this.tablet.setActive(surface !== null);
    for (const [name, button] of [['start', this.launcher.button], ['quick', this.elements.quickButton], ['notifications', this.elements.clockButton]] as const) {
      if (surface === name) button?.add_style_pseudo_class('active');
      else button?.remove_style_pseudo_class('active');
    }
  }

  private get scoped(): boolean {
    return taskbarPreferences.windowsPerDisplay || taskbarPreferences.windowsPerWorkspace;
  }

  private windowsOf(app: Shell.App): Meta.Window[] {
    let windows = app.get_windows();
    if (taskbarPreferences.windowsPerWorkspace) {
      const workspace = activeWorkspace();
      windows = windows.filter(window => window.located_on_workspace(workspace));
    }
    if (taskbarPreferences.windowsPerDisplay && this.monitor) windows = windows.filter(window => window.get_monitor() === this.monitor!.index);
    return windows;
  }

  private open(app: Shell.App): void {
    const elsewhere = taskbarPreferences.windowsPerWorkspace && app.get_n_windows() > 0 &&
      !app.get_windows().some(window => window.located_on_workspace(activeWorkspace()));
    if (elsewhere && app.can_open_new_window()) app.open_new_window(-1);
    else app.activate();
  }

  private syncWorkspaceWindows(): void {
    if (taskbarPreferences.windowsPerWorkspace) this.workspaceWindows ??= new WorkspaceWindows(() => afterMotion(this.refreshAfterMotion));
    else {
      this.workspaceWindows?.destroy();
      this.workspaceWindows = null;
    }
  }

  private preferenceChanged(key: TaskbarKey): void {
    if (LOOK_KEYS.includes(key)) this.surface.sync();
    if (key === 'taskbar-style' && this.screen.joined !== this.joined) this.rearrange();
    else if (SHAPE_KEYS.includes(key)) {
      const metrics = this.screen.metrics;
      this.launcher.resize(metrics.button);
      this.taskbar.resize(metrics);
      this.elements.resize();
      this.place(true);
      this.layout.ease();
    }
    if (key === 'taskbar-arrangement') this.rearrange();
    if (key === 'taskbar-shown' && this.monitor) this.reserve();
    if (key === 'tablet') this.morph.sync();
    if (key === 'taskbar-windows-per-workspace') this.syncWorkspaceWindows();
    if (key === 'taskbar-start-button') {
      this.launcher.button.visible = this.screen.startButton;
      this.rearrange();
    }
    if (APP_KEYS.includes(key)) this.refreshApps();
  }

  private refreshApps(immediate = false): void {
    const pinned = taskbarPreferences.showPinned ? this.favorites.get_strv('favorite-apps') : [];
    const apps = pinned
      .map(id => this.appSystem.lookup_app(id))
      .filter((app): app is Shell.App => app !== null);
    for (const app of this.appSystem.get_running()) {
      if (!apps.some(shown => shown.id === app.id) && (!this.scoped || this.windowsOf(app).length)) apps.push(app);
    }
    this.taskbar.update(apps, immediate);
  }
}
