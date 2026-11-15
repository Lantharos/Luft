import type { Extension, WindowEffectHandle } from '@luft/extension-api';

import { colorSetting } from '../color.js';
import type { AppRules, Granted } from '../rules.js';

const FLOW_SPEED = 0.12;
const PULSE_DEPTH = 0.45;
const GLOWING = new Set(['glow', 'neon']);

const DECLARATIONS = `
uniform float border_width;
uniform vec3 border_first;
uniform vec3 border_second;
uniform float border_speed;
uniform float border_pulse;
uniform float border_pulse_rate;
uniform float border_reach;
uniform float border_app;

float border_turn(vec2 position) {
  vec2 from_middle = (position - outline_size * 0.5) / outline_size;
  return atan(from_middle.y, from_middle.x) / 6.2831853 + 0.5;
}

float border_along(vec2 position) {
  vec2 size = outline_size;
  vec2 on = clamp(position, vec2(0.0), size);
  float top = on.y;
  float right = size.x - on.x;
  float bottom = size.y - on.y;
  float nearest = min(min(top, bottom), min(on.x, right));
  if (nearest == top) return on.x;
  if (nearest == right) return size.x + on.y;
  if (nearest == bottom) return 2.0 * size.x + size.y - on.x;
  return 2.0 * (size.x + size.y) - on.y;
}

float border_band(float distance_out, float from, float to) {
  return clamp(0.5 - (abs(distance_out + (from + to) * 0.5) - (to - from) * 0.5) * outline_scale, 0.0, 1.0);
}

vec3 border_hue(float hue) {
  vec3 channels = clamp(abs(fract(hue + vec3(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0) - 1.0, 0.0, 1.0);
  return mix(vec3(1.0), channels, 0.8);
}`;

const FIRST = 'vec3 first = border_app > 0.5 && outline_app_color.r >= 0.0 ? outline_app_color : border_first;';

const COLORS: Record<string, string> = {
  gradient: `${FIRST}
float along = fract(border_turn(outline_position) + outline_time * border_speed);
vec3 color = mix(first, border_second, abs(along * 2.0 - 1.0));`,
  rainbow: `
float around = border_along(outline_position) / (2.0 * (outline_size.x + outline_size.y));
vec3 color = border_hue(around + outline_time * border_speed);`,
};

const SHAPES: Record<string, string> = {
  line: 'float edge = border_band(distance_out, 0.0, border_width);\nfloat halo = 0.0;',
  glow: `float edge = border_band(distance_out, 0.0, border_width);
float halo = exp(-max(distance_out, 0.0) * 4.0 / border_reach) * 0.55 * step(0.0, distance_out);`,
  double: 'float edge = max(border_band(distance_out, 0.0, border_width), border_band(distance_out, border_width * 2.0, border_width * 3.0));\nfloat halo = 0.0;',
  dashed: `float dash = max(12.0, border_width * 6.0) * outline_scale;
float march = fract((border_along(outline_position) * outline_scale - outline_time * border_speed * 400.0) / dash);
float edge = border_band(distance_out, 0.0, border_width) * smoothstep(0.0, 0.08, march) * (1.0 - smoothstep(0.5, 0.58, march));
float halo = 0.0;`,
  neon: `float edge = border_band(distance_out, 0.0, border_width);
float outer = exp(-max(distance_out, 0.0) * 3.0 / border_reach) * step(0.0, distance_out);
float inner = exp(-max(-distance_out - border_width, 0.0) * 6.0 / border_reach) * step(distance_out, -border_width) * 0.5;
float halo = max(outer, inner) * 0.7;
color = mix(color, vec3(1.0), edge * 0.55);`,
};

const SHAPE_OF: Record<string, string> = { glow: 'glow', double: 'double', dashed: 'dashed', neon: 'neon' };

const DRAW = `
float pulse = 1.0 - border_pulse * (0.5 + 0.5 * sin(outline_time * border_pulse_rate));
outline_color = vec4(color * max(edge, halo), edge) * pulse;`;

function shader(style: string): string {
  return [
    COLORS[style] ?? `${FIRST}\nvec3 color = first;`,
    'float distance_out = outline_distance(outline_position);',
    SHAPES[SHAPE_OF[style] ?? 'line'],
    DRAW,
  ].join('\n');
}

function inset(style: string, width: number, glow: number): number {
  if (style === 'double') return width * 3 + 1;
  if (style === 'neon') return width + glow / 2 + 1;
  return width + 1;
}

/** Sets what can change without building the border again. */
export function tuneBorder(phosphor: Extension<Granted>, border: WindowEffectHandle): void {
  const { settings } = phosphor;
  border.set('border_first', ...colorSetting(phosphor, 'border-color'));
  border.set('border_second', ...colorSetting(phosphor, settings.get<string>('border') === 'gradient' ? 'border-second-color' : 'border-color'));
  border.set('border_app', settings.get<boolean>('border-app-color') ? 1 : 0);
}

export function addBorder(phosphor: Extension<Granted>, rules: AppRules): WindowEffectHandle | null {
  const { settings, screenEffects, appearance, t } = phosphor;
  const style = settings.get<string>('border');
  if (style === 'off') return null;
  const motion = settings.get<string>('border-motion');
  const width = settings.get<number>('border-width');
  const glow = GLOWING.has(style) ? settings.get<number>('border-glow-size') : 0;
  const speed = settings.get<number>('border-speed');
  const focusedOnly = settings.get<boolean>('border-focused');
  const border = screenEffects.addWindowOverlay({
    label: t('border'),
    declarations: DECLARATIONS,
    shader: shader(style),
    margin: glow,
    inset: inset(style, width, glow),
    animated: motion !== 'still' && !appearance.reducedMotion,
    fullscreen: settings.get<boolean>('windows-fullscreen'),
    followsFocus: focusedOnly,
    match: window => (!focusedOnly || window.focused) && rules.applies('border', window),
  });
  border.set('border_width', width);
  tuneBorder(phosphor, border);
  border.set('border_speed', motion === 'flow' ? FLOW_SPEED * speed : 0);
  border.set('border_pulse', motion === 'pulse' ? PULSE_DEPTH : 0);
  border.set('border_pulse_rate', 2.4 * speed);
  border.set('border_reach', glow);
  return border;
}
