import { contrast, toneOf, type Rgb } from '../../appearance/color.js';

const FLOOR_SHARE = 0.07;
const EXTREME_SHARE = 0.1;
const BUSY_CONTRAST = 1.5;
const BUSY_SHARE = 0.15;

const average = (colors: Rgb[]) =>
  colors.reduce((sum, color) => sum.map((value, channel) => value + color[channel] / colors.length) as Rgb, [0, 0, 0]);

function extremes(colors: Rgb[]): Rgb[] {
  const byTone = colors.map(color => ({ color, tone: toneOf(color) })).sort((a, b) => a.tone - b.tone);
  const offset = Math.floor((byTone.length - 1) * EXTREME_SHARE);
  return [byTone[offset].color, byTone[byTone.length - 1 - offset].color];
}

export class WallpaperFloor {
  private readonly listeners = new Set<() => void>();
  color: Rgb | null = null;
  extremes: Rgb[] = [];
  busy = false;

  sample(samples: Rgb[]): void {
    const grid = Math.round(Math.sqrt(samples.length));
    const floor = samples.slice(-grid * Math.max(1, Math.round(grid * FLOOR_SHARE)));
    const color = floor.length ? average(floor) : null;
    this.color = color;
    this.extremes = color ? extremes(floor) : [];
    this.busy = !!color && floor.filter(sample => contrast(sample, color) >= BUSY_CONTRAST).length > floor.length * BUSY_SHARE;
    for (const listener of this.listeners) listener();
  }

  watch(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const wallpaperFloor = new WallpaperFloor();
