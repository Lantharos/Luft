import Clutter from 'gi://Clutter';
import type GLib from 'gi://GLib';
import St from 'gi://St';
import { WallClock } from 'resource:///com/lantharos/kestrel/misc/wallClock.js';

import type { Monitor } from '../panel/panel.js';
import { Battery, type BatteryState } from '../quickSettings/battery.js';
import { blurSurface } from '../shared/surface.js';

const MARGIN = 12;

export class CornerPill {
  readonly actor = new St.Button({
    name: 'kestrel-board-pill',
    style_class: 'kestrel-board-pill kestrel-glass',
    can_focus: true,
    accessible_name: 'Quick settings',
    visible: false,
  });
  private readonly status = new St.BoxLayout({ style_class: 'kestrel-board-pill-status', y_align: Clutter.ActorAlign.CENTER });
  private readonly batteryIcon = new St.Icon({ style_class: 'kestrel-board-pill-icon', visible: false });
  private readonly batteryLabel = new St.Label({ style_class: 'kestrel-board-pill-battery', y_align: Clutter.ActorAlign.CENTER, visible: false });
  private readonly time = new St.Label({ style_class: 'kestrel-board-pill-time', y_align: Clutter.ActorAlign.CENTER });
  private readonly clock = new WallClock((now, clock) => this.tick(now, clock));
  private readonly battery = new Battery(state => this.showBattery(state));

  constructor(openQuickSettings: () => void) {
    const box = new St.BoxLayout({ style_class: 'kestrel-board-pill-box' });
    box.add_child(this.status);
    box.add_child(this.batteryIcon);
    box.add_child(this.batteryLabel);
    box.add_child(this.time);
    this.actor.set_child(box);
    blurSurface(this.actor, 999);
    this.actor.connect('clicked', openQuickSettings);
  }

  place(monitor: Monitor): void {
    const [, width] = this.actor.get_preferred_width(-1);
    const [, height] = this.actor.get_preferred_height(width);
    this.actor.set_position(monitor.x + monitor.width - width - MARGIN, monitor.y + monitor.height - height - MARGIN);
  }

  showStatus(iconNames: string[]): void {
    const icons = this.status.get_children() as St.Icon[];
    iconNames.forEach((iconName, index) => {
      const icon = icons[index] ?? new St.Icon({ style_class: 'kestrel-board-pill-icon' });
      if (!icon.get_parent()) this.status.add_child(icon);
      icon.icon_name = iconName;
    });
    for (const icon of icons.slice(iconNames.length)) icon.destroy();
  }

  destroy(): void {
    this.clock.destroy();
    this.battery.destroy();
    this.actor.destroy();
  }

  private showBattery(state: BatteryState | null): void {
    this.batteryIcon.visible = this.batteryLabel.visible = !!state;
    if (!state) return;
    this.batteryIcon.icon_name = state.iconName;
    this.batteryLabel.text = `${state.percentage}%`;
  }

  private tick(now: GLib.DateTime, clock: WallClock): void {
    const text = now.format(clock.twelveHour ? '%-l:%M %p' : '%H:%M') ?? '';
    if (this.time.text !== text) this.time.text = text;
  }
}
