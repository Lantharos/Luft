import type { Extension, WindowEffectHandle } from '@luft/extension-api';

import { rgb } from '../color.js';
import type { AppRules, Granted } from '../rules.js';

const DECLARATIONS = 'uniform float overlay_strength;\nuniform vec3 overlay_tint;';

const LOOKS: Record<string, string> = {
  scanlines: `
float line = step(0.5, fract(outline_position.y / 3.0));
outline_color = vec4(0.0, 0.0, 0.0, line * overlay_strength * 0.45) * outline_inside(outline_position);`,
  tint: `
outline_color = vec4(overlay_tint, 1.0) * overlay_strength * 0.35 * outline_inside(outline_position);`,
  grain: `
vec2 cell = floor(outline_position / 2.0);
float grain = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
outline_color = vec4(vec3(grain), 1.0) * overlay_strength * 0.12 * outline_inside(outline_position);`,
  vignette: `
vec2 from_middle = outline_position / outline_size * 2.0 - 1.0;
float dark = smoothstep(0.4, 1.5, length(from_middle));
outline_color = vec4(0.0, 0.0, 0.0, dark * overlay_strength) * outline_inside(outline_position);`,
  bezel: `
float depth = -outline_distance(outline_position);
float shade = 1.0 - smoothstep(0.0, 18.0, depth);
outline_color = vec4(0.0, 0.0, 0.0, shade * (0.4 + overlay_strength * 0.6)) * outline_inside(outline_position);`,
};

const BEZEL_INSET = 18;

export function tuneOverlay({ settings, appearance }: Extension<Granted>, overlay: WindowEffectHandle): void {
  overlay.set('overlay_strength', settings.get<number>('overlay-strength'));
  overlay.set('overlay_tint', ...rgb(appearance.accent));
}

export function addOverlay(phosphor: Extension<Granted>, rules: AppRules): WindowEffectHandle | null {
  const { settings, screenEffects, t } = phosphor;
  const look = settings.get<string>('overlay');
  if (look === 'off') return null;
  const overlay = screenEffects.addWindowOverlay({
    label: t('overlay'),
    declarations: DECLARATIONS,
    shader: LOOKS[look],
    inset: look === 'bezel' ? BEZEL_INSET : undefined,
    fullscreen: settings.get<boolean>('windows-fullscreen'),
    match: window => rules.applies('overlay', window),
  });
  tuneOverlay(phosphor, overlay);
  return overlay;
}
