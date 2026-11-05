import type { EffectSurface, Extension, ScreenEffectBase } from '@luft/extension-api';

import { rgb } from '../color.js';
import type { Granted } from '../rules.js';

const SHIMMER_RATE = 20;
const DECLARATIONS = 'uniform vec3 lines_color;';

const LOOKS: Record<string, string> = {
  lines: `
float rule = 1.0 - smoothstep(0.0, 1.5, abs(outline_position.y - 1.0));
outline_color = vec4(lines_color, 1.0) * rule * 0.8 * outline_inside(outline_position);`,
  scanlines: `
float line = step(0.5, fract(outline_position.y / 3.0));
outline_color = vec4(lines_color, 1.0) * line * 0.07 * outline_inside(outline_position);`,
  shimmer: `
float wave = pow(0.5 + 0.5 * sin(outline_position.x * 0.012 - outline_time * 1.4), 18.0);
float rule = 1.0 - smoothstep(0.0, 1.5, abs(outline_position.y - 1.0));
outline_color = vec4(lines_color, 1.0) * rule * (0.25 + wave * 0.75) * outline_inside(outline_position);`,
};

export function tuneSurfaceLines({ settings, appearance }: Extension<Granted>, lines: ScreenEffectBase): void {
  const chosen = settings.get<string>('surface-color');
  lines.set('lines_color', ...rgb(chosen === 'accent' ? appearance.accent : chosen));
}

export function addSurfaceLines(phosphor: Extension<Granted>): ScreenEffectBase | null {
  const { settings, screenEffects, appearance, t } = phosphor;
  const look = settings.get<string>('surface-lines');
  if (look === 'off') return null;
  const lines = screenEffects.addSurfaceOverlay({
    label: t('surface-lines'),
    surfaces: settings.get<EffectSurface[]>('surface-places'),
    declarations: DECLARATIONS,
    shader: LOOKS[look],
    animated: look === 'shimmer' && !appearance.reducedMotion ? SHIMMER_RATE : false,
  });
  tuneSurfaceLines(phosphor, lines);
  return lines;
}
