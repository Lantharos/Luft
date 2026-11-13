import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import { iconPixels, laidOutX, pixelScale } from '../../shared/display/graphics.js';
import { contentBoxOf } from '../../shared/layout/fill.js';

const spacingOf = (container: Clutter.Actor) => (container as St.Widget).get_theme_node().get_length('spacing');
const fitted = (child: Clutter.Actor, width: number) => width < 0 ? child.get_preferred_width(-1)[1] : Math.min(child.get_preferred_width(-1)[1], width);

export const CellRowLayout = GObject.registerClass(class CellRowLayout extends Clutter.LayoutManager {
  private readonly icon: number;

  constructor(icon: number) {
    super();
    this.icon = icon;
  }

  vfunc_get_preferred_width(container: Clutter.Actor, forHeight: number): [number, number] {
    const children = container.get_children();
    const spacing = spacingOf(container) * Math.max(0, children.length - 1);
    return children.reduce(([minimum, natural], child) => {
      const [childMinimum, childNatural] = child.get_preferred_width(forHeight);
      return [minimum + childMinimum, natural + childNatural];
    }, [spacing, spacing]);
  }

  vfunc_get_preferred_height(container: Clutter.Actor, forWidth: number): [number, number] {
    const children = container.get_children();
    const cell = forWidth < 0 ? -1 : (forWidth - spacingOf(container) * (children.length - 1)) / children.length;
    return children.reduce(([minimum, natural], child) => {
      const [childMinimum, childNatural] = child.get_preferred_height(cell);
      return [Math.max(minimum, childMinimum), Math.max(natural, childNatural)];
    }, [0, 0]);
  }

  vfunc_allocate(container: Clutter.Actor, box: Clutter.ActorBox): void {
    const children = container.get_children();
    const scale = pixelScale(container);
    const origin = laidOutX(container);
    const start = Math.round((origin + box.x1) * scale);
    const across = Math.round((origin + box.x2) * scale) - start;
    const gaps = Math.max(1, children.length - 1);
    let cell = Math.floor((across - spacingOf(container) * scale * (children.length - 1)) / children.length);
    if ((cell - iconPixels(this.icon, scale)) % 2) cell -= 1;
    const free = across - cell * children.length;
    children.forEach((child, index) => {
      const left = start + index * cell + Math.round(free * index / gaps);
      child.allocate(new Clutter.ActorBox({ x1: left / scale - origin, y1: box.y1, x2: (left + cell) / scale - origin, y2: box.y2 }));
    });
  }
});

export const CenteredColumnLayout = GObject.registerClass(class CenteredColumnLayout extends Clutter.LayoutManager {
  vfunc_get_preferred_width(container: Clutter.Actor, _forHeight: number): [number, number] {
    return container.get_children().reduce(([minimum, natural], child) => {
      const [childMinimum, childNatural] = child.get_preferred_width(-1);
      return [Math.max(minimum, childMinimum), Math.max(natural, childNatural)];
    }, [0, 0]);
  }

  vfunc_get_preferred_height(container: Clutter.Actor, forWidth: number): [number, number] {
    const children = container.get_children();
    const spacing = spacingOf(container) * Math.max(0, children.length - 1);
    return children.reduce(([minimum, natural], child) => {
      const [childMinimum, childNatural] = child.get_preferred_height(fitted(child, forWidth));
      return [minimum + childMinimum, natural + childNatural];
    }, [spacing, spacing]);
  }

  vfunc_allocate(container: Clutter.Actor): void {
    const box = contentBoxOf(container);
    const width = box.get_width();
    const spacing = spacingOf(container);
    let y = box.y1;
    for (const child of container.get_children()) {
      const childWidth = fitted(child, width);
      const height = child.get_preferred_height(childWidth)[1];
      const x = box.x1 + (width - childWidth) / 2;
      child.allocate(new Clutter.ActorBox({ x1: x, y1: y, x2: x + childWidth, y2: y + height }));
      y += height + spacing;
    }
  }
});
