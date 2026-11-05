import type { Extension, Stored } from '@luft/extension-api';

import type { Pack } from './pack.js';
import { PackProblem, readPack } from './read.js';

const BUILT_IN = ['packs/mechanical', 'packs/membrane', 'packs/typewriter', 'packs/thock'];
const ADDED = 'packs';

/** Every pack there is: the ones that come with Keystrokes and the ones people added, in the same format. */
export class Library {
  packs: Pack[];

  constructor(private readonly keystrokes: Extension) {
    this.packs = [...BUILT_IN.map(folder => `${keystrokes.path}/${folder}`), ...this.added].flatMap(folder => {
      try {
        return [readPack(keystrokes, folder)];
      } catch (error) {
        if (error instanceof PackProblem) return [];
        throw error;
      }
    });
  }

  private get added(): readonly string[] {
    return this.keystrokes.storage.get<string[] & Stored>(ADDED) ?? [];
  }

  /** Whether it comes with Keystrokes, so it stays. */
  isBuiltIn(pack: Pack): boolean {
    return !this.added.includes(pack.folder);
  }

  /** Reads a folder someone picked, or deletes it again and throws what's wrong with it. */
  read(folder: string): Pack {
    try {
      return readPack(this.keystrokes, folder);
    } catch (error) {
      this.keystrokes.deleteFile(folder);
      throw error;
    }
  }

  add(pack: Pack): void {
    this.packs.push(pack);
    this.keystrokes.storage.set(ADDED, [...this.added, pack.folder]);
  }

  remove(pack: Pack): void {
    this.keystrokes.deleteFile(pack.folder);
    this.keystrokes.storage.set(ADDED, this.added.filter(folder => folder !== pack.folder));
    this.packs = this.packs.filter(candidate => candidate !== pack);
  }
}
