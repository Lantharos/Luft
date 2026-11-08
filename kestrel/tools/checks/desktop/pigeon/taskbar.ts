import type Clutter from 'gi://Clutter';
import St from 'gi://St';

import {descendants, named} from '../../lib/actors.js';
import {checks} from '../../lib/check.js';
import {captureArea, captureFrame, type Frame} from '../../lib/screenshots.js';

const {require, eventually} = checks('Pigeon');
const ZOOM = 8;
const PEEK = 24;

const icons = (actor: Clutter.Actor) => descendants(actor).filter((child): child is St.Icon => child instanceof St.Icon && child.mapped);
const left = (actor: Clutter.Actor) => Math.round(actor.get_transformed_extents().get_x());
const right = (actor: Clutter.Actor) => left(actor) + Math.round(actor.get_transformed_extents().get_width());
const statusIcons = () => icons(named('kestrel-taskbar-status')!).sort((a, b) => left(a) - left(b));

function islandOf(actor: Clutter.Actor): Clutter.Actor {
  for (let parent = actor.get_parent(); parent; parent = parent.get_parent())
    if (parent instanceof St.BoxLayout && parent.has_style_class_name('kestrel-taskbar')) return parent;
  throw new Error('The element sits in no taskbar island');
}

function insets(element: Clutter.Actor) {
  const [own] = icons(element);
  return [left(own!) - left(element), right(element) - right(own!)];
}

function ink(frame: Frame) {
  const {pixbuf} = frame;
  const [width, height, stride, size, pixels] = [pixbuf.get_width(), pixbuf.get_height(), pixbuf.get_rowstride(), pixbuf.get_n_channels(), pixbuf.get_pixels()];
  const light = (x: number, y: number) => {
    const offset = y * stride + x * size;
    return 0.2126 * pixels[offset]! + 0.7152 * pixels[offset + 1]! + 0.0722 * pixels[offset + 2]!;
  };
  const edge: number[] = [];
  for (let x = 0; x < width; x++) edge.push(light(x, 0), light(x, height - 1));
  for (let y = 0; y < height; y++) edge.push(light(0, y), light(width - 1, y));
  const background = Math.min(...edge);
  let lit = 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) lit += Math.max(0, light(x, y) - background) / (255 - background);
  return lit / (width * height);
}

async function inkOf(icon: St.Icon, name: string) {
  const [x, y] = icon.get_transformed_position();
  const frame = await captureFrame({x: Math.round(x), y: Math.round(y), width: Math.round(icon.width), height: Math.round(icon.height)});
  frame.saveZoomed(name, ZOOM);
  return ink(frame);
}

/** Pigeon's element as the session started, before anything hovered it: wide enough for its icon and its padding. */
export async function checkFirstLayout(element: St.Widget) {
  const [x, y] = element.get_transformed_position();
  await captureArea('pigeon-taskbar-first-frame', {x: Math.round(x) - PEEK, y: Math.round(y), width: Math.round(element.width) + 2 * PEEK, height: Math.round(element.height)});
  const node = element.get_theme_node();
  const padding = [node.get_padding(St.Side.LEFT), node.get_padding(St.Side.RIGHT)].map(Math.round);
  console.log(`Pigeon at the start of the session: its icon ${insets(element).join('/')}px in from its edges, padding ${padding.join('/')}px`);
  require(insets(element).join() === padding.join(), 'Pigeon’s element fits its icon and padding from the start, without being hovered');
}

/** Pigeon's icon is the size of the status icons next to it, and sits as far in from its edges as they do in their button. */
export async function checkIcon(element: Clutter.Actor) {
  await eventually(() => element.get_transition('width') === null, 'Pigeon has finished coming into the taskbar');
  const status = named('kestrel-taskbar-status')!;
  const [own] = icons(element);
  const shown = statusIcons();
  const statusInset = [left(shown[0]!) - left(status), right(status) - right(shown.at(-1)!)];
  const island = icons(islandOf(element)).sort((a, b) => left(a) - left(b));
  const gaps = island.slice(1).map((icon, index) => left(icon) - right(island[index]!));
  console.log(`Pigeon spacing: its icon ${insets(element).join('/')}px in from its edges, the status icons ${statusInset.join('/')}px, gaps between the icons of its island ${gaps.join(', ')}px`);
  require(insets(element).join() === statusInset.join(), 'Pigeon’s icon sits as far from its edges as the status icons do');
  const sizes = shown.map(icon => `${icon.icon_name} ${icon.width}×${icon.height}`);
  console.log(`Pigeon’s icon ${own!.width}×${own!.height}, the status icons ${sizes.join(', ')}`);
  require(shown.every(icon => icon.width === own!.width && icon.height === own!.height), 'Pigeon’s icon is the size of the status icons');
  const weights = await Promise.all(shown.map((icon, index) => inkOf(icon, `pigeon-weight-status-${index}`)));
  const weight = await inkOf(own!, 'pigeon-weight-own');
  console.log(`Ink: Pigeon ${weight.toFixed(3)}, the status icons ${weights.map(value => value.toFixed(3)).join(', ')}`);
}
