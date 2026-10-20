import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import primary from './luft-primary.svg';
import secondary from './luft-secondary.svg';
import { markShade, monochromeShade } from './shade.js';
import { taskbarBackdrops } from '../backdrop.js';
import { appIcons } from '../../../appearance/icons/appIcons.js';
import { animateActor, Spring } from '../../../shared/motion.js';
import { wallpaperFloor } from '../../wallpaper/floor.js';

const MARK_SCALE = 0.65;
const PAINTED_MARK_SCALE = 0.8;
const WHITE = '#ffffffff';

const svgIcon = (svg: string, fill: string) =>
  Gio.BytesIcon.new(new GLib.Bytes(new TextEncoder().encode(svg.replace('fill="white"', `fill="${fill}"`))));

const LAYERS = [
  { svg: secondary, direction: 1, pivot: [0.58, 0.69], style: 'icon-shadow: none;' },
  { svg: primary, direction: -1, pivot: [0.4, 0.3], style: null },
] as const;

export interface Launcher {
  button: St.Button;
  resize(size: number): void;
}

function markPaint(button: St.Button, panel: St.Widget): () => string[] {
  let shaded = { key: '', shade: '' };
  return () => {
    const foreground = button.peek_theme_node()?.get_foreground_color().to_string() ?? WHITE;
    const paint = appIcons.paint;
    const ink = paint?.ink ?? foreground;
    const backdrops = taskbarBackdrops(panel, wallpaperFloor);
    if (!backdrops.length) return [paint?.shade ?? ink, ink];
    const key = [ink, paint?.shade, ...backdrops].join();
    if (key !== shaded.key) shaded = { key, shade: paint ? markShade(ink, paint.shade, backdrops) : monochromeShade(ink, backdrops) };
    return [shaded.shade, ink];
  };
}

function animatedMark(button: St.Button, panel: St.Widget): [St.Widget, (size: number) => void] {
  const mark = new St.Widget({ layout_manager: new Clutter.BinLayout() });
  let size = 0;
  const icons = LAYERS.map(({ direction, pivot: [pivotX, pivotY], style }) => {
    const icon = new St.Icon({ style });
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
  let painted = '';
  const paint = () => {
    const fills = current();
    painted = fills.join();
    LAYERS.forEach((layer, index) => {
      icons[index].icon_size = Math.round(size * (appIcons.paint ? PAINTED_MARK_SCALE : 1));
      icons[index].gicon = svgIcon(layer.svg, fills[index]);
    });
  };
  const repaint = () => {
    if (current().join() !== painted) paint();
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
