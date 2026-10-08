import Clutter from 'gi://Clutter';
import St from 'gi://St';

import type { ContextMenus, MenuEntry } from './contextMenus.js';

export class ControlRow {
  readonly actor = new St.BoxLayout({ style_class: 'kestrel-login-controls' });

  constructor(private readonly menus: ContextMenus, name: string) {
    this.actor.name = name;
  }

  icon(name: string): St.Icon {
    return new St.Icon({ icon_name: name, icon_size: 16, y_align: Clutter.ActorAlign.CENTER });
  }

  add(actor: Clutter.Actor): void {
    this.actor.add_child(actor);
  }

  button(name: string, label: string, child: St.Widget, entries: () => MenuEntry[]): St.Button {
    const button = new St.Button({
      name, style_class: 'kestrel-status-button kestrel-login-control', child,
      accessible_name: label, can_focus: true, track_hover: true,
    });
    button.connect('clicked', () => {
      const [x, y] = button.get_transformed_position();
      this.menus.open(button, entries(), Math.round(x + button.width / 2), Math.round(y));
    });
    this.actor.add_child(button);
    return button;
  }
}
