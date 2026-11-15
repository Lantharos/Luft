import type { Extension, WindowEffectHandle } from '@luft/extension-api';

import { colorSetting } from '../color.js';
import type { Granted } from '../rules.js';

const DECLARATIONS = `
uniform vec3 shadow_color;
uniform float shadow_size;`;

const LOOKS: Record<string, string> = {
  hard: `
float cast = outline_inside(outline_position - vec2(shadow_size));
float shown = cast * (1.0 - outline_inside(outline_position));
outline_color = vec4(shadow_color, 1.0) * shown;`,
  soft: `
float from_cast = outline_distance(outline_position - vec2(0.0, shadow_size * 0.4));
float cast = exp(-max(from_cast, 0.0) * 2.5 / shadow_size) * 0.6;
float shown = cast * (1.0 - outline_inside(outline_position));
outline_color = vec4(shadow_color, 1.0) * shown;`,
};

const REACH: Record<string, number> = { hard: 1, soft: 2 };

export function tuneShadow(phosphor: Extension<Granted>, shadow: WindowEffectHandle): void {
  shadow.set('shadow_color', ...colorSetting(phosphor, 'shadow-color'));
}

export function addShadow(phosphor: Extension<Granted>): WindowEffectHandle | null {
  const { settings, screenEffects, t } = phosphor;
  const look = settings.get<string>('shadow');
  if (look === 'off') return null;
  const size = settings.get<number>('shadow-size');
  const shadow = screenEffects.addWindowOverlay({
    label: t('shadow'),
    declarations: DECLARATIONS,
    shader: LOOKS[look],
    margin: Math.ceil(size * REACH[look]) + 1,
    inset: 1,
    fullscreen: settings.get<boolean>('windows-fullscreen'),
    match: window => !window.maximized && window.kind !== 'utility',
  });
  shadow.set('shadow_size', size);
  tuneShadow(phosphor, shadow);
  return shadow;
}
