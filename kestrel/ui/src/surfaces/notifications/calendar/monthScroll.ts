import Clutter from 'gi://Clutter';

const VELOCITY_WINDOW = 150;
const PIXELS_PER_UNIT = 10;
const STEPS = new Map([[Clutter.ScrollDirection.UP, -1], [Clutter.ScrollDirection.DOWN, 1]]);
const FINISHED = Clutter.ScrollFinishFlags.VERTICAL;

export interface MonthScrollTarget {
  follow(distance: number): void;
  release(velocity: number): void;
  step(direction: number): void;
}

export class MonthScroll {
  private samples: { time: number; distance: number }[] = [];
  private heading = 0;

  constructor(private readonly target: MonthScrollTarget) {}

  handle(event: Clutter.Event): boolean {
    if (event.get_flags() & Clutter.EventFlags.FLAG_POINTER_EMULATED) return Clutter.EVENT_STOP;
    const direction = event.get_scroll_direction();
    if (direction !== Clutter.ScrollDirection.SMOOTH) {
      const step = STEPS.get(direction);
      if (step) this.target.step(step);
      return Clutter.EVENT_STOP;
    }
    if (event.get_scroll_source() === Clutter.ScrollSource.FINGER) this.follow(event);
    return Clutter.EVENT_STOP;
  }

  private follow(event: Clutter.Event): void {
    const time = event.get_time();
    const dy = event.get_scroll_delta()[1] * PIXELS_PER_UNIT;
    if (dy) {
      if (dy * this.heading < 0) this.samples = [];
      this.heading = Math.sign(dy);
      this.samples.push({ time, distance: dy });
      this.samples = this.samples.filter(sample => sample.time >= time - VELOCITY_WINDOW);
      this.target.follow(dy);
    }
    if (event.get_scroll_finish_flags() & FINISHED) this.release(time);
  }

  private release(time: number): void {
    const recent = this.samples.filter(sample => sample.time >= time - VELOCITY_WINDOW);
    const span = recent.length > 1 ? time - recent[0].time : 0;
    const travelled = recent.slice(1).reduce((sum, sample) => sum + sample.distance, 0);
    this.samples = [];
    this.heading = 0;
    this.target.release(span > 0 ? travelled * 1000 / span : 0);
  }
}
