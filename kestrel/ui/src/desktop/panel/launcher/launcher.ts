import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import { MARK_LAYERS, MARK_SCALE, markLayerSvg, PAINTED_MARK_SCALE, type MarkFills, type MarkLayer } from '../../../../../../packages/ui/src/taskbar/mark';
import { markFills } from './shade.js';
import { taskbarBackdrops } from '../backdrop.js';
import { appIcons } from '../../../appearance/icons/appIcons.js';
import { animateActor, Spring } from '../../../shared/motion.js';
import { wallpaperFloor } from '../../wallpaper/floor.js';

const WHITE = '#ffffffff';

const svgIcon = (layer: MarkLayer, fill: string) =>
  Gio.BytesIcon.new(new GLib.Bytes(new TextEncoder().encode(markLayerSvg(layer, fill))));

export interface Launcher {
  button: St.Button;
  resize(size: number): void;
}

function markPaint(button: St.Button, panel: St.Widget): () => MarkFills {
  let painted = { key: '', fills: { shade: WHITE, ink: WHITE } };
  return () => {
    const foreground = button.peek_theme_node()?.get_foreground_color().to_string() ?? WHITE;
    const paint = appIcons.paint;
    const backdrops = taskbarBackdrops(panel, wallpaperFloor);
    const key = [foreground, paint?.ink, paint?.shade, ...backdrops].join();
    if (key !== painted.key) painted = { key, fills: markFills(foreground, paint, backdrops) };
    return painted.fills;
  };
}

function animatedMark(button: St.Button, panel: St.Widget): [St.Widget, (size: number) => void] {
  const mark = new St.Widget({ layout_manager: new Clutter.BinLayout() });
  let size = 0;
  const icons = MARK_LAYERS.map(({ direction, pivot: [pivotX, pivotY], halo }) => {
    const icon = new St.Icon({ style: halo ? null : 'icon-shadow: none;' });
    icon.set_pivot_point(pivotX, pivotY);
    mark.add_child(icon);
    const update = () => {
      const lifted = button.hover && !button.pressed;
      animateActor(icon, {
        translation_x: lifted ? direction * 0.6 : 0,
        translation_y: lifted ? direction * 0.6 : 0,
        rotation_angle_z: lifted ? direction * 3 : 0,
        spring: Spring.snappy,
      });
    };
    button.connect('notify::hover', update);
    button.connect('notify::pressed', update);
    return icon;
  });
  const current = markPaint(button, panel);
  let painted: MarkFills | null = null;
  const paint = () => {
    const fills = painted = current();
    MARK_LAYERS.forEach((layer, index) => {
      icons[index].icon_size = Math.round(size * (appIcons.paint ? PAINTED_MARK_SCALE : 1));
      icons[index].gicon = svgIcon(layer, fills[layer.fill]);
    });
  };
  const repaint = () => {
    if (current() !== painted) paint();
  };
  const unwatch = [appIcons.watch(paint), wallpaperFloor.watch(repaint)];
  mark.connect('destroy', () => unwatch.forEach(stop => stop()));
  button.connect('style-changed', repaint);
  return [mark, markSize => {
    size = markSize;
    mark.set_size(size, size);
    paint();
  }];
}

export function createLauncher(activate: () => void, size: number, panel: St.Widget): Launcher {
  const button = new St.Button({
    style_class: 'kestrel-task-button', clip_to_allocation: true,
    can_focus: true, track_hover: true, accessible_name: 'Start',
  });
  const [mark, resizeMark] = animatedMark(button, panel);
  button.child = mark;
  button.connect('clicked', activate);
  const resize = (buttonSize: number) => {
    button.set_size(buttonSize, buttonSize);
    resizeMark(Math.round(buttonSize * MARK_SCALE));
  };
  resize(size);
  return { button, resize };
}
