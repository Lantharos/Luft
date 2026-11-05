import type { Extension, WindowEffectHandle } from '@luft/extension-api';

import { rgb } from '../color.js';
import type { AppRules, Granted } from '../rules.js';

const GLOW_REACH = 24;

const DECLARATIONS = `
uniform float border_width;
uniform vec3 border_first;
uniform vec3 border_second;
uniform float border_speed;
uniform float border_pulse;
uniform float border_reach;

float border_turn(vec2 position) {
  vec2 from_middle = (position - outline_size * 0.5) / outline_size;
  return atan(from_middle.y, from_middle.x) / 6.2831853 + 0.5;
}`;

const SOLID = 'vec3 color = border_first;';
const GRADIENT = `
float along = fract(border_turn(outline_position) + outline_time * border_speed);
vec3 color = mix(border_first, border_second, abs(along * 2.0 - 1.0));`;

const SHAPE = `
float distance_out = outline_distance(outline_position);
float pulse = 1.0 - border_pulse * (0.5 + 0.5 * sin(outline_time * 2.4));
float edge = clamp(0.5 - (abs(distance_out + border_width * 0.5) - border_width * 0.5) * outline_scale, 0.0, 1.0);
float halo = border_reach > 0.0 ? exp(-max(distance_out, 0.0) * 4.0 / border_reach) * 0.55 * step(0.0, distance_out) : 0.0;
outline_color = vec4(color * max(edge, halo), edge) * pulse;`;

/** Sets what can change without building the border again. */
export function tuneBorder({ settings, appearance }: Extension<Granted>, border: WindowEffectHandle): void {
  const color = (key: string) => {
    const chosen = settings.get<string>(key);
    return rgb(chosen === 'accent' ? appearance.accent : chosen);
  };
  border.set('border_first', ...color('border-color'));
  border.set('border_second', ...color(settings.get<string>('border') === 'gradient' ? 'border-second-color' : 'border-color'));
}

export function addBorder(phosphor: Extension<Granted>, rules: AppRules): WindowEffectHandle | null {
  const { settings, screenEffects, appearance, t } = phosphor;
  const style = settings.get<string>('border');
  if (style === 'off') return null;
  const motion = settings.get<string>('border-motion');
  const width = settings.get<number>('border-width');
  const focusedOnly = settings.get<boolean>('border-focused');
  const glowing = style === 'glow';
  const border = screenEffects.addWindowOverlay({
    label: t('border'),
    declarations: DECLARATIONS,
    shader: `${style === 'gradient' ? GRADIENT : SOLID}\n${SHAPE}`,
    margin: glowing ? GLOW_REACH : 0,
    inset: width + 1,
    animated: motion !== 'still' && !appearance.reducedMotion,
    fullscreen: settings.get<boolean>('windows-fullscreen'),
    followsFocus: focusedOnly,
    match: window => (!focusedOnly || window.focused) && rules.applies('border', window),
  });
  border.set('border_width', width);
  tuneBorder(phosphor, border);
  border.set('border_speed', motion === 'flow' ? 0.12 : 0);
  border.set('border_pulse', motion === 'pulse' ? 0.45 : 0);
  border.set('border_reach', glowing ? GLOW_REACH : 0);
  return border;
}
