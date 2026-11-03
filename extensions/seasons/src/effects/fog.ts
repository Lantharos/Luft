import { type Effect, paintSky, SKY } from './sky.js';

const SCALE_PX = 520;

const DECLARATIONS = `${SKY}
uniform vec3 fog_tint;

float fog_noise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = sky_hash(cell);
  float b = sky_hash(cell + vec2(1.0, 0.0));
  float c = sky_hash(cell + vec2(0.0, 1.0));
  float d = sky_hash(cell + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fog_layers(vec2 p) {
  float total = 0.0;
  float weight = 0.5;
  for (int i = 0; i < 4; i++) {
    total += weight * fog_noise(p);
    p = p * 2.03 + vec2(17.1, 9.2);
    weight *= 0.5;
  }
  return total;
}
`;

const SHADER = `
float uncovered = 1.0 - sky_covered(layer_position);
if (uncovered > 0.0) {
  vec2 p = layer_position / ${SCALE_PX}.0;
  vec2 flow = vec2(sky_drift / ${SCALE_PX}.0 + sky_time * 0.006, sky_time * 0.002);
  float body = fog_layers(p + flow);
  float wisps = fog_layers(p * 1.7 - flow * 1.6 + body);
  float fog = smoothstep(0.34, 0.86, 0.55 * body + 0.6 * wisps);
  fog *= mix(0.4, 1.0, smoothstep(0.0, 0.9, layer_position.y / layer_size.y));
  float alpha = fog * (0.2 + 0.45 * sky_density) * uncovered;
  layer_color = vec4(fog_tint * alpha, alpha);
}
`;

/** Mist drifting slowly across the wallpaper, thicker towards the bottom. */
export function fog(tint: () => readonly number[]): Effect {
  return {
    declarations: DECLARATIONS,
    shader: SHADER,
    paint(display, _index, weather) {
      paintSky(display, weather);
      display.uniform('fog_tint', ...tint());
    },
  };
}
