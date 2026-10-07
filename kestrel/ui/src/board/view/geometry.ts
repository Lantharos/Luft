import type { Box } from '../../shared/placement.js';

export interface View {
  x: number;
  y: number;
  scale: number;
}

export const MIN_SCALE = 0.08;
export const FULL_SIZE = 1;
export const PLACEMENT_GAP = 32;
const MAGNIFIED_FILL = 0.9;

export function clampScale(scale: number, max = FULL_SIZE): number {
  return Math.max(MIN_SCALE, Math.min(max, scale));
}

export function magnifiedScale(box: Box, viewport: Box): number {
  return Math.max(FULL_SIZE, MAGNIFIED_FILL * Math.min(viewport.width / box.width, viewport.height / box.height));
}

export function copyView(target: View, source: View): View {
  target.x = source.x;
  target.y = source.y;
  target.scale = source.scale;
  return target;
}

export function zoomAround(view: View, viewport: Box, scale: number, screenX: number, screenY: number): void {
  const offsetX = screenX - viewport.x;
  const offsetY = screenY - viewport.y;
  view.x += offsetX / view.scale - offsetX / scale;
  view.y += offsetY / view.scale - offsetY / scale;
  view.scale = scale;
}

export function centerOn(view: View, viewport: Box, box: Box, amount: number): void {
  view.x += (box.x + box.width / 2 - viewport.width / 2 / view.scale - view.x) * amount;
  view.y += (box.y + box.height / 2 - viewport.height / 2 / view.scale - view.y) * amount;
}

export function fitView(view: View, bounds: Box, viewport: Box, padding: number): void {
  const scale = clampScale(Math.min(
    (viewport.width - 2 * padding) / Math.max(1, bounds.width),
    (viewport.height - 2 * padding) / Math.max(1, bounds.height)));
  view.scale = scale;
  view.x = bounds.x + bounds.width / 2 - viewport.width / 2 / scale;
  view.y = bounds.y + bounds.height / 2 - viewport.height / 2 / scale;
}

export function screenBox(view: View, viewport: Box, box: Box): Box {
  return {
    x: viewport.x + (box.x - view.x) * view.scale,
    y: viewport.y + (box.y - view.y) * view.scale,
    width: box.width * view.scale,
    height: box.height * view.scale,
  };
}

export function visibleCanvas(view: View, viewport: Box): Box {
  return { x: view.x, y: view.y, width: viewport.width / view.scale, height: viewport.height / view.scale };
}

export function boundsOf(boxes: Iterable<Box>): Box | null {
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  for (const box of boxes) {
    left = Math.min(left, box.x);
    top = Math.min(top, box.y);
    right = Math.max(right, box.x + box.width);
    bottom = Math.max(bottom, box.y + box.height);
  }
  return left === Infinity ? null : { x: left, y: top, width: right - left, height: bottom - top };
}

const NEIGHBOR_CONE = Math.tan(Math.PI / 3);
const SIDEWAYS_WEIGHT = 2;

export function nearestInDirection(from: Box, candidates: readonly Box[], directionX: number, directionY: number): number {
  const centerX = from.x + from.width / 2;
  const centerY = from.y + from.height / 2;
  let best = -1;
  let bestScore = Infinity;
  candidates.forEach((box, index) => {
    const offsetX = box.x + box.width / 2 - centerX;
    const offsetY = box.y + box.height / 2 - centerY;
    const along = offsetX * directionX + offsetY * directionY;
    const sideways = Math.abs(offsetX * directionY - offsetY * directionX);
    if (along <= 0 || sideways > along * NEIGHBOR_CONE) return;
    const score = along + sideways * SIDEWAYS_WEIGHT;
    if (score < bestScore) {
      bestScore = score;
      best = index;
    }
  });
  return best;
}

export function intersection(a: Box, b: Box): number {
  const width = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const height = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  return width > 0 && height > 0 ? width * height : 0;
}

export function overlaps(a: Box, b: Box, gap = 0): boolean {
  return a.x < b.x + b.width + gap && b.x < a.x + a.width + gap &&
    a.y < b.y + b.height + gap && b.y < a.y + a.height + gap;
}

function pushOut(fixed: Box, moving: Box, gap: number): void {
  const right = fixed.x + fixed.width + gap - moving.x;
  const left = moving.x + moving.width + gap - fixed.x;
  const down = fixed.y + fixed.height + gap - moving.y;
  const up = moving.y + moving.height + gap - fixed.y;
  const horizontal = Math.min(right, left);
  const vertical = Math.min(down, up);
  if (horizontal <= vertical) moving.x += right <= left ? right : -left;
  else moving.y += down <= up ? down : -up;
}

export function pushApart(boxes: Box[], anchor: number, gap = 0): void {
  const queue = [anchor];
  let budget = boxes.length * boxes.length * 4;
  while (queue.length && budget-- > 0) {
    const pusher = boxes[queue.shift()!]!;
    for (let index = 0; index < boxes.length; index++) {
      if (index === anchor || boxes[index] === pusher || !overlaps(pusher, boxes[index]!, gap)) continue;
      pushOut(pusher, boxes[index]!, gap);
      queue.push(index);
    }
  }
}

export function freeSpot(occupied: readonly Box[], width: number, height: number, centerX: number, centerY: number, gap = PLACEMENT_GAP): [number, number] {
  const wanted: Box = { x: Math.round(centerX - width / 2), y: Math.round(centerY - height / 2), width, height };
  if (!occupied.some(box => overlaps(box, wanted, gap))) return [wanted.x, wanted.y];
  let best: [number, number] | null = null;
  let bestDistance = Infinity;
  const consider = (x: number, y: number) => {
    const candidate: Box = { x, y, width, height };
    if (occupied.some(box => overlaps(box, candidate, gap - 0.5))) return;
    const distance = Math.hypot(x + width / 2 - centerX, y + height / 2 - centerY);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = [x, y];
    }
  };
  for (const box of occupied) {
    const xs = [box.x + box.width + gap, box.x - width - gap, box.x, box.x + box.width - width, wanted.x];
    const ys = [box.y + box.height + gap, box.y - height - gap, box.y, box.y + box.height - height, wanted.y];
    for (const x of xs) for (const y of ys) consider(x, y);
  }
  return best ?? [wanted.x, wanted.y];
}

export function settle(boxes: Box[], gap = PLACEMENT_GAP): void {
  const placed: Box[] = [];
  for (const box of boxes) {
    if (placed.some(other => overlaps(other, box, gap - 0.5))) {
      const [x, y] = freeSpot(placed, box.width, box.height, box.x + box.width / 2, box.y + box.height / 2, gap);
      box.x = x;
      box.y = y;
    }
    placed.push(box);
  }
}

export function snapEdges(moving: Box, others: readonly Box[], threshold: number): void {
  let bestX = threshold, bestY = threshold, shiftX = 0, shiftY = 0;
  for (const other of others) {
    const besideVertically = moving.y < other.y + other.height + threshold && other.y < moving.y + moving.height + threshold;
    const besideHorizontally = moving.x < other.x + other.width + threshold && other.x < moving.x + moving.width + threshold;
    if (besideVertically) {
      for (const shift of [other.x + other.width - moving.x, other.x - moving.x - moving.width, other.x - moving.x, other.x + other.width - moving.x - moving.width]) {
        if (Math.abs(shift) < bestX) {
          bestX = Math.abs(shift);
          shiftX = shift;
        }
      }
    }
    if (besideHorizontally) {
      for (const shift of [other.y + other.height - moving.y, other.y - moving.y - moving.height, other.y - moving.y, other.y + other.height - moving.y - moving.height]) {
        if (Math.abs(shift) < bestY) {
          bestY = Math.abs(shift);
          shiftY = shift;
        }
      }
    }
  }
  moving.x += shiftX;
  moving.y += shiftY;
}

export interface ExitPlan<K> {
  placed: [K, Box][];
  minimized: K[];
  maximized: K | null;
}

const VISIBLE_FRACTION = 0.5;
const FILLING_FRACTION = 0.6;

export function fits(view: View, box: Box, viewport: Box, padding: number): boolean {
  const fitted = { x: 0, y: 0, scale: 1 };
  fitView(fitted, box, viewport, padding);
  return Math.abs(fitted.scale - view.scale) < 0.005 &&
    Math.abs(fitted.x - view.x) * view.scale < 2 && Math.abs(fitted.y - view.y) * view.scale < 2;
}

export function planExit<K>(windows: readonly [K, Box][], view: View, viewport: Box, workArea: Box, fitted: K | null): ExitPlan<K> {
  const plan: ExitPlan<K> = { placed: [], minimized: [], maximized: fitted };
  const viewportArea = viewport.width * viewport.height;
  for (const [key, box] of windows) {
    if (key === fitted) continue;
    const onScreen = screenBox(view, viewport, box);
    const visible = intersection(onScreen, viewport);
    if (!plan.maximized && visible >= viewportArea * FILLING_FRACTION) {
      plan.maximized = key;
      continue;
    }
    if (visible < onScreen.width * onScreen.height * VISIBLE_FRACTION) {
      plan.minimized.push(key);
      continue;
    }
    const width = Math.min(box.width, workArea.width);
    const height = Math.min(box.height, workArea.height);
    const centerX = onScreen.x + onScreen.width / 2;
    const centerY = onScreen.y + onScreen.height / 2;
    plan.placed.push([key, {
      x: Math.round(Math.max(workArea.x, Math.min(centerX - width / 2, workArea.x + workArea.width - width))),
      y: Math.round(Math.max(workArea.y, Math.min(centerY - height / 2, workArea.y + workArea.height - height))),
      width, height,
    }]);
  }
  if (plan.maximized !== null) {
    plan.minimized.push(...plan.placed.map(([key]) => key));
    plan.placed = [];
  }
  return plan;
}
