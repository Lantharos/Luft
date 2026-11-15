export const NOISE = `
float filter_noise(vec2 cell) {
  return fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
}`;

export const CURVE = `
uniform float crt_curvature;

vec2 curved(vec2 position) {
  vec2 from_middle = position * 2.0 - 1.0;
  from_middle *= 1.0 + dot(from_middle, from_middle) * 0.07 * crt_curvature;
  return from_middle * 0.5 + 0.5;
}`;

export const BEND = `
scene_position = curved(filter_uv);
on_tube = step(0.0, scene_position.x) * step(scene_position.x, 1.0) * step(0.0, scene_position.y) * step(scene_position.y, 1.0);`;

export const PIXELATE = `
vec2 pixel_size = vec2(pixel_block * filter_scale) / filter_size;
scene_position = (floor(scene_position / pixel_size) + 0.5) * pixel_size;`;

export const VHS_WOBBLE = `
float vhs_band = 1.0 - smoothstep(0.0, 0.03, abs(scene_position.y - fract(0.85 - filter_time * 0.06)));
float vhs_bottom = smoothstep(0.975, 0.99, scene_position.y);
scene_position.x += (sin(scene_position.y * 90.0 + filter_time * 4.0) * 0.0006 + vhs_band * 0.008 + vhs_bottom * (filter_noise(vec2(floor(scene_position.y * filter_size.y / 3.0), floor(filter_time * 30.0))) - 0.5) * 0.03) * vhs_strength;`;

export const GLITCH_SHIFT = `
float burst = sin(filter_play * 3.1415927);
if (filter_play > 0.0) {
  float jolt = filter_noise(vec2(floor(scene_position.y * 22.0), floor(filter_play * 14.0)));
  scene_position.x += (jolt - 0.5) * 0.06 * step(0.6, jolt) * burst;
}`;

export const READ = 'filter_color = filter_scene(scene_position) * on_tube;';

export const ABERRATION = `
vec2 from_middle_of_tube = scene_position * 2.0 - 1.0;
vec2 outward = from_middle_of_tube * filter_size;
float reach = dot(from_middle_of_tube, from_middle_of_tube) * 0.5;
vec2 fringe = outward / max(length(outward), 1.0) * reach * chromatic_aberration * 8.0 * filter_scale / filter_size;
filter_color.r = filter_scene(scene_position + fringe).r * on_tube;
filter_color.b = filter_scene(scene_position - fringe).b * on_tube;`;

export const VHS_BLEED = `
vec3 smear = filter_color.rgb;
for (int tap = 1; tap <= 4; tap++) smear += filter_scene(scene_position - vec2(float(tap) * 2.5 * filter_scale / filter_size.x, 0.0)).rgb;
smear /= 5.0;
vec3 luma_weights = vec3(0.299, 0.587, 0.114);
vec3 bled = vec3(dot(filter_color.rgb, luma_weights)) + (smear - vec3(dot(smear, luma_weights))) * 1.2;
filter_color.rgb = mix(filter_color.rgb, clamp(bled, 0.0, 1.0), vhs_strength) * on_tube;`;
