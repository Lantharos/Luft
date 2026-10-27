import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import type Mtk from 'gi://Mtk';

import * as Main from '../../main.js';
import * as Util from '../../runtime/util.js';

const WINDOW_PREVIEW_MAXIMUM_SCALE = 0.95;
const LAYOUT_SCALE_WEIGHT = 1;
const LAYOUT_SPACE_WEIGHT = 0.1;

export interface GridWindow extends Clutter.Actor {
  readonly boundingBox: Mtk.Rectangle;
  readonly windowCenter: { x: number; y: number };
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Row {
  x: number;
  y: number;
  width: number;
  height: number;
  fullWidth: number;
  fullHeight: number;
  additionalScale: number;
  windows: GridWindow[];
}

interface GridLayout {
  numRows: number;
  rows: Row[];
  maxColumns: number;
  gridWidth: number;
  gridHeight: number;
  scale: number;
}

type Slot = [x: number, y: number, width: number, height: number, window: GridWindow];

function newRow(): Row {
  return { x: 0, y: 0, width: 0, height: 0, fullWidth: 0, fullHeight: 0, additionalScale: 1, windows: [] };
}

function keepSameRow(row: Row, width: number, idealRowWidth: number): boolean {
  if (row.fullWidth + width <= idealRowWidth) return true;

  const oldRatio = row.fullWidth / idealRowWidth;
  const newRatio = (row.fullWidth + width) / idealRowWidth;
  return Math.abs(1 - newRatio) < Math.abs(1 - oldRatio);
}

function isBetterScaleAndSpace(oldScale: number, oldSpace: number, scale: number, space: number): boolean {
  const spacePower = (space - oldSpace) * LAYOUT_SPACE_WEIGHT;
  const scalePower = (scale - oldScale) * LAYOUT_SCALE_WEIGHT;

  if (scale > oldScale && space > oldSpace) return true;
  if (scale > oldScale && space <= oldSpace) return scalePower > spacePower;
  if (scale <= oldScale && space > oldSpace) return spacePower > scalePower;
  return false;
}

class WindowGridStrategy {
  constructor(private readonly monitorHeight: number, private readonly spacing: number) {}

  private windowScale(window: GridWindow): number {
    return Util.lerp(1.5, 1, window.boundingBox.height / this.monitorHeight);
  }

  computeLayout(windows: GridWindow[], numRows: number): GridLayout {
    let totalWidth = 0;
    for (const window of windows) totalWidth += window.boundingBox.width * this.windowScale(window);

    const idealRowWidth = totalWidth / numRows;
    const sortedWindows = windows.toSorted((a, b) => a.windowCenter.y - b.windowCenter.y);

    const rows: Row[] = [];
    let windowIdx = 0;
    for (let i = 0; i < numRows; i++) {
      const row = newRow();
      rows.push(row);

      for (; windowIdx < sortedWindows.length; windowIdx++) {
        const window = sortedWindows[windowIdx];
        const s = this.windowScale(window);
        const width = window.boundingBox.width * s;
        const height = window.boundingBox.height * s;
        row.fullHeight = Math.max(row.fullHeight, height);

        if (!keepSameRow(row, width, idealRowWidth) && i !== numRows - 1) break;
        row.windows.push(window);
        row.fullWidth += width;
      }
    }

    let gridHeight = 0;
    let maxRow = rows[0];
    for (const row of rows) {
      row.windows.sort((a, b) => a.windowCenter.x - b.windowCenter.x);
      if (row.fullWidth > maxRow.fullWidth) maxRow = row;
      gridHeight += row.fullHeight;
    }

    return {
      numRows,
      rows,
      maxColumns: maxRow.windows.length,
      gridWidth: maxRow.fullWidth,
      gridHeight,
      scale: 0,
    };
  }

  computeScaleAndSpace(layout: GridLayout, area: Area): [scale: number, space: number] {
    const hspacing = (layout.maxColumns - 1) * this.spacing;
    const vspacing = (layout.numRows - 1) * this.spacing;

    const horizontalScale = (area.width - hspacing) / layout.gridWidth;
    const verticalScale = (area.height - vspacing) / layout.gridHeight;
    const scale = Math.min(horizontalScale, verticalScale, WINDOW_PREVIEW_MAXIMUM_SCALE);

    const scaledLayoutWidth = layout.gridWidth * scale + hspacing;
    const scaledLayoutHeight = layout.gridHeight * scale + vspacing;
    const space = (scaledLayoutWidth * scaledLayoutHeight) / (area.width * area.height);

    layout.scale = scale;
    return [scale, space];
  }

  computeWindowSlots(layout: GridLayout, area: Area): Slot[] {
    const { rows, scale } = layout;
    for (const row of rows) {
      row.width = row.fullWidth * scale + (row.windows.length - 1) * this.spacing;
      row.height = row.fullHeight * scale;
    }

    let heightWithoutSpacing = 0;
    for (const row of rows) heightWithoutSpacing += row.height;

    const verticalSpacing = (rows.length - 1) * this.spacing;
    const additionalVerticalScale = Math.min(1, (area.height - verticalSpacing) / heightWithoutSpacing);

    let compensation = 0;
    let y = 0;
    for (const row of rows) {
      const horizontalSpacing = (row.windows.length - 1) * this.spacing;
      const widthWithoutSpacing = row.width - horizontalSpacing;
      const additionalHorizontalScale = Math.min(1, (area.width - horizontalSpacing) / widthWithoutSpacing);

      if (additionalHorizontalScale < additionalVerticalScale) {
        row.additionalScale = additionalHorizontalScale;
        compensation += (additionalVerticalScale - additionalHorizontalScale) * row.height;
      } else {
        row.additionalScale = additionalVerticalScale;
      }

      row.x = area.x + (Math.max(area.width - (widthWithoutSpacing * row.additionalScale + horizontalSpacing), 0) / 2);
      row.y = area.y + (Math.max(area.height - (heightWithoutSpacing + verticalSpacing), 0) / 2) + y;
      y += row.height * row.additionalScale + this.spacing;
    }

    compensation /= 2;

    const slots: Slot[] = [];
    for (const row of rows) {
      const rowY = row.y + compensation;
      const rowHeight = row.height * row.additionalScale;

      let x = row.x;
      for (const window of row.windows) {
        let s = scale * this.windowScale(window) * row.additionalScale;
        const cellWidth = window.boundingBox.width * s;
        const cellHeight = window.boundingBox.height * s;

        s = Math.min(s, WINDOW_PREVIEW_MAXIMUM_SCALE);
        const cloneWidth = window.boundingBox.width * s;
        const cloneHeight = window.boundingBox.height * s;

        const cloneX = x + (cellWidth - cloneWidth) / 2;
        const cloneY = rows.length === 1
          ? rowY + (rowHeight - cloneHeight) / 2
          : rowY + rowHeight - cellHeight;

        slots.push([Math.floor(cloneX), Math.floor(cloneY), cloneWidth, cloneHeight, window]);
        x += cellWidth + this.spacing;
      }
    }
    return slots;
  }
}

export class WindowGridLayout<W extends GridWindow = GridWindow> extends Clutter.LayoutManager {
  static {
    GObject.registerClass(this);
  }

  private container: Clutter.Actor | null = null;
  private sortedWindows: W[] = [];
  private windowSlots: Slot[] = [];
  private layout: GridLayout | null = null;
  private strategy!: WindowGridStrategy;
  private lastBox: Clutter.ActorBox | null = null;
  private workarea!: Mtk.Rectangle;
  private workareasChangedId = 0;

  constructor(private readonly monitorIndex: number, private readonly spacing = 20) {
    super();
  }

  get windows(): W[] {
    return this.sortedWindows;
  }

  addWindow(window: W): void {
    if (this.sortedWindows.includes(window)) return;

    this.sortedWindows.push(window);
    this.container!.add_child(window);
    this.layout = null;
    this.layout_changed();
  }

  reset(): void {
    for (const window of this.sortedWindows) window.destroy();

    this.sortedWindows = [];
    this.windowSlots = [];
    this.layout = null;
  }

  private createBestLayout(area: Area): GridLayout {
    this.strategy = new WindowGridStrategy(Main.layoutManager.monitors[this.monitorIndex].height, this.spacing);

    let lastLayout: GridLayout | null = null;
    let lastNumColumns = -1;
    let lastScale = 0;
    let lastSpace = 0;

    for (let numRows = 1; ; numRows++) {
      const numColumns = Math.ceil(this.sortedWindows.length / numRows);
      if (numColumns === lastNumColumns) break;

      const layout = this.strategy.computeLayout(this.sortedWindows, numRows);
      const [scale, space] = this.strategy.computeScaleAndSpace(layout, area);
      if (lastLayout && !isBetterScaleAndSpace(lastScale, lastSpace, scale, space)) break;

      lastLayout = layout;
      lastNumColumns = numColumns;
      lastScale = scale;
      lastSpace = space;
    }

    return lastLayout!;
  }

  private syncWorkareaTracking(): void {
    if (this.container) {
      if (this.workareasChangedId) return;
      this.workarea = Main.layoutManager.getWorkAreaForMonitor(this.monitorIndex);
      this.workareasChangedId = global.display.connect('workareas-changed', () => {
        this.workarea = Main.layoutManager.getWorkAreaForMonitor(this.monitorIndex);
        this.layout_changed();
      });
    } else if (this.workareasChangedId) {
      global.display.disconnect(this.workareasChangedId);
      this.workareasChangedId = 0;
    }
  }

  vfunc_set_container(container: Clutter.Actor | null): void {
    this.container = container;
    this.syncWorkareaTracking();
  }

  vfunc_get_preferred_width(_container: Clutter.Actor, forHeight: number): [number, number] {
    if (forHeight === -1) return [0, this.workarea.width];
    return [0, forHeight * this.workarea.width / this.workarea.height];
  }

  vfunc_get_preferred_height(_container: Clutter.Actor, forWidth: number): [number, number] {
    if (forWidth === -1) return [0, this.workarea.height];
    return [0, forWidth * this.workarea.height / this.workarea.width];
  }

  vfunc_allocate(container: Clutter.Actor, box: Clutter.ActorBox): void {
    const containerBox = container.allocation;
    const containerAllocationChanged = this.lastBox === null || !this.lastBox.equal(containerBox);
    this.lastBox = containerBox.copy();

    let layoutChanged = false;
    if (this.layout === null) {
      this.layout = this.createBestLayout(this.workarea);
      layoutChanged = true;
    }

    if (layoutChanged || containerAllocationChanged) {
      this.windowSlots = this.strategy.computeWindowSlots(this.layout, {
        x: Math.trunc(box.x1),
        y: Math.trunc(box.y1),
        width: Math.trunc(box.get_width()),
        height: Math.trunc(box.get_height()),
      });
    }

    const childBox = new Clutter.ActorBox();
    for (const [x, y, width, height, child] of this.windowSlots) {
      childBox.set_origin(x, y);
      childBox.set_size(width, height);
      child.allocate(childBox);
    }
  }
}
