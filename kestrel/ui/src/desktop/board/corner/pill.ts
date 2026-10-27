import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';
import { WallClock } from '../../../shared/time/wallClock.js';

import { BatteryIndicator } from '../../../shared/battery/indicator.js';
import { blurSurface } from '../../../shared/layout/surface.js';
import { localized, onLocaleChanged, t } from '../../../shared/i18n/index.js';
import { timeText } from '../../panel/widgets/clockText.js';

export class CornerPill {
  readonly actor = new St.Button({
    name: 'kestrel-board-pill',
    style_class: 'kestrel-board-pill kestrel-glass',
    can_focus: true,
  });
  private readonly status = new St.BoxLayout({ style_class: 'kestrel-board-pill-status', y_align: Clutter.ActorAlign.CENTER });
  private readonly time = new St.Label({ style_class: 'kestrel-board-pill-time', y_align: Clutter.ActorAlign.CENTER });
  private readonly clock = new WallClock((now, clock) => this.tick(now, clock));
  private readonly forgetLocale = onLocaleChanged(() => this.tick(GLib.DateTime.new_now_local(), this.clock));

  constructor(openQuickSettings: () => void) {
    const box = new St.BoxLayout({ style_class: 'kestrel-board-pill-box' });
    box.add_child(this.status);
    box.add_child(new BatteryIndicator(16).actor);
    box.add_child(this.time);
    this.actor.set_child(box);
    localized(this.actor, () => (this.actor.accessible_name = t('board-quick-settings')));
    blurSurface(this.actor, 999);
    this.actor.connect('clicked', openQuickSettings);
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
    this.forgetLocale();
  }

  private tick(now: GLib.DateTime, clock: WallClock): void {
    const text = timeText(now, clock.twelveHour);
    if (this.time.text !== text) this.time.text = text;
  }
}
