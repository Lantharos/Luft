import type { Monitor } from '../../../../desktop/panel/panel.js';
import { SURFACE_GAP } from '../../../../shared/layout/surface.js';
import type { Edge } from '../../../../shared/layout/edge.js';
import type { ExtensionHost } from '../../../host.js';
import type { Point, Rect, ScreenPosition } from '../types.js';

const MARGIN = 12;

/** Where a pop-up goes before its size is known: a point it grows away from, and the edge it grows from. */
export interface Placement {
  monitor: Monitor;
  area: Rect;
  /** The side of the pop-up nearest what it belongs to, which it slides in from. */
  edge: Edge;
  place(width: number, height: number): Point;
}

const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(value, Math.max(low, high)));

function inside(area: Rect, x: number, y: number, width: number, height: number): Point {
  return {
    x: Math.round(clamp(x, area.x + MARGIN, area.x + area.width - width - MARGIN)),
    y: Math.round(clamp(y, area.y + MARGIN, area.y + area.height - height - MARGIN)),
  };
}

function taskbarEdge(monitor: Monitor, bar: Rect): Edge {
  if (bar.height > bar.width) return bar.x + bar.width / 2 < monitor.x + monitor.width / 2 ? 'left' : 'right';
  return bar.y + bar.height / 2 < monitor.y + monitor.height / 2 ? 'top' : 'bottom';
}

export function besideTaskbar(host: ExtensionHost, monitor: Monitor, button: { x: number; y: number; width: number; height: number }): Placement {
  const bar = host.taskbar(monitor) ?? { x: monitor.x, y: monitor.y + monitor.height, width: monitor.width, height: 0 };
  const edge = taskbarEdge(monitor, bar);
  const area = { x: monitor.x, y: monitor.y, width: monitor.width, height: monitor.height };
  const middleX = button.x + button.width / 2;
  const middleY = button.y + button.height / 2;
  return {
    monitor, area, edge,
    place: (width, height) => {
      switch (edge) {
        case 'bottom': return inside(area, middleX - width / 2, bar.y - SURFACE_GAP - height, width, height);
        case 'top': return inside(area, middleX - width / 2, bar.y + bar.height + SURFACE_GAP, width, height);
        case 'left': return inside(area, bar.x + bar.width + SURFACE_GAP, middleY - height / 2, width, height);
        case 'right': return inside(area, bar.x - SURFACE_GAP - width, middleY - height / 2, width, height);
      }
    },
  };
}

export function atPoint(host: ExtensionHost, monitor: Monitor, point: Point): Placement {
  const area = host.workArea(monitor.index);
  return { monitor, area, edge: 'top', place: (width, height) => inside(area, point.x, point.y, width, height) };
}

export function atPosition(host: ExtensionHost, monitor: Monitor, position: ScreenPosition): Placement {
  const area = host.workArea(monitor.index);
  const [vertical, horizontal] = position === 'center' ? ['center', 'center'] : position.includes('-') ? position.split('-') :
    position === 'left' || position === 'right' ? ['center', position] : [position, 'center'];
  const edge: Edge = vertical === 'top' ? 'top' : vertical === 'bottom' ? 'bottom' : horizontal === 'left' ? 'left' : horizontal === 'right' ? 'right' : 'bottom';
  return {
    monitor, area, edge,
    place: (width, height) => {
      const x = horizontal === 'left' ? area.x : horizontal === 'right' ? area.x + area.width - width : area.x + (area.width - width) / 2;
      const y = vertical === 'top' ? area.y : vertical === 'bottom' ? area.y + area.height - height : area.y + (area.height - height) / 2;
      return inside(area, x, y, width, height);
    },
  };
}
