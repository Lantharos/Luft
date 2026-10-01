import { atTone, isNeutral, toHex, type Rgb, type Seed, type TonalPalette } from './color.js';
import { terminalColors } from './terminal.js';

type PaletteName = 'primary' | 'secondary' | 'tertiary' | 'error' | 'neutral' | 'neutralVariant';
type Tones = [palette: PaletteName, light: number, dark: number];

const ERROR_HUE = 27;
const ERROR_CHROMA = 0.18;
const TERTIARY_ROTATION = 60;

const ROLES = {
  primary: ['primary', 40, 80],
  onPrimary: ['primary', 100, 20],
  primaryContainer: ['primary', 90, 30],
  onPrimaryContainer: ['primary', 10, 90],
  secondary: ['secondary', 40, 80],
  onSecondary: ['secondary', 100, 20],
  secondaryContainer: ['secondary', 90, 30],
  onSecondaryContainer: ['secondary', 10, 90],
  tertiary: ['tertiary', 40, 80],
  onTertiary: ['tertiary', 100, 20],
  tertiaryContainer: ['tertiary', 90, 30],
  onTertiaryContainer: ['tertiary', 10, 90],
  error: ['error', 40, 80],
  onError: ['error', 100, 20],
  errorContainer: ['error', 90, 30],
  onErrorContainer: ['error', 10, 90],
  surface: ['neutral', 98, 6],
  surfaceDim: ['neutral', 87, 6],
  surfaceBright: ['neutral', 98, 24],
  surfaceContainerLowest: ['neutral', 100, 4],
  surfaceContainerLow: ['neutral', 96, 10],
  surfaceContainer: ['neutral', 94, 12],
  surfaceContainerHigh: ['neutral', 92, 17],
  surfaceContainerHighest: ['neutral', 90, 22],
  onSurface: ['neutral', 10, 90],
  surfaceVariant: ['neutralVariant', 90, 30],
  onSurfaceVariant: ['neutralVariant', 30, 80],
  outline: ['neutralVariant', 50, 60],
  outlineVariant: ['neutralVariant', 80, 30],
  inverseSurface: ['neutral', 20, 90],
  inverseOnSurface: ['neutral', 95, 20],
  inversePrimary: ['primary', 80, 40],
} satisfies Record<string, Tones>;

export type Role = keyof typeof ROLES;
export type Colors = Record<Role, string>;

const PURE_BLACK_TONES: Partial<Record<Role, number>> = {
  surface: 0,
  surfaceDim: 0,
  surfaceBright: 18,
  surfaceContainerLowest: 0,
  surfaceContainerLow: 4,
  surfaceContainer: 8,
  surfaceContainerHigh: 12,
  surfaceContainerHighest: 17,
};

const MONOCHROME_TONES: Partial<Record<Role, [light: number, dark: number]>> = {
  primary: [10, 100],
  onPrimary: [100, 10],
  primaryContainer: [25, 85],
  onPrimaryContainer: [100, 0],
  inversePrimary: [100, 10],
};

export interface Scheme {
  colors: Colors;
  terminal: Record<string, string>;
}

export interface Palette {
  light: Scheme;
  dark: Scheme;
}

function tonalPalettes({ hue, chroma }: Seed): Record<PaletteName, TonalPalette> {
  return {
    primary: { hue, chroma },
    secondary: { hue, chroma: chroma * 0.35 },
    tertiary: { hue: (hue + TERTIARY_ROTATION) % 360, chroma: chroma * 0.7 },
    error: { hue: ERROR_HUE, chroma: ERROR_CHROMA },
    neutral: { hue, chroma: Math.min(0.02, chroma * 0.12) },
    neutralVariant: { hue, chroma: Math.min(0.032, chroma * 0.2) },
  };
}

function scheme(palettes: Record<PaletteName, TonalPalette>, seed: Seed, dark: boolean, pureBlack: boolean): Scheme {
  const overrides = isNeutral(seed) ? MONOCHROME_TONES : {};
  const colors = Object.fromEntries(Object.entries(ROLES).map(([role, [palette, ...tones]]) => {
    const [light, darkTone] = overrides[role as Role] ?? tones;
    const tone = dark ? (pureBlack ? PURE_BLACK_TONES[role as Role] : undefined) ?? darkTone : light;
    return [role, atTone(palettes[palette], tone)];
  })) as Record<Role, Rgb>;
  const hex = (entries: Record<string, Rgb>) =>
    Object.fromEntries(Object.entries(entries).map(([key, color]) => [key, toHex(color)]));
  return {
    colors: hex(colors) as Colors,
    terminal: hex(terminalColors(colors, palettes.neutral, palettes.neutralVariant, seed, dark)),
  };
}

export function buildPalette(seed: Seed, pureBlack: boolean): Palette {
  const palettes = tonalPalettes(seed);
  return { light: scheme(palettes, seed, false, false), dark: scheme(palettes, seed, true, pureBlack) };
}
