import { atTone, toHex, type Seed } from '../color.js';

export type IconStyle = 'default' | 'tinted' | 'clear' | 'monochrome';
export type PaintedStyle = Exclude<IconStyle, 'default'>;

export interface Paint {
  plate: string;
  ink: string;
  shade: string;
  rim: number;
  bare: boolean;
}

const PLATE_CHROMA = 0.05;
const INK_CHROMA = 0.012;
const CLEAR_RIM = 0.45;
const NO_PLATE = '#00000000';

const withAlpha = (hex: string, alpha: number) => `${hex.slice(0, 7)}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
const opaque = (hex: string) => withAlpha(hex, 1);

function tinted({ hue, chroma }: Seed, dark: boolean): Paint {
  const plate = { hue, chroma: Math.min(PLATE_CHROMA, chroma * 0.4) };
  const ink = { hue, chroma: Math.min(INK_CHROMA, chroma * 0.1) };
  const [plateTone, inkTone, shadeTone] = dark ? [12, 95, 66] : [91, 16, 50];
  return {
    plate: opaque(toHex(atTone(plate, plateTone))),
    ink: opaque(toHex(atTone(ink, inkTone))),
    shade: opaque(toHex(atTone({ hue, chroma }, shadeTone))),
    rim: 0,
    bare: false,
  };
}

const clear = (dark: boolean): Paint => dark
  ? { plate: withAlpha('#ffffff', 0.12), ink: withAlpha('#ffffff', 0.94), shade: withAlpha('#ffffff', 0.5), rim: CLEAR_RIM, bare: false }
  : { plate: withAlpha('#ffffff', 0.45), ink: withAlpha('#1b1b1f', 0.88), shade: withAlpha('#1b1b1f', 0.45), rim: CLEAR_RIM, bare: false };

const monochrome = (dark: boolean): Paint => dark
  ? { plate: '#181817ff', ink: '#f3f3efff', shade: '#8f8f88ff', rim: 0, bare: false }
  : { plate: '#f3f3efff', ink: '#181817ff', shade: '#8f8f88ff', rim: 0, bare: false };

export const paints = (seed: Seed, dark: boolean): Record<PaintedStyle, Paint> =>
  ({ tinted: tinted(seed, dark), clear: clear(dark), monochrome: monochrome(dark) });

export const GLYPH_PAINT: Paint = { plate: NO_PLATE, ink: '#ffffffff', shade: '#000000ff', rim: 0, bare: true };
