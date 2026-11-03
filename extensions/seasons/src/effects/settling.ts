import type { Rect } from '@luft/extension-api';

const GROWTH_PX_S = 0.3;
const MELT_PX_S = 0.4;
const DEEPEST_PX = 6;

const keyOf = (rect: Rect) => `${rect.x},${rect.y},${rect.width}`;

/**
 * How deep snow lies on top of each window and piece of the taskbar. It builds up slowly on whatever stays put, melts once
 * the snow stops, and slides off a window that moves.
 */
export class Settling {
  private readonly displays: Map<string, number>[] = [];

  depths(display: number, surfaces: readonly Rect[], density: number, elapsed: number): number[] {
    const previous = this.displays[display] ?? new Map<string, number>();
    const current = new Map<string, number>();
    const depths = surfaces.map(rect => {
      const key = keyOf(rect);
      const depth = previous.get(key) ?? 0;
      const deepest = DEEPEST_PX * density;
      const settled = depth < deepest ? Math.min(deepest, depth + GROWTH_PX_S * density * elapsed) : Math.max(deepest, depth - MELT_PX_S * elapsed);
      current.set(key, settled);
      return settled;
    });
    this.displays[display] = current;
    return depths;
  }
}
