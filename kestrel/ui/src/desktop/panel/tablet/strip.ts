import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { BatteryIndicator } from '../../../shared/battery/indicator.js';
import { PanelClock } from '../widgets/clock.js';

const ICON_SIZE = 14;

export class TabletStrip {
  readonly actor: St.Button;
  private readonly icons = new St.BoxLayout({ style_class: 'kestrel-tablet-strip-icons', y_align: Clutter.ActorAlign.CENTER });
  private readonly clock = new PanelClock(true);

  constructor(expand: () => void, primary: boolean) {
    const content = new St.BoxLayout({ style_class: 'kestrel-tablet-strip-status', x_align: Clutter.ActorAlign.END, x_expand: true });
    if (primary) this.icons.add_child(new BatteryIndicator(ICON_SIZE, 'never').actor);
    content.add_child(this.icons);
    content.add_child(this.clock.actor);
    this.actor = new St.Button({
      name: primary ? 'kestrel-tablet-strip' : null, style_class: 'kestrel-tablet-strip',
      child: content, x_expand: true, can_focus: true, accessible_name: 'Show taskbar',
    });
    this.actor.connect('clicked', expand);
    this.actor.connect('destroy', () => this.clock.destroy());
  }

  updateStatus(iconNames: string[]): void {
    const icons = this.icons.get_children().filter(child => child instanceof St.Icon);
    iconNames.forEach((iconName, index) => {
      const icon = icons[index] ?? new St.Icon({ icon_size: ICON_SIZE });
      if (!icon.get_parent()) this.icons.insert_child_at_index(icon, index);
      icon.icon_name = iconName;
    });
    for (const icon of icons.slice(iconNames.length)) icon.destroy();
  }
}
