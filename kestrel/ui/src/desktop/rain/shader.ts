export const MAX_SURFACES = 16;

export const DECLARATIONS = `
uniform vec2 rain_size;
uniform float rain_time;
uniform float rain_density;
uniform float rain_wind;
uniform float rain_count;
uniform vec4 rain_rects[${MAX_SURFACES}];
uniform vec4 rain_bar;

float rain_hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float rain_surface(float x) {
  float top = rain_size.y;
  if (rain_bar.z > 0.0 && x >= rain_bar.x && x <= rain_bar.x + rain_bar.z) top = min(top, rain_bar.y);
  for (int i = 0; i < ${MAX_SURFACES}; i++) {
    if (float(i) >= rain_count) break;
    vec4 r = rain_rects[i];
    if (x >= r.x && x <= r.x + r.z) top = min(top, r.y);
  }
  return top;
}

float rain_sheltered(vec2 p) {
  float blocked = 0.0;
  for (int i = 0; i <= ${MAX_SURFACES}; i++) {
    if (float(i) > rain_count) break;
    vec4 r = i == 0 ? rain_bar : rain_rects[i - 1];
    float x = p.x + (r.y - p.y) * rain_wind;
    if (r.z > 0.0 && r.y < p.y && x >= r.x && x <= r.x + r.z) blocked = 1.0;
    if (r.z > 0.0 && p.x >= r.x && p.x <= r.x + r.z && p.y >= r.y && p.y <= r.y + r.w) blocked = 1.0;
  }
  return blocked;
}

vec2 rain_layer(vec2 p, float cell, float speed, float len, float width, float seed) {
  float x = p.x - p.y * rain_wind;
  float column = floor(x / cell);
  float r1 = rain_hash(vec2(column, seed));
  float r2 = rain_hash(vec2(seed, column));
  float spacing = len * (3.0 + 9.0 * r2) / (0.4 + 0.6 * rain_density);
  float travelled = rain_time * speed * (0.85 + 0.3 * r1) / spacing + r1 * 7.0;
  float u = p.y / spacing - fract(travelled);
  float slot = floor(u) - floor(travelled);
  float along = fract(u) * spacing;
  float present = step(rain_hash(vec2(column * 1.7 + slot, seed + 3.1)), 0.3 + 0.7 * rain_density);
  float start = rain_hash(vec2(slot, column + seed)) * max(spacing - len, 0.0);
  float tail = (along - start) / len;
  if (tail < 0.0 || tail > 1.0) return vec2(0.0);
  float centre = (column + 0.25 + 0.5 * r2) * cell;
  float distance = abs(x - centre);
  float edge = 1.0 - smoothstep(width * 0.5, width * 0.5 + 0.9, distance);
  float halo = 1.0 - smoothstep(width * 0.5 + 0.6, width * 0.5 + 2.2, distance);
  float shade = 0.55 + 0.45 * rain_hash(vec2(slot, column * 3.3 + seed));
  float strength = present * tail * tail * shade;
  return vec2(edge, halo) * strength;
}

float rain_splashes(vec2 p) {
  float total = 0.0;
  float cell = 16.0;
  float base = floor(p.x / cell);
  float rate = 1.2 + 2.8 * rain_density;
  for (int k = -1; k <= 1; k++) {
    float n = base + float(k);
    float w = rain_time * rate + rain_hash(vec2(n, 9.1)) * 13.0;
    float event = floor(w);
    float age = fract(w) / rate;
    if (age > 0.38 || rain_hash(vec2(event, n + 4.2)) > 0.35 + 0.65 * rain_density) continue;
    float x0 = (n + rain_hash(vec2(n, event))) * cell;
    float top = rain_surface(x0);
    float ground = rain_bar.z > 0.0 && x0 >= rain_bar.x && x0 <= rain_bar.x + rain_bar.z ? rain_bar.y : rain_size.y;
    bool nearTop = p.y >= top - 34.0 && p.y <= top + 2.0;
    bool nearGround = p.y >= ground - 34.0 && p.y <= ground + 2.0;
    if (!nearTop && !nearGround) continue;
    bool low = rain_hash(vec2(event, n + 8.8)) < 0.5;
    float y0 = low ? ground : top;
    if (rain_sheltered(vec2(x0, y0 - 0.5)) > 0.5) {
      y0 = low ? top : ground;
      if (rain_sheltered(vec2(x0, y0 - 0.5)) > 0.5) continue;
    }
    if (p.y < y0 - 34.0 || p.y > y0 + 2.0) continue;
    float fade = 1.0 - age / 0.38;
    vec2 d = p - vec2(x0, y0);
    float spread = 2.0 + 30.0 * age;
    float ring = exp(-pow((abs(d.x) - spread) / 1.3, 2.0) - pow(d.y / 0.9, 2.0));
    total += 0.45 * ring * fade * fade;
    total += 0.8 * exp(-pow(d.x / 2.5, 2.0) - pow(d.y / 1.0, 2.0)) * max(0.0, 1.0 - age / 0.07);
    for (int j = 0; j < 3; j++) {
      float a = rain_hash(vec2(event + float(j) * 13.0, n));
      float b = rain_hash(vec2(n + float(j) * 7.0, event));
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
  for (int i = 0; i < ${MAX_SURFACES}; i++) {
    if (float(i) >= rain_count) break;
    vec4 r = rain_rects[i];
    for (int side = 0; side < 2; side++) {
      float x = side == 0 ? r.x - 0.5 : r.x + r.z + 0.5;
      if (abs(p.x - x) > 4.0 || p.y < r.y - 2.0) continue;
      float seed = rain_hash(vec2(float(i) * 3.0 + float(side), 5.7));
      float period = (1.4 + 2.2 * seed) / (0.4 + 0.6 * rain_density);
      float age = fract(rain_time / period + seed) * period;
      float hang = 0.75 * period;
      if (age < hang) {
        float radius = 0.6 + 1.5 * age / hang;
        vec2 bead = vec2(x, r.y + radius * 0.9);
        vec2 d = (p - bead) / vec2(1.0, 1.0 + 0.4 * age / hang);
        total += 1.0 - smoothstep(radius, radius + 0.8, length(d));
      } else {
        float fall = age - hang;
        float y = r.y + 2.0 + 800.0 * fall * fall;
        float len = min(2.0 + 0.02 * 1600.0 * fall, 18.0);
        float along = clamp((p.y - (y - len)) / len, 0.0, 1.0);
        float inside = step(y - len, p.y) * step(p.y, y + 1.5);
        total += inside * along * (1.0 - smoothstep(1.0, 1.9, abs(p.x - x)));
      }
    }
  }
  return total;
}
`;

export const MAIN = `
vec2 p = cogl_tex_coord_in[0].xy * rain_size;
float surf = rain_surface(p.x);
float sheltered = rain_sheltered(p);
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
float alpha = clamp(rain, 0.0, 1.0);
float dark = clamp(0.3 * shadow, 0.0, 1.0) * (1.0 - alpha);
cogl_color_out = vec4(vec3(0.86, 0.9, 0.97) * alpha, alpha + dark);
`;
