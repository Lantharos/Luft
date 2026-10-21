import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { PanelLayout } from './panelLayout.js';
import type { WindowPreviews } from './windowPreviews.js';
import { Taskbar } from './taskbar/taskbar.js';
import type { ContextMenus } from '../menus/contextMenus.js';
import { createLauncher, type Launcher } from './launcher/launcher.js';
import { Tray } from '../tray/tray.js';
import { DesktopPeek } from './widgets/desktopPeek.js';
import { PanelClock } from './widgets/clock.js';
import { BatteryIndicator } from '../../shared/battery/indicator.js';
import { PrivacyIndicator } from '../../system/privacy/indicator.js';
import { InputSourceIndicator } from '../../system/inputSources/indicator.js';
import { systemMonitor } from './widgets/systemMonitor.js';
import { taskbarPreferences, type TaskbarKey } from './preferences/taskbarPreferences.js';
import { TaskbarSurface } from './preferences/taskbarLook.js';
import { AutoHide } from './autoHide/autoHide.js';
import { afterMotion, dropAfterMotion } from '../../shared/afterMotion.js';
import { animateActor, Curve, Duration, reducedMotion, Spring } from '../../shared/motion.js';
import { activeWorkspace, WorkspaceWindows } from './taskbar/workspaceWindows.js';
import { TabletTaskbar } from './tablet/tabletTaskbar.js';
import { afterWindowsReach } from './tablet/windowsReach.js';
import { localized, t } from '../../shared/i18n/index.js';

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

type Rect = Omit<Monitor, 'index'>;

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
  readonly tablet: TabletTaskbar;
  private readonly peek = new DesktopPeek();
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
  private readonly refreshAfterMotion = () => this.refreshApps();
  private readonly updateFocusAfterMotion = () => this.taskbar.updateFocus();
  private stopWaiting = () => {};

  constructor(actions: PanelActions, menus: ContextMenus, previews: WindowPreviews, public monitor: Monitor | null, readonly primary: boolean) {
    this.taskbar = new Taskbar(this.tracker, menus, previews, this.favorites, () => this.monitor?.index ?? -1,
      app => this.windowsOf(app), window => {
        actions.activateWindow(window);
        this.tablet.collapse();
      }, app => {
        this.open(app);
        this.tablet.collapse();
      });
    this.actor = new St.Widget({
      name: primary ? 'kestrel-panel' : 'kestrel-secondary-panel',
      style_class: 'kestrel-panel',
      reactive: true,
      layout_manager: this.layout,
    });
    this.autoHide = new AutoHide(this.actor, () => this.monitor, () => this.tablet.rest);

    const center = new St.BoxLayout({
      name: primary ? 'kestrel-panel-center' : null,
      style_class: 'kestrel-taskbar',
      x_align: Clutter.ActorAlign.CENTER,
      y_align: Clutter.ActorAlign.CENTER,
    });
    this.launcher = createLauncher(actions.start, taskbarPreferences.metrics.button, this.actor);
    this.launcher.button.visible = taskbarPreferences.startButton;
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
          ...keys && layout ? [{ label: t('taskbar-show-keyboard-layout'), run: () => showLayout(keys, layout) }] : [],
          { label: t('taskbar-keyboard-settings'), run: () => menus.settings('keyboard') },
        ];
      });
      right.add_child(this.inputSource.actor);
      right.add_child(this.tray.actor);
      this.statusIcons.add_child(new BatteryIndicator(16).actor);
      const quickButton = new St.Button({ style_class: 'kestrel-status-button', child: this.statusIcons, can_focus: true });
      localized(quickButton, () => (quickButton.accessible_name = t('taskbar-quick-settings')));
      quickButton.connect('clicked', actions.quickSettings);
      right.add_child(quickButton);
      this.quickButton = quickButton;
      menus.bind(quickButton, () => [
        { label: t('taskbar-network-settings'), run: () => menus.settings('network') },
        { label: t('taskbar-sound-settings'), run: () => menus.settings('sound') },
      ]);
    }
    this.clockButton = new St.Button({ style_class: 'kestrel-status-button', child: this.clock.actor, can_focus: true });
    localized(this.clockButton, () => (this.clockButton.accessible_name = t('taskbar-notifications-and-date')));
    this.clockButton.connect('clicked', actions.notifications);
    right.add_child(this.clockButton);
    this.actor.add_child(right);
    this.actor.add_child(this.peek.actor);
    this.surface = new TaskbarSurface(this.actor, this.peek.actor);
    this.tablet = new TabletTaskbar(this.actor, [center, right], primary, () => this.autoHide.shown);

    this.externalSignals.push(
      [this.appSystem, this.appSystem.connect('app-state-changed', () => afterMotion(this.refreshAfterMotion))],
      [this.appSystem, this.appSystem.connect('installed-changed', () => this.refreshApps())],
      [this.favorites, this.favorites.connect('changed::favorite-apps', () => this.refreshApps())],
      [this.tracker, this.tracker.connect('notify::focus-app', () => {
        this.tablet.collapse();
        afterMotion(this.updateFocusAfterMotion);
      })],
      ...(['window-entered-monitor', 'window-left-monitor'] as const).map(signal => {
        const display = (global as unknown as Shell.Global).display;
        return [display, display.connect(signal, () => { if (taskbarPreferences.windowsPerDisplay) this.refreshApps(); })] as [Meta.Display, number];
      }),
    );
    this.unwatchPreferences = taskbarPreferences.watch(key => this.preferenceChanged(key));
    menus.bind(this.actor, () => {
      const monitor = systemMonitor();
      return [
        { label: t('taskbar-show-desktop'), run: () => this.peek.toggleDesktop() },
        ...monitor ? [{ label: t('taskbar-system-monitor'), run: () => monitor.activate() }] : [],
        { label: t('taskbar-settings'), run: () => menus.settings('appearance/taskbar') },
      ];
    });
    menus.bind(this.clockButton, () => [
      { label: t('taskbar-date-time-settings'), run: () => menus.settings('datetime') },
    ]);
    this.syncWorkspaceWindows();
    this.refreshApps();
    this.syncTablet(true);
  }

  shutdown(): void {
    dropAfterMotion(this.refreshAfterMotion, this.updateFocusAfterMotion);
    this.stopWaiting();
    this.unwatchPreferences();
    this.workspaceWindows?.destroy();
    this.workspaceWindows = null;
    this.tray?.shutdown();
    this.privacy?.shutdown();
    this.inputSource?.shutdown();
    this.taskbar.shutdown();
    this.tablet.destroy();
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
    const icons = this.statusIcons.get_children().filter(child => child instanceof St.Icon);
    iconNames.forEach((iconName, index) => {
      const icon = icons[index] ?? new St.Icon({ icon_size: 16 });
      if (!icon.get_parent()) this.statusIcons.insert_child_at_index(icon, index);
      icon.icon_name = iconName;
    });
    for (const icon of icons.slice(iconNames.length)) icon.destroy();
    this.tablet.updateStatus(iconNames);
  }

  place(animate = false): void {
    if (!this.monitor) return;
    this.reserve();
    const bar = this.bar;
    if (animate) animateActor(this.actor, { ...bar, duration: RESIZE_DURATION, mode: Clutter.AnimationMode.EASE_OUT_QUART });
    else {
      this.actor.set_position(bar.x, bar.y);
      this.actor.set_size(bar.width, bar.height);
    }
    this.autoHide.place();
  }

  private get bar(): Rect {
    const { x, y, width, height } = this.monitor!;
    const { height: barHeight, margin } = taskbarPreferences.metrics;
    return { x: x + margin, y: y + height - barHeight - margin, width: width - 2 * margin, height: barHeight };
  }

  private reserve(): void {
    const { x, y, width, height } = this.monitor!;
    const reserved = taskbarPreferences.reserved;
    this.strut.set_position(x, y + height - reserved);
    this.strut.set_size(width, reserved);
  }

  hold(held: boolean): void {
    this.autoHide.hold(held);
    this.tablet.hold(held);
  }

  setActive(surface: string | null): void {
    this.autoHide.setActive(surface !== null);
    this.tablet.setActive(surface !== null);
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
    if (taskbarPreferences.windowsPerWorkspace) this.workspaceWindows ??= new WorkspaceWindows(() => afterMotion(this.refreshAfterMotion));
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
    if (key === 'tablet') this.syncTablet();
    if (key === 'taskbar-windows-per-workspace') this.syncWorkspaceWindows();
    if (key === 'taskbar-start-button' || key === 'tablet') this.launcher.button.visible = taskbarPreferences.startButton;
    if (APP_KEYS.includes(key)) this.refreshApps();
  }

  private syncTablet(immediate = false): void {
    if (taskbarPreferences.touch === this.tablet.shown) return;
    this.stopWaiting();
    this.peek.actor.visible = !taskbarPreferences.touch;
    if (immediate || !this.monitor) this.switchTablet();
    else if (reducedMotion()) this.fadeTablet();
    else this.morphTablet();
  }

  private fit(): void {
    const metrics = taskbarPreferences.metrics;
    this.surface.sync();
    this.launcher.resize(metrics.button);
    this.taskbar.resize(metrics);
  }

  private switchTablet(): void {
    if (taskbarPreferences.touch) this.tablet.enter(() => this.fit(), true);
    else {
      this.fit();
      this.tablet.leave(true);
      if (this.autoHide.shown) this.actor.translation_y = 0;
    }
    this.place();
  }

  private fadeTablet(): void {
    animateActor(this.actor, {
      opacity: 0, duration: Duration.quick, curve: Curve.decelerate,
      onStopped: () => {
        if (taskbarPreferences.touch !== this.tablet.shown) this.switchTablet();
        animateActor(this.actor, { opacity: 255, duration: Duration.standard, curve: Curve.decelerate });
      },
    });
  }

  private morphTablet(): void {
    const from = { width: this.actor.width, radius: this.surface.radius };
    if (taskbarPreferences.touch) {
      this.tablet.enter(() => this.fit(), false);
      this.reserve();
      const { y, height } = this.monitor!;
      this.stopWaiting = afterWindowsReach(this.monitor!, y + height - taskbarPreferences.reserved, () => {
        if (this.autoHide.shown) animateActor(this.actor, { translation_y: this.tablet.rest, spring: Spring.smooth });
        this.morphTo(from);
      });
    } else {
      this.fit();
      this.tablet.leave(false);
      if (this.autoHide.shown) {
        animateActor(this.actor, {
          translation_y: 0, spring: Spring.smooth,
          onStopped: () => { if (!this.tablet.shown) this.reserve(); },
        });
      } else this.reserve();
      this.morphTo(from);
    }
  }

  private morphTo(from: { width: number; radius: number }): void {
    const to = { ...this.bar, radius: taskbarPreferences.metrics.radius };
    animateActor(this.actor, { x: to.x, y: to.y, width: to.width, height: to.height, spring: Spring.smooth });
    this.morphRadius(from, to);
    this.autoHide.place();
  }

  private morphRadius(from: { width: number; radius: number }, to: { width: number; radius: number }): void {
    const width = this.actor.get_transition('width');
    if (from.radius === to.radius || !width) return;
    this.surface.shape(from.radius);
    width.connect('new-frame', () => {
      const progress = (this.actor.width - from.width) / (to.width - from.width);
      this.surface.shape(from.radius + (to.radius - from.radius) * progress);
    });
    width.connect('stopped', () => this.surface.shape(null));
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
