import type { Move } from '../world/graph.js';

export type Bounds = readonly [number, number];
export type Pose = 'stand' | 'sit' | 'sleep' | 'hover';

export interface Walk {
  kind: 'walk';
  target: number;
  speed: number;
  mood: Mood;
  then(): void;
}

export interface Leap {
  kind: 'leap';
  flying: boolean;
  startX: number;
  startY: number;
  onto: string;
  anchor: number;
  /** How far below the top of what it's leaping at it ends, for a leap at the side of a window. */
  depth: number;
  seconds: number;
  lift: number;
  elapsed: number;
  climbsAfter: Move | null;
}

export interface Climb {
  kind: 'climb';
  top: number;
  surface: string | null;
  side: number;
}

export interface Play {
  kind: 'play';
  frames: readonly number[];
  index: number;
  mood: Mood;
  then(): void;
}

export type Activity =
  | { kind: 'rest'; pose: Pose }
  | Walk
  | Leap
  | { kind: 'air' }
  | Climb
  | Play
  | { kind: 'held' };

export const between = ([low, high]: Bounds) => low + (high - low) * Math.random();

export const MOODS = {
  stand: 'mood-stand',
  sit: 'mood-sit',
  sleep: 'mood-sleep',
  hover: 'mood-hover',
  still: 'mood-still',
  walk: 'mood-walk',
  fall: 'mood-fall',
  climb: 'mood-climb',
  leap: 'mood-leap',
  fly: 'mood-fly',
  held: 'mood-held',
  greet: 'mood-greet',
  chase: 'mood-chase',
  flee: 'mood-flee',
  play: 'mood-play',
  stalk: 'mood-stalk',
  bumped: 'mood-bumped',
} as const;
export type Mood = keyof typeof MOODS;
