import type { LayerDisplay, Outline } from '@luft/extension-api';

import { MAX_SHAPES, shapesOf } from './surfaces.js';

/** How much of an effect shows and how it moves, as the frame paints it. */
export interface Weather {
  time: number;
  /** How much falls or floats, from 0 to 1. */
  density: number;
  /** See {@link Density.history}. */
  history: readonly [number, number, number, number];
  /** How far things drift sideways for each pixel they fall. */
  wind: number;
  /** How far the wind has carried something falling 100 pixels a second, in pixels. */
  drift: number;
}

export interface Effect {
  declarations: string;
  shader: string;
  /** Picture atlases its shader samples. */
  atlases?: readonly string[];
  paint(display: LayerDisplay, index: number, weather: Weather, elapsed: number): void;
}

/**
 * What every effect knows about the sky: the time, the weather, and the shapes things land on and bump into, which are
 * the taskbar's pieces and the windows, each with its rounded corners. Nothing is ever drawn over them.
 */
export const SKY = `
#define SKY_SHAPES ${MAX_SHAPES}
#define SKY_NEVER 1e6

uniform float sky_time;
uniform float sky_density;
uniform vec4 sky_history;
uniform float sky_wind;
uniform float sky_drift;
uniform float sky_count;
uniform vec4 sky_shapes[SKY_SHAPES];
uniform vec4 sky_corners[SKY_SHAPES];

float sky_hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float sky_density_started(float age) {
  float since = sky_time - age - sky_history.z;
  return since <= 0.0 ? sky_history.x : mix(sky_history.y, sky_history.x, exp(-since * sky_history.w));
}

float sky_density_lingering(float age, float least) {
  return min(mix(least, 1.0, sky_density_started(age)), sky_density * 4.0);
}

float sky_radius(vec4 corners, vec2 offset) {
  return offset.x < 0.0 ? (offset.y < 0.0 ? corners.x : corners.w) : (offset.y < 0.0 ? corners.y : corners.z);
}

float sky_distance(vec2 p, vec4 shape, vec4 corners) {
  vec2 half_size = shape.zw * 0.5;
  vec2 offset = p - shape.xy - half_size;
  float radius = sky_radius(corners, offset);
  vec2 d = abs(offset) - half_size + radius;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - radius;
}

float sky_covered(vec2 p) {
  float covered = 0.0;
  for (int i = 0; i < SKY_SHAPES; i++) {
    if (float(i) >= sky_count) break;
    vec4 shape = sky_shapes[i];
    if (p.x < shape.x - 1.0 || p.x > shape.x + shape.z + 1.0 || p.y < shape.y - 1.0 || p.y > shape.y + shape.w + 1.0) continue;
    covered = max(covered, 1.0 - smoothstep(-0.5, 0.5, sky_distance(p, shape, sky_corners[i])));
  }
  return covered;
}

float sky_contact(vec2 p, vec4 shape, vec4 corners) {
  float back = p.x - (p.y - shape.y) * sky_wind;
  if (p.y < shape.y || max(p.x, back) < shape.x || min(p.x, back) > shape.x + shape.z) return SKY_NEVER;
  float top = shape.y;
  float bottom = shape.y + shape.w;
  if (abs(sky_wind) > 0.0001) {
    float a = p.y + (shape.x - p.x) / sky_wind;
    float b = p.y + (shape.x + shape.z - p.x) / sky_wind;
    top = max(top, min(a, b));
    bottom = min(bottom, max(a, b));
  } else if (p.x < shape.x || p.x > shape.x + shape.z) {
    return SKY_NEVER;
  }
  if (top > bottom || top > p.y) return SKY_NEVER;
  vec2 entry = vec2(p.x + (top - p.y) * sky_wind, top);
  vec2 half_size = shape.zw * 0.5;
  vec2 offset = entry - shape.xy - half_size;
  float radius = sky_radius(corners, offset);
  vec2 quadrant = sign(offset);
  vec2 centre = shape.xy + half_size + quadrant * (half_size - radius);
  if (radius <= 0.0 || any(lessThan((entry - centre) * quadrant, vec2(0.0)))) return top;
  vec2 direction = vec2(sky_wind, 1.0);
  vec2 from = entry - centre;
  float a = dot(direction, direction);
  float b = dot(direction, from);
  float reach = b * b - a * (dot(from, from) - radius * radius);
  if (reach < 0.0) return SKY_NEVER;
  return entry.y + max((-b - sqrt(reach)) / a, 0.0);
}

float sky_sheltered(vec2 p) {
  for (int i = 0; i < SKY_SHAPES; i++) {
    if (float(i) >= sky_count) break;
    if (sky_contact(p, sky_shapes[i], sky_corners[i]) <= p.y) return 1.0;
  }
  return 0.0;
}

float sky_top(vec4 shape, vec4 corners, float x) {
  if (x < shape.x || x > shape.x + shape.z) return SKY_NEVER;
  float left = x - shape.x;
  float right = shape.x + shape.z - x;
  float radius = left < right ? corners.x : corners.y;
  float edge = min(left, right);
  if (edge >= radius) return shape.y;
  float across = radius - edge;
  return shape.y + radius - sqrt(radius * radius - across * across);
}

float sky_surface(float x) {
  float top = layer_size.y;
  for (int i = 0; i < SKY_SHAPES; i++) {
    if (float(i) >= sky_count) break;
    top = min(top, sky_top(sky_shapes[i], sky_corners[i], x));
  }
  return top;
}
`;

/** Sets what {@link SKY} declares for one display, and returns the shapes it used. */
export function paintSky(display: LayerDisplay, weather: Weather): readonly Outline[] {
  const shapes = shapesOf(display.windows, display.taskbarOutlines);
  const rects = new Array<number>(MAX_SHAPES * 4).fill(0);
  const corners = new Array<number>(MAX_SHAPES * 4).fill(0);
  shapes.forEach((shape, index) => {
    const at = index * 4;
    rects[at] = shape.x;
    rects[at + 1] = shape.y;
    rects[at + 2] = shape.width;
    rects[at + 3] = shape.height;
    for (let corner = 0; corner < 4; corner++) corners[at + corner] = shape.radii[corner];
  });
  display.uniform('sky_time', weather.time);
  display.uniform('sky_density', weather.density);
  display.uniform('sky_history', ...weather.history);
  display.uniform('sky_wind', weather.wind);
  display.uniform('sky_drift', weather.drift);
  display.uniform('sky_count', shapes.length);
  display.uniformArray('sky_shapes', 4, rects);
  display.uniformArray('sky_corners', 4, corners);
  return shapes;
}
