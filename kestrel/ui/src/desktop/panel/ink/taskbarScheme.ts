import { toneOf } from '../../../appearance/color.js';
import type { WallpaperFloor } from '../../wallpaper/floor.js';
import type { Scheme } from './schemeThemes.js';

const LIGHT_FLOOR = 62;
const DARK_FLOOR = 38;

export function taskbarScheme(style: Scheme, opaque: boolean, floor: WallpaperFloor): Scheme {
  if (opaque || !floor.color) return style;
  const tone = toneOf(floor.color);
  if (tone >= LIGHT_FLOOR) return 'light';
  if (tone <= DARK_FLOOR) return 'dark';
  return style;
}
