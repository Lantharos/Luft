import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';

import { iconPixels, laidOutX, pixelScale } from '../../../shared/display/graphics.js';

const shownChildren = (container: Clutter.Actor) => container.get_children().filter(child => child.visible);

export const SheetLayout = GObject.registerClass(class SheetLayout extends Clutter.LayoutManager {
  columns = 0;
  private readonly cellWidth: number;
  private readonly cellHeight: number;
  private readonly icon: number;
  private readonly inset: number;

  constructor(cellWidth: number, cellHeight: number, icon: number, inset: number) {
    super();
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.icon = icon;
    this.inset = inset;
  }

  fit(width: number): number {
    return Math.max(1, Math.floor((width - 2 * this.inset - this.icon) / this.cellWidth) + 1);
  }

  vfunc_get_preferred_width(): [number, number] {
    return [this.icon + 2 * this.inset, this.icon + 2 * this.inset];
  }

  vfunc_get_preferred_height(container: Clutter.Actor, forWidth: number): [number, number] {
    const columns = forWidth < 0 ? 1 : this.fit(forWidth);
    const height = Math.ceil(shownChildren(container).length / columns) * this.cellHeight;
    return [height, height];
  }

  vfunc_allocate(container: Clutter.Actor, box: Clutter.ActorBox): void {
    const scale = pixelScale(container);
    const origin = laidOutX(container);
    const start = Math.round((origin + box.x1 + this.inset) * scale);
    const across = Math.round((origin + box.x2 - this.inset) * scale) - start;
    const icon = iconPixels(this.icon, scale);
    let cell = Math.round(this.cellWidth * scale);
    if ((cell - icon) % 2) cell -= 1;
    const overhang = (cell - icon) / 2;
    this.columns = this.fit(box.get_width());
    const gaps = Math.max(1, this.columns - 1);
    shownChildren(container).forEach((child, index) => {
      const left = start + Math.round((across - icon) * (index % this.columns) / gaps) - overhang;
      const y = box.y1 + Math.floor(index / this.columns) * this.cellHeight;
      child.allocate(new Clutter.ActorBox({ x1: left / scale - origin, y1: y, x2: (left + cell) / scale - origin, y2: y + this.cellHeight }));
    });
  }
});
