import type { Outline, Rect } from '@luft/extension-api';

export const MAX_WINDOWS = 16;
export const MAX_TASKBAR_PARTS = 4;
export const MAX_SHAPES = MAX_WINDOWS + MAX_TASKBAR_PARTS;

function contains(outer: Rect, inner: Rect): boolean {
  return inner.x >= outer.x && inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height;
}

function bounds(outlines: readonly Outline[]): Outline {
  const left = Math.min(...outlines.map(outline => outline.x));
  const top = Math.min(...outlines.map(outline => outline.y));
  const right = Math.max(...outlines.map(outline => outline.x + outline.width));
  const bottom = Math.max(...outlines.map(outline => outline.y + outline.height));
  return { x: left, y: top, width: right - left, height: bottom - top, radii: [0, 0, 0, 0] };
}

// Windows come topmost first. Ones hidden inside a higher window shelter nothing more, and past the
// shader's limit the rest share one box, which keeps them dry at the cost of some wallpaper between them.
function fitWindows(windows: readonly Outline[]): readonly Outline[] {
  const visible = windows.filter((outline, index) => !windows.slice(0, index).some(above => contains(above, outline)));
  if (visible.length <= MAX_WINDOWS) return visible;
  return [...visible.slice(0, MAX_WINDOWS - 1), bounds(visible.slice(MAX_WINDOWS - 1))];
}

/** Everything on a display that things land on and bump into: the taskbar's pieces, then the windows. */
export function shapesOf(windows: readonly Outline[], taskbar: readonly Outline[]): readonly Outline[] {
  return [...taskbar.slice(0, MAX_TASKBAR_PARTS), ...fitWindows(windows)];
}
