import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { BatteryIndicator } from '../../../shared/battery/indicator.js';
import { animateActor, Spring } from '../../../shared/motion.js';
import { PanelClock } from '../widgets/clock.js';

const ICON_SIZE = 14;
const HANDLE_STRETCH = 0.6;
const HANDLE_FADE = 0.35;

export class TabletStrip {
  readonly actor: St.Button;
  private readonly handle = new St.Widget({
    style_class: 'kestrel-tablet-strip-handle', x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.CENTER,
  });
  private readonly icons = new St.BoxLayout({ style_class: 'kestrel-tablet-strip-icons', y_align: Clutter.ActorAlign.CENTER });
  private readonly clock = new PanelClock(true);

  constructor(expand: () => void, primary: boolean) {
    this.handle.set_pivot_point(0.5, 0.5);
    const status = new St.BoxLayout({ style_class: 'kestrel-tablet-strip-status', x_align: Clutter.ActorAlign.END, x_expand: true });
    if (primary) this.icons.add_child(new BatteryIndicator(ICON_SIZE, 'never').actor);
    status.add_child(this.icons);
    status.add_child(this.clock.actor);
    const content = new St.Widget({ layout_manager: new Clutter.BinLayout(), x_expand: true, y_expand: true });
    content.add_child(this.handle);
    content.add_child(status);
    this.actor = new St.Button({
      name: primary ? 'kestrel-tablet-strip' : null, style_class: 'kestrel-tablet-strip',
      child: content, x_expand: true, can_focus: true, accessible_name: 'Show taskbar',
    });
    this.actor.connect('clicked', expand);
    this.actor.connect('destroy', () => this.clock.destroy());
  }

  pull(progress: number): void {
    this.handle.remove_all_transitions();
    this.handle.scale_x = 1 + progress * HANDLE_STRETCH;
    this.handle.opacity = Math.round(255 * Math.max(0, 1 - progress / HANDLE_FADE));
  }

  settle(collapsed: boolean): void {
    animateActor(this.handle, {
      scale_x: collapsed ? 1 : 1 + HANDLE_STRETCH, opacity: collapsed ? 255 : 0, spring: Spring.snappy,
    });
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
