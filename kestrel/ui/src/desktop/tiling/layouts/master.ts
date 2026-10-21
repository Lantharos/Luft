import type { Box } from '../../../shared/placement.js';
import { axisOf, clampRatio, divide, forward, split, type Direction } from './geometry.js';
import type { TiledLayout } from './layout.js';

const MASTER_RATIO = 0.55;
const MIN_WEIGHT = 0.15;

export class MasterStack<T> implements TiledLayout<T> {
  private order: T[] = [];
  private weights = new Map<T, number>();
  private ratio = MASTER_RATIO;
  private area: Box | null = null;
  private gap = 0;
  private boxes = new Map<T, Box>();

  get windows(): readonly T[] {
    return this.order;
  }

  has(window: T): boolean {
    return this.weights.has(window);
  }

  insert(window: T, beside: T | null): void {
    const index = beside ? this.order.indexOf(beside) : -1;
    if (index < 0) this.order.push(window);
    else this.order.splice(index + 1, 0, window);
    this.weights.set(window, 1);
  }

  remove(window: T): void {
    this.order = this.order.filter(other => other !== window);
    this.weights.delete(window);
    this.boxes.delete(window);
  }

  swap(a: T, b: T): void {
    const first = this.order.indexOf(a);
    const second = this.order.indexOf(b);
    if (first < 0 || second < 0) return;
    this.order[first] = b;
    this.order[second] = a;
  }

  arrange(area: Box, gap: number): Map<T, Box> {
    this.area = area;
    this.gap = gap;
    this.boxes = new Map();
    const [master, ...stack] = this.order;
    if (master === undefined) return this.boxes;
    if (!stack.length) {
      this.boxes.set(master, area);
      return this.boxes;
    }
    const [left, right] = split(area, 'horizontal', this.ratio, gap);
    this.boxes.set(master, left);
    divide(right, 'vertical', stack.map(window => this.weights.get(window) ?? 1), gap)
      .forEach((box, index) => this.boxes.set(stack[index]!, box));
    return this.boxes;
  }

  resize(window: T, direction: Direction, step: number): void {
    const signed = forward(direction) ? step : -step;
    if (axisOf(direction) === 'horizontal') {
      if (this.area) this.ratio = clampRatio(this.ratio + signed / Math.max(1, this.area.width - this.gap));
      return;
    }
    const stack = this.order.slice(1);
    const index = stack.indexOf(window);
    if (index < 0 || stack.length < 2) return;
    const above = index === stack.length - 1 ? index - 1 : index;
    this.shiftBoundary(stack, above, signed);
  }

  moveEdge(window: T, side: Direction, coordinate: number): void {
    const box = this.boxes.get(window);
    if (!box || !this.area) return;
    if (axisOf(side) === 'horizontal') {
      const master = this.order[0] === window;
      if (master !== (side === 'right')) return;
      const first = coordinate - this.area.x - (master ? 0 : this.gap);
      this.ratio = clampRatio(first / Math.max(1, this.area.width - this.gap));
      return;
    }
    const stack = this.order.slice(1);
    const index = stack.indexOf(window);
    const above = side === 'down' ? index : index - 1;
    if (index < 0 || above < 0 || above >= stack.length - 1) return;
    const edge = side === 'down' ? box.y + box.height : box.y;
    this.shiftBoundary(stack, above, coordinate - edge);
  }

  private shiftBoundary(stack: T[], above: number, pixels: number): void {
    const upper = this.boxes.get(stack[above]!);
    const lower = this.boxes.get(stack[above + 1]!);
    if (!upper || !lower) return;
    const pair = upper.height + lower.height;
    const minimum = pair * MIN_WEIGHT;
    const height = Math.min(pair - minimum, Math.max(minimum, upper.height + pixels));
    const weight = (this.weights.get(stack[above]!) ?? 1) + (this.weights.get(stack[above + 1]!) ?? 1);
    this.weights.set(stack[above]!, weight * height / pair);
    this.weights.set(stack[above + 1]!, weight * (pair - height) / pair);
  }
}
