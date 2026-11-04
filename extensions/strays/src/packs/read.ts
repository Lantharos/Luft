import type { Extension, SpriteSheet, Sprites } from '@luft/extension-api';

import { type Abilities, DEFAULT_LIKES, DEFAULT_TEMPER, framesOf, LARGEST_FRAME, type Likes, OPTIONAL_STATES, type Pack, REQUIRED_STATES, SMALLEST_FRAME, type State, type StateName, type Temper } from './pack.js';

const MANIFEST = 'pack.json';
const DEFAULT_SHEET = 'sheet.png';

/** What's wrong with a pack, as a message and its arguments. */
export class PackProblem extends Error {
  constructor(readonly id: string, readonly args: Record<string, string | number> = {}) {
    super(id);
  }
}

type Manifest = {
  name?: unknown;
  description?: unknown;
  frame?: unknown;
  sheet?: unknown;
  states?: Record<string, Partial<State> | undefined>;
  temper?: Partial<Temper>;
  abilities?: Partial<Abilities>;
  likes?: Partial<Likes>;
};

function parsed(text: string | null): Manifest {
  if (text === null) throw new PackProblem('pack-no-manifest');
  try {
    return JSON.parse(text) as Manifest;
  } catch {
    throw new PackProblem('pack-bad-manifest');
  }
}

function abilitiesOf({ walks = true, climbs, jumps = 0, flies = false }: Partial<Abilities>, hasClimb: boolean): Abilities {
  if (typeof jumps !== 'number' || jumps < 0) throw new PackProblem('pack-bad-jumps');
  if (!walks && !flies) throw new PackProblem('pack-cant-move');
  return { walks: !!walks, climbs: climbs ?? hasClimb, jumps, flies: !!flies };
}

function checkedSheetName(sheet: unknown): string {
  if (sheet === undefined) return DEFAULT_SHEET;
  if (typeof sheet !== 'string' || sheet.includes('/')) throw new PackProblem('pack-bad-sheet-name');
  return sheet;
}

function loaded(sprites: Sprites, path: string, name: string, cell: number): SpriteSheet {
  try {
    return sprites.loadSheet({ path, cell });
  } catch {
    throw new PackProblem('pack-wrong-size', { sheet: name, frame: cell });
  }
}

function framesIn(name: StateName, state: Partial<State>, sheet: SpriteSheet): number[] {
  const { row, frames, start = 0 } = state;
  if (!Number.isInteger(row) || !Number.isInteger(frames) || !Number.isInteger(start) || row! < 0 || frames! < 1 || start < 0) throw new PackProblem('pack-bad-state', { state: name });
  if (row! >= sheet.rows) throw new PackProblem('pack-row-outside', { state: name, row: row! + 1, rows: sheet.rows });
  if (start + frames! > sheet.columns) throw new PackProblem('pack-frames-outside', { state: name, columns: sheet.columns });
  return Array.from({ length: frames! }, (_, index) => row! * sheet.columns + start + index);
}

/** Reads a pack from its folder, or throws a {@link PackProblem} that says plainly what's wrong with it. */
export function readPack(strays: Extension, sprites: Sprites, folder: string): Pack {
  const manifest = parsed(strays.readText(`${folder}/${MANIFEST}`));
  const { name, description, frame, states = {}, temper, abilities = {}, likes } = manifest;
  if (typeof name !== 'string' || !name.trim()) throw new PackProblem('pack-no-name');
  if (!Number.isInteger(frame) || (frame as number) < SMALLEST_FRAME || (frame as number) > LARGEST_FRAME) throw new PackProblem('pack-bad-frame', { smallest: SMALLEST_FRAME, largest: LARGEST_FRAME });
  for (const state of REQUIRED_STATES) if (!states[state]) throw new PackProblem('pack-missing-state', { state });
  const sheetName = checkedSheetName(manifest.sheet);
  const path = `${folder}/${sheetName}`;
  if (strays.readText(path) === null) throw new PackProblem('pack-no-sheet', { sheet: sheetName });
  const sheet = loaded(sprites, path, sheetName, frame as number);
  const shown: Partial<Record<StateName, number[]>> = {};
  for (const state of [...REQUIRED_STATES, ...OPTIONAL_STATES]) if (states[state]) shown[state] = framesIn(state, states[state], sheet);
  return {
    id: folder.slice(folder.lastIndexOf('/') + 1),
    folder,
    name: name.trim(),
    description: typeof description === 'string' ? description : null,
    sheet: path,
    frameSheet: sheet,
    frames: framesOf(shown),
    temper: { ...DEFAULT_TEMPER, ...temper },
    abilities: abilitiesOf(abilities, !!states.climb),
    likes: { ...DEFAULT_LIKES, ...likes },
  };
}
