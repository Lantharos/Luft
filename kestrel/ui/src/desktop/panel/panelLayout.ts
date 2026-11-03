import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';

import { alongOf, layIslands, placeAlong, type Box } from '../../../../../packages/web/ui/src/taskbar/arrangement/index';
import { isVertical, rightToLeft } from '../../shared/layout/edge.js';
import { animateActor, Spring } from '../../shared/motion/motion.js';
import type { Island } from './islands/islandSet.js';
import { STRIP_HEIGHT, taskbarPreferences, type TaskbarLayout } from './preferences/taskbarPreferences.js';

function naturalSize(child: Clutter.Actor): [number, number] {
  const [, width] = child.get_preferred_width(-1);
  const [, height] = child.get_preferred_height(width);
  return [width, height];
}

const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;
const actorBox = ({ x, y, width, height }: Box) => new Clutter.ActorBox({ x1: x, y1: y, x2: x + width, y2: y + height });

/**
 * Lays out a panel's islands: along one bar when they're joined, or each at its own spot on the screen when they're
 * separate. When the arrangement changes, islands glide from where they were to where they go.
 */
export const PanelLayout = GObject.registerClass(
  class PanelLayout extends Clutter.LayoutManager {
    screen: () => TaskbarLayout = () => taskbarPreferences.desktop;
    islands: () => readonly Island[] = () => [];
    peek: Clutter.Actor | null = null;
    /** Whose `translation-x` runs from 0 to 1 while islands glide to their new places. */
    readonly glide = new Clutter.Actor({ width: 0, height: 0 });
    private from = new Map<Clutter.Actor, Box>();
    private allocated = new Map<Clutter.Actor, Box>();

    constructor() {
      super();
      this.glide.connect('notify::translation-x', () => this.layout_changed());
    }

    /** Lets every island glide from where it is now to its next place. */
    ease(): void {
      this.from = new Map();
      for (const { actor } of this.islands()) {
        if (!this.allocated.has(actor)) continue;
        const { x1, y1, x2, y2 } = actor.get_allocation_box();
        this.from.set(actor, { x: x1 + actor.translation_x, y: y1 + actor.translation_y, width: x2 - x1, height: y2 - y1 });
        actor.set_translation(0, 0, 0);
      }
      this.glide.translation_x = 0;
      animateActor(this.glide, { translation_x: 1, spring: Spring.smooth, onStopped: () => this.from.clear() });
      this.layout_changed();
    }

    vfunc_get_preferred_width(): [number, number] { return this.across(true); }

    vfunc_get_preferred_height(): [number, number] { return this.across(false); }

    private across(vertical: boolean): [number, number] {
      const screen = this.screen();
      const thickness = screen.joined && screen.vertical === vertical ? screen.metrics.thickness : 0;
      return [thickness, thickness];
    }

    vfunc_allocate(container: Clutter.Actor, allocation: Clutter.ActorBox): void {
      const width = allocation.get_width();
      const height = allocation.get_height();
      const screen = this.screen();
      const islands = this.islands();
      const boxes = screen.joined ? this.alongBar(islands, width, height) : this.onScreen(islands, width, height);
      const progress = this.glide.translation_x;
      this.allocated = new Map(islands.map((island, index) => [island.actor, boxes[index]]));
      for (const [actor, box] of this.allocated) {
        const from = this.from.get(actor);
        const shown = from && progress < 1 ? {
          x: mix(from.x, box.x, progress), y: mix(from.y, box.y, progress),
          width: Math.max(0, mix(from.width, box.width, progress)), height: Math.max(0, mix(from.height, box.height, progress)),
        } : box;
        actor.allocate(actorBox(shown));
      }
      this.glide.allocate(new Clutter.ActorBox());
      for (const child of container.get_children()) {
        if (!this.allocated.has(child) && child !== this.peek && child !== this.glide) child.allocate(actorBox({ x: 0, y: 0, width, height: STRIP_HEIGHT }));
      }
    }

    private alongBar(islands: readonly Island[], width: number, height: number): Box[] {
      const screen = this.screen();
      const vertical = screen.vertical;
      const length = vertical ? height : width;
      const across = vertical ? width : height;
      const reversed = !vertical && rightToLeft();
      const { inset } = screen.metrics;
      const peek = this.peek!;
      const peekLength = !peek.visible ? 0 : vertical ? peek.get_preferred_height(width)[1] : peek.get_preferred_width(height)[1];
      const box = (start: number, along: number, crossLength: number): Box => {
        const first = Math.round(reversed ? length - start - along : start);
        const cross = Math.round((across - crossLength) / 2);
        return vertical ? { x: cross, y: first, width: crossLength, height: along } : { x: first, y: cross, width: along, height: crossLength };
      };
      peek.allocate(actorBox(box(length - peekLength, peekLength, across)));
      const sizes = islands.map(island => naturalSize(island.actor)).map(([w, h]) => vertical ? [h, w] : [w, h]);
      const starts = placeAlong({ start: inset, end: length - peekLength - inset },
        islands.map((island, index) => ({ along: alongOf(island.spot), length: sizes[index][0] })), inset, length / 2);
      return islands.map((_, index) => box(starts[index], sizes[index][0], sizes[index][1]));
    }

    private onScreen(islands: readonly Island[], width: number, height: number): Box[] {
      const { thickness, margin } = this.screen().metrics;
      this.peek?.allocate(new Clutter.ActorBox());
      const placed = layIslands(islands.map(island => {
        const [naturalWidth, naturalHeight] = naturalSize(island.actor);
        return { spot: island.spot, length: isVertical(island.edge) ? naturalHeight : naturalWidth };
      }), { width, height, thickness, margin, rightToLeft: rightToLeft() });
      return islands.map(island => placed.find(box => box.spot === island.spot)!);
    }
  },
);
