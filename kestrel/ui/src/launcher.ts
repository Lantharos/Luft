import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import primary from './assets/luft-primary.svg';
import secondary from './assets/luft-secondary.svg';
import { animateActor } from './motion.js';

const MARK_SIZE = 26;

export function createLauncher(activate: () => void): St.Button {
  const mark = new St.Widget({ width: MARK_SIZE, height: MARK_SIZE, layout_manager: new Clutter.BinLayout() });
  const button = new St.Button({
    style_class: 'kestrel-task-button', child: mark, clip_to_allocation: true,
    width: 40, height: 40, can_focus: true, track_hover: true, accessible_name: 'Start',
  });
  for (const [svg, direction, pivotX, pivotY] of [[secondary, 1, 0.58, 0.69], [primary, -1, 0.4, 0.3]] as const) {
    const icon = new St.Icon({
      gicon: Gio.BytesIcon.new(new GLib.Bytes(new TextEncoder().encode(svg))),
      icon_size: MARK_SIZE,
    });
    icon.set_pivot_point(pivotX, pivotY);
    mark.add_child(icon);
    const update = () => {
      const offset = button.hover && !button.pressed ? 0.6 : 0;
      animateActor(icon, {
        translation_x: direction * offset,
        translation_y: direction * offset,
        rotation_angle_z: button.hover && !button.pressed ? direction * 3 : 0,
        duration: 150, mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      });
    };
    button.connect('notify::hover', update);
    button.connect('notify::pressed', update);
  }
  button.connect('clicked', activate);
  return button;
}
