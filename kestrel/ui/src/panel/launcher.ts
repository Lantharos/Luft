import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import primary from '../assets/luft-primary.svg';
import secondary from '../assets/luft-secondary.svg';
import { appIcon, appIcons } from '../appearance/icons/appIcons.js';
import { animateActor } from '../shared/motion.js';
import { PANEL_ICON_SIZE } from '../shared/surface.js';

const MARK_SIZE = 26;

const svgIcon = (svg: string) => Gio.BytesIcon.new(new GLib.Bytes(new TextEncoder().encode(svg)));

const luft = {
  get_id: () => 'kestrel-luft',
  get_icon: () => svgIcon(primary),
};

function animatedMark(button: St.Button): St.Widget {
  const mark = new St.Widget({ width: MARK_SIZE, height: MARK_SIZE, layout_manager: new Clutter.BinLayout() });
  for (const [svg, direction, pivotX, pivotY] of [[secondary, 1, 0.58, 0.69], [primary, -1, 0.4, 0.3]] as const) {
    const icon = new St.Icon({ gicon: svgIcon(svg), icon_size: MARK_SIZE });
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
  return mark;
}

export function createLauncher(activate: () => void): St.Button {
  const button = new St.Button({
    style_class: 'kestrel-task-button', clip_to_allocation: true,
    width: 40, height: 40, can_focus: true, track_hover: true, accessible_name: 'Start',
  });
  const mark = animatedMark(button);
  const styled = appIcon(luft, PANEL_ICON_SIZE);
  const sync = () => { button.child = appIcons.style === 'default' ? mark : styled; };
  const unwatch = appIcons.watch(sync);
  sync();
  button.connect('destroy', () => {
    unwatch();
    for (const actor of [mark, styled]) if (actor !== button.child) actor.destroy();
  });
  button.connect('clicked', activate);
  return button;
}
