import type { Extension } from '@luft/extension-api';

import type { Granted } from './rules.js';

export function rgb(hex: string): [number, number, number] {
  const [red, green, blue] = [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16) / 255);
  return [red, green, blue];
}

/** A colour setting as red, green and blue, with the accent colour for `accent`. */
export function colorSetting({ settings, appearance }: Extension<Granted>, key: string): [number, number, number] {
  const chosen = settings.get<string>(key);
  return rgb(chosen === 'accent' ? appearance.accent : chosen === 'wallpaper' ? appearance.wallpaperAccent : chosen);
}
