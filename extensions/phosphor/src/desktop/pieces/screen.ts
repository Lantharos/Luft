const MASKS: Record<string, string> = {
  aperture: `
float column = mod(floor(scene_position.x * filter_size.x), 3.0);
float mask_gap = 1.0;`,
  shadow: `
float mask_row = floor(scene_position.y * filter_size.y / 2.0);
float column = mod(floor(scene_position.x * filter_size.x + mod(mask_row, 2.0) * 1.5), 3.0);
float mask_gap = mod(floor(scene_position.y * filter_size.y), 2.0) < 0.5 ? 1.0 : 0.85;`,
  slot: `
float column = mod(floor(scene_position.x * filter_size.x), 3.0);
float mask_triad = floor(scene_position.x * filter_size.x / 3.0);
float mask_gap = mod(floor(scene_position.y * filter_size.y) + mod(mask_triad, 2.0) * 2.0, 4.0) < 1.0 ? 0.7 : 1.0;`,
};

export const crt = (mask: string) => `
float line_height = max(2.0, floor(filter_size.y / crt_line_count));
float line = pow(0.5 + 0.5 * cos(scene_position.y * filter_size.y * 6.2831853 / line_height), crt_line_shape);
filter_color.rgb *= 1.0 - line * crt_scanlines * 0.55;
${MASKS[mask]}
vec3 mask = vec3(column < 0.5 ? 1.0 : 0.75, abs(column - 1.0) < 0.5 ? 1.0 : 0.75, column > 1.5 ? 1.0 : 0.75) * mask_gap;
filter_color.rgb = mix(filter_color.rgb, filter_color.rgb * mask * 1.15, crt_mask);
vec2 from_middle = filter_uv * 2.0 - 1.0;
filter_color.rgb *= 1.0 - dot(from_middle, from_middle) * 0.14 * crt_scanlines;`;

export const VIGNETTE = `
vec2 from_screen_middle = filter_uv * 2.0 - 1.0;
filter_color.rgb *= 1.0 - smoothstep(0.35, 1.45, length(from_screen_middle)) * screen_vignette;`;

export const grain = (moving: boolean) => `
float grain = filter_noise(floor(filter_uv * filter_size / (1.5 * filter_scale))${moving ? ' + floor(filter_time * 24.0) * 11.0' : ''});
filter_color.rgb *= 1.0 + (grain - 0.5) * screen_grain * 0.4;`;

export const VHS_NOISE = `
float hiss = filter_noise(floor(filter_uv * filter_size / (2.0 * filter_scale)) + floor(filter_time * 30.0) * 7.0);
filter_color.rgb += (hiss - 0.5) * 0.09 * vhs_strength;
filter_color.rgb = mix(filter_color.rgb, vec3(hiss), (vhs_band * 0.45 + vhs_bottom * 0.6) * vhs_strength);`;

export const GLITCH_COLOR = `
if (filter_play > 0.0) {
  float blocky = step(0.92, filter_noise(floor(filter_uv * vec2(26.0, 15.0)) + floor(filter_play * 10.0) * 3.0));
  filter_color.r = mix(filter_color.r, filter_scene(scene_position + vec2(0.01 * burst, 0.0)).r, burst);
  filter_color.rgb = mix(filter_color.rgb, filter_color.gbr, blocky * burst);
}`;

export const FLICKER = `
float roll = fract(scene_position.y - filter_time * 0.11);
filter_color.rgb *= 1.0 + crt_flicker_amount * (0.018 * sin(filter_time * 113.0) + 0.05 * smoothstep(0.93, 1.0, roll));`;

export const BRIGHT = `
vec3 bright = max(filter_color.rgb - bloom_threshold, 0.0);
filter_color = vec4(bright / (1.0 - bloom_threshold), 1.0);`;

export const blur = (sampler: string, axis: string) => `
vec2 step_size = ${axis} / filter_size * 3.0 * bloom_radius;
vec3 sum = filter_read(${sampler}, filter_uv).rgb * 0.227;
sum += (filter_read(${sampler}, filter_uv + step_size * 1.385).rgb + filter_read(${sampler}, filter_uv - step_size * 1.385).rgb) * 0.316;
sum += (filter_read(${sampler}, filter_uv + step_size * 3.231).rgb + filter_read(${sampler}, filter_uv - step_size * 3.231).rgb) * 0.0703;
filter_color = vec4(sum, 1.0);`;

export const BLOOM = 'filter_color.rgb += filter_read(cogl_sampler3, scene_position).rgb * bloom_amount;';
