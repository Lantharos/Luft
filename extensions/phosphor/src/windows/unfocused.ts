import type { EffectWindow, Extension, WindowEffectHandle } from '@luft/extension-api';

import type { Granted } from '../rules.js';

const DECLARATIONS = 'uniform float unfocused_strength;';

const DIM = 'outline_color = vec4(0.0, 0.0, 0.0, unfocused_strength * 0.6) * outline_inside(outline_position);';

const DESATURATE = `
float light = dot(window_color.rgb, vec3(0.2126, 0.7152, 0.0722));
window_color.rgb = mix(window_color.rgb, vec3(light), unfocused_strength);`;

export function tuneUnfocused({ settings }: Extension<Granted>, unfocused: WindowEffectHandle): void {
  unfocused.set('unfocused_strength', settings.get<number>('unfocused-strength'));
}

/** Dims or greys out every window but the focused one. Greying reads the window's pixels, so it costs memory for each. */
export function addUnfocused(phosphor: Extension<Granted>): WindowEffectHandle | null {
  const { settings, screenEffects, t } = phosphor;
  const look = settings.get<string>('unfocused');
  if (look === 'off') return null;
  const options = {
    label: t('unfocused'),
    declarations: DECLARATIONS,
    fullscreen: settings.get<boolean>('windows-fullscreen'),
    followsFocus: true,
    match: ({ focused, kind }: EffectWindow) => !focused && kind === 'normal',
  };
  const unfocused = look === 'dim'
    ? screenEffects.addWindowOverlay({ ...options, shader: DIM })
    : screenEffects.addWindowShader({ ...options, shader: DESATURATE });
  tuneUnfocused(phosphor, unfocused);
  return unfocused;
}
