import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import { GUST_PARTS, GUST_SCALE, gustPartSvg, type GustFill, type GustFills, type GustPart } from '../../../../../../packages/web/ui/src/taskbar/gust';
import { gustFills } from './fills.js';
import { taskbarBackdrops } from '../backdrop.js';
import { appIcons } from '../../../appearance/icons/appIcons.js';
import { animateActor, pressable, Spring } from '../../../shared/motion/motion.js';
import { wallpaperFloor, type Backdrop } from '../../wallpaper/floor.js';
import type { TaskbarLayout } from '../preferences/taskbarPreferences.js';
import { clampUnit } from '../../../shared/math.js';
import { localized, t } from '../../../shared/i18n/index.js';

const WHITE = '#ffffffff';
const WAVE_TILT = -14;

const svgIcon = (part: GustPart, fill: GustFill) =>
  Gio.BytesIcon.new(new GLib.Bytes(new TextEncoder().encode(gustPartSvg(part, fill))));

export interface GustButton {
  button: St.Button;
  resize(size: number): void;
}

type BackdropOf = (button: St.Button) => Backdrop;

const wholeFloor: BackdropOf = () => wallpaperFloor;

export function floorAlong(panel: St.Widget, screen: () => TaskbarLayout): BackdropOf {
  return button => {
    if (!screen().vertical || !panel.height) return wallpaperFloor;
    const [, y] = button.get_transformed_position();
    const [, panelY] = panel.get_transformed_position();
    return wallpaperFloor.around(clampUnit((y - panelY + button.height / 2) / panel.height));
  };
}

function buttonFills(button: St.Button, surface: () => St.Widget, backdropOf: BackdropOf): () => GustFills {
  let painted = { key: '', fills: gustFills(WHITE, null, []) };
  return () => {
    const foreground = button.peek_theme_node()?.get_foreground_color().to_string() ?? WHITE;
    const paint = appIcons.gustPaint;
    const backdrops = taskbarBackdrops(surface(), backdropOf(button));
    const key = [foreground, paint?.ink, paint?.shade, ...backdrops].join();
    if (key !== painted.key) painted = { key, fills: gustFills(foreground, paint, backdrops) };
    return painted.fills;
  };
}

function animatedPebble(button: St.Button, surface: () => St.Widget, backdropOf: BackdropOf): [St.Widget, (size: number) => void] {
  const pebble = new St.Widget({ layout_manager: new Clutter.BinLayout() });
  const icons = Object.fromEntries(GUST_PARTS.map(part => {
    const icon = new St.Icon({ style: part === 'wave' ? null : 'icon-shadow: none;' });
    icon.set_pivot_point(0.5, 0.5);
    pebble.add_child(icon);
    return [part, icon];
  })) as Record<GustPart, St.Icon>;
  const tilt = () => animateActor(icons.wave, { rotation_angle_z: button.hover && !button.pressed ? WAVE_TILT : 0, spring: Spring.snappy });
  button.connect('notify::hover', tilt);
  button.connect('notify::pressed', tilt);
  const current = buttonFills(button, surface, backdropOf);
  let painted: GustFills | null = null;
  const paint = () => {
    const fills = painted = current();
    for (const part of GUST_PARTS) icons[part].gicon = svgIcon(part, fills[part]);
  };
  const repaint = () => {
    if (current() !== painted) paint();
  };
  const unwatch = [appIcons.watch(paint), wallpaperFloor.watch(repaint)];
  pebble.connect('destroy', () => unwatch.forEach(stop => stop()));
  button.connect('style-changed', repaint);
  if (backdropOf !== wholeFloor) button.connect('notify::allocation', repaint);
  return [pebble, size => {
    pebble.set_size(size, size);
    for (const icon of Object.values(icons)) icon.icon_size = size;
    paint();
  }];
}

export function createGustButton(activate: () => void, size: number, surface: () => St.Widget, backdropOf = wholeFloor): GustButton {
  const button = new St.Button({
    style_class: 'kestrel-task-button', clip_to_allocation: true,
    can_focus: true, track_hover: true,
  });
  localized(button, () => (button.accessible_name = t('taskbar-gust')));
  const [pebble, resizePebble] = animatedPebble(button, surface, backdropOf);
  button.child = pebble;
  pressable(button, pebble);
  button.connect('clicked', activate);
  const resize = (buttonSize: number) => {
    button.set_size(buttonSize, buttonSize);
    resizePebble(Math.round(buttonSize * GUST_SCALE));
  };
  resize(size);
  return { button, resize };
}
