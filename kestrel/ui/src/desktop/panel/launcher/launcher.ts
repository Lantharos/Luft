import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import primary from './luft-primary.svg';
import secondary from './luft-secondary.svg';
import { appIcons } from '../../../appearance/icons/appIcons.js';
import { animateActor } from '../../../shared/motion.js';

const MARK_SCALE = 0.65;
const PAINTED_MARK_SCALE = 0.8;
const WHITE = '#ffffffff';

const svgIcon = (svg: string, fill: string) =>
  Gio.BytesIcon.new(new GLib.Bytes(new TextEncoder().encode(svg.replace('fill="white"', `fill="${fill}"`))));

const LAYERS = [
  { svg: secondary, direction: 1, pivot: [0.58, 0.69], fill: (ink: string) => appIcons.paint?.shade ?? ink },
  { svg: primary, direction: -1, pivot: [0.4, 0.3], fill: (ink: string) => appIcons.paint?.ink ?? ink },
] as const;

export interface Launcher {
  button: St.Button;
  resize(size: number): void;
}

function animatedMark(button: St.Button): [St.Widget, (size: number) => void] {
  const mark = new St.Widget({ layout_manager: new Clutter.BinLayout() });
  let size = 0;
  const icons = LAYERS.map(({ direction, pivot: [pivotX, pivotY] }) => {
    const icon = new St.Icon();
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
  let painted = '';
  const ink = () => button.peek_theme_node()?.get_foreground_color().to_string() ?? WHITE;
  const paint = () => {
    const fills = LAYERS.map(layer => layer.fill(ink()));
    painted = fills.join();
    LAYERS.forEach((layer, index) => {
      icons[index].icon_size = Math.round(size * (appIcons.paint ? PAINTED_MARK_SCALE : 1));
      icons[index].gicon = svgIcon(layer.svg, fills[index]);
    });
  };
  const unwatch = appIcons.watch(paint);
  mark.connect('destroy', unwatch);
  button.connect('style-changed', () => {
    if (LAYERS.map(layer => layer.fill(ink())).join() !== painted) paint();
  });
  return [mark, markSize => {
    size = markSize;
    mark.set_size(size, size);
    paint();
  }];
}

export function createLauncher(activate: () => void, size: number): Launcher {
  const button = new St.Button({
    style_class: 'kestrel-task-button', clip_to_allocation: true,
    can_focus: true, track_hover: true, accessible_name: 'Start',
  });
  const [mark, resizeMark] = animatedMark(button);
  button.child = mark;
  button.connect('clicked', activate);
  const resize = (buttonSize: number) => {
    button.set_size(buttonSize, buttonSize);
    resizeMark(Math.round(buttonSize * MARK_SCALE));
  };
  resize(size);
  return { button, resize };
}
