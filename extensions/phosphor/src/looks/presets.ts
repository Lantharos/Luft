import type { SettingDescription, SettingValue } from '@luft/extension-api';

import manifest from '../../extension.toml';

export type Values = Record<string, SettingValue>;

const PLACEMENT = new Set(['look', 'windows-fullscreen', 'filters-scope', 'filters-fullscreen', 'filters-captured', 'surface-places']);
const COLOR = /^(#[0-9a-f]{6}|accent|wallpaper)$/i;

const decided = new Map((manifest as { settings: SettingDescription[] }).settings.filter(({ key }) => !PLACEMENT.has(key)).map(setting => [setting.key, setting]));

/** Every setting a look decides, with its default. Where effects go and whether they stay on fullscreen stay people's own. */
export const DEFAULTS: Values = Object.fromEntries([...decided].map(([key, setting]) => [key, setting.default]));

/** Whether a setting a look decides can hold this value, for looks read from a file. */
export function fits(key: string, value: unknown): value is SettingValue {
  const setting = decided.get(key);
  switch (setting?.type) {
    case 'switch': return typeof value === 'boolean';
    case 'slider': return typeof value === 'number' && value >= setting.min && value <= setting.max;
    case 'choice': return setting.options.some(option => option.value === value);
    case 'color': return typeof value === 'string' && COLOR.test(value);
    default: return false;
  }
}

const PRESETS: Record<string, Values> = {
  terminal: {
    'desktop-crt': true, 'crt-scanlines': 0.5, 'crt-curvature': 0.35, 'crt-mask': 0.3,
    grade: 'duotone', 'grade-strength': 1, 'duotone-dark': '#031a07', 'duotone-light': '#8bf58a', bloom: 0.45,
    border: 'glow', 'border-color': '#8bf58a', 'surface-lines': 'scanlines', 'surface-color': '#8bf58a', 'app-lines': 'scanlines',
    'open-effect': 'crt', 'close-effect': 'crt',
  },
  amber: {
    'desktop-crt': true, 'crt-scanlines': 0.55, 'crt-curvature': 0.45, 'crt-mask': 0.35, 'crt-mask-type': 'shadow', 'crt-line-count': 400,
    grade: 'duotone', 'grade-strength': 1, 'duotone-dark': '#1a0b00', 'duotone-light': '#ffb347', bloom: 0.5, 'screen-vignette': 0.4,
    border: 'color', 'border-color': '#ffb347', 'surface-lines': 'lines', 'surface-color': '#ffb347',
    'open-effect': 'crt', 'close-effect': 'crt',
  },
  vaporwave: {
    border: 'gradient', 'border-color': '#ff5fa2', 'border-second-color': '#5fd4ff', 'border-width': 3, 'border-motion': 'flow',
    overlay: 'scanlines', 'overlay-strength': 0.25, shadow: 'hard', 'shadow-color': '#5fd4ff', 'shadow-size': 8,
    grade: 'custom', 'grade-strength': 1, 'grade-temperature': -0.15, 'grade-tint': 0.4, 'grade-saturation': 1.3, 'grade-contrast': 1.05,
    'chromatic-aberration': 0.35, bloom: 0.3, 'surface-lines': 'shimmer', 'surface-color': '#ff5fa2',
    'open-effect': 'glitch', 'close-effect': 'glitch',
  },
  noir: {
    grade: 'noir', 'grade-strength': 1, 'screen-grain': 0.45, 'screen-vignette': 0.6, unfocused: 'dim', 'unfocused-strength': 0.35,
    'open-effect': 'dissolve', 'close-effect': 'dissolve',
  },
  vhs: {
    vhs: true, 'vhs-strength': 0.6, 'glitch-bursts': true, 'desktop-crt': true, 'crt-scanlines': 0.3, 'crt-mask': 0,
    grade: 'warm', 'grade-strength': 0.5, 'chromatic-aberration': 0.25, 'open-effect': 'static', 'close-effect': 'static',
  },
  neon: {
    border: 'neon', 'border-width': 2, 'border-glow-size': 28, shadow: 'soft', 'shadow-color': 'accent', unfocused: 'dim', 'unfocused-strength': 0.3,
    bloom: 0.25, 'surface-lines': 'lines', 'app-lines': 'lines', 'open-effect': 'beam', 'close-effect': 'beam',
  },
  pocket: {
    palette: 'pocket', pixelate: 3, 'open-effect': 'pixelate', 'close-effect': 'pixelate',
  },
};

export const isPreset = (name: string) => name === 'plain' || name in PRESETS;

export const presetValues = (name: string): Values => ({ ...DEFAULTS, ...PRESETS[name] });
