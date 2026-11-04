import type { Extension, Sprites, Stored } from '@luft/extension-api';

import type { Pack } from './pack.js';
import { PackProblem, readPack } from './read.js';

const BUILT_IN = ['packs/tuft', 'packs/pip', 'packs/dollop'];
const ADDED = 'packs';
const OFF = 'off';

/** Every pack there is: the ones that come with Strays and the ones people added, in the same format. */
export class Library {
  packs: Pack[] = [];
  private off: Set<string>;
  private readonly listeners: (() => void)[] = [];

  constructor(private readonly strays: Extension, private readonly sprites: Sprites) {
    this.off = new Set<string>(strays.storage.get<string[] & Stored>(OFF) ?? []);
    this.packs = [...BUILT_IN.map(folder => `${strays.path}/${folder}`), ...this.added].flatMap(folder => {
      try {
        return [readPack(strays, sprites, folder)];
      } catch (error) {
        if (error instanceof PackProblem) return [];
        throw error;
      }
    });
  }

  private get added(): readonly string[] {
    return this.strays.storage.get<string[] & Stored>(ADDED) ?? [];
  }

  /** Whether it comes with Strays, so it can only be switched off. */
  isBuiltIn(pack: Pack): boolean {
    return !this.added.includes(pack.folder);
  }

  get roster(): Pack[] {
    return this.packs.filter(pack => !this.off.has(pack.id));
  }

  isOn(pack: Pack): boolean {
    return !this.off.has(pack.id);
  }

  turn(pack: Pack, on: boolean): void {
    if (on) this.off.delete(pack.id);
    else this.off.add(pack.id);
    this.strays.storage.set(OFF, [...this.off]);
    this.changed();
  }

  /** Adds a folder someone picked, or removes it again and throws what's wrong with it. */
  add(folder: string): void {
    try {
      this.packs.push(readPack(this.strays, this.sprites, folder));
    } catch (error) {
      this.strays.deleteFile(folder);
      throw error;
    }
    this.strays.storage.set(ADDED, [...this.added, folder]);
    this.changed();
  }

  remove(pack: Pack): void {
    this.strays.deleteFile(pack.folder);
    this.strays.storage.set(ADDED, this.added.filter(folder => folder !== pack.folder));
    this.packs = this.packs.filter(candidate => candidate !== pack);
    this.off.delete(pack.id);
    this.strays.storage.set(OFF, [...this.off]);
    this.changed();
  }

  watch(changed: () => void): void {
    this.listeners.push(changed);
  }

  private changed(): void {
    for (const listener of this.listeners) listener();
  }
}
