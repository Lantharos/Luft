import type { Extension, WindowEffectHandle } from '@luft/extension-api';

import type { AppRules, Granted } from '../rules.js';

const DECLARATIONS = `
uniform float crt_strength;

vec2 crt_bend(vec2 position) {
  vec2 from_middle = position * 2.0 - 1.0;
  from_middle *= 1.0 + dot(from_middle, from_middle) * 0.05 * crt_strength;
  return from_middle * 0.5 + 0.5;
}`;

const SHADER = `
vec2 inside = (window_uv - window_frame.xy) / window_frame.zw;
if (window_inside(window_uv) > 0.5) {
  vec2 bent = crt_bend(inside);
  vec2 position = window_frame.xy + bent * window_frame.zw;
  vec2 split = vec2(0.0012 * crt_strength, 0.0);
  vec4 middle = window_sample(position);
  float inside_screen = step(0.0, bent.x) * step(bent.x, 1.0) * step(0.0, bent.y) * step(bent.y, 1.0);
  vec3 color = vec3(window_sample(position - split).r, middle.g, window_sample(position + split).b);
  float pixel_y = bent.y * window_size.y;
  float line = 0.5 + 0.5 * cos(pixel_y * 2.0943951);
  color *= 1.0 - line * 0.32 * crt_strength;
  float column = mod(floor(bent.x * window_size.x), 3.0);
  vec3 mask = vec3(column < 0.5 ? 1.0 : 0.82, abs(column - 1.0) < 0.5 ? 1.0 : 0.82, column > 1.5 ? 1.0 : 0.82);
  window_color = vec4(mix(color, color * mask, crt_strength), middle.a) * inside_screen;
}`;

export function tuneWindowCrt({ settings }: Extension<Granted>, crt: WindowEffectHandle): void {
  crt.set('crt_strength', settings.get<number>('window-crt'));
}

export function addWindowCrt(phosphor: Extension<Granted>, rules: AppRules): WindowEffectHandle {
  const { settings, screenEffects, t } = phosphor;
  const crt = screenEffects.addWindowShader({
    label: t('window-crt'),
    declarations: DECLARATIONS,
    shader: SHADER,
    fullscreen: settings.get<boolean>('windows-fullscreen'),
    match: window => rules.applies('crt', window),
  });
  tuneWindowCrt(phosphor, crt);
  return crt;
}
