import type { SpriteSheet } from '@luft/extension-api';

import type { PlatformKind } from '../world/world.js';

/** How a stray carries itself. */
export interface Temper {
  /** How far it goes each step when it walks, in pixels of a 24 pixel frame. */
  stride: number;
  /** How fast it speeds up as it falls: a blob plummets, a leaf would hardly fall. */
  gravity: number;
  /** How likely it is to doze off when it could. */
  sleepiness: number;
  /** How keen it is to get up and go somewhere rather than stay put, from 0 to 1. */
  curiosity: number;
}

/** How a stray gets around. */
export interface Abilities {
  walks: boolean;
  climbs: boolean;
  /** How far it can jump, in lengths of its own frame, across or up; 0 if it doesn't. */
  jumps: number;
  flies: boolean;
}

/** How much it likes being in each kind of place, against the others. `edges` is clinging to the side of the screen. */
export type Likes = Record<PlatformKind | 'edges', number>;

export const ENCOUNTERS = ['greet', 'chase', 'play', 'nap', 'stalk', 'bump'] as const;
export type Encounter = typeof ENCOUNTERS[number];

/** How a stray gets on with the others. */
export interface Together {
  /** How keen it is on company at all, from 0 to 1. */
  chatty: number;
  /** How much it likes doing each thing with another stray, against the others. */
  does: Record<Encounter, number>;
  /** What it does first of all with a certain stray, by that stray's name. */
  with: Readonly<Record<string, Encounter>>;
}

/** Which frames of the sheet each thing a stray does shows, as frame numbers. */
export interface Frames {
  look: readonly number[];
  walk: readonly number[];
  stand: number;
  sit: number;
  sitDown: readonly number[];
  sleep: number;
  lieDown: readonly number[];
  wake: readonly number[];
  fall: readonly number[];
  land: readonly number[];
  climb: readonly number[];
  jump: readonly number[];
  fly: readonly number[];
  held: readonly number[];
}

/** A creature on disk: `pack.json` next to its sprite sheet. */
export interface Pack {
  /** The folder's name, which also says which packs are switched off. */
  id: string;
  folder: string;
  name: string;
  description: string | null;
  /** The sheet's path, and the same sheet cut into frames. */
  sheet: string;
  frameSheet: SpriteSheet;
  frames: Frames;
  temper: Temper;
  abilities: Abilities;
  likes: Likes;
  together: Together;
}

/** A row of the sheet, or part of one. */
export interface State {
  row: number;
  frames: number;
  start?: number;
}

export const REQUIRED_STATES = ['idle', 'walk', 'sit', 'sleep', 'fall'] as const;
export const OPTIONAL_STATES = ['land', 'climb', 'jump', 'fly', 'held'] as const;
export type StateName = typeof REQUIRED_STATES[number] | typeof OPTIONAL_STATES[number];

export const SMALLEST_FRAME = 8;
export const LARGEST_FRAME = 128;

export const DEFAULT_TEMPER: Temper = { stride: 1.4, gravity: 1, sleepiness: 0.5, curiosity: 0.6 };
export const DEFAULT_LIKES: Likes = { window: 2, taskbar: 2, ground: 1, edges: 0.3 };
export const DEFAULT_TOGETHER: Together = { chatty: 0.5, does: { greet: 3, chase: 1, play: 1, nap: 1, stalk: 0, bump: 0 }, with: {} };

const HOLD_LOOK_STEPS = 4;

/** Stands, looks at each of the other idle frames for a moment, and stands again. */
function lookAround([stand, ...others]: readonly number[]): number[] {
  return [stand, stand, ...others.flatMap(frame => [...Array(HOLD_LOOK_STEPS).fill(frame), stand])];
}

/** What a stray shows for each thing it does, with what's left out borrowed from what's there. */
export function framesOf(states: Readonly<Partial<Record<StateName, readonly number[]>>>): Frames {
  const { idle, walk, sit, sleep, fall } = states as Record<typeof REQUIRED_STATES[number], readonly number[]>;
  return {
    look: lookAround(idle),
    walk,
    stand: idle[0],
    sit: sit[sit.length - 1],
    sitDown: sit,
    sleep: sleep[sleep.length - 1],
    lieDown: sleep,
    wake: [...sleep].reverse(),
    fall,
    land: states.land ?? [fall[fall.length - 1]],
    climb: states.climb ?? walk,
    jump: states.jump ?? fall,
    fly: states.fly ?? fall,
    held: states.held ?? fall,
  };
}
