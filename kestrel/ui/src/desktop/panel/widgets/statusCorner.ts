import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';
import { WallClock } from '../../../shared/time/wallClock.js';

import { BatteryIndicator } from '../../../shared/battery/indicator.js';
import { localized, onLocaleChanged, t } from '../../../shared/i18n/index.js';
import { blurSurface } from '../../../shared/layout/surface.js';
import { createLauncher, type Launcher } from '../launcher/launcher.js';
import type { Monitor } from '../panel.js';
import { taskbarPreferences } from '../preferences/taskbarPreferences.js';
import { timeText } from './clockText.js';

const MARGIN = 12;
const MARK_SIZE = 36;

export interface CornerActions {
  start(): void;
  quickSettings(): void;
  notifications(): void;
}

function pill(name: string, child: Clutter.Actor, activate: () => void): St.Button {
  const button = new St.Button({ name, style_class: 'kestrel-corner-pill kestrel-glass', can_focus: true, track_hover: true, child });
  blurSurface(button, 999);
  button.connect('clicked', activate);
  return button;
}

export class StatusCorner {
  readonly actor = new St.BoxLayout({ name: 'kestrel-status-corner', style_class: 'kestrel-status-corner', visible: false });
  private readonly status = new St.BoxLayout({ style_class: 'kestrel-corner-status', y_align: Clutter.ActorAlign.CENTER });
  private readonly time = new St.Label({ style_class: 'kestrel-corner-time', y_align: Clutter.ActorAlign.CENTER });
  private readonly launcher: Launcher;
  private readonly buttons: [St.Button, string][];
  private readonly clock = new WallClock((now, clock) => this.tick(now, clock));
  private readonly forgetLocale = onLocaleChanged(() => this.tick(GLib.DateTime.new_now_local(), this.clock));
  private readonly unwatchPreferences: () => void;
  private monitor: Monitor | null = null;

  constructor(actions: CornerActions) {
    this.launcher = createLauncher(actions.start, MARK_SIZE, this.actor);
    this.launcher.button.add_style_class_name('kestrel-corner-start kestrel-glass');
    blurSurface(this.launcher.button, 999);
    const statusBox = new St.BoxLayout({ style_class: 'kestrel-corner-status' });
    statusBox.add_child(this.status);
    statusBox.add_child(new BatteryIndicator(16).actor);
    const quick = pill('kestrel-corner-quick-settings', statusBox, actions.quickSettings);
    const clock = pill('kestrel-corner-clock', this.time, actions.notifications);
    localized(quick, () => (quick.accessible_name = t('taskbar-quick-settings')));
    localized(clock, () => (clock.accessible_name = t('taskbar-notifications-and-date')));
    this.buttons = [[this.launcher.button, 'start'], [quick, 'quick'], [clock, 'notifications']];
    for (const [button] of this.buttons) this.actor.add_child(button);
    this.syncStartButton();
    this.unwatchPreferences = taskbarPreferences.watch(key => { if (key === 'taskbar-start-button') this.syncStartButton(); });
    this.actor.connect('notify::width', () => this.reposition());
    this.actor.connect('notify::height', () => this.reposition());
  }

  get clearance(): number {
    const [, height] = this.actor.get_preferred_height(-1);
    return MARGIN + height;
  }

  place(monitor: Monitor): void {
    this.monitor = monitor;
    this.reposition();
  }

  setShown(shown: boolean): void {
    this.actor.visible = shown;
  }

  setActive(surface: string | null): void {
    for (const [button, opens] of this.buttons) {
      if (opens === surface) button.add_style_pseudo_class('active');
      else button.remove_style_pseudo_class('active');
    }
  }

  showStatus(iconNames: string[]): void {
    const icons = this.status.get_children() as St.Icon[];
    iconNames.forEach((iconName, index) => {
      const icon = icons[index] ?? new St.Icon({ icon_size: 16 });
      if (!icon.get_parent()) this.status.add_child(icon);
      icon.icon_name = iconName;
    });
    for (const icon of icons.slice(iconNames.length)) icon.destroy();
  }

  destroy(): void {
    this.unwatchPreferences();
    this.clock.destroy();
    this.forgetLocale();
    this.actor.destroy();
  }

  private syncStartButton(): void {
    this.launcher.button.visible = taskbarPreferences.startButton;
  }

  private reposition(): void {
    if (!this.monitor) return;
    const [, width] = this.actor.get_preferred_width(-1);
    const [, height] = this.actor.get_preferred_height(width);
    const { x, y, width: monitorWidth, height: monitorHeight } = this.monitor;
    this.actor.set_position(x + monitorWidth - width - MARGIN, y + monitorHeight - height - MARGIN);
  }

  private tick(now: GLib.DateTime, clock: WallClock): void {
    const text = timeText(now, clock.twelveHour);
    if (this.time.text !== text) this.time.text = text;
  }
}
