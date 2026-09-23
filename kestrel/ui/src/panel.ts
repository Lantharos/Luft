import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import Pango from 'gi://Pango';
import St from 'gi://St';

import { blurSurface, PANEL_HEIGHT } from './surface.js';
import { PanelLayout } from './panelLayout.js';
import { liftIcon } from './motion.js';

export interface Monitor {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PanelActions {
  start(): void;
  quickSettings(): void;
  notifications(): void;
}

export class KestrelPanel {
  readonly actor: St.Widget;
  private readonly appSystem = Shell.AppSystem.get_default();
  private readonly tracker = Shell.WindowTracker.get_default();
  private readonly favorites = new Gio.Settings({ schema_id: 'org.gnome.shell' });
  private readonly appButtons = new St.BoxLayout({ style_class: 'kestrel-taskbar' });
  private readonly clock = new St.Label({ style_class: 'kestrel-clock', y_align: Clutter.ActorAlign.CENTER });
  private readonly networkIcon = new St.Icon({ icon_name: 'network-wired-symbolic', icon_size: 16 });
  private readonly volumeIcon = new St.Icon({ icon_name: 'audio-volume-high-symbolic', icon_size: 16 });
  private readonly externalSignals: [Gio.Settings | Shell.AppSystem | Shell.WindowTracker, number][] = [];
  private readonly buttons = new Map<string, St.Button>();
  private readonly startButton: St.Button;
  private readonly quickButton: St.Button;
  private readonly clockButton: St.Button;
  private clockTimer = 0;

  constructor(actions: PanelActions) {
    this.actor = new St.Widget({
      name: 'kestrel-panel',
      style_class: 'kestrel-panel',
      reactive: true,
      layout_manager: new PanelLayout(),
    });
    blurSurface(this.actor, 0);

    const center = new St.BoxLayout({
      name: 'kestrel-panel-center',
      style_class: 'kestrel-taskbar',
      x_align: Clutter.ActorAlign.CENTER,
      y_align: Clutter.ActorAlign.CENTER,
    });
    this.startButton = this.iconButton('view-app-grid-symbolic', 'Start', actions.start);
    center.add_child(this.startButton);
    center.add_child(this.appButtons);
    this.actor.add_child(center);

    const right = new St.BoxLayout({
      name: 'kestrel-panel-status',
      style_class: 'kestrel-panel-status',
      x_align: Clutter.ActorAlign.END,
      y_align: Clutter.ActorAlign.CENTER,
    });
    const status = new St.BoxLayout({ style_class: 'kestrel-status-icons', y_align: Clutter.ActorAlign.CENTER });
    status.add_child(this.networkIcon);
    status.add_child(this.volumeIcon);
    this.quickButton = new St.Button({
      style_class: 'kestrel-status-button', child: status,
      can_focus: true, accessible_name: 'Quick settings',
    });
    this.quickButton.connect('clicked', actions.quickSettings);
    right.add_child(this.quickButton);
    this.clockButton = new St.Button({
      style_class: 'kestrel-status-button', child: this.clock,
      can_focus: true, accessible_name: 'Notifications and date',
    });
    this.clockButton.connect('clicked', actions.notifications);
    right.add_child(this.clockButton);
    this.actor.add_child(right);

    this.externalSignals.push(
      [this.appSystem, this.appSystem.connect('app-state-changed', () => this.refreshApps())],
      [this.appSystem, this.appSystem.connect('installed-changed', () => this.refreshApps())],
      [this.favorites, this.favorites.connect('changed::favorite-apps', () => this.refreshApps())],
      [this.tracker, this.tracker.connect('notify::focus-app', () => this.refreshFocus())],
    );
    this.refreshApps();
    this.clock.clutter_text.set_line_alignment(Pango.Alignment.CENTER);
    this.refreshClock();
    this.scheduleClock();
  }

  shutdown(): void {
    GLib.Source.remove(this.clockTimer);
    for (const [object, signal] of this.externalSignals) object.disconnect(signal);
    this.externalSignals.length = 0;
    this.buttons.clear();
  }

  updateStatus(networkIcon: string, volumeIcon: string): void {
    this.networkIcon.icon_name = networkIcon;
    this.volumeIcon.icon_name = volumeIcon;
  }

  place(monitor: Monitor): void {
    this.actor.set_position(monitor.x, monitor.y + monitor.height - PANEL_HEIGHT);
    this.actor.set_size(monitor.width, PANEL_HEIGHT);
  }

  setActive(surface: string | null): void {
    for (const [button, active] of [
      [this.startButton, surface === 'start' || surface === 'power'],
      [this.quickButton, surface === 'quick'],
      [this.clockButton, surface === 'notifications'],
    ] as const) {
      if (active) button.add_style_pseudo_class('active');
      else button.remove_style_pseudo_class('active');
    }
  }

  private refreshClock(): void {
    const text = GLib.DateTime.new_now_local().format('%d %b\n%H:%M') ?? '';
    if (this.clock.text !== text) this.clock.text = text;
  }

  private scheduleClock(): void {
    const seconds = 60 - GLib.DateTime.new_now_local().get_second();
    this.clockTimer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, seconds, () => {
      this.refreshClock();
      this.scheduleClock();
      return GLib.SOURCE_REMOVE;
    });
  }

  private refreshApps(): void {
    this.appButtons.destroy_all_children();
    this.buttons.clear();
    const apps = this.favorites.get_strv('favorite-apps')
      .map(id => this.appSystem.lookup_app(id))
      .filter((app): app is Shell.App => app !== null);
    for (const app of this.appSystem.get_running()) {
      if (!apps.some(favorite => favorite.id === app.id)) apps.push(app);
    }
    for (const app of apps) {
      const icon = app.create_icon_texture(24);
      const content = new St.Widget({ layout_manager: new Clutter.BinLayout() });
      icon.set_x_align(Clutter.ActorAlign.CENTER);
      icon.set_y_align(Clutter.ActorAlign.CENTER);
      content.add_child(icon);
      if (app.state === Shell.AppState.RUNNING) {
        content.add_child(new St.Widget({
          style_class: 'kestrel-running-dot',
          x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.END,
        }));
      }
      const button = new St.Button({
        style_class: 'kestrel-task-button',
        child: content,
        width: 40, height: 40,
        can_focus: true, track_hover: true,
        accessible_name: app.get_name(),
      });
      liftIcon(button, icon);
      button.connect('clicked', () => {
        const windows = app.get_windows();
        if (this.tracker.focus_app === app && windows.length === 1) windows[0].minimize();
        else app.activate();
      });
      this.buttons.set(app.id, button);
      this.appButtons.add_child(button);
    }
    this.refreshFocus();
  }

  private refreshFocus(): void {
    const focused = this.tracker.focus_app?.id;
    for (const [id, button] of this.buttons) {
      if (id === focused) button.add_style_pseudo_class('active');
      else button.remove_style_pseudo_class('active');
    }
  }

  private iconButton(icon: string, label: string, action: () => void): St.Button {
    const button = new St.Button({
      style_class: 'kestrel-task-button',
      child: new St.Icon({ icon_name: icon, icon_size: 18 }),
      width: 40, height: 40,
      can_focus: true, track_hover: true, accessible_name: label,
    });
    liftIcon(button, button.child!);
    button.connect('clicked', action);
    return button;
  }
}
