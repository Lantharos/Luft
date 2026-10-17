import Clutter from 'gi://Clutter';

import { Gesture, projection, rubberband } from '../../shared/motion.js';

const FINGERS = 4;
const UNITS_PER_MM = 1000 / 25.4;
const TOUCHPAD_FALLBACK_HEIGHT = 70;
const TRACK_SHARE = 2 / 3;
const FLING_VELOCITY = 0.4;
const VELOCITY_WINDOW = 150;

export type SwipeDirection = 'up' | 'down';

export interface SwipeTrack {
  update(progress: number): void;
  release(velocity: number, commit: boolean): void;
}

export function banded(progress: number): number {
  return progress > 1 ? 1 + rubberband(progress - 1, 1) : progress < 0 ? rubberband(progress, 1) : progress;
}

type Mode = 'idle' | 'choosing' | 'tracking' | 'ignored';

export class FourFingerSwipe {
  private mode: Mode = 'idle';
  private swipeX = 0;
  private swipeY = 0;
  private upward = false;
  private began = 0;
  private distance = 1;
  private progress = 0;
  private samples: { time: number; step: number }[] = [];
  private track: SwipeTrack | null = null;

  constructor(private readonly begin: (direction: SwipeDirection) => SwipeTrack | null) {}

  handle(event: Clutter.Event): boolean {
    if (event.type() !== Clutter.EventType.TOUCHPAD_SWIPE) return false;
    const phase = event.get_gesture_phase();
    if (phase === Clutter.TouchpadGesturePhase.BEGIN) this.reset(event);
    const mode = this.mode;
    if (phase === Clutter.TouchpadGesturePhase.END || phase === Clutter.TouchpadGesturePhase.CANCEL) {
      if (mode === 'tracking') this.release();
      this.mode = 'idle';
      return mode === 'tracking';
    }
    if (mode === 'choosing') return this.choose(event);
    if (mode === 'tracking') return this.follow(event, event.get_gesture_motion_delta_unaccelerated()[1]);
    return false;
  }

  private reset(event: Clutter.Event): void {
    this.swipeX = this.swipeY = 0;
    this.began = event.get_time();
    this.track = null;
    this.mode = event.get_touchpad_gesture_finger_count() === FINGERS ? 'choosing' : 'ignored';
  }

  private choose(event: Clutter.Event): boolean {
    const [dx, dy] = event.get_gesture_motion_delta_unaccelerated();
    this.swipeX += dx;
    this.swipeY += dy;
    if (Math.hypot(this.swipeX, this.swipeY) < Gesture.directionLock) return false;
    this.upward = this.swipeY < 0;
    this.track = Math.abs(this.swipeY) > Math.abs(this.swipeX) ? this.begin(this.upward ? 'up' : 'down') : null;
    if (!this.track) {
      this.mode = 'ignored';
      return false;
    }
    const [found, , height] = event.get_source_device()?.get_dimensions() ?? [false, 0, 0];
    this.distance = (found ? height : TOUCHPAD_FALLBACK_HEIGHT) * UNITS_PER_MM * TRACK_SHARE;
    this.progress = 0;
    this.samples = [{ time: this.began, step: 0 }];
    this.mode = 'tracking';
    return this.follow(event, this.swipeY);
  }

  private follow(event: Clutter.Event, dy: number): boolean {
    const time = event.get_time();
    const step = (this.upward ? -dy : dy) / this.distance;
    this.samples.push({ time, step });
    this.samples = this.samples.filter(sample => sample.time >= time - VELOCITY_WINDOW);
    this.progress += step;
    this.track!.update(this.progress);
    return true;
  }

  private release(): void {
    const [first] = this.samples;
    const last = this.samples[this.samples.length - 1]!;
    const travelled = this.samples.slice(1).reduce((sum, sample) => sum + sample.step, 0);
    const velocity = last.time > first!.time ? travelled * 1000 / (last.time - first!.time) : 0;
    const commit = this.progress + projection(velocity) >= 0.5 || velocity >= FLING_VELOCITY;
    const track = this.track!;
    this.track = null;
    track.release(velocity, commit);
  }
}
