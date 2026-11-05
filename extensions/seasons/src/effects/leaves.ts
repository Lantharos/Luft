import { paintParted, PARTED } from './parted.js';
import { type Effect, paintSky, SKY } from './sky.js';

const DECLARATIONS = `${SKY}${PARTED}
vec3 leaves_colour(float pick) {
  if (pick < 0.3) return vec3(0.86, 0.47, 0.13);
  if (pick < 0.55) return vec3(0.66, 0.22, 0.09);
  if (pick < 0.8) return vec3(0.89, 0.66, 0.2);
  return vec3(0.5, 0.12, 0.09);
}

vec3 leaves_bump(vec2 centre, float reach, float size) {
  if (abs(sky_wind) < 0.01) return vec3(centre, 1.0);
  bool rightward = sky_wind > 0.0;
  float shown = 1.0;
  for (int i = 0; i < SKY_SHAPES; i++) {
    if (float(i) >= sky_count) break;
    vec4 r = sky_shapes[i];
    vec4 corners = sky_corners[i];
    float into = rightward ? centre.x - (r.x - size) : r.x + r.z + size - centre.x;
    float top = r.y + (rightward ? corners.x : corners.y);
    float bottom = r.y + r.w;
    if (into <= 0.0 || into > reach || centre.y < top || centre.y > bottom + reach) continue;
    centre.x += rightward ? -into : into;
    shown *= (1.0 - smoothstep(reach * 0.3, reach, into)) * (1.0 - smoothstep(bottom - reach, bottom, centre.y));
  }
  return vec3(centre, shown);
}

vec4 leaves_layer(vec2 p, float cell, float speed, float size, float seed) {
  vec2 q = vec2(p.x - sky_drift * speed / 100.0, p.y - sky_time * speed);
  vec2 id = floor(q / cell);
  vec2 local = q - id * cell;
  float r1 = sky_hash(id + seed);
  float r2 = sky_hash(id.yx * 1.31 + seed);
  float r3 = sky_hash(id * 0.71 + seed * 2.3);
  float height = (id.y + 0.5) * cell + sky_time * speed;
  if (r3 > 0.75 * sky_density_lingering(height / speed, 0.2)) return vec4(0.0);
  float sway = sin(sky_time * (0.5 + 0.4 * r2) + r1 * 6.2832);
  vec2 drifting = p - (local - cell * vec2(0.5 + 0.17 * sway, 0.3 + 0.4 * r2));
  float half_length = size * (0.75 + 0.5 * r2);
  float reach = cell * 0.2;
  if (length(p - drifting) > half_length * 1.4 + reach) return vec4(0.0);
  vec3 bumped = leaves_bump(drifting, reach, half_length);
  if (bumped.z <= 0.0 || sky_sheltered(bumped.xy) > 0.5) return vec4(0.0);
  vec2 d = p - bumped.xy;
  float angle = r1 * 6.2832 + 0.6 * sway + sky_time * (0.3 + 0.8 * r2) * sign(r1 - 0.5);
  d = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * d;
  float flip = cos(sky_time * (0.9 + 1.3 * r3) + r2 * 6.2832);
  float narrow = max(abs(flip), 0.3);
  d.x /= narrow;
  float half_width = half_length * 0.42;
  float bulge = (half_length * half_length - half_width * half_width) / (2.0 * half_width);
  float edge = (length(vec2(abs(d.x) + bulge, d.y)) - bulge - half_width) * mix(narrow, 1.0, 0.5);
  float body = 1.0 - smoothstep(-0.6, 0.6, edge);
  float stem = (1.0 - smoothstep(0.35, 0.9, abs(d.x) * narrow)) * step(d.y, -half_length + 1.0) * step(-half_length - 0.35 * half_length, d.y);
  float vein = (1.0 - smoothstep(0.2, 0.8, abs(d.x) * narrow)) * step(abs(d.y), half_length * 0.8);
  vec3 colour = leaves_colour(sky_hash(id * 2.17 + seed)) * (flip < 0.0 ? 0.72 : 1.0) * (0.9 + 0.2 * d.y / half_length);
  colour *= 1.0 - 0.3 * vein * body;
  float alpha = max(body, stem * 0.9) * bumped.z;
  return vec4(colour * alpha, alpha);
}
`;

const SHADER = `
float uncovered = 1.0 - sky_covered(layer_position);
if (uncovered > 0.0) {
  vec3 sky = parted(layer_position);
  vec4 far = leaves_layer(sky.xy, 100.0, 34.0, 6.0, 1.0) * 0.65;
  vec4 middle = leaves_layer(sky.xy, 150.0, 50.0, 9.0, 2.0) * 0.88;
  vec4 near = leaves_layer(sky.xy, 220.0, 72.0, 13.5, 3.0);
  vec4 leaves = middle + far * (1.0 - middle.a);
  leaves = near + leaves * (1.0 - near.a);
  layer_color = leaves * sky.z * uncovered;
}
`;

/** Autumn leaves tumbling down in the wind, turning as they fall and bumping off the sides of windows. */
export function leaves(): Effect {
  return {
    declarations: DECLARATIONS,
    shader: SHADER,
    parts: true,
    paint(display, _index, weather) {
      paintSky(display, weather);
      paintParted(display, weather);
    },
  };
}
