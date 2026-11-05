import type { SpriteSheet, Sprites } from '@luft/extension-api';

import type { Sheets } from '../things/thing.js';

const CELLS: Record<keyof Sheets, number> = { lantern: 192, tassel: 64, cloud: 256, flame: 160, logs: 192, glow: 128, star: 64, small: 32, comet: 128 };

/** Reads each sheet the first time a thing wants it, so kinds that are off keep nothing in memory. */
export function sheetShelf(sprites: Sprites): Sheets {
  const read: Partial<Record<keyof Sheets, SpriteSheet>> = {};
  const shelf = {} as Sheets;
  for (const name of Object.keys(CELLS) as (keyof Sheets)[]) {
    Object.defineProperty(shelf, name, {
      get: () => read[name] ??= sprites.loadSheet({ path: `sheets/${name}.png`, cell: CELLS[name], smooth: true }),
    });
  }
  return shelf;
}
