import { atTone, toHex, type Seed } from '../color.js';

export type IconStyle = 'default' | 'tinted' | 'clear';
export type PaintedStyle = Exclude<IconStyle, 'default'>;

export interface Paint {
  plate: string;
  ink: string;
  shade: string;
  rim: number;
}

const PLATE_CHROMA = 0.03;
const CLEAR_RIM = 0.45;

const withAlpha = (hex: string, alpha: number) => `${hex}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;

function tinted({ hue, chroma }: Seed, dark: boolean): Paint {
  const plate = { hue, chroma: Math.min(PLATE_CHROMA, chroma * 0.3) };
  const accent = { hue, chroma };
  const [plateTone, inkTone, shadeTone] = dark ? [12, 82, 48] : [95, 38, 68];
  return {
    plate: withAlpha(toHex(atTone(plate, plateTone)), 1),
    ink: withAlpha(toHex(atTone(accent, inkTone)), 1),
    shade: withAlpha(toHex(atTone(accent, shadeTone)), 1),
    rim: 0,
  };
}

const clear = (dark: boolean): Paint => ({
  plate: withAlpha('#ffffff', dark ? 0.12 : 0.2),
  ink: withAlpha('#ffffff', 0.94),
  shade: withAlpha('#ffffff', 0.5),
  rim: CLEAR_RIM,
});

export const paints = (seed: Seed, dark: boolean): Record<PaintedStyle, Paint> => ({ tinted: tinted(seed, dark), clear: clear(dark) });

export const GLYPH_PAINT: Paint = { plate: '#00000000', ink: '#ffffffff', shade: '#000000ff', rim: 0 };
