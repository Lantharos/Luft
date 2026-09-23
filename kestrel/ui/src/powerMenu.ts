import Clutter from 'gi://Clutter';
import St from 'gi://St';
import { blurSurface } from './surface.js';

import * as SystemActions from 'resource:///org/gnome/shell/misc/systemActions.js';

export class PowerMenu {
  readonly actor = new St.BoxLayout({
    name: 'kestrel-power',
    orientation: Clutter.Orientation.VERTICAL,
    style_class: 'kestrel-popover kestrel-power-menu',
    reactive: true,
    visible: false,
  });

  constructor(private readonly close: () => void) {
    blurSurface(this.actor, 20);

    const actions = SystemActions.getDefault();
    this.addAction('system-lock-screen-symbolic', 'Lock', () => actions.activateLockScreen());
    this.addAction('media-playback-pause-symbolic', 'Suspend', () => actions.activateSuspend());
    this.addAction('system-log-out-symbolic', 'Log out', () => actions.activateLogout());
    this.addAction('system-reboot-symbolic', 'Restart', () => actions.activateRestart());
    this.addAction('system-shutdown-symbolic', 'Power off', () => actions.activatePowerOff());
  }

  private addAction(iconName: string, label: string, activate: () => void): void {
    const row = new St.BoxLayout({ style_class: 'kestrel-power-row', x_expand: true, y_align: Clutter.ActorAlign.CENTER });
    row.add_child(new St.Icon({ icon_name: iconName, icon_size: 18, y_align: Clutter.ActorAlign.CENTER }));
    row.add_child(new St.Label({ text: label, y_align: Clutter.ActorAlign.CENTER }));
    const button = new St.Button({
      style_class: 'kestrel-power-action',
      child: row,
      x_align: Clutter.ActorAlign.FILL,
      can_focus: true,
    });
    button.connect('clicked', () => {
      this.close();
      activate();
    });
    this.actor.add_child(button);
  }
}
