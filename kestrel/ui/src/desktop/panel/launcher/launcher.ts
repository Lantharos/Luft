import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import primary from './luft-primary.svg';
import secondary from './luft-secondary.svg';
import { showsWallpaper, taskbarBackdrops } from './backdrop.js';
import { markEdge, markShade, monochromeShade } from './shade.js';
import { appIcons } from '../../../appearance/icons/appIcons.js';
import { animateActor } from '../../../shared/motion.js';
import { wallpaperFloor } from '../../wallpaper/floor.js';

const MARK_SCALE = 0.65;
const PAINTED_MARK_SCALE = 0.8;
const WHITE = '#ffffffff';

const svgIcon = (svg: string, fill: string) =>
  Gio.BytesIcon.new(new GLib.Bytes(new TextEncoder().encode(svg.replace('fill="white"', `fill="${fill}"`))));

const LAYERS = [
  { svg: secondary, direction: 1, pivot: [0.58, 0.69] },
  { svg: primary, direction: -1, pivot: [0.4, 0.3] },
] as const;

export interface Launcher {
  button: St.Button;
  resize(size: number): void;
}

interface MarkPaint {
  fills: string[];
  edge: string | null;
}

function markPaint(button: St.Button, panel: St.Widget): () => MarkPaint {
  let shaded = { key: '', shade: '' };
  return () => {
    const foreground = button.peek_theme_node()?.get_foreground_color().to_string() ?? WHITE;
    const paint = appIcons.paint;
    const ink = paint?.ink ?? foreground;
    const backdrops = taskbarBackdrops(panel, wallpaperFloor);
    if (!backdrops.length) return { fills: [paint?.shade ?? ink, ink], edge: null };
    const key = [ink, paint?.shade, ...backdrops].join();
    if (key !== shaded.key) shaded = { key, shade: paint ? markShade(ink, paint.shade, backdrops) : monochromeShade(ink, backdrops) };
    const edge = wallpaperFloor.busy && showsWallpaper(panel) ? markEdge(shaded.shade, backdrops[0]) : null;
    return { fills: [shaded.shade, ink], edge };
  };
}

function animatedMark(button: St.Button, panel: St.Widget): [St.Widget, (size: number) => void] {
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
  const current = markPaint(button, panel);
  let painted = '';
  const paint = () => {
    const { fills, edge } = current();
    painted = [...fills, edge].join();
    LAYERS.forEach((layer, index) => {
      icons[index].icon_size = Math.round(size * (appIcons.paint ? PAINTED_MARK_SCALE : 1));
      icons[index].gicon = svgIcon(layer.svg, fills[index]);
    });
    icons[0].style = `icon-shadow: ${edge ? `0 0 1px 1px ${edge}` : 'none'};`;
  };
  const repaint = () => {
    const { fills, edge } = current();
    if ([...fills, edge].join() !== painted) paint();
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
