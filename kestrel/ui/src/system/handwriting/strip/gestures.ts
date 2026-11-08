import type { Stroke } from '../../../shared/ink/stroke.js';

const TAP_REACH = 6;
const TAP_TIME = 300;
const STRIKE_LENGTH = 10;
const STRIKE_FLATNESS = 0.5;
const SCRATCH_TURNS = 4;
const SCRATCH_SWING = 6;

export function isTap(stroke: Stroke): boolean {
  const { x1, y1, x2, y2 } = stroke.bounds;
  const samples = stroke.samples;
  const lasted = samples[samples.length - 1].time - samples[0].time;
  const reach = TAP_REACH + stroke.style.width;
  return x2 - x1 <= reach && y2 - y1 <= reach && lasted <= TAP_TIME;
}

/** A line drawn across, flat enough to cross words out. */
export function isStrike(stroke: Stroke): boolean {
  const { x1, y1, x2, y2 } = stroke.bounds;
  return x2 - x1 >= STRIKE_LENGTH && y2 - y1 <= (x2 - x1) * STRIKE_FLATNESS;
}

/** Back and forth over the same place, the way people scribble something out. */
export function isScratch(stroke: Stroke): boolean {
  let turns = 0;
  let direction = 0;
  let extreme = stroke.samples[0].x;
  for (const { x } of stroke.samples) {
    const moved = x - extreme;
    if (direction === 0 && Math.abs(moved) >= SCRATCH_SWING) direction = Math.sign(moved);
    if (direction * moved > 0) extreme = x;
    else if (direction !== 0 && Math.abs(moved) >= SCRATCH_SWING) {
      turns++;
      direction = -direction;
      extreme = x;
    }
  }
  return turns >= SCRATCH_TURNS;
}

export function overlaps(a: Stroke, b: Stroke): boolean {
  return a.bounds.x1 <= b.bounds.x2 && b.bounds.x1 <= a.bounds.x2 && a.bounds.y1 <= b.bounds.y2 && b.bounds.y1 <= a.bounds.y2;
}
