import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';

const POINTER_MOVES = [Meta.GrabOp.MOVING, Meta.GrabOp.MOVING_UNCONSTRAINED];
const WINDOW = 80;
const AFTER_RELEASE = 120;
const FASTEST = 2000;

const now = () => GLib.get_monotonic_time() / 1000;

interface Sample {
  at: number;
  time: number;
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export class DragVelocity {
  private window: Meta.Window | null = null;
  private samples: Sample[] = [];
  private filter = 0;
  private released = 0;

  constructor() {
    global.display.connect('grab-op-begin', (_display, window: Meta.Window | null, op: Meta.GrabOp) => {
      if (!window || !POINTER_MOVES.includes(op)) return;
      this.stopFollowing();
      this.window = window;
      this.samples = [];
      this.released = 0;
      this.filter = Clutter.Event.prepend_filter(null, event => {
        if (event.type() === Clutter.EventType.MOTION) this.sample(event);
        return Clutter.EVENT_PROPAGATE;
      });
    });
    global.display.connect('grab-op-end', (_display, window: Meta.Window | null) => {
      if (window !== this.window) return;
      this.stopFollowing();
      this.released = now();
    });
  }

  of(window: Meta.Window): Velocity | undefined {
    if (window !== this.window) return undefined;
    if (this.released && now() - this.released > AFTER_RELEASE) return undefined;
    const end = this.samples.at(-1);
    if (!end || now() - end.at > WINDOW) return undefined;
    const recent = this.samples.filter(sample => sample.time >= end.time - WINDOW);
    const [first, last] = [recent[0], end];
    if (last.time <= first.time) return undefined;
    const span = (last.time - first.time) / 1000;
    const [x, y] = [(last.x - first.x) / span, (last.y - first.y) / span];
    const damping = Math.min(1, FASTEST / Math.hypot(x, y));
    return { x: x * damping, y: y * damping };
  }

  private sample(event: Clutter.Event): void {
    const [x, y] = event.get_coords();
    const time = event.get_time();
    this.samples = [...this.samples.filter(sample => sample.time >= time - WINDOW), { at: now(), time, x, y }];
  }

  private stopFollowing(): void {
    if (this.filter) Clutter.Event.remove_filter(this.filter);
    this.filter = 0;
  }
}
