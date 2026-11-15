import { rgb } from '../../color.js';

/** Palettes drawn from light to dark, picked by how light each part of the screen is. */
export const SHADED_PALETTES: Record<string, string[]> = {
  pocket: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'],
  'one-bit': ['#16161a', '#f2efe6'],
  amber: ['#140800', '#5c2c00', '#c87000', '#ffb347'],
};

const SIXTEEN = [
  '#000000', '#1d2b53', '#7e2553', '#008751', '#ab5236', '#5f574f', '#c2c3c7', '#fff1e8',
  '#ff004d', '#ffa300', '#ffec27', '#00e436', '#29adff', '#83769c', '#ff77a8', '#ffccaa',
];

export const STYLIZE_DECLARATIONS = `
float bayer_two(vec2 cell) {
  cell = floor(cell);
  return fract(dot(cell, vec2(0.5, cell.y * 0.75)));
}

float bayer(vec2 cell) {
  return bayer_two(cell * 0.5) * 0.25 + bayer_two(cell);
}

float halftone_dot(vec2 at, float angle, float amount) {
  vec2 turned = vec2(cos(angle) * at.x - sin(angle) * at.y, sin(angle) * at.x + cos(angle) * at.y);
  float radius = sqrt(clamp(amount, 0.0, 1.0)) * 0.62;
  return 1.0 - smoothstep(radius - 0.07, radius + 0.07, length(fract(turned) - 0.5));
}

void palette_try(vec3 wanted, vec3 option, inout vec3 best, inout float nearest) {
  vec3 apart = (wanted - option) * vec3(0.55, 0.75, 0.35);
  float distance_to = dot(apart, apart);
  if (distance_to < nearest) {
    nearest = distance_to;
    best = option;
  }
}`;

export const POSTERIZE = `
filter_color.rgb = floor(clamp(filter_color.rgb, 0.0, 1.0) * (posterize_levels - 1.0) + 0.5) / (posterize_levels - 1.0);`;

export const HALFTONE = `
vec2 dot_at = filter_uv * filter_size / (halftone_size * filter_scale);
vec3 ink = 1.0 - clamp(filter_color.rgb, 0.0, 1.0);
float key = min(ink.r, min(ink.g, ink.b));
ink = (ink - key) / max(1.0 - key, 0.001);
vec3 paper = vec3(1.0, 0.98, 0.94);
paper.r *= 1.0 - 0.85 * halftone_dot(dot_at, 0.2618, ink.r);
paper.g *= 1.0 - 0.85 * halftone_dot(dot_at, 1.309, ink.g);
paper.b *= 1.0 - 0.85 * halftone_dot(dot_at, 0.0, ink.b);
filter_color.rgb = paper * (1.0 - 0.9 * halftone_dot(dot_at, 0.7854, key));`;

const DITHER_AT = 'vec2 dither_cell = floor(scene_position * filter_size / (pixel_block * filter_scale));';

export function shadedPalette(dither: boolean, shades: number): string {
  const top = shades - 1;
  const steps = Array.from({ length: top }, (_, index) => `shaded = mix(shaded, palette_${index + 1}, step(${index}.5, index));`);
  return `
${DITHER_AT}
float shade = dot(clamp(filter_color.rgb, 0.0, 1.0), vec3(0.2126, 0.7152, 0.0722));
float index = clamp(floor(shade * ${top}.0 + ${dither ? 'bayer(dither_cell)' : '0.5'}), 0.0, ${top}.0);
vec3 shaded = palette_0;
${steps.join('\n')}
filter_color.rgb = shaded;`;
}

export function sixteenColors(dither: boolean): string {
  const tries = SIXTEEN.map(hex => `palette_try(wanted, vec3(${rgb(hex).map(channel => channel.toFixed(4)).join(', ')}), best, nearest);`).join('\n');
  return `
${DITHER_AT}
vec3 wanted = clamp(filter_color.rgb, 0.0, 1.0)${dither ? ' + (bayer(dither_cell) - 0.5) * 0.18' : ''};
vec3 best = vec3(0.0);
float nearest = 9.0;
${tries}
filter_color.rgb = best;`;
}
