import { toneOf } from '../../../appearance/color.js';
import type { WallpaperFloor } from '../../wallpaper/floor.js';
import type { Scheme } from './schemeThemes.js';

const LIGHT_FLOOR = 62;
const DARK_FLOOR = 38;

// The taskbar always sits on the wallpaper, so its glass is light over a
// clearly light bottom of the wallpaper and dark over a clearly dark one.
// In between, and when pure black makes it opaque, it follows the style.
export function taskbarScheme(style: Scheme, opaque: boolean, floor: WallpaperFloor): Scheme {
  if (opaque || !floor.color) return style;
  const tone = toneOf(floor.color);
  if (tone >= LIGHT_FLOOR) return 'light';
  if (tone <= DARK_FLOOR) return 'dark';
  return style;
}
