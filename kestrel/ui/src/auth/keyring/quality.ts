import Clutter from 'gi://Clutter';
import St from 'gi://St';

export type Measure = (secret: string) => Promise<number>;

const FULL = 100;

export class QualityMeter {
  readonly actor = new St.Widget({ style_class: 'kestrel-quality', x_expand: true, visible: false, layout_manager: new Clutter.FixedLayout() });
  private readonly fill = new St.Widget({ style_class: 'kestrel-quality-fill', width: 0 });
  private source: Measure | undefined;
  private score = 0;
  private waiting: string | null = null;
  private measuring = false;

  constructor() {
    this.actor.add_child(this.fill);
    this.actor.connect('notify::allocation', () => this.draw());
  }

  use(source: Measure | undefined): void {
    this.source = source;
    this.actor.visible = !!source;
    this.show(0);
  }

  measure(secret: string): void {
    if (!this.source) return;
    this.waiting = secret;
    if (!this.measuring) void this.drain();
  }

  private async drain(): Promise<void> {
    this.measuring = true;
    while (this.waiting !== null && this.source) {
      const secret = this.waiting;
      this.waiting = null;
      this.show(secret ? await this.source(secret).catch(() => 0) : 0);
    }
    this.measuring = false;
  }

  private show(score: number): void {
    this.score = Math.max(-FULL, Math.min(FULL, score));
    this.fill[this.score < 0 ? 'add_style_class_name' : 'remove_style_class_name']('kestrel-quality-weak');
    this.draw();
  }

  private draw(): void {
    this.fill.width = Math.round(this.actor.get_allocation_box().get_width() * Math.abs(this.score) / FULL);
  }
}
