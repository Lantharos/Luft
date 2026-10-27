import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import type St from 'gi://St';

import { setSourceColor } from '../display/cairo.js';
import { clamp } from '../math.js';
import { BarLevel } from './barLevel.js';

const SLIDER_SCROLL_STEP = 0.02;
const SNAP_THRESHOLD = 0.04;
const KEY_STEP = 0.1;

export namespace Slider {
  export interface Signals extends St.DrawingArea.SignalSignatures {
    'drag-begin': () => void;
    'drag-end': () => void;
  }
}

export class Slider extends BarLevel {
  static [GObject.signals] = {
    'drag-begin': {},
    'drag-end': {},
  };

  static {
    GObject.registerClass(this);

    const bindingPool = this.get_binding_pool();
    bindingPool.install_closure('left', Clutter.KEY_Left, 0 as Clutter.ModifierType, ((slider: Slider) => {
      slider.moveBy(-KEY_STEP);
      return Clutter.EVENT_STOP;
    }) as unknown as GObject.Closure);
    bindingPool.install_closure('right', Clutter.KEY_Right, 0 as Clutter.ModifierType, ((slider: Slider) => {
      slider.moveBy(KEY_STEP);
      return Clutter.EVENT_STOP;
    }) as unknown as GObject.Closure);
  }

  declare connect: GObject.SignalMethods<this, Slider.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, Slider.Signals>['emit'];

  private handleRadius = 0;
  private grab: Clutter.Grab | null = null;
  private readonly panGesture = new Clutter.PanGesture();
  private readonly marks = new Set<number>();
  private unsnappedValue: number | null = null;

  constructor(value: number) {
    super({
      style_class: 'slider',
      can_focus: true,
      reactive: true,
      track_hover: true,
      hover: false,
      accessible_role: Atk.Role.SLIDER,
      x_expand: true,
    });
    this.value = value;

    this.panGesture.set_begin_threshold(0);
    this.panGesture.connect('recognize', () => this.onPanBegin());
    this.panGesture.connect('pan-update', () => this.moveHandle(this.panGesture.get_centroid().x));
    this.panGesture.connect('end', () => this.onPanEnd());
    this.add_action(this.panGesture);

    const smoothScrollController = new Clutter.ScrollController({
      flags: Clutter.ScrollControllerFlags.PHYSICAL_DIRECTION | Clutter.ScrollControllerFlags.SCROLL_HORIZONTAL,
    });
    smoothScrollController.connect('scroll', (_controller, _sprite, _source, dx) => {
      this.step(this.get_text_direction() === Clutter.TextDirection.RTL ? -dx : dx);
    });
    this.add_action(smoothScrollController);

    const discreteScrollController = new Clutter.ScrollController({
      flags: Clutter.ScrollControllerFlags.DISCRETE | Clutter.ScrollControllerFlags.SCROLL_VERTICAL,
    });
    discreteScrollController.connect('scroll', (_controller, _sprite, _source, _dx, dy) => {
      this.step(-dy);
    });
    this.add_action(discreteScrollController);

    this.customAccessible.connect('get-minimum-increment', () => KEY_STEP);
  }

  addMark(value: number): void {
    this.marks.add(value);
  }

  clearMarks(): void {
    this.marks.clear();
  }

  step(nSteps: number): boolean {
    return this.applyDelta(nSteps * SLIDER_SCROLL_STEP);
  }

  vfunc_style_changed(): void {
    super.vfunc_style_changed();
    this.handleRadius = Math.round(2 * this.get_theme_node().get_length('-slider-handle-radius')) / 2;
  }

  vfunc_repaint(): void {
    super.vfunc_repaint();

    const cr = this.get_context();
    const [width, height] = this.get_surface_size();

    let handleX = this.handleRadius + (width - 2 * this.handleRadius) * this.currentValue / this.maxValue;
    if (this.get_text_direction() === Clutter.TextDirection.RTL) handleX = width - handleX;

    setSourceColor(cr, this.get_theme_node().get_foreground_color());
    cr.arc(handleX, height / 2, this.handleRadius, 0, 2 * Math.PI);
    cr.fill();
    cr.$dispose();
  }

  protected getPreferredHeight(): number {
    return Math.max(super.getPreferredHeight(), 2 * this.handleRadius);
  }

  protected getPreferredWidth(): number {
    return Math.max(super.getPreferredWidth(), 2 * this.handleRadius);
  }

  private snapToMark(value: number): number {
    for (const mark of this.marks) {
      if (Math.abs(value - mark) < SNAP_THRESHOLD) return mark;
    }
    return value;
  }

  private onPanBegin(): boolean {
    this.grab = global.stage.grab(this);
    this.emit('drag-begin');
    this.moveHandle(this.panGesture.get_centroid().x);
    return Clutter.EVENT_STOP;
  }

  private onPanEnd(): void {
    this.grab?.dismiss();
    this.grab = null;
    this.emit('drag-end');
  }

  private applyDelta(delta: number): boolean {
    const base = this.unsnappedValue ?? this.currentValue;
    const oldValue = this.currentValue;
    this.unsnappedValue = clamp(base + delta, 0, this.maxValue);
    this.value = this.snapToMark(this.unsnappedValue);
    return this.currentValue !== oldValue;
  }

  private moveBy(delta: number): void {
    this.applyDelta(this.get_text_direction() === Clutter.TextDirection.RTL ? -delta : delta);
  }

  private moveHandle(x: number): void {
    const width = this.barLevelWidth;
    const relX = this.get_text_direction() === Clutter.TextDirection.RTL ? width - x : x;

    let newValue;
    if (relX < this.handleRadius) newValue = 0;
    else if (relX > width - this.handleRadius) newValue = 1;
    else newValue = (relX - this.handleRadius) / (width - 2 * this.handleRadius);
    this.unsnappedValue = newValue * this.maxValue;
    this.value = this.snapToMark(this.unsnappedValue);
  }
}
