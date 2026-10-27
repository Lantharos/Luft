import {contrast, luminance} from '../../lib/colors.js';
import {measureInk} from '../../panel/backdrops/coverage.js';

const MID_LUMINANCE = 0.18;

async function measureLayer(layers, index, area) {
  layers.forEach((layer, other) => (layer.opacity = other === index ? 255 : 0));
  return measureInk(layers[index], area);
}

export async function measureMark(layers, area) {
  try {
    const [secondary, primary] = [await measureLayer(layers, 0, area), await measureLayer(layers, 1, area)];
    return {
      secondary: contrast(secondary.fill, secondary.around),
      primary: contrast(primary.fill, primary.around),
      partners: contrast(secondary.fill, primary.fill),
      darker: luminance(secondary.fill) < luminance(primary.fill),
      lightFront: luminance(primary.fill) > MID_LUMINANCE,
    };
  } finally {
    for (const layer of layers) layer.opacity = 255;
  }
}
