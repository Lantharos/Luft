import type Clutter from 'gi://Clutter';
import St from 'gi://St';

import {descendants, named} from '../../lib/actors.js';
import {checks} from '../../lib/check.js';
import {captureArea, captureFrame, type Frame} from '../../lib/screenshots.js';
import {settled} from '../../lib/wait.js';
import {withScheme} from '../../apps/lib/palette.js';

const {require} = checks('Post');
const ZOOM = 8;
const PEEK = 24;

export const indicator = () => named('kestrel-taskbar-post');
const status = () => named('kestrel-taskbar-status')!;
const icons = (actor: Clutter.Actor) => descendants(actor).filter((child): child is St.Icon => child instanceof St.Icon && child.mapped);
const left = (actor: Clutter.Actor) => Math.round(actor.get_transformed_extents().get_x());
const right = (actor: Clutter.Actor) => left(actor) + Math.round(actor.get_transformed_extents().get_width());
const top = (actor: Clutter.Actor) => actor.get_transformed_extents().get_y();
const middle = (actor: Clutter.Actor) => top(actor) + actor.get_transformed_extents().get_height() / 2;

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

/** The tray close up: Post and the status icons, with a little of what's around them. */
export async function captureTray(name: string) {
  const post = indicator()!;
  const [x, y] = post.get_transformed_position();
  const width = right(status()) - Math.round(x);
  await captureArea(name, {x: Math.round(x) - PEEK, y: Math.round(y) - PEEK / 2, width: width + 2 * PEEK, height: Math.round(post.height) + PEEK});
}

/**
 * Post's icon sits in the row of the network and sound icons as one of them: the same size, weight and line, as far
 * from the next icon as they are from each other, in a button of its own 1 or 2 pixels from theirs.
 */
export async function checkTray() {
  await settled();
  const post = indicator()!;
  const [own] = icons(post);
  const shown = icons(status()).sort((a, b) => left(a) - left(b));
  const row = [own!, ...shown];
  const gaps = row.slice(1).map((icon, index) => left(icon) - right(row[index]!));
  const between = left(status()) - right(post);
  console.log(`Post in the tray: gaps between the icons ${gaps.join(', ')}px, ${between}px between the buttons, icons ${row.map(icon => `${icon.width}×${icon.height}`).join(', ')}`);
  require(gaps.every(gap => gap === gaps[0]), 'Post’s icon is as far from the network icon as the status icons are from each other');
  require(between >= 1 && between <= 2, 'Post’s button sits 1 or 2 pixels from the status button');
  require(shown.every(icon => icon.width === own!.width && icon.height === own!.height), 'Post’s icon is the size of the status icons');
  require(row.every(icon => Math.abs(middle(icon) - middle(own!)) < 1), 'and lines up with them');
  const weights = await Promise.all(shown.map((icon, index) => inkOf(icon, `post-weight-status-${index}`)));
  const weight = await inkOf(own!, 'post-weight-own');
  console.log(`Ink: Post ${weight.toFixed(3)}, the status icons ${weights.map(value => value.toFixed(3)).join(', ')}`);
  require(weights.some(other => Math.abs(other - weight) / other < 0.35), 'Post’s icon is about as heavy as the icons beside it');
  await captureTray('post-tray-dark');
  await withScheme('light', async () => {
    await settled();
    await captureTray('post-tray-light');
  });
}
