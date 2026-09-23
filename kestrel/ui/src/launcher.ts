import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import luft from './assets/luft.svg';
import { liftIcon } from './motion.js';

export function createLauncher(activate: () => void): St.Button {
  const icon = new St.Icon({
    gicon: Gio.BytesIcon.new(new GLib.Bytes(new TextEncoder().encode(luft))),
    icon_size: 24,
  });
  const button = new St.Button({
    style_class: 'kestrel-task-button', child: icon,
    width: 40, height: 40, can_focus: true, track_hover: true, accessible_name: 'Start',
  });
  liftIcon(button, icon);
  button.connect('clicked', activate);
  return button;
}
