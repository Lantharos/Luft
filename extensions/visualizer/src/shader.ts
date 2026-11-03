export const BANDS = 24;

export const STYLES = { glow: 0, wave: 1, bars: 2 } as const;

export type Style = keyof typeof STYLES;

export const DECLARATIONS = `
uniform float vis_bands[${BANDS}];
uniform float vis_level;
uniform float vis_time;
uniform float vis_height;
uniform float vis_floor;
uniform float vis_strength;
uniform float vis_style;
uniform vec3 vis_color;

const float VIS_BAR_COUNT = 36.0;

// Bass sits in the middle and the highs reach out to both edges, so the shape stays balanced
float vis_spectrum(float x) {
  float along = abs(x / layer_size.x - 0.5) * 2.0;
  float position = along * ${BANDS - 1}.0;
  float total = 0.0;
  float weight = 0.0;
  for (int i = 0; i < ${BANDS}; i++) {
    float offset = position - float(i);
    float w = max(0.0, 1.0 - offset * offset / 4.0);
    w *= w;
    total += vis_bands[i] * w;
    weight += w;
  }
  return total / max(weight, 0.0001);
}

// Partly additive, so the glow lights up the wallpaper instead of covering it
vec4 vis_paint(float alpha, float rise) {
  float a = clamp(alpha, 0.0, 0.9) * (1.0 - smoothstep(vis_height * 0.55, vis_height, rise));
  return vec4(vis_color * a, a * 0.6);
}
`;

export const SHADER = `
float rise = layer_size.y - vis_floor - layer_position.y;
float x = layer_position.x;
if (vis_style < 0.5) {
  float s = vis_spectrum(x);
  float ripple = 1.0 + 0.05 * sin(x * 0.006 + vis_time * 0.9) + 0.03 * sin(x * 0.017 - vis_time * 1.7);
  float reach = vis_height * (0.16 + 0.84 * s) * ripple;
  float height = max(rise, 0.0);
  float glow = exp(-1.8 * height / max(reach, 1.0));
  float base = exp(-height / (vis_height * 0.1)) * (0.3 + 0.7 * vis_level);
  layer_color = vis_paint((glow * (0.35 + 0.65 * s) + 0.35 * base) * vis_strength, rise);
} else if (vis_style < 1.5) {
  float s = vis_spectrum(x);
  float sway = sin(x * 0.004 + vis_time * 1.3) * 0.08 + sin(x * 0.011 - vis_time * 0.7) * 0.05;
  float crest = vis_height * (0.08 + 0.62 * s) * (1.0 + sway);
  float echo = vis_height * (0.06 + 0.42 * s) * (1.0 - sway * 1.6);
  float line = 1.0 - smoothstep(0.0, 2.2, abs(rise - crest));
  float faint = (1.0 - smoothstep(0.0, 1.6, abs(rise - echo))) * 0.45;
  float fill = rise >= 0.0 && rise < crest ? 0.18 * (1.0 - rise / max(crest, 1.0)) : 0.0;
  layer_color = vis_paint((max(line, faint) * 0.85 + fill) * vis_strength, rise);
} else {
  float width = layer_size.x / VIS_BAR_COUNT;
  float column = floor(x / width);
  float centre = (column + 0.5) * width;
  float s = vis_spectrum(centre);
  float half_width = width * 0.22;
  float top = vis_height * (0.04 + 0.86 * s);
  float radius = min(half_width, top * 0.5);
  vec2 q = abs(vec2(x - centre, rise - (top - radius) * 0.5)) - vec2(half_width, (top + radius) * 0.5) + radius;
  float outside = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
  float shape = rise < 0.0 ? 0.0 : 1.0 - smoothstep(-0.8, 0.8, outside);
  float shade = 0.45 + 0.55 * (1.0 - rise / max(top, 1.0));
  layer_color = vis_paint(shape * shade * 0.7 * vis_strength, rise);
}
`;
