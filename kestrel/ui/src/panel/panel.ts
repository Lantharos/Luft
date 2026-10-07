import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { PanelLayout } from './panelLayout.js';
import type { WindowPreviews } from './windowPreviews.js';
import { Taskbar } from './taskbar/taskbar.js';
import type { ContextMenus } from '../menus/contextMenus.js';
import { createLauncher, type Launcher } from './launcher.js';
import { Tray } from '../tray/tray.js';
import { DesktopPeek } from './desktopPeek.js';
import { PanelClock } from './clock.js';
import { PrivacyIndicator } from '../privacy/indicator.js';
import { InputSourceIndicator } from '../inputSources/indicator.js';
import { systemMonitor } from './systemMonitor.js';
import { taskbarPreferences, type TaskbarKey } from './preferences/taskbarPreferences.js';
import { TaskbarSurface } from './preferences/taskbarLook.js';
import { AutoHide } from './autoHide/autoHide.js';
import { animateActor } from '../shared/motion.js';
import { activeWorkspace, WorkspaceWindows } from './taskbar/workspaceWindows.js';

const KEYS_APP = 'com.lantharos.keys.desktop';
const RESIZE_DURATION = 240;
const SHAPE_KEYS: TaskbarKey[] = ['taskbar-style', 'taskbar-size'];
const LOOK_KEYS: TaskbarKey[] = ['taskbar-look', 'taskbar-style', 'taskbar-size', 'pure-black'];
const APP_KEYS: TaskbarKey[] = ['taskbar-show-pinned', 'taskbar-windows-per-display', 'taskbar-windows-per-workspace'];

function showLayout(keys: Shell.App, layout: string): void {
  keys.get_app_info().launch_uris([`kestrel-keys:view/${encodeURIComponent(layout)}`], (global as unknown as Shell.Global).create_app_launch_context(0, -1));
}

export interface Monitor {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PanelActions {
  start(): void;
  quickSettings(): void;
  notifications(): void;
  activateWindow(window: Meta.Window): void;
  stopScreencast(): void;
}

export class KestrelPanel {
  readonly actor: St.Widget;
  readonly strut = new St.Widget();
  readonly autoHide: AutoHide;
  private readonly layout = new PanelLayout();
  private readonly surface: TaskbarSurface;
  private readonly launcher: Launcher;
  private readonly appSystem = Shell.AppSystem.get_default();
  private readonly tracker = Shell.WindowTracker.get_default();
  private readonly favorites = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private readonly taskbar: Taskbar;
  private readonly clock = new PanelClock();
  private readonly statusIcons = new St.BoxLayout({ style_class: 'kestrel-status-icons', y_align: Clutter.ActorAlign.CENTER });
  private readonly externalSignals: [Gio.Settings | Shell.AppSystem | Shell.WindowTracker | Meta.Display, number][] = [];
  private readonly unwatchPreferences: () => void;
  private workspaceWindows: WorkspaceWindows | null = null;
  private readonly quickButton: St.Button | null = null;
  private readonly clockButton: St.Button;
  private readonly tray: Tray | null = null;
  private readonly privacy: PrivacyIndicator | null = null;
  private readonly inputSource: InputSourceIndicator | null = null;

  constructor(actions: PanelActions, menus: ContextMenus, previews: WindowPreviews, public monitor: Monitor | null, readonly primary: boolean) {
    this.taskbar = new Taskbar(this.tracker, menus, previews, this.favorites, () => this.monitor?.index ?? -1,
      app => this.windowsOf(app), actions.activateWindow, app => this.open(app));
    this.actor = new St.Widget({
      name: primary ? 'kestrel-panel' : 'kestrel-secondary-panel',
      style_class: 'kestrel-panel',
      reactive: true,
      layout_manager: this.layout,
    });
    this.autoHide = new AutoHide(this.actor, () => this.monitor);

    const center = new St.BoxLayout({
      name: primary ? 'kestrel-panel-center' : null,
      style_class: 'kestrel-taskbar',
      x_align: Clutter.ActorAlign.CENTER,
      y_align: Clutter.ActorAlign.CENTER,
    });
    this.launcher = createLauncher(actions.start, taskbarPreferences.metrics.button);
    center.add_child(this.launcher.button);
    center.add_child(this.taskbar.actor);
    this.actor.add_child(center);

    const right = new St.BoxLayout({
      name: primary ? 'kestrel-panel-status' : null,
      style_class: 'kestrel-panel-status',
      x_align: Clutter.ActorAlign.END,
      y_align: Clutter.ActorAlign.CENTER,
    });
    if (primary) {
      this.privacy = new PrivacyIndicator(menus, actions.stopScreencast);
      right.add_child(this.privacy.actor);
      this.tray = new Tray(menus);
      this.inputSource = new InputSourceIndicator(menus, layout => {
        const keys = this.appSystem.lookup_app(KEYS_APP);
        return [
          ...keys && layout ? [{ label: 'Show keyboard layout', run: () => showLayout(keys, layout) }] : [],
          { label: 'Keyboard settings', run: () => menus.settings('keyboard') },
        ];
      });
      right.add_child(this.inputSource.actor);
      right.add_child(this.tray.actor);
      this.quickButton = new St.Button({
        style_class: 'kestrel-status-button', child: this.statusIcons,
        can_focus: true, accessible_name: 'Quick settings',
      });
      this.quickButton.connect('clicked', actions.quickSettings);
      right.add_child(this.quickButton);
      menus.bind(this.quickButton, () => [
        { label: 'Network settings', run: () => menus.settings('network') },
        { label: 'Sound settings', run: () => menus.settings('sound') },
      ]);
    }
    this.clockButton = new St.Button({
      style_class: 'kestrel-status-button', child: this.clock.actor,
      can_focus: true, accessible_name: 'Notifications and date',
    });
    this.clockButton.connect('clicked', actions.notifications);
    right.add_child(this.clockButton);
    this.actor.add_child(right);
    const peek = new DesktopPeek();
    this.actor.add_child(peek.actor);
    this.surface = new TaskbarSurface(this.actor, peek.actor);

    this.externalSignals.push(
      [this.appSystem, this.appSystem.connect('app-state-changed', () => this.refreshApps())],
      [this.appSystem, this.appSystem.connect('installed-changed', () => this.refreshApps())],
      [this.favorites, this.favorites.connect('changed::favorite-apps', () => this.refreshApps())],
      [this.tracker, this.tracker.connect('notify::focus-app', () => this.taskbar.updateFocus())],
      ...(['window-entered-monitor', 'window-left-monitor'] as const).map(signal => {
        const display = (global as unknown as Shell.Global).display;
        return [display, display.connect(signal, () => { if (taskbarPreferences.windowsPerDisplay) this.refreshApps(); })] as [Meta.Display, number];
      }),
    );
    this.unwatchPreferences = taskbarPreferences.watch(key => this.preferenceChanged(key));
    menus.bind(this.actor, () => {
      const monitor = systemMonitor();
      return [
        { label: 'Show desktop', run: () => peek.toggleDesktop() },
        ...monitor ? [{ label: 'System monitor', run: () => monitor.activate() }] : [],
        { label: 'Taskbar settings', run: () => menus.settings('appearance/taskbar') },
      ];
    });
    menus.bind(this.clockButton, () => [
      { label: 'Date and time settings', run: () => menus.settings('datetime') },
    ]);
    this.syncWorkspaceWindows();
    this.refreshApps();
  }

  shutdown(): void {
    this.unwatchPreferences();
    this.workspaceWindows?.destroy();
    this.workspaceWindows = null;
    this.tray?.shutdown();
    this.privacy?.shutdown();
    this.inputSource?.shutdown();
    this.taskbar.shutdown();
    this.clock.destroy();
    for (const [object, signal] of this.externalSignals) object.disconnect(signal);
    this.externalSignals.length = 0;
  }

  destroy(): void {
    this.shutdown();
    this.actor.destroy();
    this.strut.destroy();
    this.autoHide.edge.destroy();
  }

  handlesScroll(actor: Clutter.Actor | null): boolean {
    return !!this.tray?.contains(actor) || !!this.inputSource?.contains(actor);
  }

  updateStatus(iconNames: string[]): void {
    const icons = this.statusIcons.get_children() as St.Icon[];
    iconNames.forEach((iconName, index) => {
      const icon = icons[index] ?? new St.Icon({ icon_size: 16 });
      if (!icon.get_parent()) this.statusIcons.add_child(icon);
      icon.icon_name = iconName;
    });
    for (const icon of icons.slice(iconNames.length)) icon.destroy();
  }

  place(animate = false): void {
    if (!this.monitor) return;
    const { x, y, width, height } = this.monitor;
    const { height: barHeight, margin } = taskbarPreferences.metrics;
    const clearance = barHeight + margin;
    this.strut.set_position(x, y + height - clearance);
    this.strut.set_size(width, clearance);
    const bar = { x: x + margin, y: y + height - clearance, width: width - 2 * margin, height: barHeight };
    if (animate) animateActor(this.actor, { ...bar, duration: RESIZE_DURATION, mode: Clutter.AnimationMode.EASE_OUT_QUART });
    else {
      this.actor.set_position(bar.x, bar.y);
      this.actor.set_size(bar.width, bar.height);
    }
    this.autoHide.place();
  }

  setActive(surface: string | null): void {
    this.autoHide.setActive(surface !== null);
    for (const [button, active] of [
      [this.launcher.button, surface === 'start'],
      [this.quickButton, surface === 'quick'],
      [this.clockButton, surface === 'notifications'],
    ] as const) {
      if (active) button?.add_style_pseudo_class('active');
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
    if (taskbarPreferences.windowsPerWorkspace) this.workspaceWindows ??= new WorkspaceWindows(() => this.refreshApps());
    else {
      this.workspaceWindows?.destroy();
      this.workspaceWindows = null;
    }
  }

  private preferenceChanged(key: TaskbarKey): void {
    if (LOOK_KEYS.includes(key)) this.surface.sync();
    if (SHAPE_KEYS.includes(key)) {
      const metrics = taskbarPreferences.metrics;
      this.launcher.resize(metrics.button);
      this.taskbar.resize(metrics);
      this.place(true);
    }
    if (key === 'taskbar-alignment' || SHAPE_KEYS.includes(key)) this.layout.ease();
    if (key === 'taskbar-windows-per-workspace') this.syncWorkspaceWindows();
    if (APP_KEYS.includes(key)) this.refreshApps();
  }

  private refreshApps(): void {
    const pinned = taskbarPreferences.showPinned ? this.favorites.get_strv('favorite-apps') : [];
    const apps = pinned
      .map(id => this.appSystem.lookup_app(id))
      .filter((app): app is Shell.App => app !== null);
    for (const app of this.appSystem.get_running()) {
      if (!apps.some(shown => shown.id === app.id) && (!this.scoped || this.windowsOf(app).length)) apps.push(app);
    }
    this.taskbar.update(apps);
  }
}
