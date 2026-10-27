import Clutter from 'gi://Clutter';
import St from 'gi://St';

export type Geometry = [x: number, y: number, width: number, height: number];

const { CursorType } = Clutter;

export const WEST_EDGES = [CursorType.NW_RESIZE, CursorType.W_RESIZE, CursorType.SW_RESIZE];
export const EAST_EDGES = [CursorType.NE_RESIZE, CursorType.E_RESIZE, CursorType.SE_RESIZE];
export const NORTH_EDGES = [CursorType.NW_RESIZE, CursorType.N_RESIZE, CursorType.NE_RESIZE];
export const SOUTH_EDGES = [CursorType.SW_RESIZE, CursorType.S_RESIZE, CursorType.SE_RESIZE];

const TO_EAST = new Map([[CursorType.NW_RESIZE, CursorType.NE_RESIZE], [CursorType.SW_RESIZE, CursorType.SE_RESIZE], [CursorType.W_RESIZE, CursorType.E_RESIZE]]);
const TO_WEST = new Map([[CursorType.NE_RESIZE, CursorType.NW_RESIZE], [CursorType.SE_RESIZE, CursorType.SW_RESIZE], [CursorType.E_RESIZE, CursorType.W_RESIZE]]);
const TO_SOUTH = new Map([[CursorType.NW_RESIZE, CursorType.SW_RESIZE], [CursorType.NE_RESIZE, CursorType.SE_RESIZE], [CursorType.N_RESIZE, CursorType.S_RESIZE]]);
const TO_NORTH = new Map([[CursorType.SW_RESIZE, CursorType.NW_RESIZE], [CursorType.SE_RESIZE, CursorType.NE_RESIZE], [CursorType.S_RESIZE, CursorType.N_RESIZE]]);

const near = (distance: number, threshold: number) => distance >= 0 && distance <= threshold;

export function cursorTypeAt([leftX, topY, width, height]: Geometry, handleSize: number, x: number, y: number): Clutter.CursorType {
  const rightX = leftX + width - 1;
  const bottomY = topY + height - 1;

  const limit = (handleSize / 2) ** 2;
  if ((leftX - x) ** 2 + (topY - y) ** 2 <= limit) return CursorType.NW_RESIZE;
  if ((rightX - x) ** 2 + (topY - y) ** 2 <= limit) return CursorType.NE_RESIZE;
  if ((leftX - x) ** 2 + (bottomY - y) ** 2 <= limit) return CursorType.SW_RESIZE;
  if ((rightX - x) ** 2 + (bottomY - y) ** 2 <= limit) return CursorType.SE_RESIZE;

  const threshold = 10 * St.ThemeContext.get_for_stage(global.stage).scaleFactor;
  const top = near(topY - y, threshold);
  const bottom = near(y - bottomY, threshold);
  const between = topY - y < 0 && y - bottomY < 0;

  if (near(leftX - x, threshold)) {
    if (top) return CursorType.NW_RESIZE;
    if (bottom) return CursorType.SW_RESIZE;
    if (between) return CursorType.W_RESIZE;
  } else if (near(x - rightX, threshold)) {
    if (top) return CursorType.NE_RESIZE;
    if (bottom) return CursorType.SE_RESIZE;
    if (between) return CursorType.E_RESIZE;
  } else if (leftX - x < 0 && x - rightX < 0) {
    if (top) return CursorType.N_RESIZE;
    if (bottom) return CursorType.S_RESIZE;
    if (between) return CursorType.MOVE;
  }

  return CursorType.CROSSHAIR;
}

export function snapPoint(cursor: Clutter.CursorType, [leftX, topY, width, height]: Geometry, x: number, y: number): [number, number] {
  const rightX = leftX + width - 1;
  const bottomY = topY + height - 1;
  const snapX = WEST_EDGES.includes(cursor) ? leftX : EAST_EDGES.includes(cursor) ? rightX : x;
  const snapY = NORTH_EDGES.includes(cursor) ? topY : SOUTH_EDGES.includes(cursor) ? bottomY : y;
  return [snapX, snapY];
}

export function orientCursor(cursor: Clutter.CursorType, rightward: boolean, downward: boolean): Clutter.CursorType {
  const horizontal = (rightward ? TO_EAST : TO_WEST).get(cursor) ?? cursor;
  return (downward ? TO_SOUTH : TO_NORTH).get(horizontal) ?? horizontal;
}
