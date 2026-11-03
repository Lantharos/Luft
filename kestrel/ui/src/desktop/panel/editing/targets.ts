import St from 'gi://St';

import { spotNear, spotTargets, type IslandBox, type Spot } from '../../../../../../packages/web/ui/src/taskbar/arrangement/index';
import { rightToLeft } from '../../../shared/layout/edge.js';
import { animateActor, Spring } from '../../../shared/motion/motion.js';
import type { Monitor } from '../panel.js';
import type { TaskbarLayout } from '../preferences/taskbarPreferences.js';

const LENGTH_IN_BUTTONS = 3;
/** How far from a spot the pointer can be and still aim at it. */
const REACH = 220;

/** The twelve spots an island can go to, drawn as soft shapes along the screen's edges while people arrange the taskbar. */
export class SpotTargets {
  readonly actor = new St.Widget({ name: 'kestrel-arrange-targets' });
  /** Where each spot sits, in stage coordinates. */
  readonly targets: IslandBox[];
  private readonly shapes = new Map<Spot, St.Widget>();
  private lit: Spot | null = null;

  constructor(monitor: Monitor, screen: TaskbarLayout) {
    const { thickness, margin } = screen.metrics;
    const frame = { width: monitor.width, height: monitor.height, thickness, margin, rightToLeft: rightToLeft() };
    this.targets = spotTargets(frame, thickness * LENGTH_IN_BUTTONS).map(target => ({ ...target, x: target.x + monitor.x, y: target.y + monitor.y }));
    for (const target of this.targets) {
      const shape = new St.Widget({
        name: `kestrel-arrange-target-${target.spot}`, style_class: 'kestrel-arrange-target',
        x: target.x, y: target.y, width: target.width, height: target.height,
        style: `border-radius: ${Math.min(target.width, target.height) / 2}px;`,
      });
      shape.set_pivot_point(0.5, 0.5);
      this.actor.add_child(shape);
      this.shapes.set(target.spot, shape);
    }
  }

  /** The spot the pointer aims at: the nearest one within reach. */
  spotNear(x: number, y: number): Spot | null {
    return spotNear(this.targets, x, y, REACH);
  }

  light(spot: Spot | null): void {
    if (spot === this.lit) return;
    for (const [name, lit] of [[this.lit, false], [spot, true]] as const) {
      const shape = name && this.shapes.get(name);
      if (!shape) continue;
      if (lit) shape.add_style_pseudo_class('hover');
      else shape.remove_style_pseudo_class('hover');
      animateActor(shape, { scale_x: lit ? 1.06 : 1, scale_y: lit ? 1.06 : 1, spring: Spring.snappy });
    }
    this.lit = spot;
  }
}
