import Clutter from 'gi://Clutter';
import type St from 'gi://St';

import { edgeOf, type Arrangement, type Spot } from '../../../../../../packages/web/ui/src/taskbar/arrangement/index';
import { isVertical, rightToLeft } from '../../../shared/layout/edge.js';
import { animateActor, Spring } from '../../../shared/motion/motion.js';
import type { Island } from '../islands/islandSet.js';
import type { KestrelPanel } from '../panel.js';
import type { SpotTargets } from './targets.js';

const THRESHOLD = 8;
const AROUND_ISLAND = 12;
const GHOST_OPACITY = 90;

export type Grip = { island: Island } | { element: string; actor: Clutter.Actor };

interface DragHost {
  readonly panel: KestrelPanel;
  readonly targets: SpotTargets;
  readonly layer: St.Widget;
  draft(): Arrangement;
  islandTo(arrangement: Arrangement, from: Spot, spot: Spot): Arrangement;
  elementTo(arrangement: Arrangement, element: string, spot: Spot, index: number): Arrangement;
  preview(arrangement: Arrangement): void;
}

function boxOf(actor: Clutter.Actor) {
  const [x, y] = actor.get_transformed_position();
  const [width, height] = actor.get_transformed_size();
  return { x, y, width, height };
}

const within = ({ x, y, width, height }: ReturnType<typeof boxOf>, px: number, py: number, around = 0) =>
  px >= x - around && px < x + width + around && py >= y - around && py < y + height + around;

export class Dragging {
  private pressed: { grip: Grip; x: number; y: number } | null = null;
  private moving: { grip: Grip; origin: Arrangement; dx: number; dy: number; clone: Clutter.Clone | null; follow: number } | null = null;
  private pointer: [number, number] = [0, 0];

  constructor(private readonly host: DragHost) {}

  get active(): boolean {
    return this.moving !== null;
  }

  elementAt(x: number, y: number): Grip | null {
    for (const island of this.host.panel.islandSet.islands) {
      const index = island.box.get_children().findIndex(child => child.visible && within(boxOf(child), x, y));
      if (index >= 0) return { element: island.elements[index], actor: island.box.get_child_at_index(index)! };
    }
    return null;
  }

  press(grip: Grip, x: number, y: number): void {
    this.pressed = { grip, x, y };
  }

  motion(x: number, y: number): void {
    this.pointer = [x, y];
    if (this.pressed && !this.moving && Math.hypot(x - this.pressed.x, y - this.pressed.y) >= THRESHOLD) this.begin(this.pressed.grip);
    if (!this.moving) return;
    this.follow();
    this.host.preview(this.aimed(x, y));
  }

  release(): void {
    this.pressed = null;
    const moving = this.moving;
    if (!moving) return;
    this.moving = null;
    this.host.targets.light(null);
    if ('island' in moving.grip) {
      moving.grip.island.actor.disconnect(moving.follow);
      this.host.panel.layout.ease();
      return;
    }
    const { actor } = moving.grip;
    const clone = moving.clone!;
    const [cloneX, cloneY] = clone.get_transformed_position();
    const [x, y] = actor.get_transformed_position();
    clone.destroy();
    actor.opacity = 255;
    actor.set_translation(cloneX - x + actor.translation_x, cloneY - y + actor.translation_y, 0);
    animateActor(actor, { translation_x: 0, translation_y: 0, spring: Spring.snappy });
  }

  cancel(): Arrangement | null {
    const origin = this.moving?.origin ?? null;
    this.release();
    return origin;
  }

  private begin(grip: Grip): void {
    const origin = this.host.draft();
    if ('island' in grip) {
      const { actor } = grip.island;
      const box = boxOf(actor);
      actor.get_parent()!.set_child_above_sibling(actor, null);
      const follow = actor.connect('notify::allocation', () => this.follow());
      this.moving = { grip, origin, dx: this.pressed!.x - box.x, dy: this.pressed!.y - box.y, clone: null, follow };
      return;
    }
    const box = boxOf(grip.actor);
    const clone = new Clutter.Clone({ source: grip.actor, x: box.x, y: box.y, width: box.width, height: box.height });
    clone.set_pivot_point(0.5, 0.5);
    this.host.layer.add_child(clone);
    animateActor(clone, { scale_x: 1.08, scale_y: 1.08, spring: Spring.snappy });
    grip.actor.opacity = GHOST_OPACITY;
    this.moving = { grip, origin, dx: this.pressed!.x - box.x, dy: this.pressed!.y - box.y, clone, follow: 0 };
  }

  private follow(): void {
    const moving = this.moving;
    if (!moving) return;
    const [x, y] = this.pointer;
    if (moving.clone) {
      moving.clone.set_position(x - moving.dx, y - moving.dy);
      return;
    }
    const { actor } = (moving.grip as { island: Island }).island;
    const [placedX, placedY] = actor.get_transformed_position();
    actor.set_translation(x - moving.dx - (placedX - actor.translation_x), y - moving.dy - (placedY - actor.translation_y), 0);
  }

  private aimed(x: number, y: number): Arrangement {
    const moving = this.moving!;
    const { targets } = this.host;
    const { grip } = moving;
    if ('island' in grip) {
      const from = moving.origin.find(island => island.elements.includes(grip.island.elements[0]))?.spot;
      const spot = targets.spotNear(x, y);
      targets.light(spot);
      return spot && from ? this.host.islandTo(moving.origin, from, spot) : moving.origin;
    }
    const { element } = grip;
    const island = this.host.panel.islandSet.islands.find(shown => within(boxOf(shown.actor), x, y, AROUND_ISLAND));
    if (island) {
      targets.light(null);
      return this.host.elementTo(moving.origin, element, island.spot, this.indexAmong(island, element, x, y));
    }
    const spot = targets.spotNear(x, y);
    targets.light(spot);
    return spot ? this.host.elementTo(moving.origin, element, spot, Infinity) : moving.origin;
  }

  private indexAmong(island: Island, element: string, x: number, y: number): number {
    const vertical = isVertical(edgeOf(island.spot));
    const reversed = !vertical && rightToLeft();
    const others = island.box.get_children().filter((_, index) => island.elements[index] !== element);
    return others.filter(child => {
      const box = boxOf(child);
      const middle = vertical ? box.y + box.height / 2 : box.x + box.width / 2;
      const pointer = vertical ? y : x;
      return reversed ? middle > pointer : middle < pointer;
    }).length;
  }
}
