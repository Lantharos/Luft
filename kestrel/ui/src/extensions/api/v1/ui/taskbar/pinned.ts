import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';

const shownChildren = (container: Clutter.Actor) => container.get_children().filter(child => child.visible);

function widest(sizes: [number, number][]): [number, number] {
  return sizes.reduce(([minimum, natural], [childMinimum, childNatural]) =>
    [Math.max(minimum, childMinimum), Math.max(natural, childNatural)], [0, 0]);
}

export const PinnedLayout = GObject.registerClass(class PinnedLayout extends Clutter.LayoutManager {
  private readonly vertical: () => boolean;

  constructor(vertical: () => boolean) {
    super();
    this.vertical = vertical;
  }

  vfunc_get_preferred_width(container: Clutter.Actor, forHeight: number): [number, number] {
    return widest(shownChildren(container).map(child => child.get_preferred_width(forHeight)));
  }

  vfunc_get_preferred_height(container: Clutter.Actor, forWidth: number): [number, number] {
    return widest(shownChildren(container).map(child => child.get_preferred_height(forWidth)));
  }

  vfunc_allocate(container: Clutter.Actor, box: Clutter.ActorBox): void {
    const leftward = container.get_text_direction() === Clutter.TextDirection.RTL;
    for (const child of container.get_children()) {
      if (this.vertical()) {
        const width = Math.min(child.get_preferred_width(-1)[1], box.get_width());
        const height = child.get_preferred_height(width)[1];
        const x = box.x1 + Math.floor((box.get_width() - width) / 2);
        child.allocate(new Clutter.ActorBox({ x1: x, y1: box.y1, x2: x + width, y2: box.y1 + height }));
        continue;
      }
      const height = Math.min(child.get_preferred_height(-1)[1], box.get_height());
      const width = child.get_preferred_width(height)[1];
      const x = leftward ? box.x2 - width : box.x1;
      const y = box.y1 + Math.floor((box.get_height() - height) / 2);
      child.allocate(new Clutter.ActorBox({ x1: x, y1: y, x2: x + width, y2: y + height }));
    }
  }
});
