import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import primary from '../assets/luft-primary.svg';
import secondary from '../assets/luft-secondary.svg';
import { appIcons } from '../appearance/icons/appIcons.js';
import { animateActor } from '../shared/motion.js';

const MARK_SIZE = 26;
const PAINTED_MARK_SIZE = 21;
const WHITE = '#ffffffff';

const svgIcon = (svg: string, fill: string) =>
  Gio.BytesIcon.new(new GLib.Bytes(new TextEncoder().encode(svg.replace('fill="white"', `fill="${fill}"`))));

const LAYERS = [
  { svg: secondary, direction: 1, pivot: [0.58, 0.69], fill: () => appIcons.paint?.shade ?? WHITE },
  { svg: primary, direction: -1, pivot: [0.4, 0.3], fill: () => appIcons.paint?.ink ?? WHITE },
] as const;

function animatedMark(button: St.Button): St.Widget {
  const mark = new St.Widget({ width: MARK_SIZE, height: MARK_SIZE, layout_manager: new Clutter.BinLayout() });
  const icons = LAYERS.map(({ direction, pivot: [pivotX, pivotY] }) => {
    const icon = new St.Icon({ icon_size: MARK_SIZE });
    icon.set_pivot_point(pivotX, pivotY);
    mark.add_child(icon);
    const update = () => {
      const lifted = button.hover && !button.pressed;
      animateActor(icon, {
        translation_x: lifted ? direction * 0.6 : 0,
        translation_y: lifted ? direction * 0.6 : 0,
        rotation_angle_z: lifted ? direction * 3 : 0,
        duration: 150, mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      });
    };
    button.connect('notify::hover', update);
    button.connect('notify::pressed', update);
    return icon;
  });
  const paint = () => LAYERS.forEach((layer, index) => {
    icons[index].icon_size = appIcons.paint ? PAINTED_MARK_SIZE : MARK_SIZE;
    icons[index].gicon = svgIcon(layer.svg, layer.fill());
  });
  const unwatch = appIcons.watch(paint);
  mark.connect('destroy', unwatch);
  paint();
  return mark;
}

export function createLauncher(activate: () => void): St.Button {
  const button = new St.Button({
    style_class: 'kestrel-task-button', clip_to_allocation: true,
    width: 40, height: 40, can_focus: true, track_hover: true, accessible_name: 'Start',
  });
  button.child = animatedMark(button);
  button.connect('clicked', activate);
  return button;
}
