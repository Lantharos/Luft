import type { FilterPass } from '@luft/extension-api';

import { DUOTONE, GRADE, INVERT, SHADOWS } from './pieces/color.js';
import { ABERRATION, BEND, CURVE, GLITCH_SHIFT, NOISE, PIXELATE, READ, VHS_BLEED, VHS_WOBBLE } from './pieces/place.js';
import { BLOOM, blur, BRIGHT, crt, FLICKER, GLITCH_COLOR, grain, VHS_NOISE, VIGNETTE } from './pieces/screen.js';
import { HALFTONE, POSTERIZE, SHADED_PALETTES, shadedPalette, sixteenColors, STYLIZE_DECLARATIONS } from './pieces/stylize.js';

/** What's on, as far as it changes the shader. Everything else is a uniform, so sliders don't build it again. */
export interface Choices {
  crt: boolean;
  mask: string;
  curved: boolean;
  flicker: boolean;
  invert: string;
  grade: string;
  shadows: boolean;
  bloom: boolean;
  aberration: boolean;
  pixelate: boolean;
  palette: string;
  dither: boolean;
  stylize: string;
  vhs: boolean;
  glitch: boolean;
  grain: boolean;
  grainMoving: boolean;
  vignette: boolean;
}

const DECLARATIONS = `
uniform float crt_scanlines;
uniform float crt_line_count;
uniform float crt_line_shape;
uniform float crt_mask;
uniform float crt_flicker_amount;
uniform float grade_amount;
uniform vec3 grade_tint;
uniform float grade_saturation;
uniform float grade_contrast;
uniform vec3 grade_shadows;
uniform vec3 grade_lights;
uniform vec3 duotone_dark;
uniform vec3 duotone_light;
uniform float shadow_boost;
uniform float bloom_amount;
uniform float chromatic_aberration;
uniform float pixel_block;
uniform float posterize_levels;
uniform float halftone_size;
uniform vec3 palette_0;
uniform vec3 palette_1;
uniform vec3 palette_2;
uniform vec3 palette_3;
uniform float vhs_strength;
uniform float screen_grain;
uniform float screen_vignette;`;

const BLOOM_DECLARATIONS = 'uniform float bloom_threshold;\nuniform float bloom_radius;';

const moves = ({ curved, pixelate, vhs, glitch }: Choices) => curved || pixelate || vhs || glitch;

function palette({ palette: chosen, dither }: Choices): string {
  if (chosen === 'sixteen') return sixteenColors(dither);
  const shades = SHADED_PALETTES[chosen];
  return shades ? shadedPalette(dither, shades.length) : '';
}

const GRADED: Record<string, string> = { duotone: DUOTONE, off: '' };

function finalShader(choices: Choices): FilterPass {
  const { crt: tube, mask, curved, flicker, invert, grade, shadows, bloom, aberration, pixelate, stylize, vhs, glitch, vignette } = choices;
  const noisy = vhs || glitch || choices.grain;
  return {
    declarations: [curved ? CURVE : '', noisy ? NOISE : '', DECLARATIONS, STYLIZE_DECLARATIONS].join('\n'),
    shader: [
      'vec2 scene_position = filter_uv;\nfloat on_tube = 1.0;',
      curved ? BEND : '',
      pixelate ? PIXELATE : '',
      vhs ? VHS_WOBBLE : '',
      glitch ? GLITCH_SHIFT : '',
      moves(choices) ? READ : '',
      aberration ? ABERRATION : '',
      vhs ? VHS_BLEED : '',
      bloom ? BLOOM : '',
      shadows ? SHADOWS : '',
      GRADED[grade] ?? GRADE,
      INVERT[invert] ?? '',
      stylize === 'posterize' ? POSTERIZE : stylize === 'halftone' ? HALFTONE : '',
      palette(choices),
      tube ? crt(mask) : '',
      vignette ? VIGNETTE : '',
      choices.grain ? grain(choices.grainMoving) : '',
      vhs ? VHS_NOISE : '',
      glitch ? GLITCH_COLOR : '',
      flicker ? FLICKER : '',
    ].join('\n'),
  };
}

const bloomPasses = (): FilterPass[] => [
  { declarations: BLOOM_DECLARATIONS, shader: BRIGHT, scale: 0.5 },
  { declarations: BLOOM_DECLARATIONS, shader: blur('cogl_sampler1', 'vec2(1.0, 0.0)'), scale: 0.25 },
  { declarations: BLOOM_DECLARATIONS, shader: blur('cogl_sampler2', 'vec2(0.0, 1.0)'), scale: 0.25 },
];

/** Everything chosen for the whole screen, in one shader after the bloom passes, so turning more on doesn't add passes over the display. */
export const passes = (choices: Choices): FilterPass[] => [...choices.bloom ? bloomPasses() : [], finalShader(choices)];

export const wanted = ({ crt: tube, invert, grade, shadows, bloom, aberration, pixelate, palette: chosen, stylize, vhs, glitch, grain: grained, vignette }: Choices) =>
  tube || bloom || shadows || aberration || pixelate || vhs || glitch || grained || vignette || [invert, grade, chosen, stylize].some(choice => choice !== 'off');
