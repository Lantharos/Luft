import Cairo from 'cairo';
import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { clampUnit } from '../../../shared/math.js';

const BAR = 3;
const GAP = 2.5;
const STEP = BAR + GAP;
const BLEED = 1;
const LEVEL_INTERVAL_MS = 50;
const FADING_BARS = 3;
const FLOOR_RISE = 0.004;
const PEAK_FALL = 0.008;
const NOISE_MARGIN = 0.04;
const LEAST_SPAN = 0.18;

class Bar {
  readonly actor = new St.DrawingArea({ width: BAR + BLEED * 2 });
  private level = 0;

  constructor() {
    this.actor.connect('repaint', () => this.repaint());
  }

  show(level: number, position: number): void {
    this.actor.translation_x = position * STEP - BLEED;
    if (level === this.level) return;
    this.level = level;
    this.actor.queue_repaint();
  }

  private repaint(): void {
    const [, height] = this.actor.get_surface_size();
    const reach = (height - BAR) * this.level / 2;
    const ink = this.actor.get_theme_node().get_foreground_color();
    const cr = this.actor.get_context();
    cr.setLineCap(Cairo.LineCap.ROUND);
    cr.setLineWidth(BAR);
    cr.setSourceRGBA(ink.red / 255, ink.green / 255, ink.blue / 255, ink.alpha / 255);
    cr.moveTo(BLEED + BAR / 2, height / 2 - reach);
    cr.lineTo(BLEED + BAR / 2, height / 2 + reach);
    cr.stroke();
    cr.$dispose();
  }
}

export class Waveform {
  readonly actor = new St.Widget({ style_class: 'kestrel-dictation-waveform', y_align: Clutter.ActorAlign.CENTER, clip_to_allocation: true });
  private readonly strip = new Clutter.Actor();
  private readonly timeline = new Clutter.Timeline({ actor: this.actor, duration: LEVEL_INTERVAL_MS });
  private readonly bars: Bar[] = [];
  private newest = 0;
  private height = 0;
  private floor = 1;
  private peak = 0;

  constructor() {
    this.actor.add_child(this.strip);
    this.timeline.connect('new-frame', () => this.scroll(this.timeline.get_progress()));
  }

  start(): void {
    this.newest = 0;
    this.floor = 1;
    this.peak = 0;
    this.bars.forEach((bar, index) => bar.show(0, index - this.bars.length + 1));
    this.advance();
  }

  push(level: number): void {
    this.floor = Math.min(level, this.floor + FLOOR_RISE);
    this.peak = Math.max(level, this.peak - PEAK_FALL);
    const span = Math.max(this.peak - this.floor, LEAST_SPAN);
    const bar = this.bars.shift();
    if (bar) {
      this.bars.push(bar);
      bar.show(clampUnit((level - this.floor - NOISE_MARGIN) / span) ** 0.8, ++this.newest);
    }
    this.advance();
  }

  stop(): void {
    this.timeline.stop();
  }

  private advance(): void {
    this.timeline.stop();
    this.scroll(0);
    this.timeline.start();
  }

  private fill(count: number, height: number): void {
    while (this.bars.length < count) {
      const bar = new Bar();
      this.strip.add_child(bar.actor);
      bar.show(0, this.newest - this.bars.length);
      this.bars.unshift(bar);
    }
    for (const bar of this.bars.splice(0, this.bars.length - count)) bar.actor.destroy();
    for (const bar of this.bars) bar.actor.height = height;
    this.height = height;
  }

  private scroll(offset: number): void {
    const [width, height] = [this.actor.width, this.actor.height];
    const count = Math.ceil(width / STEP) + 1;
    if (count !== this.bars.length || height !== this.height) this.fill(count, height);
    const fade = FADING_BARS * STEP;
    this.strip.translation_x = width - BAR - (this.newest + offset) * STEP;
    for (let age = 0; age < count; age++) {
      const x = width - (age + offset) * STEP - BAR / 2;
      const edge = clampUnit(Math.min(x, width - x) / fade);
      this.bars[count - 1 - age].actor.opacity = Math.round(255 * edge);
    }
  }
}
