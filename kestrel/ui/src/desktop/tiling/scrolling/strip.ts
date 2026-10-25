import type { Box } from '../../../shared/layout/box.js';
import { divide } from '../layouts/geometry.js';

export const PRESET_WIDTHS = [1 / 3, 1 / 2, 2 / 3, 1];
const DEFAULT_WIDTH = 1 / 2;
const WIDTH_STEP = 0.1;
const MIN_WIDTH = 0.1;
const MIN_ROW_SHARE = 0.15;
const PRESET_TOLERANCE = 0.01;

export interface Column<T> {
  windows: T[];
  weights: number[];
  width: number;
  row: number;
  restore?: number;
}

export interface Snap {
  offset: number;
  column: number;
}

export class Strip<T> {
  columns: Column<T>[] = [];
  focused = 0;
  offset = 0;
  private view: Box = { x: 0, y: 0, width: 1, height: 1 };
  private gap = 0;

  get windows(): T[] {
    return this.columns.flatMap(column => column.windows);
  }

  get focusedWindow(): T | null {
    const column = this.columns[this.focused];
    return column?.windows[column.row] ?? null;
  }

  get viewWidth(): number {
    return Math.max(1, this.view.width - 2 * this.gap);
  }

  get totalWidth(): number {
    return this.columns.reduce((sum, column) => sum + this.columnWidth(column), 0) + this.gap * Math.max(0, this.columns.length - 1);
  }

  setView(view: Box, gap: number): void {
    this.view = view;
    this.gap = gap;
  }

  has(window: T): boolean {
    return this.locate(window) !== null;
  }

  locate(window: T): [column: number, row: number] | null {
    for (let column = 0; column < this.columns.length; column++) {
      const row = this.columns[column]!.windows.indexOf(window);
      if (row >= 0) return [column, row];
    }
    return null;
  }

  add(window: T, besideFocused: boolean): void {
    const index = besideFocused && this.columns.length ? this.focused + 1 : this.columns.length;
    this.columns.splice(index, 0, { windows: [window], weights: [1], width: DEFAULT_WIDTH, row: 0 });
    this.focused = index;
  }

  remove(window: T): void {
    const found = this.locate(window);
    if (!found) return;
    const [index, row] = found;
    const column = this.columns[index]!;
    column.windows.splice(row, 1);
    column.weights.splice(row, 1);
    column.row = Math.min(column.row, column.windows.length - 1);
    if (column.windows.length) return;
    this.columns.splice(index, 1);
    if (this.focused > index || this.focused >= this.columns.length) this.focused = Math.max(0, this.focused - 1);
    this.clampOffset();
  }

  focus(window: T): boolean {
    const found = this.locate(window);
    if (!found) return false;
    [this.focused, this.columns[found[0]]!.row] = found;
    return true;
  }

  columnAt(direction: -1 | 1): T | null {
    const column = this.columns[this.focused + direction];
    return column?.windows[column.row] ?? null;
  }

  rowAt(direction: -1 | 1): T | null {
    const column = this.columns[this.focused];
    return column?.windows[column.row + direction] ?? null;
  }

  moveColumn(direction: -1 | 1): boolean {
    const target = this.focused + direction;
    if (target < 0 || target >= this.columns.length) return false;
    [this.columns[this.focused], this.columns[target]] = [this.columns[target]!, this.columns[this.focused]!];
    this.focused = target;
    return true;
  }

  moveRow(direction: -1 | 1): boolean {
    const column = this.columns[this.focused];
    if (!column) return false;
    const target = column.row + direction;
    if (target < 0 || target >= column.windows.length) return false;
    for (const list of [column.windows, column.weights] as unknown[][])
      [list[column.row], list[target]] = [list[target], list[column.row]];
    column.row = target;
    return true;
  }

  stack(direction: -1 | 1): boolean {
    const column = this.columns[this.focused];
    const window = this.focusedWindow;
    if (!column || window === null) return false;
    if (column.windows.length > 1) {
      column.windows.splice(column.row, 1);
      column.weights.splice(column.row, 1);
      column.row = Math.min(column.row, column.windows.length - 1);
      const index = direction > 0 ? this.focused + 1 : this.focused;
      this.columns.splice(index, 0, { windows: [window], weights: [1], width: column.width, row: 0 });
      this.focused = index;
      return true;
    }
    const neighbor = this.columns[this.focused + direction];
    if (!neighbor) return false;
    neighbor.windows.push(window);
    neighbor.weights.push(1);
    neighbor.row = neighbor.windows.length - 1;
    this.columns.splice(this.focused, 1);
    this.focused = this.columns.indexOf(neighbor);
    this.clampOffset();
    return true;
  }

  cycleWidth(): void {
    const column = this.columns[this.focused];
    if (!column) return;
    delete column.restore;
    column.width = PRESET_WIDTHS.find(width => width > column.width + PRESET_TOLERANCE) ?? PRESET_WIDTHS[0]!;
  }

  /** Makes the focused column as wide as the view, keeping its gaps, or gives it back the width it had. */
  maximize(): void {
    const column = this.columns[this.focused];
    if (!column) return;
    if (column.width >= 1 - PRESET_TOLERANCE) {
      column.width = column.restore ?? DEFAULT_WIDTH;
      delete column.restore;
      return;
    }
    column.restore = column.width;
    column.width = 1;
  }

  /** Widens the focused column over the space the other columns fully in view leave, so together they fill it. */
  expand(): void {
    const column = this.columns[this.focused];
    if (!column) return;
    const shown = this.columns.map((_, index) => index).filter(index => index !== this.focused && this.fullyShown(index));
    const taken = shown.reduce((sum, index) => sum + this.columnWidth(this.columns[index]!) + this.gap, 0);
    delete column.restore;
    column.width = this.widthFor(this.viewWidth - taken);
    this.offset = this.columnStart(Math.min(this.focused, ...shown));
  }

  edge(last: boolean): T | null {
    const column = this.columns[last ? this.columns.length - 1 : 0];
    return column?.windows[column.row] ?? null;
  }

  moveColumnToEdge(last: boolean): boolean {
    const target = last ? this.columns.length - 1 : 0;
    if (!this.columns.length || target === this.focused) return false;
    const [column] = this.columns.splice(this.focused, 1);
    this.columns.splice(target, 0, column!);
    this.focused = target;
    return true;
  }

  resizeWidth(direction: -1 | 1): void {
    const column = this.columns[this.focused];
    if (!column) return;
    delete column.restore;
    column.width = Math.min(1, Math.max(MIN_WIDTH, column.width + direction * WIDTH_STEP));
  }

  resizeRow(direction: -1 | 1): void {
    const column = this.columns[this.focused];
    if (!column || column.windows.length < 2) return;
    const above = column.row === column.windows.length - 1 ? column.row - 1 : column.row;
    const boxes = this.rowBoxes(column);
    this.shiftRows(column, above, direction * WIDTH_STEP * (boxes[above]!.height + boxes[above + 1]!.height));
  }

  setWidth(window: T, pixels: number): void {
    const found = this.locate(window);
    if (!found) return;
    this.columns[found[0]]!.width = this.widthFor(pixels);
  }

  private widthFor(pixels: number): number {
    return Math.min(1, Math.max(MIN_WIDTH, (pixels + this.gap) / Math.max(1, this.view.width - this.gap)));
  }

  private fullyShown(index: number): boolean {
    const left = this.columnStart(index);
    return left >= this.offset - 1 && left + this.columnWidth(this.columns[index]!) <= this.offset + this.viewWidth + 1;
  }

  moveRowEdge(window: T, bottom: boolean, coordinate: number): void {
    const found = this.locate(window);
    if (!found) return;
    const column = this.columns[found[0]]!;
    const above = bottom ? found[1] : found[1] - 1;
    if (above < 0 || above >= column.windows.length - 1) return;
    const boxes = this.rowBoxes(column);
    const edge = bottom ? boxes[above]!.y + boxes[above]!.height : boxes[above + 1]!.y;
    this.shiftRows(column, above, coordinate - edge);
  }

  columnStart(index: number): number {
    let x = 0;
    for (let column = 0; column < index; column++) x += this.columnWidth(this.columns[column]!) + this.gap;
    return x;
  }

  columnWidth(column: Column<T>): number {
    return Math.max(1, Math.round(column.width * (this.view.width - this.gap)) - this.gap);
  }

  reveal(index = this.focused): void {
    const column = this.columns[index];
    if (!column) return;
    const left = this.columnStart(index);
    const right = left + this.columnWidth(column);
    if (right - left > this.viewWidth || left < this.offset) this.offset = left;
    else if (right > this.offset + this.viewWidth) this.offset = right - this.viewWidth;
  }

  center(index = this.focused): void {
    const column = this.columns[index];
    if (column) this.offset = Math.round(this.columnStart(index) + this.columnWidth(column) / 2 - this.viewWidth / 2);
  }

  clampOffset(): void {
    this.offset = Math.min(this.offset, Math.max(0, this.totalWidth - this.viewWidth));
  }

  snap(offset: number): Snap {
    // Edges that would scroll past either end of the strip land on that end instead
    const furthest = Math.max(0, this.totalWidth - this.viewWidth);
    const within = (candidate: number) => Math.min(furthest, Math.max(0, candidate));
    let best: Snap = { offset: 0, column: 0 };
    for (let index = 0; index < this.columns.length; index++) {
      const left = this.columnStart(index);
      const right = left + this.columnWidth(this.columns[index]!) - this.viewWidth;
      for (const candidate of [within(left), within(right)]) {
        if (Math.abs(candidate - offset) < Math.abs(best.offset - offset)) best = { offset: candidate, column: index };
      }
    }
    return best;
  }

  layout(offset = this.offset): Map<T, Box> {
    const boxes = new Map<T, Box>();
    let x = this.view.x + this.gap - offset;
    for (const column of this.columns) {
      const width = this.columnWidth(column);
      this.rowBoxes(column).forEach((box, row) => boxes.set(column.windows[row]!, { ...box, x, width }));
      x += width + this.gap;
    }
    return boxes;
  }

  private rowBoxes(column: Column<T>): Box[] {
    const height = Math.max(1, this.view.height - 2 * this.gap);
    return divide({ x: 0, y: this.view.y + this.gap, width: 1, height }, 'vertical', column.weights, this.gap);
  }

  private shiftRows(column: Column<T>, above: number, pixels: number): void {
    const boxes = this.rowBoxes(column);
    const pair = boxes[above]!.height + boxes[above + 1]!.height;
    const minimum = pair * MIN_ROW_SHARE;
    const height = Math.min(pair - minimum, Math.max(minimum, boxes[above]!.height + pixels));
    const weight = column.weights[above]! + column.weights[above + 1]!;
    column.weights[above] = weight * height / pair;
    column.weights[above + 1] = weight * (pair - height) / pair;
  }
}
