import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';

import type { TabletTaskbar } from './tabletTaskbar.js';

const SPEED_WINDOW = 80000;

interface Sample {
  at: number;
  distance: number;
}

export class EdgeSwipe {
  private readonly gesture = new Shell.EdgeDragGesture({ name: 'Tablet taskbar bottom drag' });
  private target: TabletTaskbar | null = null;
  private samples: Sample[] = [];

  constructor(private readonly taskbarAt: (x: number, y: number) => TabletTaskbar | null) {
    this.gesture.set_side(St.Side.BOTTOM);
    this.gesture.connect('may-recognize', () => {
      const [point] = this.gesture.get_points();
      const [x, y] = this.gesture.get_point_event(point).get_coords();
      this.target = this.taskbarAt(x, y);
      this.samples = [];
      return this.target?.canFollow ?? false;
    });
    this.gesture.connect('progress', (_gesture, distance: number) => {
      this.samples.push({ at: GLib.get_monotonic_time(), distance });
      this.target?.follow(distance);
    });
    this.gesture.connect('end', () => this.release(true));
    this.gesture.connect('cancel', () => this.release(false));
    global.stage.add_action(this.gesture);
  }

  destroy(): void {
    global.stage.remove_action(this.gesture);
  }

  private release(completed: boolean): void {
    const last = this.samples.at(-1);
    if (last) this.target?.release(last.distance, this.speed(last), completed);
    this.target = null;
    this.samples = [];
  }

  private speed(last: Sample): number {
    const first = this.samples.find(sample => last.at - sample.at <= SPEED_WINDOW) ?? last;
    const elapsed = (last.at - first.at) / 1e6;
    return elapsed > 0 ? (last.distance - first.distance) / elapsed : 0;
  }
}
