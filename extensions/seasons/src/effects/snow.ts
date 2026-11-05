import { paintParted, PARTED } from './parted.js';
import { Settling } from './settling.js';
import { type Effect, paintSky, SKY } from './sky.js';
import { MAX_SHAPES } from './surfaces.js';

const DECLARATIONS = `${SKY}${PARTED}
uniform float snow_caps[SKY_SHAPES];

vec2 snow_flakes(vec2 p, float cell, float speed, float size, float seed) {
  vec2 q = vec2(p.x - sky_drift * speed / 100.0, p.y - sky_time * speed);
  vec2 id = floor(q / cell);
  vec2 local = q - id * cell;
  float r1 = sky_hash(id + seed);
  float r2 = sky_hash(id.yx * 1.31 + seed);
  float r3 = sky_hash(id * 0.71 + seed * 2.3);
  float sway = sin(sky_time * (0.4 + 0.6 * r2) + r1 * 6.2832) * 0.15;
  vec2 centre = cell * vec2(0.3 + 0.4 * r1 + sway, 0.3 + 0.4 * r2);
  float distance = length(local - centre);
  float radius = size * (0.6 + 0.6 * r3);
  if (distance > radius + 1.0) return vec2(0.0);
  float height = (id.y + 0.5) * cell + sky_time * speed;
  if (r3 > sky_density_lingering(height / speed, 0.2)) return vec2(0.0);
  float flake = 1.0 - smoothstep(0.0, radius, distance);
  float shade = 1.0 - smoothstep(radius * 0.6, radius + 1.0, distance);
  return vec2(flake, shade);
}

float snow_cap(vec2 p, vec4 r, vec4 corners, float depth) {
  if (depth <= 0.05 || p.x < r.x || p.x > r.x + r.z || p.y < r.y - depth - 2.0 || p.y > r.y + max(corners.x, corners.y)) return 0.0;
  float flat_edge = min(p.x - r.x - corners.x * 0.6, r.x + r.z - corners.y * 0.6 - p.x);
  float drifts = 0.72 + 0.28 * sin(p.x * 0.043 + r.x) * sin(p.x * 0.117 + r.y * 0.3);
  float height = depth * drifts * smoothstep(-4.0, 14.0, flat_edge);
  return 1.0 - smoothstep(height - 0.7, height + 0.5, sky_top(r, corners, p.x) - p.y);
}
`;

const SHADER = `
float uncovered = 1.0 - sky_covered(layer_position);
if (uncovered > 0.0) {
  vec2 p = layer_position;
  vec2 snow = vec2(0.0);
  if (sky_sheltered(p) < 0.5) {
    vec3 sky = parted(p);
    snow += vec2(0.5, 0.05) * snow_flakes(sky.xy, 22.0, 32.0, 1.8, 1.0);
    snow += vec2(0.8, 0.07) * snow_flakes(sky.xy, 36.0, 52.0, 2.7, 2.0);
    snow += vec2(1.0, 0.09) * snow_flakes(sky.xy, 58.0, 80.0, 3.9, 3.0);
    snow *= sky.z;
  }
  float cap = 0.0;
  for (int i = 0; i < SKY_SHAPES; i++) {
    if (float(i) >= sky_count) break;
    cap = max(cap, snow_cap(p, sky_shapes[i], sky_corners[i], snow_caps[i]));
  }
  float alpha = clamp(snow.x + 0.92 * cap * sky_density, 0.0, 1.0) * uncovered;
  float dark = clamp(snow.y, 0.0, 1.0) * (1.0 - alpha) * uncovered;
  layer_color = vec4(vec3(0.96, 0.97, 1.0) * alpha, alpha + dark);
}
`;

/** Snowflakes drifting with the wind, three depths of them, stopping at windows and settling on their tops and the taskbar. */
export function snow(): Effect {
  const settling = new Settling();
  return {
    declarations: DECLARATIONS,
    shader: SHADER,
    parts: true,
    paint(display, index, weather, elapsed) {
      paintParted(display, weather);
      const depths = settling.depths(index, paintSky(display, weather), weather.density, elapsed);
      display.uniformArray('snow_caps', 1, [...depths, ...new Array<number>(MAX_SHAPES - depths.length).fill(0)]);
    },
  };
}
