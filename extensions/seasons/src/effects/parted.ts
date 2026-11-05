import type { LayerDisplay } from '@luft/extension-api';

import type { Weather } from './sky.js';

export const MAX_TOUCHES = 4;

/**
 * Where the pointer and fingers part what falls. {@link parted} says which part of the sky shows at a position, so it
 * depends on nothing but that position and where the pointer is: nothing is carried along, and however the pointer
 * moves, what falls keeps its speed. Things only shift sideways, around the pointer, and the few that would still reach
 * it fade out.
 */
export const PARTED = `
#define PARTED_TOUCHES ${MAX_TOUCHES}
#define PARTED_REACH 170.0
#define PARTED_FAST_REACH 0.4
#define PARTED_PUSH 0.8

uniform float parted_count;
uniform vec4 parted_touches[PARTED_TOUCHES];

vec3 parted(vec2 p) {
  vec3 sky = vec3(p, 1.0);
  for (int i = 0; i < PARTED_TOUCHES; i++) {
    if (float(i) >= parted_count) break;
    vec4 touch = parted_touches[i];
    vec2 offset = p - touch.xy;
    float reach = PARTED_REACH * (1.0 + PARTED_FAST_REACH * touch.z);
    float squared = dot(offset, offset);
    if (squared >= reach * reach) continue;
    float near = 1.0 - sqrt(squared) / reach;
    sky.x -= offset.x * near * near * (3.0 - 2.0 * near) * PARTED_PUSH * touch.w;
    sky.z *= 1.0 - touch.w * smoothstep(0.4, 0.75, near);
  }
  return sky;
}
`;

/** Sets what {@link PARTED} declares for one display. */
export function paintParted(display: LayerDisplay, { touches }: Weather): void {
  const here = touches.filter(touch => touch.display === display.index);
  display.uniform('parted_count', here.length);
  if (!here.length) return;
  const values = new Array<number>(MAX_TOUCHES * 4).fill(0);
  here.forEach(({ x, y, speed, strength }, index) => values.splice(index * 4, 4, x, y, speed, strength));
  display.uniformArray('parted_touches', 4, values);
}
