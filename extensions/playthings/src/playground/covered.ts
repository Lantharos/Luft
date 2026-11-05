import type { Rect } from '@luft/extension-api';

function without(rects: readonly Rect[], { x, y, width, height }: Rect): Rect[] {
  return rects.flatMap(rect => {
    const [right, bottom] = [rect.x + rect.width, rect.y + rect.height];
    if (x >= right || x + width <= rect.x || y >= bottom || y + height <= rect.y) return [rect];
    const [top, under] = [Math.max(rect.y, y), Math.min(bottom, y + height)];
    return [
      { x: rect.x, y: rect.y, width: rect.width, height: top - rect.y },
      { x: rect.x, y: under, width: rect.width, height: bottom - under },
      { x: rect.x, y: top, width: Math.max(0, x - rect.x), height: under - top },
      { x: x + width, y: top, width: Math.max(0, right - x - width), height: under - top },
    ].filter(part => part.width > 0 && part.height > 0);
  });
}

/** Whether `windows` leave nothing of `rect` showing. */
export const coveredBy = (rect: Rect, windows: readonly Rect[]) => windows.reduce(without, [rect]).length === 0;
