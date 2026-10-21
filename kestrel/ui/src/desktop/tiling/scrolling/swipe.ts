import Clutter from 'gi://Clutter';
import type Meta from 'gi://Meta';

import { Gesture } from '../../../shared/motion.js';
import type { ScrollingSpace } from './scrollingSpace.js';

const FINGERS = 3;
const VELOCITY_WINDOW = 150;

type Mode = 'idle' | 'choosing' | 'tracking' | 'ignored';

interface Sample {
  time: number;
  distance: number;
}

export class StripSwipe {
  private mode: Mode = 'idle';
  private space: ScrollingSpace | null = null;
  private lockX = 0;
  private lockY = 0;
  private distance = 0;
  private samples: Sample[] = [];

  constructor(
    private readonly enabled: () => boolean,
    private readonly stripAt: (x: number, y: number) => ScrollingSpace | null,
    private readonly activate: (window: Meta.Window) => void,
  ) {}

  handle(event: Clutter.Event): boolean {
    if (event.type() !== Clutter.EventType.TOUCHPAD_SWIPE) return false;
    const phase = event.get_gesture_phase();
    if (phase === Clutter.TouchpadGesturePhase.BEGIN) this.begin(event);
    const mode = this.mode;
    if (phase === Clutter.TouchpadGesturePhase.END || phase === Clutter.TouchpadGesturePhase.CANCEL) {
      if (mode === 'tracking') this.release();
      this.mode = 'idle';
      return mode === 'tracking' || mode === 'choosing';
    }
    if (mode === 'choosing') this.choose(event);
    else if (mode === 'tracking') this.follow(event, event.get_gesture_motion_delta()[0]);
    return this.mode === 'tracking' || this.mode === 'choosing';
  }

  private begin(event: Clutter.Event): void {
    this.lockX = this.lockY = 0;
    this.space = null;
    const [x, y] = event.get_coords();
    const space = event.get_touchpad_gesture_finger_count() === FINGERS && this.enabled() ? this.stripAt(x, y) : null;
    this.mode = space && !space.overview ? 'choosing' : 'ignored';
    this.space = space;
  }

  private choose(event: Clutter.Event): void {
    const [dx, dy] = event.get_gesture_motion_delta_unaccelerated();
    this.lockX += dx;
    this.lockY += dy;
    if (Math.hypot(this.lockX, this.lockY) < Gesture.directionLock) return;
    if (Math.abs(this.lockX) <= Math.abs(this.lockY)) {
      this.mode = 'ignored';
      return;
    }
    this.mode = 'tracking';
    this.distance = 0;
    this.samples = [{ time: event.get_time(), distance: 0 }];
    this.space!.beginSwipe();
    this.follow(event, event.get_gesture_motion_delta()[0]);
  }

  private follow(event: Clutter.Event, dx: number): void {
    const time = event.get_time();
    this.distance += dx;
    this.samples.push({ time, distance: this.distance });
    this.samples = this.samples.filter(sample => sample.time >= time - VELOCITY_WINDOW);
    this.space!.swipe(this.distance);
  }

  private release(): void {
    const [first] = this.samples;
    const last = this.samples.at(-1)!;
    const velocity = first && last.time > first.time ? (last.distance - first.distance) * 1000 / (last.time - first.time) : 0;
    const window = this.space!.endSwipe(velocity);
    this.space = null;
    if (window) this.activate(window);
  }
}
