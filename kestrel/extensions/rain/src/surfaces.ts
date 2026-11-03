import type { Rect } from '@luft/extension-api';

import { MAX_SURFACES } from './shader.js';

function contains(outer: Rect, inner: Rect): boolean {
  return inner.x >= outer.x && inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height;
}

function bounds(rects: readonly Rect[]): Rect {
  const left = Math.min(...rects.map(rect => rect.x));
  const top = Math.min(...rects.map(rect => rect.y));
  const right = Math.max(...rects.map(rect => rect.x + rect.width));
  const bottom = Math.max(...rects.map(rect => rect.y + rect.height));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

// Windows come topmost first. Ones hidden inside a higher window shelter nothing more, and past the
// shader's limit the rest share one box, which keeps them dry at the cost of some wallpaper between them.
export function fitSurfaces(windows: readonly Rect[]): readonly Rect[] {
  const visible = windows.filter((rect, index) => !windows.slice(0, index).some(above => contains(above, rect)));
  if (visible.length <= MAX_SURFACES) return visible;
  return [...visible.slice(0, MAX_SURFACES - 1), bounds(visible.slice(MAX_SURFACES - 1))];
}
