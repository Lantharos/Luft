import { atTone, type Rgb, type TonalPalette } from './color.js';
import type { Role } from './palette.js';

const ANSI_HUES = [25, 145, 95, 255, 330, 200];
const ANSI_CHROMA = 0.15;
const HARMONIZE_LIMIT = 15;

const TONES = {
  light: { normal: 40, bright: 46, black: 20, brightBlack: 45, white: 75, brightWhite: 90 },
  dark: { normal: 70, bright: 80, black: 20, brightBlack: 55, white: 80, brightWhite: 95 },
};

function harmonize(hue: number, towards: number): number {
  const difference = ((towards - hue + 540) % 360) - 180;
  return (hue + Math.sign(difference) * Math.min(Math.abs(difference) / 2, HARMONIZE_LIMIT) + 360) % 360;
}

export function terminalColors(colors: Record<Role, Rgb>, neutral: TonalPalette, neutralVariant: TonalPalette, seedHue: number, dark: boolean): Record<string, Rgb> {
  const tones = dark ? TONES.dark : TONES.light;
  const hues = ANSI_HUES.map(hue => harmonize(hue, seedHue));
  const ansi = [
    atTone(neutral, tones.black),
    ...hues.map(hue => atTone({ hue, chroma: ANSI_CHROMA }, tones.normal)),
    atTone(neutralVariant, tones.white),
    atTone(neutralVariant, tones.brightBlack),
    ...hues.map(hue => atTone({ hue, chroma: ANSI_CHROMA }, tones.bright)),
    atTone(neutral, tones.brightWhite),
  ];
  return {
    foreground: colors.onSurface,
    background: colors.surface,
    cursor: colors.primary,
    cursorText: colors.onPrimary,
    selectionBackground: colors.primaryContainer,
    selectionForeground: colors.onPrimaryContainer,
    ...Object.fromEntries(ansi.map((color, index) => [`color${index}`, color])),
  };
}
