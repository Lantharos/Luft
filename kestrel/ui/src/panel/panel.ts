import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import type GioUnix from 'gi://GioUnix';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { blurSurface, PANEL_HEIGHT } from '../shared/surface.js';
import { PanelLayout } from './panelLayout.js';
import type { WindowPreviews } from './windowPreviews.js';
import { Taskbar } from './taskbar/taskbar.js';
import type { ContextMenus } from '../menus/contextMenus.js';
import { createLauncher } from './launcher.js';
import { Tray } from '../tray/tray.js';
import { DesktopPeek } from './desktopPeek.js';
import { PanelClock } from './clock.js';
import { PrivacyIndicator } from '../privacy/indicator.js';

function systemMonitor(): Shell.App | null {
  const appSystem = Shell.AppSystem.get_default();
  const info = appSystem.get_installed().find(app => {
    const categories = (app as GioUnix.DesktopAppInfo).get_categories()?.split(';') ?? [];
    return categories.includes('System') && categories.includes('Monitor');
  });
  return info ? appSystem.lookup_app(info.get_id()!) : null;
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
  private readonly appSystem = Shell.AppSystem.get_default();
  private readonly tracker = Shell.WindowTracker.get_default();
  private readonly favorites = new Gio.Settings({ schema_id: 'dev.lantharos.kestrel' });
  private readonly taskbar: Taskbar;
  private readonly clock = new PanelClock();
  private readonly statusIcons = new St.BoxLayout({ style_class: 'kestrel-status-icons', y_align: Clutter.ActorAlign.CENTER });
  private readonly externalSignals: [Gio.Settings | Shell.AppSystem | Shell.WindowTracker, number][] = [];
  private readonly startButton: St.Button;
  private readonly quickButton: St.Button | null = null;
  private readonly clockButton: St.Button;
  readonly tray: Tray | null = null;
  private readonly privacy: PrivacyIndicator | null = null;

  constructor(actions: PanelActions, menus: ContextMenus, previews: WindowPreviews, public monitor: Monitor | null, readonly primary: boolean) {
    this.taskbar = new Taskbar(this.tracker, menus, previews, this.favorites, () => this.monitor?.index ?? -1, actions.activateWindow);
    this.actor = new St.Widget({
      name: primary ? 'kestrel-panel' : 'kestrel-secondary-panel',
      style_class: 'kestrel-panel',
      reactive: true,
      layout_manager: new PanelLayout(),
    });
    blurSurface(this.actor, 0);

    const center = new St.BoxLayout({
      name: primary ? 'kestrel-panel-center' : null,
      style_class: 'kestrel-taskbar',
      x_align: Clutter.ActorAlign.CENTER,
      y_align: Clutter.ActorAlign.CENTER,
    });
    this.startButton = createLauncher(actions.start);
    center.add_child(this.startButton);
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

    this.externalSignals.push(
      [this.appSystem, this.appSystem.connect('app-state-changed', () => this.refreshApps())],
      [this.appSystem, this.appSystem.connect('installed-changed', () => this.refreshApps())],
      [this.favorites, this.favorites.connect('changed::favorite-apps', () => this.refreshApps())],
      [this.tracker, this.tracker.connect('notify::focus-app', () => this.taskbar.updateFocus())],
    );
    menus.bind(this.actor, () => {
      const monitor = systemMonitor();
      return [
        { label: 'Show desktop', run: () => peek.toggleDesktop() },
        ...monitor ? [{ label: 'System monitor', run: () => monitor.activate() }] : [],
        { label: 'Settings', run: () => menus.settings() },
      ];
    });
    menus.bind(this.clockButton, () => [
      { label: 'Date and time settings', run: () => menus.settings('datetime') },
    ]);
    this.refreshApps();
  }

  shutdown(): void {
    this.tray?.shutdown();
    this.privacy?.shutdown();
    this.taskbar.shutdown();
    this.clock.destroy();
    for (const [object, signal] of this.externalSignals) object.disconnect(signal);
    this.externalSignals.length = 0;
  }

  destroy(): void {
    this.shutdown();
    this.actor.destroy();
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

  place(): void {
    if (!this.monitor) return;
    this.actor.set_position(this.monitor.x, this.monitor.y + this.monitor.height - PANEL_HEIGHT);
    this.actor.set_size(this.monitor.width, PANEL_HEIGHT);
  }

  setActive(surface: string | null): void {
    for (const [button, active] of [
      [this.startButton, surface === 'start'],
      [this.quickButton, surface === 'quick'],
      [this.clockButton, surface === 'notifications'],
    ] as const) {
      if (active) button?.add_style_pseudo_class('active');
      else button?.remove_style_pseudo_class('active');
    }
  }

  private refreshApps(): void {
    const apps = this.favorites.get_strv('favorite-apps')
      .map(id => this.appSystem.lookup_app(id))
      .filter((app): app is Shell.App => app !== null);
    for (const app of this.appSystem.get_running()) {
      if (!apps.some(favorite => favorite.id === app.id)) apps.push(app);
    }
    this.taskbar.update(apps);
  }
}
