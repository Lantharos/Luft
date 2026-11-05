import type { Extension, WindowEffectHandle } from '@luft/extension-api';

import type { AppRules, Granted } from '../rules.js';

const DECLARATIONS = 'uniform float aberration_strength;';

const SHADER = `
if (window_inside(window_uv) > 0.5) {
  vec2 from_middle = (window_uv - window_frame.xy) / window_frame.zw * 2.0 - 1.0;
  vec2 outward = from_middle * window_size;
  float reach = dot(from_middle, from_middle) * 0.5;
  vec2 shift = outward / max(length(outward), 1.0) * reach * aberration_strength * 8.0 / window_size * window_frame.zw;
  vec2 low = window_frame.xy;
  vec2 high = window_frame.xy + window_frame.zw;
  window_color.r = min(window_sample(clamp(window_uv + shift, low, high)).r, window_color.a);
  window_color.b = min(window_sample(clamp(window_uv - shift, low, high)).b, window_color.a);
}`;

export function tuneWindowAberration({ settings }: Extension<Granted>, aberration: WindowEffectHandle): void {
  aberration.set('aberration_strength', settings.get<number>('window-aberration'));
}

export function addWindowAberration(phosphor: Extension<Granted>, rules: AppRules): WindowEffectHandle {
  const { settings, screenEffects, t } = phosphor;
  const aberration = screenEffects.addWindowShader({
    label: t('window-aberration'),
    declarations: DECLARATIONS,
    shader: SHADER,
    fullscreen: settings.get<boolean>('windows-fullscreen'),
    match: window => rules.applies('aberration', window),
  });
  tuneWindowAberration(phosphor, aberration);
  return aberration;
}
