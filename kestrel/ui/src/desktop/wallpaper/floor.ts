import { contrast, toneOf, type Rgb } from '../../appearance/color.js';
import { isVertical, type Edge } from '../../shared/layout/edge.js';
import type { Box } from '../../shared/layout/box.js';

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

const NEARBY_SHARE = 0.2;

export interface Backdrop {
  color: Rgb | null;
  extremes: Rgb[];
}

function along(samples: Rgb[], edge: Edge, share: number): Rgb[][] {
  const grid = Math.round(Math.sqrt(samples.length));
  const depth = Math.max(1, Math.round(grid * share));
  const at = (row: number, column: number) => samples[row * grid + column];
  const steps = Array.from({ length: grid }, (_, step) => step);
  const layers = Array.from({ length: depth }, (_, layer) => layer);
  switch (edge) {
    case 'bottom': return steps.map(column => layers.map(layer => at(grid - 1 - layer, column)));
    case 'top': return steps.map(column => layers.map(layer => at(layer, column)));
    case 'left': return steps.map(row => layers.map(layer => at(row, layer)));
    case 'right': return steps.map(row => layers.map(layer => at(row, grid - 1 - layer)));
  }
}

function backdropOf(samples: Rgb[]): Backdrop {
  return samples.length ? { color: average(samples), extremes: extremes(samples) } : { color: null, extremes: [] };
}

export class WallpaperFloor implements Backdrop {
  private readonly listeners = new Set<() => void>();
  private samples: Rgb[] = [];
  private band: Rgb[][] = [];
  private edge: Edge = 'bottom';
  private share = FLOOR_SHARE;
  color: Rgb | null = null;
  extremes: Rgb[] = [];
  busy = false;

  sample(samples: Rgb[]): void {
    this.samples = samples;
    this.measure();
  }

  follow(edge: Edge, screen: Box): boolean {
    const share = isVertical(edge) ? FLOOR_SHARE * screen.height / screen.width : FLOOR_SHARE;
    if (edge === this.edge && share === this.share) return false;
    this.edge = edge;
    this.share = share;
    if (this.samples.length) this.measure();
    return true;
  }

  around(fraction: number): Backdrop {
    const reach = Math.max(1, Math.round(this.band.length * NEARBY_SHARE / 2));
    const center = Math.round(fraction * (this.band.length - 1));
    return backdropOf(this.band.slice(Math.max(0, center - reach), center + reach + 1).flat());
  }

  private measure(): void {
    this.band = this.samples.length ? along(this.samples, this.edge, this.share) : [];
    const floor = this.band.flat();
    const { color, extremes } = backdropOf(floor);
    this.color = color;
    this.extremes = extremes;
    this.busy = !!color && floor.filter(sample => contrast(sample, color) >= BUSY_CONTRAST).length > floor.length * BUSY_SHARE;
    for (const listener of this.listeners) listener();
  }

  watch(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const wallpaperFloor = new WallpaperFloor();
