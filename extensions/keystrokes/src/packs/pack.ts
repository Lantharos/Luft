import type { InputSound } from '@luft/extension-api';

export const SOUND_KINDS = ['key', 'space', 'enter', 'backspace', 'click'] as const satisfies readonly InputSound[];
export const MOST_SOUNDS_OF_A_KIND = 8;

/** A set of sounds on disk: `pack.json` next to the sound files. */
export interface Pack {
  /** The folder's name, which is also what's remembered as the pack in use. */
  id: string;
  folder: string;
  name: string;
  description: string | null;
  /** Full paths of each kind's sounds. `key` always has some; what the others leave out borrows from it, or from the built-in mouse click. */
  sounds: Partial<Record<InputSound, string[]>>;
}
