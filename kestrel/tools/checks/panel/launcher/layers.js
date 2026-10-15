import Clutter from 'gi://Clutter';

import {renderedFrame} from '../../lib/screenshots.js';
import {contrast, luminance} from '../../system/lib/colors.js';

const COVERED = 0.97;
const UNCOVERED = 0.03;
const RING = 2;

async function shot(area) {
  const {pixbuf} = await renderedFrame(area);
  const [width, height, stride, channels, pixels] =
    [pixbuf.get_width(), pixbuf.get_height(), pixbuf.get_rowstride(), pixbuf.get_n_channels(), pixbuf.get_pixels()];
  return {width, height, at: (x, y) => [0, 1, 2].map(channel => pixels[y * stride + x * channels + channel])};
}

async function coverage(icon, area) {
  const effect = new Clutter.BrightnessContrastEffect();
  const style = icon.style;
  icon.style = 'icon-shadow: none;';
  icon.add_effect(effect);
  try {
    effect.set_brightness_full(1, 1, 1);
    const white = await shot(area);
    effect.set_brightness_full(-1, -1, -1);
    const black = await shot(area);
    return (x, y) => {
      const [lit, dark] = [white.at(x, y), black.at(x, y)];
      return lit.reduce((sum, value, channel) => sum + value - dark[channel], 0) / (3 * 255);
    };
  } finally {
    icon.remove_effect(effect);
    icon.style = style;
  }
}

function meanHex(colors) {
  const mean = colors.reduce((sum, color) => sum.map((value, channel) => value + color[channel] / colors.length), [0, 0, 0]);
  return `#${mean.map(channel => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;
}

function touches(covered, x, y, width, height) {
  for (let dy = -RING; dy <= RING; dy++) {
    for (let dx = -RING; dx <= RING; dx++) {
      const [nx, ny] = [x + dx, y + dy];
      if (nx >= 0 && ny >= 0 && nx < width && ny < height && covered(nx, ny) > UNCOVERED) return true;
    }
  }
  return false;
}

async function measureLayer(layers, index, area) {
  layers.forEach((layer, other) => (layer.opacity = other === index ? 255 : 0));
  const covered = await coverage(layers[index], area);
  const drawn = await shot(area);
  let densest = 0;
  for (let y = 0; y < drawn.height; y++)
    for (let x = 0; x < drawn.width; x++) densest = Math.max(densest, covered(x, y));
  const fill = [];
  const around = [];
  for (let y = 0; y < drawn.height; y++) {
    for (let x = 0; x < drawn.width; x++) {
      const share = covered(x, y);
      if (share >= COVERED * densest) fill.push(drawn.at(x, y));
      else if (share <= UNCOVERED && touches(covered, x, y, drawn.width, drawn.height)) around.push(drawn.at(x, y));
    }
  }
  return {fill: meanHex(fill), around: meanHex(around)};
}

export async function measureMark(layers, area) {
  try {
    const [secondary, primary] = [await measureLayer(layers, 0, area), await measureLayer(layers, 1, area)];
    return {
      secondary: contrast(secondary.fill, secondary.around),
      primary: contrast(primary.fill, primary.around),
      partners: contrast(secondary.fill, primary.fill),
      darker: luminance(secondary.fill) < luminance(primary.fill),
    };
  } finally {
    for (const layer of layers) layer.opacity = 255;
  }
}
