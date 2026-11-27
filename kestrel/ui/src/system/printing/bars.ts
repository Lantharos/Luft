import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import { Curve, stillMotion } from '../../shared/motion/motion.js';

const SWEEP = 0.35;
const SWEEP_TIME = 1100;
const FULL = 100;

class FractionLayout extends Clutter.LayoutManager {
  static {
    GObject.registerClass(this);
  }

  private shownFraction = 0;

  set fraction(fraction: number) {
    this.shownFraction = fraction;
    this.layout_changed();
  }

  vfunc_get_preferred_width(): [number, number] {
    return [0, 0];
  }

  vfunc_get_preferred_height(): [number, number] {
    return [0, 0];
  }

  vfunc_allocate(container: Clutter.Actor, box: Clutter.ActorBox): void {
    const fill = container.get_first_child();
    if (!fill) return;
    const width = Math.round((box.x2 - box.x1) * this.shownFraction);
    fill.allocate(Clutter.ActorBox.new(0, 0, width, box.y2 - box.y1));
  }
}

class Bar {
  readonly actor: St.Widget;
  protected readonly fill = new St.BoxLayout({ style_class: 'kestrel-print-fill' });
  protected readonly layout = new FractionLayout();

  constructor(style: string) {
    this.actor = new St.Widget({ style_class: style, x_expand: true, layout_manager: this.layout });
    this.actor.add_child(this.fill);
  }
}

export class ProgressBar extends Bar {
  private sweeping = false;

  constructor() {
    super('kestrel-print-track');
    this.actor.clip_to_allocation = true;
    this.actor.connect('notify::mapped', () => this.sweep());
    this.actor.connect('notify::width', () => this.sweep());
  }

  show(fraction: number | null): void {
    const sweeping = fraction === null;
    this.layout.fraction = fraction ?? SWEEP;
    if (sweeping === this.sweeping) return;
    this.sweeping = sweeping;
    this.sweep();
  }

  private sweep(): void {
    this.fill.remove_all_transitions();
    this.fill.translation_x = 0;
    if (!this.sweeping || !this.actor.mapped || stillMotion()) return;
    this.fill.ease({
      translation_x: this.actor.width * (1 - SWEEP), duration: SWEEP_TIME, curve: Curve.drift, repeatCount: -1, autoReverse: true,
    });
  }
}

export class InkBar extends Bar {
  constructor() {
    super('kestrel-print-ink-track');
  }

  show(level: number, colors: string[]): void {
    this.layout.fraction = level >= 0 ? level / FULL : 0;
    if (this.fill.get_n_children() === colors.length) {
      this.fill.get_children().forEach((segment, index) => ((segment as St.Widget).style = `background-color: ${colors[index]};`));
      return;
    }
    this.fill.destroy_all_children();
    colors.forEach((color, index) => {
      const segment = new St.Widget({ x_expand: true, style: `background-color: ${color};` });
      if (index === 0) segment.add_style_class_name('kestrel-print-first');
      if (index === colors.length - 1) segment.add_style_class_name('kestrel-print-last');
      this.fill.add_child(segment);
    });
  }
}
