import type { Disposable, Extension } from '@luft/extension-api';

import type { AppRules, Granted } from '../rules.js';

export type Look = 'glitch' | 'fold' | 'dissolve' | 'burn' | 'crt' | 'pixelate' | 'beam' | 'shatter' | 'static';

const NOISE = `
float noise_at(vec2 cell) {
  return fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
}

float soft_noise(vec2 position) {
  vec2 cell = floor(position);
  vec2 part = position - cell;
  part = part * part * (3.0 - 2.0 * part);
  return mix(mix(noise_at(cell), noise_at(cell + vec2(1.0, 0.0)), part.x),
             mix(noise_at(cell + vec2(0.0, 1.0)), noise_at(cell + vec2(1.0, 1.0)), part.x), part.y);
}

float cloud(vec2 position) {
  return soft_noise(position) * 0.6 + soft_noise(position * 2.3) * 0.3 + soft_noise(position * 5.1) * 0.1;
}`;

const SHADERS: Record<Look, { duration: number; shader: string }> = {
  glitch: {
    duration: 360,
    shader: `
float strength = 1.0 - reveal;
float band = floor(window_uv.y * 26.0);
float jolt = noise_at(vec2(band, floor(reveal * 18.0)));
vec2 moved = window_uv + vec2((jolt - 0.5) * 0.28 * strength * step(0.45, jolt), 0.0);
vec2 split = vec2(0.03 * strength, 0.0);
vec4 middle = window_sample(moved);
window_color = vec4(window_sample(moved + split).r, middle.g, window_sample(moved - split).b, middle.a) * smoothstep(0.0, 0.3, reveal);`,
  },
  fold: {
    duration: 420,
    shader: `
float open_part = clamp(reveal * 1.15, 0.001, 1.0);
float from_middle = (window_uv.x - 0.5) / open_part;
float slant = (1.0 - open_part) * 0.5 * cos(window_uv.x * 25.1327412);
vec2 flat_position = vec2(from_middle + 0.5, (window_uv.y - 0.5) / (1.0 - abs(slant) * 0.6) + 0.5);
float inside_fold = step(abs(from_middle), 0.5) * step(abs(flat_position.y - 0.5), 0.5);
window_color = window_sample(flat_position) * inside_fold;
window_color.rgb *= 1.0 - (1.0 - open_part) * 0.5 * (0.5 + 0.5 * sin(window_uv.x * 25.1327412));`,
  },
  dissolve: {
    duration: 480,
    shader: `
float amount = cloud(window_uv * window_size / 14.0);
window_color *= smoothstep(amount - 0.04, amount + 0.04, reveal * 1.1 - 0.05);`,
  },
  burn: {
    duration: 620,
    shader: `
float amount = cloud(window_uv * window_size / 34.0);
float front = reveal * 1.25 - 0.15;
float kept = smoothstep(amount - 0.015, amount + 0.015, front);
float ember = smoothstep(amount + 0.12, amount, front) * kept * step(0.001, 1.0 - reveal);
vec3 fire = mix(vec3(1.0, 0.2, 0.02), vec3(1.0, 0.85, 0.35), ember);
window_color = vec4(window_color.rgb * (1.0 - ember) + fire * ember * window_color.a, window_color.a) * kept;`,
  },
  crt: {
    duration: 420,
    shader: `
float tall = smoothstep(0.25, 1.0, reveal);
float wide = smoothstep(0.0, 0.25, reveal);
float height = max(tall, 0.006);
vec2 position = vec2((window_uv.x - 0.5) / max(wide, 0.01) + 0.5, (window_uv.y - 0.5) / height + 0.5);
float shown = step(abs(position.x - 0.5), 0.5) * step(abs(position.y - 0.5), 0.5);
float flash = 1.0 - smoothstep(0.1, 0.8, reveal);
vec4 picture = window_sample(position);
window_color = vec4(picture.rgb + vec3(0.8, 0.9, 1.0) * flash * picture.a, picture.a) * shown;`,
  },
  pixelate: {
    duration: 420,
    shader: `
float hidden = 1.0 - reveal;
vec2 cells = window_size / max(1.0, hidden * hidden * 56.0);
window_color = window_sample((floor(window_uv * cells) + 0.5) / cells) * smoothstep(0.0, 0.35, reveal);`,
  },
  beam: {
    duration: 520,
    shader: `
float open_part = smoothstep(0.2, 0.85, reveal);
float from_middle = abs(window_uv.x - 0.5);
float half_width = max(open_part * 0.5, 0.003);
float shown = 1.0 - smoothstep(half_width - 0.01, half_width, from_middle);
float beam = exp(-from_middle * 60.0 / (0.4 + open_part * 6.0)) * (1.0 - smoothstep(0.55, 1.0, reveal)) * smoothstep(0.0, 0.12, reveal);
vec4 picture = window_sample(window_uv) * shown * smoothstep(0.15, 0.6, reveal);
window_color = picture + vec4(vec3(0.7, 0.88, 1.0) * beam, beam * 0.35);`,
  },
  shatter: {
    duration: 560,
    shader: `
vec2 grid = vec2(10.0, 7.0);
vec2 cell = floor(window_uv * grid);
vec2 in_cell = fract(window_uv * grid);
float upper = step(in_cell.x, in_cell.y);
vec2 middle = upper > 0.5 ? vec2(1.0 / 3.0, 2.0 / 3.0) : vec2(2.0 / 3.0, 1.0 / 3.0);
float gone = clamp((1.0 - reveal) * 1.6 - noise_at(cell + upper * 17.0) * 0.6, 0.0, 1.0);
vec2 drift = (vec2(noise_at(cell + 3.1 + upper), noise_at(cell + 7.7 + upper)) - 0.5) * gone * 0.8 + vec2(0.0, gone * gone * 0.6);
vec2 from = middle + (in_cell - middle - drift) / max(1.0 - gone, 0.001);
float on_shard = step(0.0, from.x) * step(from.x, 1.0) * step(0.0, from.y) * step(from.y, 1.0) * (upper > 0.5 ? step(from.x, from.y) : step(from.y, from.x));
window_color = window_sample((cell + from) / grid) * on_shard * (1.0 - gone);`,
  },
  static: {
    duration: 460,
    shader: `
vec4 picture = window_sample(window_uv);
float snow = noise_at(floor(window_uv * window_size / 2.0) + floor(reveal * 40.0) * 13.0);
float roll = smoothstep(0.0, 0.06, abs(fract(window_uv.y * 2.0 - reveal * 3.0) - 0.5) - 0.44);
vec3 noise = vec3(snow * (0.75 + 0.25 * roll));
window_color = vec4(mix(noise * picture.a, picture.rgb, smoothstep(0.25, 0.9, reveal)), picture.a) * smoothstep(0.0, 0.15, reveal);`,
  },
};

export function addTransition(phosphor: Extension<Granted>, rules: AppRules, kind: 'open' | 'close', look: Look): Disposable {
  const { screenEffects, settings, t } = phosphor;
  const { duration, shader } = SHADERS[look];
  const length = settings.get<number>(`${kind}-length`);
  const reveal = kind === 'open' ? 'window_progress' : '1.0 - window_progress';
  return screenEffects.addWindowTransition({
    label: t(kind === 'open' ? 'open-effect' : 'close-effect'),
    kinds: [kind],
    duration: Math.round(duration * length),
    declarations: NOISE,
    shader: `float reveal = ${reveal};\n${shader}`,
    fullscreen: settings.get<boolean>('windows-fullscreen'),
    match: window => rules.applies('motion', window),
  });
}
