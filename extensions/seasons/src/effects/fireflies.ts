import { type Effect, paintSky, SKY } from './sky.js';

const DECLARATIONS = `${SKY}
float fireflies_layer(vec2 p, float cell, float size, float seed) {
  vec2 drifted = vec2(p.x - sky_drift * 0.1, p.y);
  vec2 id = floor(drifted / cell);
  vec2 local = drifted - id * cell;
  float r1 = sky_hash(id + seed);
  float r2 = sky_hash(id.yx * 1.31 + seed);
  float r3 = sky_hash(id * 0.71 + seed * 2.3);
  float lowness = clamp((id.y + 0.5) * cell / layer_size.y, 0.0, 1.0);
  float gathered = (0.1 + 0.5 * sky_density) * (0.3 + 0.7 * lowness) - r3;
  if (gathered <= 0.0) return 0.0;
  float t = sky_time;
  vec2 wander = vec2(
    sin(t * (0.21 + 0.2 * r1) + r2 * 6.2832) + 0.5 * sin(t * (0.53 + 0.3 * r2) + r3 * 6.2832),
    cos(t * (0.17 + 0.2 * r2) + r1 * 6.2832) + 0.5 * sin(t * (0.41 + 0.3 * r3) + r1 * 3.1)) / 1.5;
  vec2 d = local - cell * (vec2(0.5) + 0.27 * wander);
  float squared = dot(d, d);
  float blink = smoothstep(0.3, 1.0, sin(t * (0.5 + 0.5 * r1) + r2 * 6.2832));
  float light = 0.06 + 0.94 * blink * blink;
  float core = exp(-squared / (2.0 * size * size));
  float halo = exp(-squared / (72.0 * size * size));
  return light * (core + 0.4 * halo) * smoothstep(0.0, 0.08, gathered);
}
`;

const SHADER = `
float uncovered = 1.0 - sky_covered(layer_position);
if (uncovered > 0.0) {
  vec2 p = layer_position;
  float glow = fireflies_layer(p, 120.0, 1.5, 1.0) + 1.2 * fireflies_layer(p, 170.0, 2.1, 2.0);
  float core = clamp(glow - 0.6, 0.0, 1.0);
  vec3 colour = mix(vec3(0.8, 0.95, 0.38), vec3(1.0, 1.0, 0.85), core);
  float light = clamp(glow, 0.0, 1.0);
  light *= uncovered;
  layer_color = vec4(colour * light, light * 0.55);
}
`;

/** Fireflies wandering low over the wallpaper, each glowing now and then. */
export function fireflies(): Effect {
  return {
    declarations: DECLARATIONS,
    shader: SHADER,
    paint(display, _index, weather) {
      paintSky(display, weather);
    },
  };
}
