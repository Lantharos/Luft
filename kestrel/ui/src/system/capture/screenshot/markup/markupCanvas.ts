import Cairo from 'cairo';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';

import type { InkWriter } from '../../../../shared/ink/inkInput.js';
import type { InkSample } from '../../../../shared/ink/sample.js';
import { Stroke, type InkStyle } from '../../../../shared/ink/stroke.js';
import { StrokeActor } from '../../../../shared/ink/strokeActor.js';

export type Tool = 'pen' | 'highlighter' | 'eraser' | 'crop';
export type Undo = () => void;

const PEN_WIDTH = 4;
const HIGHLIGHTER_WIDTH = 22;
const HIGHLIGHTER_OPACITY = 0.4;
const ERASER_RADIUS = 10;

export class MarkupCanvas extends Clutter.Actor implements InkWriter {
  static {
    GObject.registerClass(this);
  }

  tool: Tool = 'pen';
  readonly colors: Record<'pen' | 'highlighter', [number, number, number]> = {
    pen: [0.9, 0.18, 0.2],
    highlighter: [1, 0.84, 0.04],
  };

  private readonly highlights = new Clutter.Actor();
  private readonly ink = new Clutter.Actor();
  private drawing: StrokeActor | null = null;
  private erased: StrokeActor[] | null = null;

  constructor(private readonly done: (undo: Undo) => void) {
    super();
    this.add_child(this.highlights);
    this.add_child(this.ink);
  }

  get empty(): boolean {
    return !this.strokes().some(actor => actor.visible);
  }

  begin(sample: InkSample, erasing: boolean): void {
    if (erasing || this.tool === 'eraser') {
      this.erased = [];
      this.erase(sample);
      return;
    }
    if (this.tool === 'crop') return;
    const highlighter = this.tool === 'highlighter';
    const style: InkStyle = {
      color: this.colors[this.tool],
      width: highlighter ? HIGHLIGHTER_WIDTH : PEN_WIDTH,
      pressure: !highlighter,
      opacity: highlighter ? HIGHLIGHTER_OPACITY : 1,
    };
    const stroke = new Stroke(style);
    stroke.add(sample);
    this.drawing = new StrokeActor(stroke);
    (highlighter ? this.highlights : this.ink).add_child(this.drawing);
  }

  extend(sample: InkSample): void {
    if (this.erased) this.erase(sample);
    else this.drawing?.add(sample);
  }

  end(): void {
    if (this.drawing) {
      const drawn = this.drawing;
      this.drawing = null;
      this.done(() => drawn.destroy());
    }
    if (this.erased?.length) {
      const erased = this.erased;
      this.done(() => erased.forEach(actor => actor.show()));
    }
    this.erased = null;
  }

  clear(): void {
    this.drawing = null;
    this.erased = null;
    this.highlights.destroy_all_children();
    this.ink.destroy_all_children();
  }

  paintStrokes(cr: Cairo.Context): void {
    for (const actor of this.strokes()) {
      if (!actor.visible) continue;
      cr.pushGroup();
      actor.stroke.paint(cr);
      cr.popGroupToSource();
      cr.paintWithAlpha(actor.stroke.style.opacity);
    }
  }

  private strokes(): StrokeActor[] {
    return [...this.highlights.get_children(), ...this.ink.get_children()] as StrokeActor[];
  }

  private erase({ x, y }: InkSample): void {
    for (const actor of this.strokes()) {
      if (!actor.visible || !actor.stroke.touches(x, y, ERASER_RADIUS)) continue;
      actor.hide();
      this.erased!.push(actor);
    }
  }
}
