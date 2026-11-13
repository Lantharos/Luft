import { atTone, toHex, type Seed } from '../color.js';

export type IconStyle = 'default' | 'tinted' | 'clear';
export type PaintedStyle = Exclude<IconStyle, 'default'> | 'plain';

export interface Paint {
  plate: string;
  ink: string;
  shade: string;
  rim: number;
  bare: boolean;
}

const PLATE_CHROMA = 0.03;
const CLEAR_RIM = 0.45;
const PLAIN_SHADE = 0.5;
const NO_PLATE = '#00000000';

const withAlpha = (hex: string, alpha: number) => `${hex.slice(0, 7)}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;

function tinted({ hue, chroma }: Seed, dark: boolean): Paint {
  const plate = { hue, chroma: Math.min(PLATE_CHROMA, chroma * 0.3) };
  const accent = { hue, chroma };
  const [plateTone, inkTone, shadeTone] = dark ? [12, 82, 48] : [95, 38, 68];
  return {
    plate: withAlpha(toHex(atTone(plate, plateTone)), 1),
    ink: withAlpha(toHex(atTone(accent, inkTone)), 1),
    shade: withAlpha(toHex(atTone(accent, shadeTone)), 1),
    rim: 0,
    bare: false,
  };
}

const clear = (dark: boolean): Paint => dark
  ? { plate: withAlpha('#ffffff', 0.12), ink: withAlpha('#ffffff', 0.94), shade: withAlpha('#ffffff', 0.5), rim: CLEAR_RIM, bare: false }
  : { plate: withAlpha('#ffffff', 0.45), ink: withAlpha('#1b1b1f', 0.88), shade: withAlpha('#1b1b1f', 0.45), rim: CLEAR_RIM, bare: false };

export const plain = (foreground: string): Paint =>
  ({ plate: NO_PLATE, ink: withAlpha(foreground, 1), shade: withAlpha(foreground, PLAIN_SHADE), rim: 0, bare: true });

export const paints = (seed: Seed, dark: boolean, foreground: string): Record<PaintedStyle, Paint> =>
  ({ tinted: tinted(seed, dark), clear: clear(dark), plain: plain(foreground) });

export const GLYPH_PAINT: Paint = { plate: NO_PLATE, ink: '#ffffffff', shade: '#000000ff', rim: 0, bare: true };
