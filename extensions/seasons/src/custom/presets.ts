import type { Extension, Stored } from '@luft/extension-api';

export type Landing = 'through' | 'bounce' | 'settle';

/** A set of pictures people chose to fall, and how they fall. */
export interface Preset {
  id: string;
  name: string;
  /** Copies in the extension's data folder. */
  pictures: string[];
  /** How many fall, 0.1 to 1. */
  amount: number;
  /** Smallest and largest size in pixels. */
  smallest: number;
  largest: number;
  /** Pixels a second. */
  speed: number;
  /** Sideways drift for each pixel they fall, -1 to 1. */
  wind: number;
  /** How much they turn as they fall, 0 to 1. */
  spin: number;
  landing: Landing;
  /** A sound in the data folder played as they land, or none. */
  impact: string | null;
}

const PRESETS = 'custom-presets';
const CHOSEN = 'custom-preset';

export const LIMITS = {
  amount: [0.1, 1],
  size: [16, 128],
  speed: [30, 600],
  wind: [-1, 1],
  spin: [0, 1],
} as const;

function fresh(name: string): Preset {
  return {
    id: `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`,
    name, pictures: [], amount: 0.4, smallest: 28, largest: 56, speed: 160, wind: 0.1, spin: 0.4, landing: 'bounce', impact: null,
  };
}

/** The presets people made, kept in the extension's storage, and which one falls. */
export class Presets {
  private readonly listeners = new Set<() => void>();

  constructor(private readonly seasons: Extension) {}

  get all(): Preset[] {
    return this.seasons.storage.get<Preset[] & Stored>(PRESETS) ?? [];
  }

  get chosen(): Preset | null {
    const all = this.all;
    const id = this.seasons.storage.get<string>(CHOSEN);
    return all.find(preset => preset.id === id) ?? all[0] ?? null;
  }

  watch(changed: () => void): void {
    this.listeners.add(changed);
  }

  create(name: string): Preset {
    const preset = fresh(name);
    this.save([...this.all, preset]);
    this.choose(preset.id);
    return preset;
  }

  choose(id: string): void {
    this.seasons.storage.set(CHOSEN, id);
    this.changed();
  }

  update(id: string, changes: Partial<Omit<Preset, 'id'>>): void {
    this.save(this.all.map(preset => preset.id === id ? { ...preset, ...changes } : preset));
  }

  remove(id: string): void {
    const gone = this.all.find(preset => preset.id === id);
    if (!gone) return;
    const others = this.all.filter(preset => preset.id !== id);
    for (const file of [...gone.pictures, ...gone.impact ? [gone.impact] : []]) {
      if (!others.some(preset => preset.pictures.includes(file) || preset.impact === file)) this.seasons.deleteFile(file);
    }
    this.save(others);
  }

  forgetPicture(id: string, picture: string): void {
    const preset = this.all.find(candidate => candidate.id === id);
    if (!preset) return;
    this.update(id, { pictures: preset.pictures.filter(file => file !== picture) });
    if (!this.all.some(other => other.pictures.includes(picture))) this.seasons.deleteFile(picture);
  }

  private save(presets: Preset[]): void {
    this.seasons.storage.set(PRESETS, presets as unknown as Stored);
    this.changed();
  }

  private changed(): void {
    for (const listener of [...this.listeners]) listener();
  }
}
