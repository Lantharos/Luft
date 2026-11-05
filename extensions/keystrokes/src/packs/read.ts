import type { Extension, InputSound } from '@luft/extension-api';

import { MOST_SOUNDS_OF_A_KIND, type Pack, SOUND_KINDS } from './pack.js';

const MANIFEST = 'pack.json';

/** What's wrong with a pack, as a message and its arguments. */
export class PackProblem extends Error {
  constructor(readonly id: string, readonly args: Record<string, string | number> = {}) {
    super(id);
  }
}

type Manifest = { name?: unknown; description?: unknown; sounds?: Record<string, unknown> };

function parsed(text: string | null): Manifest {
  if (text === null) throw new PackProblem('pack-no-manifest');
  try {
    return JSON.parse(text) as Manifest;
  } catch {
    throw new PackProblem('pack-bad-manifest');
  }
}

function filesOf(kind: InputSound, entry: unknown, folder: string): string[] {
  const names = typeof entry === 'string' ? [entry] : entry;
  if (!Array.isArray(names) || !names.length || names.some(name => typeof name !== 'string' || !name || name.includes('/'))) throw new PackProblem('pack-bad-sounds', { kind });
  if (names.length > MOST_SOUNDS_OF_A_KIND) throw new PackProblem('pack-too-many-sounds', { kind, most: MOST_SOUNDS_OF_A_KIND });
  return names.map(name => `${folder}/${name as string}`);
}

/** Reads a pack from its folder, or throws a {@link PackProblem} that says plainly what's wrong with it. */
export function readPack(keystrokes: Extension, folder: string): Pack {
  const { name, description, sounds = {} } = parsed(keystrokes.readText(`${folder}/${MANIFEST}`));
  if (typeof name !== 'string' || !name.trim()) throw new PackProblem('pack-no-name');
  if (sounds.key === undefined) throw new PackProblem('pack-no-key-sound');
  const unknown = Object.keys(sounds).find(kind => !(SOUND_KINDS as readonly string[]).includes(kind));
  if (unknown) throw new PackProblem('pack-unknown-kind', { kind: unknown });
  return {
    id: folder.slice(folder.lastIndexOf('/') + 1),
    folder,
    name: name.trim(),
    description: typeof description === 'string' ? description : null,
    sounds: Object.fromEntries(SOUND_KINDS.filter(kind => sounds[kind] !== undefined).map(kind => [kind, filesOf(kind, sounds[kind], folder)])),
  };
}
