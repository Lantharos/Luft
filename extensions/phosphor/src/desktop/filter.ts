import type { DesktopFilter, Extension, FilterPass } from '@luft/extension-api';

import type { Granted } from '../rules.js';

const FLICKER_RATE = 30;

const GRADES: Record<string, { tint: number[]; saturation: number; contrast: number; shadows: number[]; lights: number[] }> = {
  warm: { tint: [1.08, 1.0, 0.86], saturation: 1.05, contrast: 1.02, shadows: [0, 0, 0], lights: [0, 0, 0] },
  cold: { tint: [0.88, 0.98, 1.12], saturation: 0.95, contrast: 1.03, shadows: [0, 0, 0], lights: [0, 0, 0] },
  'teal-orange': { tint: [1, 1, 1], saturation: 1.1, contrast: 1.08, shadows: [-0.05, 0.03, 0.08], lights: [0.08, 0.02, -0.07] },
  noir: { tint: [1, 1, 1], saturation: 0, contrast: 1.25, shadows: [0, 0, 0], lights: [0, 0, 0] },
  sepia: { tint: [1.12, 0.98, 0.74], saturation: 0.15, contrast: 1.04, shadows: [0, 0, 0], lights: [0, 0, 0] },
  vivid: { tint: [1, 1, 1], saturation: 1.45, contrast: 1.1, shadows: [0, 0, 0], lights: [0, 0, 0] },
};

const CURVE = `
uniform float crt_curvature;

vec2 curved(vec2 position) {
  vec2 from_middle = position * 2.0 - 1.0;
  from_middle *= 1.0 + dot(from_middle, from_middle) * 0.07 * crt_curvature;
  return from_middle * 0.5 + 0.5;
}`;

const BRIGHT = `
vec3 bright = max(filter_color.rgb - 0.62, 0.0);
filter_color = vec4(bright * (1.0 / 0.38), 1.0);`;

const blur = (sampler: string, axis: string) => `
vec2 step_size = ${axis} / filter_size * 3.0;
vec3 sum = texture2D(${sampler}, filter_uv).rgb * 0.227;
sum += (texture2D(${sampler}, filter_uv + step_size * 1.385).rgb + texture2D(${sampler}, filter_uv - step_size * 1.385).rgb) * 0.316;
sum += (texture2D(${sampler}, filter_uv + step_size * 3.231).rgb + texture2D(${sampler}, filter_uv - step_size * 3.231).rgb) * 0.0703;
filter_color = vec4(sum, 1.0);`;

const DECLARATIONS = `
uniform float crt_scanlines;
uniform float crt_mask;
uniform float crt_flicker;
uniform float grade_amount;
uniform vec3 grade_tint;
uniform float grade_saturation;
uniform float grade_contrast;
uniform vec3 grade_shadows;
uniform vec3 grade_lights;
uniform float shadow_boost;
uniform float bloom_amount;`;

const USE_BEND = `
vec2 scene_position = curved(filter_uv);
float on_tube = step(0.0, scene_position.x) * step(scene_position.x, 1.0) * step(0.0, scene_position.y) * step(scene_position.y, 1.0);
filter_color = filter_scene(scene_position) * on_tube;`;

const NO_BEND = 'vec2 scene_position = filter_uv;';

const USE_BLOOM = 'filter_color.rgb += texture2D(cogl_sampler3, scene_position).rgb * bloom_amount;';

const USE_SHADOWS = `
float dark = 1.0 - clamp(dot(filter_color.rgb, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);
filter_color.rgb += filter_color.rgb * dark * dark * shadow_boost * 1.6 + vec3(0.03) * dark * dark * dark * shadow_boost;`;

const USE_GRADE = `
vec3 graded = filter_color.rgb * grade_tint;
float light = dot(graded, vec3(0.2126, 0.7152, 0.0722));
graded = mix(vec3(light), graded, grade_saturation);
graded += mix(grade_shadows, grade_lights, smoothstep(0.1, 0.8, light));
graded = (graded - 0.5) * grade_contrast + 0.5;
filter_color.rgb = mix(filter_color.rgb, clamp(graded, 0.0, 1.0), grade_amount);`;

const INVERT: Record<string, string> = {
  colors: 'filter_color.rgb = 1.0 - clamp(filter_color.rgb, 0.0, 1.0);',
  lightness: `
vec3 kept = clamp(filter_color.rgb, 0.0, 1.0);
filter_color.rgb = kept + 1.0 - max(kept.r, max(kept.g, kept.b)) - min(kept.r, min(kept.g, kept.b));`,
};

const USE_CRT = `
float line_height = max(2.0, floor(filter_size.y / 480.0));
float line = 0.5 + 0.5 * cos(scene_position.y * filter_size.y * 6.2831853 / line_height);
filter_color.rgb *= 1.0 - line * crt_scanlines * 0.55;
float column = mod(floor(scene_position.x * filter_size.x), 3.0);
vec3 mask = vec3(column < 0.5 ? 1.0 : 0.75, abs(column - 1.0) < 0.5 ? 1.0 : 0.75, column > 1.5 ? 1.0 : 0.75);
filter_color.rgb = mix(filter_color.rgb, filter_color.rgb * mask * 1.15, crt_mask);
vec2 from_middle = filter_uv * 2.0 - 1.0;
filter_color.rgb *= 1.0 - dot(from_middle, from_middle) * 0.14 * crt_scanlines;`;

const USE_FLICKER = `
float roll = fract(scene_position.y - filter_time * 0.11);
filter_color.rgb *= 1.0 + 0.018 * sin(filter_time * 113.0) + 0.05 * smoothstep(0.93, 1.0, roll);`;

interface Choices {
  crt: boolean;
  curved: boolean;
  flicker: boolean;
  invert: string;
  grade: string;
  shadows: boolean;
  bloom: boolean;
}

function finalShader({ crt, curved, flicker, invert, grade, shadows, bloom }: Choices): FilterPass {
  return {
    declarations: `${curved ? CURVE : ''}${DECLARATIONS}`,
    shader: [
      curved ? USE_BEND : NO_BEND,
      bloom ? USE_BLOOM : '',
      shadows ? USE_SHADOWS : '',
      grade !== 'off' ? USE_GRADE : '',
      INVERT[invert] ?? '',
      crt ? USE_CRT : '',
      flicker ? USE_FLICKER : '',
    ].join('\n'),
  };
}

const bloomPasses = (): FilterPass[] => [
  { shader: BRIGHT, scale: 0.5 },
  { shader: blur('cogl_sampler1', 'vec2(1.0, 0.0)'), scale: 0.25 },
  { shader: blur('cogl_sampler2', 'vec2(0.0, 1.0)'), scale: 0.25 },
];

/** Everything chosen for the whole screen, in one shader, so turning more on doesn't add passes over the display. */
export class ScreenFilter {
  private filter: DesktopFilter | null = null;
  private shape = '';

  constructor(private readonly phosphor: Extension<Granted>) {}

  private choices(): Choices {
    const { settings, appearance } = this.phosphor;
    const crt = settings.get<boolean>('desktop-crt');
    return {
      crt,
      curved: crt && settings.get<number>('crt-curvature') > 0,
      flicker: crt && settings.get<boolean>('crt-flicker') && !appearance.reducedMotion,
      invert: settings.get<string>('invert'),
      grade: settings.get<string>('grade'),
      shadows: settings.get<number>('shadow-boost') > 0,
      bloom: settings.get<number>('bloom') > 0,
    };
  }

  update(): void {
    const { settings, screenEffects, t } = this.phosphor;
    const choices = this.choices();
    const { crt, curved, flicker, invert, grade, shadows, bloom } = choices;
    const wanted = crt || invert !== 'off' || grade !== 'off' || shadows || bloom;
    const shape = wanted ? JSON.stringify(choices) + settings.get<boolean>('filters-fullscreen') : '';
    if (shape !== this.shape) {
      this.shape = shape;
      this.filter?.dispose();
      this.filter = !wanted ? null : screenEffects.addDesktopFilter({
        label: t('desktop-filters'),
        passes: [...bloom ? bloomPasses() : [], finalShader(choices)],
        warps: curved,
        animated: flicker ? FLICKER_RATE : false,
        fullscreen: settings.get<boolean>('filters-fullscreen'),
        captured: settings.get<boolean>('filters-captured'),
      });
    }
    this.apply();
  }

  private apply(): void {
    const { filter } = this;
    if (!filter) return;
    const { settings } = this.phosphor;
    filter.setCaptured(settings.get<boolean>('filters-captured'));
    filter.set('crt_scanlines', settings.get<number>('crt-scanlines'));
    filter.set('crt_curvature', settings.get<number>('crt-curvature'));
    filter.set('crt_mask', settings.get<number>('crt-mask'));
    filter.set('shadow_boost', settings.get<number>('shadow-boost'));
    filter.set('bloom_amount', settings.get<number>('bloom'));
    const grade = GRADES[settings.get<string>('grade')];
    if (!grade) return;
    filter.set('grade_amount', settings.get<number>('grade-strength'));
    filter.set('grade_tint', ...grade.tint);
    filter.set('grade_saturation', grade.saturation);
    filter.set('grade_contrast', grade.contrast);
    filter.set('grade_shadows', ...grade.shadows);
    filter.set('grade_lights', ...grade.lights);
  }
}
