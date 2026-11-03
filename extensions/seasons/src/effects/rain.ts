import { type Effect, paintSky, SKY } from './sky.js';

const DECLARATIONS = `${SKY}
uniform vec3 rain_tint;

vec2 rain_layer(vec2 p, float cell, float speed, float len, float width, float seed) {
  float x = p.x - p.y * sky_wind;
  float column = floor(x / cell);
  float r1 = sky_hash(vec2(column, seed));
  float r2 = sky_hash(vec2(seed, column));
  float spacing = len * (3.0 + 9.0 * r2) / (0.4 + 0.6 * sky_density);
  float travelled = sky_time * speed * (0.85 + 0.3 * r1) / spacing + r1 * 7.0;
  float u = p.y / spacing - fract(travelled);
  float slot = floor(u) - floor(travelled);
  float along = fract(u) * spacing;
  float present = step(sky_hash(vec2(column * 1.7 + slot, seed + 3.1)), 0.3 + 0.7 * sky_density);
  float start = sky_hash(vec2(slot, column + seed)) * max(spacing - len, 0.0);
  float tail = (along - start) / len;
  if (tail < 0.0 || tail > 1.0) return vec2(0.0);
  float centre = (column + 0.25 + 0.5 * r2) * cell;
  float distance = abs(x - centre);
  float edge = 1.0 - smoothstep(width * 0.5, width * 0.5 + 0.9, distance);
  float halo = 1.0 - smoothstep(width * 0.5 + 0.6, width * 0.5 + 2.2, distance);
  float shade = 0.55 + 0.45 * sky_hash(vec2(slot, column * 3.3 + seed));
  float strength = present * tail * tail * shade;
  return vec2(edge, halo) * strength;
}

float rain_below(float x, float above) {
  float below = layer_size.y;
  for (int i = 0; i < SKY_SHAPES; i++) {
    if (float(i) >= sky_count) break;
    float top = sky_top(sky_shapes[i], sky_corners[i], x);
    if (top > above + 1.0) below = min(below, top);
  }
  return below;
}

float rain_splashes(vec2 p) {
  float total = 0.0;
  float cell = 16.0;
  float base = floor(p.x / cell);
  float rate = 1.2 + 2.8 * sky_density;
  for (int k = -1; k <= 1; k++) {
    float n = base + float(k);
    float w = sky_time * rate + sky_hash(vec2(n, 9.1)) * 13.0;
    float event = floor(w);
    float age = fract(w) / rate;
    if (age > 0.38 || sky_hash(vec2(event, n + 4.2)) > 0.35 + 0.65 * sky_density) continue;
    float x0 = (n + sky_hash(vec2(n, event))) * cell;
    float top = sky_surface(x0);
    if (p.y < top - 34.0) continue;
    float ground = rain_below(x0, top);
    bool nearTop = p.y <= top + 2.0;
    bool nearGround = p.y >= ground - 34.0 && p.y <= ground + 2.0;
    if (!nearTop && !nearGround) continue;
    bool low = sky_hash(vec2(event, n + 8.8)) < 0.5;
    float y0 = low ? ground : top;
    if (sky_sheltered(vec2(x0, y0 - 0.5)) > 0.5) {
      y0 = low ? top : ground;
      if (sky_sheltered(vec2(x0, y0 - 0.5)) > 0.5) continue;
    }
    if (p.y < y0 - 34.0 || p.y > y0 + 2.0) continue;
    float fade = 1.0 - age / 0.38;
    vec2 d = p - vec2(x0, y0);
    float spread = 2.0 + 30.0 * age;
    float ring = exp(-pow((abs(d.x) - spread) / 1.3, 2.0) - pow(d.y / 0.9, 2.0));
    total += 0.45 * ring * fade * fade;
    total += 0.8 * exp(-pow(d.x / 2.5, 2.0) - pow(d.y / 1.0, 2.0)) * max(0.0, 1.0 - age / 0.07);
    for (int j = 0; j < 3; j++) {
      float a = sky_hash(vec2(event + float(j) * 13.0, n));
      float b = sky_hash(vec2(n + float(j) * 7.0, event));
      float vx = (a - 0.5) * 240.0;
      float vy = 90.0 + 170.0 * b;
      vec2 q = vec2(x0 + vx * age, y0 - vy * age + 700.0 * age * age);
      if (q.y > y0) continue;
      vec2 velocity = vec2(vx, -vy + 1400.0 * age);
      vec2 offset = p - q;
      vec2 along = normalize(velocity + vec2(0.001, 0.0));
      float stretch = 1.0 + min(length(velocity) * 0.006, 1.5);
      vec2 shape = vec2(dot(offset, along) / stretch, dot(offset, vec2(-along.y, along.x)));
      float r = 0.55 + 0.5 * b;
      total += 0.7 * (1.0 - smoothstep(r, r + 0.8, length(shape))) * fade;
    }
  }
  return total;
}

float rain_drips(vec2 p) {
  float total = 0.0;
  for (int i = 0; i < SKY_SHAPES; i++) {
    if (float(i) >= sky_count) break;
    vec4 r = sky_shapes[i];
    vec4 corners = sky_corners[i];
    for (int side = 0; side < 2; side++) {
      float x = side == 0 ? r.x - 0.5 : r.x + r.z + 0.5;
      float edge = r.y + (side == 0 ? corners.x : corners.y);
      if (abs(p.x - x) > 4.0 || p.y < edge - 2.0) continue;
      float seed = sky_hash(vec2(float(i) * 3.0 + float(side), 5.7));
      float period = (1.4 + 2.2 * seed) / (0.4 + 0.6 * sky_density);
      float age = fract(sky_time / period + seed) * period;
      float hang = 0.75 * period;
      if (age < hang) {
        float radius = 0.6 + 1.5 * age / hang;
        vec2 bead = vec2(x + (side == 0 ? -radius : radius) * 0.6, edge + radius * 0.9);
        vec2 d = (p - bead) / vec2(1.0, 1.0 + 0.4 * age / hang);
        total += 1.0 - smoothstep(radius, radius + 0.8, length(d));
      } else {
        float fall = age - hang;
        float y = edge + 2.0 + 800.0 * fall * fall;
        float len = min(2.0 + 0.02 * 1600.0 * fall, 18.0);
        float along = clamp((p.y - (y - len)) / len, 0.0, 1.0);
        float inside = step(y - len, p.y) * step(p.y, y + 1.5);
        total += inside * along * (1.0 - smoothstep(1.0, 1.9, abs(p.x - x)));
      }
    }
  }
  return total;
}

float rain_side_splashes(vec2 p) {
  if (abs(sky_wind) < 0.02) return 0.0;
  bool rightward = sky_wind > 0.0;
  float outward = rightward ? -1.0 : 1.0;
  float rate = (1.0 + 3.0 * sky_density) * min(abs(sky_wind) * 6.0, 1.5);
  float cell = 12.0;
  float total = 0.0;
  for (int i = 0; i < SKY_SHAPES; i++) {
    if (float(i) >= sky_count) break;
    vec4 r = sky_shapes[i];
    vec4 corners = sky_corners[i];
    float x = rightward ? r.x : r.x + r.z;
    float reach = (p.x - x) * outward;
    float top = r.y + (rightward ? corners.x : corners.y);
    float bottom = r.y + r.w - (rightward ? corners.w : corners.z);
    if (reach < -1.0 || reach > 24.0 || p.y < top - 24.0 || p.y > bottom + 70.0) continue;
    float base = floor(p.y / cell);
    for (int k = -1; k <= 5; k++) {
      float n = base - float(k);
      float w = sky_time * rate + sky_hash(vec2(n, float(i) * 7.3 + 2.1)) * 11.0;
      float event = floor(w);
      float age = fract(w) / rate;
      if (age > 0.3 || sky_hash(vec2(event, n + 3.3)) > 0.3 + 0.7 * sky_density) continue;
      float y0 = (n + sky_hash(vec2(n, event))) * cell;
      if (y0 < top || y0 > bottom || sky_sheltered(vec2(x + outward * 0.5, y0)) > 0.5) continue;
      float fade = 1.0 - age / 0.3;
      vec2 d = p - vec2(x, y0);
      total += 0.7 * exp(-pow(d.x / 1.6, 2.0) - pow(d.y / 2.2, 2.0)) * max(0.0, 1.0 - age / 0.06);
      for (int j = 0; j < 2; j++) {
        float a = sky_hash(vec2(event + float(j) * 11.0, n));
        float b = sky_hash(vec2(n + float(j) * 5.0, event));
        vec2 q = vec2(x + outward * (40.0 + 90.0 * a) * age, y0 - (30.0 + 80.0 * b) * age + 700.0 * age * age);
        float radius = 0.6 + 0.4 * b;
        total += 0.7 * (1.0 - smoothstep(radius, radius + 0.8, length(p - q))) * fade;
      }
    }
  }
  return total;
}
`;

const SHADER = `
vec2 p = layer_position;
float uncovered = 1.0 - sky_covered(p);
if (uncovered > 0.0) {
  float surf = sky_surface(p.x);
  float sheltered = sky_sheltered(p);
  float rain = 0.0;
  float shadow = 0.0;
  if (p.y <= surf + 6.0 || sheltered < 0.5) {
    float open = 1.0 - sheltered;
    vec2 drops = open * (0.22 * rain_layer(p, 7.0, 650.0, 12.0, 0.7, 1.0)
      + 0.34 * rain_layer(p, 12.0, 1000.0, 22.0, 0.9, 2.0)
      + 0.55 * rain_layer(p, 23.0, 1450.0, 54.0, 1.3, 3.0));
    rain += drops.x;
    shadow += drops.y;
    rain += 0.7 * rain_splashes(p);
    rain += 0.85 * rain_drips(p);
  }
  rain += 0.8 * rain_side_splashes(p);
  float alpha = clamp(rain, 0.0, 1.0) * uncovered;
  float dark = clamp(0.3 * shadow, 0.0, 1.0) * (1.0 - alpha) * uncovered;
  layer_color = vec4(rain_tint * alpha, alpha + dark);
}
`;

/** Rain streaking down in three depths, splashing on window tops, sides and the taskbar and dripping off window corners. */
export function rain(tint: () => readonly number[]): Effect {
  return {
    declarations: DECLARATIONS,
    shader: SHADER,
    paint(display, _index, weather) {
      paintSky(display, weather);
      display.uniform('rain_tint', ...tint());
    },
  };
}
