import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import type { Key } from './key.js';

const KEY_SIZE = 2;

export const AspectContainer = GObject.registerClass(
class AspectContainer extends St.Widget {
  private ratio = 1;

  setRatio(relWidth: number, relHeight: number): void {
    this.ratio = relWidth / relHeight;
    this.queue_relayout();
  }

  vfunc_get_preferred_width(forHeight: number): [number, number] {
    const [min, nat] = super.vfunc_get_preferred_width(forHeight);
    return [min, forHeight > 0 ? forHeight * this.ratio : nat];
  }

  vfunc_get_preferred_height(forWidth: number): [number, number] {
    const [min, nat] = super.vfunc_get_preferred_height(forWidth);
    return [min, forWidth > 0 ? forWidth / this.ratio : nat];
  }

  vfunc_allocate(box: Clutter.ActorBox): void {
    if (box.get_width() > 0 && box.get_height() > 0 && box.get_width() / box.get_height() >= this.ratio) {
      const diff = box.get_width() - box.get_height() * this.ratio;
      box.x1 += Math.floor(diff / 2);
      box.x2 -= Math.ceil(diff / 2);
    }

    super.vfunc_allocate(box);
  }
});

export type AspectContainer = InstanceType<typeof AspectContainer>;

export const KeyContainer = GObject.registerClass(
class KeyContainer extends St.Widget {
  readonly shiftKeys: Key[] = [];
  private readonly grid: Clutter.GridLayout;
  private nRows = 0;
  private currentCol = 0;
  private maxCols = 0;

  constructor() {
    const grid = new Clutter.GridLayout({
      orientation: Clutter.Orientation.HORIZONTAL,
      column_homogeneous: true,
      row_homogeneous: true,
    });
    super({ layout_manager: grid, x_expand: true, y_expand: true });
    this.grid = grid;
  }

  appendRow(): void {
    this.nRows++;
    this.currentCol = 0;
  }

  appendKey(key: Key, width = 1, height = 1, leftOffset = 0): void {
    const left = this.currentCol + leftOffset;
    this.grid.attach(key, left * KEY_SIZE, this.nRows * KEY_SIZE, width * KEY_SIZE, height * KEY_SIZE);

    this.currentCol += leftOffset + width;
    this.maxCols = Math.max(this.currentCol, this.maxCols);
  }

  getRatio(): [number, number] {
    return [this.maxCols, this.nRows];
  }
});

export type KeyContainer = InstanceType<typeof KeyContainer>;

export const Suggestions = GObject.registerClass(
class Suggestions extends St.BoxLayout {
  constructor() {
    super({
      style_class: 'word-suggestions',
      orientation: Clutter.Orientation.HORIZONTAL,
      x_align: Clutter.ActorAlign.CENTER,
    });
    this.show();
  }

  addWord(word: string, callback: () => void): void {
    const button = new St.Button({ label: word });
    button.connect('clicked', () => callback());
    this.add_child(button);
  }

  clear(): void {
    this.remove_all_children();
  }

  setWordsVisible(visible: boolean): void {
    for (const child of this) child.visible = visible;
  }
});

export type Suggestions = InstanceType<typeof Suggestions>;
