import type { Storage } from '@luft/extension-api';

import { complete, SOUNDS, type Levels } from './catalogue.js';

export interface Mix {
  id: string;
  /** What people named it, or for a mix Luft comes with, the message id of its name. */
  name: string;
  levels: Levels;
  own: boolean;
}

type StoredMix = { id: string; name: string; levels: Levels };

const STORED = 'mixes';
const LEVELS_MATCH = 0.005;

const BUILT_IN: Mix[] = [
  { id: 'rainy-cafe', name: 'rainy-cafe', levels: { cafe: 0.55, rain: 0.6, thunder: 0.15 }, own: false },
  { id: 'campfire', name: 'campfire', levels: { fire: 0.75, forest: 0.3, wind: 0.2 }, own: false },
  { id: 'seaside', name: 'seaside', levels: { waves: 0.75, wind: 0.3 }, own: false },
  { id: 'deep-focus', name: 'deep-focus', levels: { 'brown-noise': 0.6, rain: 0.25 }, own: false },
  { id: 'thunderstorm', name: 'thunderstorm', levels: { rain: 0.7, thunder: 0.6, wind: 0.3 }, own: false },
];

export const FIRST_MIX = BUILT_IN[0]!;

const sameLevels = (one: Levels, other: Levels) => {
  const [a, b] = [complete(one), complete(other)];
  return SOUNDS.every(sound => Math.abs(a[sound] - b[sound]) < LEVELS_MATCH);
};

/** The mixes Luft comes with and the ones people saved, which they keep in the extension's storage. */
export class Mixes {
  constructor(
    private readonly storage: Storage,
    private readonly t: (id: string) => string,
    private readonly changed: () => void,
  ) {}

  private get stored(): StoredMix[] {
    return this.storage.get<StoredMix[]>(STORED) ?? [];
  }

  private set stored(mixes: StoredMix[]) {
    this.storage.set(STORED, mixes);
    this.changed();
  }

  get all(): Mix[] {
    return [...BUILT_IN, ...this.stored.map(mix => ({ ...mix, own: true }))];
  }

  name(mix: Mix): string {
    return mix.own ? mix.name : this.t(mix.name);
  }

  /** The mix whose levels these are, if any. */
  matching(levels: Levels): Mix | null {
    return this.all.find(mix => sameLevels(mix.levels, levels)) ?? null;
  }

  save(name: string, levels: Levels): void {
    const audible = Object.fromEntries(Object.entries(levels).filter(([, level]) => level > 0));
    const mix = { id: `own-${Date.now().toString(36)}`, name, levels: audible };
    this.stored = [...this.stored, mix];
  }

  rename(id: string, name: string): void {
    this.stored = this.stored.map(mix => (mix.id === id ? { ...mix, name } : mix));
  }

  delete(id: string): void {
    this.stored = this.stored.filter(mix => mix.id !== id);
  }
}
