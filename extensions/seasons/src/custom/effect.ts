import type { Layer } from '@luft/extension-api';

import { paintParted, PARTED } from '../effects/parted.js';
import { type Effect, paintSky, SKY } from '../effects/sky.js';
import type { Landing, Preset } from './presets.js';

export const ATLAS = 'custom_pictures';

const LANDINGS: Record<Landing, number> = { through: 0, bounce: 1, settle: 2 };

const DECLARATIONS = `${SKY}${PARTED}
uniform vec2 custom_size;
uniform float custom_speed;
uniform float custom_spin;
uniform float custom_landing;
uniform float custom_cell;

float custom_contact(vec2 p) {
  float contact = SKY_NEVER;
  for (int i = 0; i < SKY_SHAPES; i++) {
    if (float(i) >= sky_count) break;
    contact = min(contact, sky_contact(p, sky_shapes[i], sky_corners[i]));
  }
  return contact;
}

vec4 custom_picture(vec2 offset, float size, float pick, float phase) {
  float index = min(floor(pick * custom_pictures_count), custom_pictures_count - 1.0);
  vec4 picture = custom_pictures_pictures[0];
  for (int i = 1; i < 8; i++) if (float(i) == index) picture = custom_pictures_pictures[i];
  float frame = picture.x + mod(floor(sky_time * picture.z + phase * picture.y), max(picture.y, 1.0));
  vec2 cell = vec2(mod(frame, custom_pictures_grid.x), floor(frame / custom_pictures_grid.x));
  vec2 inside = offset / size + 0.5;
  if (any(lessThan(inside, vec2(0.0))) || any(greaterThan(inside, vec2(1.0)))) return vec4(0.0);
  return texture2D(custom_pictures, (cell + inside) / custom_pictures_grid);
}

vec4 custom_fall(vec2 p, vec2 id, float cell, float speed, float scale, float seed) {
  float r1 = sky_hash(id + seed);
  float r2 = sky_hash(id.yx * 1.31 + seed);
  float r3 = sky_hash(id * 0.71 + seed * 2.3);
  float size = mix(custom_size.x, custom_size.y, r2) * scale;
  vec2 shift = vec2(sky_drift * speed / 100.0, sky_time * speed);
  vec2 centre = (id + vec2(0.5 + 0.2 * (r1 - 0.5), 0.3 + 0.4 * r2)) * cell + shift;
  float lasts = cell * 0.8;
  float reach = size * 1.5 + lasts * (abs(sky_wind) + 0.35);
  if (abs(p.x - centre.x) > reach || p.y > centre.y + size || p.y < centre.y - lasts - size * 1.5) return vec4(0.0);
  if (r3 > sky_density_lingering(centre.y / speed, 0.1)) return vec4(0.0);
  vec2 at = centre;
  float shown = 1.0;
  float travel = 0.0;
  float bottom = centre.y + size * 0.5;
  float contact = custom_contact(vec2(centre.x, bottom));
  float past = bottom - contact;
  if (past > 0.0) {
    if (custom_landing < 0.5 || past > lasts) return vec4(0.0);
    at = vec2(centre.x - past * sky_wind, contact - size * 0.5);
    travel = past;
    if (custom_landing < 1.5) {
      float hop = past / lasts;
      at.y -= size * 0.9 * abs(sin(hop * 9.42)) * (1.0 - hop);
      at.x += past * 0.35 * (r1 > 0.5 ? 1.0 : -1.0);
    }
    shown = 1.0 - smoothstep(lasts * 0.6, lasts, past);
  }
  vec2 offset = p - at;
  if (dot(offset, offset) > size * size) return vec4(0.0);
  float turn = custom_spin * (r1 * 6.2832 + sky_time * (0.6 + 1.4 * r3) * sign(r2 - 0.5)) * (1.0 - travel / max(cell, 1.0));
  offset = mat2(cos(turn), -sin(turn), sin(turn), cos(turn)) * offset;
  float flip = mix(1.0, max(abs(cos(sky_time * (0.8 + r2) + r1 * 6.2832)), 0.25), custom_spin);
  offset.x /= flip;
  return custom_picture(offset, size, sky_hash(id * 3.7 + seed), r1) * shown;
}

vec4 custom_layer(vec2 p, float cell, float speed, float scale, float seed) {
  vec2 q = vec2(p.x - sky_drift * speed / 100.0, p.y - sky_time * speed);
  vec2 id = floor(q / cell);
  vec4 own = custom_fall(p, id, cell, speed, scale, seed);
  vec4 below = custom_fall(p, id + vec2(0.0, 1.0), cell, speed, scale, seed);
  return own + below * (1.0 - own.a);
}
`;

const SHADER = `
float uncovered = 1.0 - sky_covered(layer_position);
if (uncovered > 0.0 && custom_pictures_count > 0.0) {
  vec3 sky = parted(layer_position);
  vec4 far = custom_layer(sky.xy, custom_cell * 0.7, custom_speed * 0.6, 0.6, 1.0) * 0.7;
  vec4 near = custom_layer(sky.xy, custom_cell, custom_speed, 1.0, 2.0);
  layer_color = (near + far * (1.0 - near.a)) * sky.z * uncovered;
}
`;

/** Pictures people chose falling like the other effects, bouncing off or settling on windows and the taskbar. */
export function custom(preset: () => Preset | null): Effect {
  return {
    declarations: DECLARATIONS,
    shader: SHADER,
    atlases: [ATLAS],
    parts: true,
    paint(display, _index, weather) {
      const chosen = preset();
      paintSky(display, weather);
      paintParted(display, weather);
      if (!chosen) return;
      display.uniform('custom_size', chosen.smallest, chosen.largest);
      display.uniform('custom_speed', chosen.speed);
      display.uniform('custom_spin', chosen.spin);
      display.uniform('custom_landing', LANDINGS[chosen.landing]);
      display.uniform('custom_cell', Math.max(chosen.largest * 2.6, 60));
    },
  };
}

export function showPictures(layer: Layer, preset: Preset | null): number {
  return layer.setPictures(ATLAS, preset?.pictures ?? []);
}
