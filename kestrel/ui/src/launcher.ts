import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import primary from './assets/luft-primary.svg';
import secondary from './assets/luft-secondary.svg';
import { animateActor } from './motion.js';

export function createLauncher(activate: () => void): St.Button {
  const mark = new St.Widget({ width: 24, height: 24, layout_manager: new Clutter.BinLayout() });
  const button = new St.Button({
    style_class: 'kestrel-task-button', child: mark,
    width: 40, height: 40, can_focus: true, track_hover: true, accessible_name: 'Start',
  });
  for (const [svg, direction] of [[secondary, 1], [primary, -1]] as const) {
    const icon = new St.Icon({
      gicon: Gio.BytesIcon.new(new GLib.Bytes(new TextEncoder().encode(svg))),
      icon_size: 24,
    });
    mark.add_child(icon);
    const update = () => {
      const offset = button.hover && !button.pressed ? 0.25 : 0;
      animateActor(icon, {
        translation_x: direction * offset,
        translation_y: direction * offset,
        duration: 150, mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      });
    };
    button.connect('notify::hover', update);
    button.connect('notify::pressed', update);
  }
  button.connect('clicked', activate);
  return button;
}
