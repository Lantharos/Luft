import Shell from 'gi://Shell';

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Anchor {
  box: Box;
  centered: boolean;
}

export interface Placement {
  x: number;
  y: number;
  above: boolean;
}

const CARET_GAP = 6;
const EDGE_MARGIN = 8;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(value, maximum));
}

export function findAnchor(caret: Box | null): Anchor {
  const shell = global as unknown as Shell.Global;
  const shellFocus = shell.stage.get_key_focus();
  if (caret && (!shellFocus || shellFocus === shell.stage)) return { box: caret, centered: false };
  const window = shell.display.focus_window;
  if (window) return { box: window.get_frame_rect(), centered: true };
  const [x, y] = shell.get_pointer();
  return { box: { x, y, width: 0, height: 0 }, centered: false };
}

export function boxCenter(box: Box): [number, number] {
  return [box.x + box.width / 2, box.y + box.height / 2];
}

export function placeNear({ box, centered }: Anchor, width: number, height: number, area: Box): Placement {
  const left = area.x + EDGE_MARGIN;
  const right = area.x + area.width - EDGE_MARGIN - width;
  const top = area.y + EDGE_MARGIN;
  const bottom = area.y + area.height - EDGE_MARGIN - height;
  if (centered) {
    const [x, y] = boxCenter(box);
    return { x: Math.round(clamp(x - width / 2, left, right)), y: Math.round(clamp(y - height / 2, top, bottom)), above: false };
  }
  const roomBelow = area.y + area.height - EDGE_MARGIN - (box.y + box.height + CARET_GAP);
  const roomAbove = box.y - CARET_GAP - top;
  const flip = roomBelow < height && roomAbove > roomBelow;
  return {
    x: Math.round(clamp(box.x, left, right)),
    y: Math.round(clamp(flip ? box.y - CARET_GAP - height : box.y + box.height + CARET_GAP, top, bottom)),
    above: flip,
  };
}
