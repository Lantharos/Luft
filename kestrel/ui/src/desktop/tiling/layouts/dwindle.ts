import type { Box } from '../../../shared/placement.js';
import { axisOf, clampRatio, forward, length, split, start, type Axis, type Direction } from './geometry.js';
import type { TiledLayout } from './layout.js';

interface Leaf<T> {
  kind: 'leaf';
  window: T;
  parent: Split<T> | null;
}

interface Split<T> {
  kind: 'split';
  axis: Axis;
  ratio: number;
  first: Node<T>;
  second: Node<T>;
  parent: Split<T> | null;
}

type Node<T> = Leaf<T> | Split<T>;

const EVEN = 0.5;

export class Dwindle<T> implements TiledLayout<T> {
  private root: Node<T> | null = null;
  private readonly leaves = new Map<T, Leaf<T>>();
  private boxes = new Map<Node<T>, Box>();
  private gap = 0;

  get windows(): T[] {
    const order: T[] = [];
    const visit = (node: Node<T> | null) => {
      if (!node) return;
      if (node.kind === 'leaf') order.push(node.window);
      else {
        visit(node.first);
        visit(node.second);
      }
    };
    visit(this.root);
    return order;
  }

  has(window: T): boolean {
    return this.leaves.has(window);
  }

  insert(window: T, beside: T | null): void {
    const leaf: Leaf<T> = { kind: 'leaf', window, parent: null };
    this.leaves.set(window, leaf);
    const target = (beside && this.leaves.get(beside)) ?? this.lastLeaf();
    if (!target) {
      this.root = leaf;
      return;
    }
    const box = this.boxes.get(target);
    const axis: Axis = !box || box.width >= box.height ? 'horizontal' : 'vertical';
    const parent = target.parent;
    const node: Split<T> = { kind: 'split', axis, ratio: EVEN, first: target, second: leaf, parent };
    this.replace(target, node);
    target.parent = node;
    leaf.parent = node;
    if (box) this.boxes.set(node, box);
  }

  remove(window: T): void {
    const leaf = this.leaves.get(window);
    if (!leaf) return;
    this.leaves.delete(window);
    this.boxes.delete(leaf);
    const parent = leaf.parent;
    if (!parent) {
      this.root = null;
      return;
    }
    const sibling = parent.first === leaf ? parent.second : parent.first;
    this.replace(parent, sibling);
    sibling.parent = parent.parent;
    this.boxes.delete(parent);
  }

  swap(a: T, b: T): void {
    const first = this.leaves.get(a);
    const second = this.leaves.get(b);
    if (!first || !second) return;
    first.window = b;
    second.window = a;
    this.leaves.set(a, second);
    this.leaves.set(b, first);
  }

  arrange(area: Box, gap: number): Map<T, Box> {
    this.gap = gap;
    this.boxes = new Map();
    const placed = new Map<T, Box>();
    const visit = (node: Node<T>, box: Box) => {
      this.boxes.set(node, box);
      if (node.kind === 'leaf') {
        placed.set(node.window, box);
        return;
      }
      const [first, second] = split(box, node.axis, node.ratio, gap);
      visit(node.first, first);
      visit(node.second, second);
    };
    if (this.root) visit(this.root, area);
    return placed;
  }

  resize(window: T, direction: Direction, step: number): void {
    const axis = axisOf(direction);
    const node = this.ancestor(window, candidate => candidate.axis === axis);
    const box = node && this.boxes.get(node);
    if (!node || !box) return;
    const usable = Math.max(1, length(box, axis) - this.gap);
    node.ratio = clampRatio(node.ratio + (forward(direction) ? step : -step) / usable);
  }

  moveEdge(window: T, side: Direction, coordinate: number): void {
    const axis = axisOf(side);
    const trailing = forward(side);
    const node = this.ancestor(window, (candidate, child) => candidate.axis === axis && (candidate.first === child) === trailing);
    const box = node && this.boxes.get(node);
    if (!node || !box) return;
    const usable = Math.max(1, length(box, axis) - this.gap);
    node.ratio = clampRatio((coordinate - start(box, axis) - (trailing ? 0 : this.gap)) / usable);
  }

  private ancestor(window: T, matches: (node: Split<T>, child: Node<T>) => boolean): Split<T> | null {
    let child: Node<T> | undefined = this.leaves.get(window);
    while (child?.parent) {
      if (matches(child.parent, child)) return child.parent;
      child = child.parent;
    }
    return null;
  }

  private lastLeaf(): Leaf<T> | null {
    let node = this.root;
    while (node?.kind === 'split') node = node.second;
    return node;
  }

  private replace(node: Node<T>, next: Node<T>): void {
    const parent = node.parent;
    if (!parent) this.root = next;
    else if (parent.first === node) parent.first = next;
    else parent.second = next;
  }
}
