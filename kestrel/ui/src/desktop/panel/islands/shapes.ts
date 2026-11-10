import type St from 'gi://St';

import type { Box } from '../../../../../../packages/web/ui/src/taskbar/arrangement/index';
import type { Edge } from '../../../shared/layout/edge.js';
import type { TaskbarLayout } from '../preferences/taskbarPreferences.js';
import type { IslandSet } from './islandSet.js';

export interface IslandShape extends Box {
  edge: Edge;
  radius: number;
}

const shapeListeners = new Set<() => void>();

export function taskbarShapesChanged(): void {
  for (const listener of shapeListeners) listener();
}

export function watchTaskbarShapes(changed: () => void): () => void {
  shapeListeners.add(changed);
  return () => shapeListeners.delete(changed);
}

function boxOf(actor: St.Widget): Box {
  const [x, y] = actor.get_transformed_position();
  const [width, height] = actor.get_transformed_size();
  return { x, y, width, height };
}

export class IslandShapes {
  constructor(private readonly panel: St.Widget, private readonly islands: IslandSet, private readonly screen: () => TaskbarLayout,
    private readonly barRadius: () => number) {}

  shapes(): IslandShape[] {
    const screen = this.screen();
    if (screen.joined) {
      if (!this.panel.mapped) return [];
      const box = boxOf(this.panel);
      return [{ ...box, edge: screen.edge, radius: Math.min(this.barRadius(), box.width / 2, box.height / 2) }];
    }
    return this.islands.islands
      .filter(({ actor }) => actor.mapped && actor.width > 0 && actor.height > 0)
      .map(({ actor, edge }) => {
        const box = boxOf(actor);
        return { ...box, edge, radius: Math.min(screen.metrics.radius, box.width / 2, box.height / 2) };
      });
  }

  anchors(): { actor: St.Widget; radius: number }[] {
    const screen = this.screen();
    if (screen.joined) return [{ actor: this.panel, radius: this.barRadius() }];
    return this.islands.islands.map(({ actor }) => ({ actor, radius: screen.metrics.radius }));
  }

  bar(): Box | null {
    const edge = this.screen().edge;
    const along = this.shapes().filter(shape => shape.edge === edge);
    if (!along.length) return null;
    const x = Math.min(...along.map(shape => shape.x));
    const y = Math.min(...along.map(shape => shape.y));
    return {
      x, y,
      width: Math.max(...along.map(shape => shape.x + shape.width)) - x,
      height: Math.max(...along.map(shape => shape.y + shape.height)) - y,
    };
  }
}
