import Cairo from 'cairo';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';

const BAR = 3;
const GAP = 2.5;
const LEVEL_INTERVAL_US = 50_000;
const SPEECH_FLOOR = 0.2;
const SPEECH_RANGE = 0.5;
const FADING_BARS = 3;

const loudness = (level: number) => Math.min(1, Math.max(0, (level - SPEECH_FLOOR) / SPEECH_RANGE)) ** 0.8;

export class Waveform {
  readonly actor = new St.DrawingArea({ style_class: 'kestrel-dictation-waveform', y_align: Clutter.ActorAlign.CENTER });
  private readonly timeline = new Clutter.Timeline({ actor: this.actor, duration: 1000, repeat_count: -1 });
  private levels: number[] = [];
  private arrived = 0;

  constructor() {
    this.timeline.connect('new-frame', () => this.actor.queue_repaint());
    this.actor.connect('repaint', () => this.repaint());
  }

  start(): void {
    this.levels = [];
    this.arrived = GLib.get_monotonic_time();
    this.actor.queue_repaint();
    this.timeline.start();
  }

  push(level: number): void {
    this.levels.push(loudness(level));
    this.arrived = GLib.get_monotonic_time();
  }

  stop(): void {
    this.timeline.stop();
  }

  private repaint(): void {
    const [width, height] = this.actor.get_surface_size();
    const step = BAR + GAP;
    const count = Math.ceil(width / step) + 1;
    if (this.levels.length > count) this.levels.splice(0, this.levels.length - count);
    const offset = Math.min(1, (GLib.get_monotonic_time() - this.arrived) / LEVEL_INTERVAL_US);
    const ink = this.actor.get_theme_node().get_foreground_color();
    const fade = FADING_BARS * step;
    const cr = this.actor.get_context();
    cr.setLineCap(Cairo.LineCap.ROUND);
    cr.setLineWidth(BAR);
    for (let bar = 0; bar < count; bar++) {
      const level = this.levels[this.levels.length - count + bar] ?? 0;
      const x = width - (count - bar - 1 + offset) * step - BAR / 2;
      const edge = Math.min(1, Math.max(0, Math.min(x, width - x) / fade));
      if (edge === 0) continue;
      const reach = (height - BAR) * level / 2;
      cr.setSourceRGBA(ink.red / 255, ink.green / 255, ink.blue / 255, ink.alpha / 255 * edge);
      cr.moveTo(x, height / 2 - reach);
      cr.lineTo(x, height / 2 + reach);
      cr.stroke();
    }
    cr.$dispose();
  }
}
