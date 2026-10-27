import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Mtk from 'gi://Mtk';
import type Shell from 'gi://Shell';

import * as KestrelUi from '../../kestrelUi.js';
import * as Main from '../main.js';
import { EventHistory, GESTURE_FINGER_COUNT, ScrollGesture, TouchpadSwipeGesture } from './swipeGestures.js';

const FLING_VELOCITY = 0.4;

enum State {
  NONE,
  SCROLLING,
}

export interface SwipeTrackerOptions {
  allowDrag?: boolean;
  allowScroll?: boolean;
  phase?: Clutter.EventPhase;
  name?: string;
  yieldsTouch?: (gesture: Clutter.PanGesture) => boolean;
}

export namespace SwipeTracker {
  export interface Signals extends GObject.Object.SignalSignatures {
    'begin': (monitor: number) => void;
    'update': (progress: number) => void;
    'end': (velocity: number, endProgress: number, immediate: boolean) => void;
  }
}

const clamp = (value: number, lower: number, upper: number) => Math.min(Math.max(value, lower), upper);

export const SwipeTracker = GObject.registerClass({
  Properties: {
    'enabled': GObject.ParamSpec.boolean('enabled', null, null, GObject.ParamFlags.READWRITE, true),
    'orientation': GObject.ParamSpec.enum('orientation', null, null, GObject.ParamFlags.READWRITE,
      Clutter.Orientation, Clutter.Orientation.HORIZONTAL),
    'distance': GObject.ParamSpec.double('distance', null, null, GObject.ParamFlags.READWRITE, 0, Infinity, 0),
    'scroll-modifiers': GObject.ParamSpec.flags('scroll-modifiers', null, null, GObject.ParamFlags.READWRITE,
      Clutter.ModifierType, 0),
  },
  Signals: {
    'begin': { param_types: [GObject.TYPE_UINT] },
    'update': { param_types: [GObject.TYPE_DOUBLE] },
    'end': { param_types: [GObject.TYPE_DOUBLE, GObject.TYPE_DOUBLE, GObject.TYPE_BOOLEAN] },
  },
}, class SwipeTracker extends GObject.Object {
  declare connect: GObject.SignalMethods<this, SwipeTracker.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, SwipeTracker.Signals>['emit'];
  declare orientation: Clutter.Orientation;

  readonly touchpadGesture: TouchpadSwipeGesture;
  trackedProgress = 0;
  private enabledValue = true;
  private distanceValue = global.screen_height;
  private readonly history = new EventHistory();
  private readonly panGesture: Clutter.PanGesture;
  private readonly scrollGesture: ScrollGesture | null = null;
  private state = State.NONE;
  private snapPoints: number[] = [];
  private initialProgress = 0;
  private cancelProgress = 0;
  private progress = 0;
  private cancelled = false;

  constructor(actor: Clutter.Actor, orientation: Clutter.Orientation, private readonly allowedModes: Shell.ActionMode, {
    allowDrag = true,
    allowScroll = true,
    phase = Clutter.EventPhase.BUBBLE,
    name = 'SwipeTracker',
    yieldsTouch = () => false,
  }: SwipeTrackerOptions = {}) {
    super();

    this.orientation = orientation;

    this.panGesture = new Clutter.PanGesture({
      min_n_points: allowDrag ? 1 : GESTURE_FINGER_COUNT,
      max_n_points: allowDrag ? 0 : GESTURE_FINGER_COUNT,
    });
    this.panGesture.connect('may-recognize', () => (this.allowedModes & Main.actionMode) !== 0 && !yieldsTouch(this.panGesture));
    this.panGesture.connect('recognize', gesture => this.beginPanGesture(gesture));
    this.panGesture.connect('pan-update', gesture => this.updatePanGesture(gesture));
    this.panGesture.connect('end', gesture => this.endPanGesture(gesture));
    this.panGesture.connect('cancel', () => this.cancelPanGesture());
    this.bind_property('enabled', this.panGesture, 'enabled', GObject.BindingFlags.DEFAULT);
    this.bind_property_full('orientation', this.panGesture, 'pan-axis', GObject.BindingFlags.SYNC_CREATE,
      (_binding, source: Clutter.Orientation) => [true, source === Clutter.Orientation.HORIZONTAL ? Clutter.PanAxis.X : Clutter.PanAxis.Y],
      null);
    actor.add_action_full(name, phase, this.panGesture);

    this.touchpadGesture = new TouchpadSwipeGesture(actor, allowedModes);
    this.touchpadGesture.connect('begin', (_gesture, time, x, y) => this.beginTouchpadGesture(time, x, y));
    this.touchpadGesture.connect('update', (_gesture, time, delta, distance) => this.updateTouchpadGesture(time, delta, distance));
    this.touchpadGesture.connect('end', (_gesture, time, distance) => this.endTouchpadGesture(time, distance));
    this.bind_property('enabled', this.touchpadGesture, 'enabled', GObject.BindingFlags.DEFAULT);
    this.bind_property('orientation', this.touchpadGesture, 'orientation', GObject.BindingFlags.SYNC_CREATE);

    if (!allowScroll) return;

    this.scrollGesture = new ScrollGesture(actor, allowedModes);
    this.scrollGesture.connect('begin', (_gesture, time, x, y) => this.beginTouchpadGesture(time, x, y));
    this.scrollGesture.connect('update', (_gesture, time, delta, distance) => this.updateTouchpadGesture(time, delta, distance));
    this.scrollGesture.connect('end', (_gesture, time, distance) => this.endTouchpadGesture(time, distance));
    this.bind_property('enabled', this.scrollGesture, 'enabled', GObject.BindingFlags.DEFAULT);
    this.bind_property('orientation', this.scrollGesture, 'orientation', GObject.BindingFlags.SYNC_CREATE);
    this.bind_property('scroll-modifiers', this.scrollGesture, 'scroll-modifiers', GObject.BindingFlags.DEFAULT);
  }

  canHandleScrollEvent(scrollEvent: Clutter.Event): boolean {
    if (!this.enabled || this.scrollGesture === null) return false;
    return this.scrollGesture.canHandleEvent(scrollEvent);
  }

  handleScrollEvent(scrollEvent: Clutter.Event): boolean {
    if (!this.enabled || this.scrollGesture === null) return false;
    return this.scrollGesture.handleEvent(scrollEvent, true) === Clutter.EVENT_STOP;
  }

  get enabled(): boolean {
    return this.enabledValue;
  }

  set enabled(enabled: boolean) {
    if (this.enabledValue === enabled) return;

    this.enabledValue = enabled;
    if (!enabled && this.state === State.SCROLLING) this.interrupt();
    this.notify('enabled');
  }

  get distance(): number {
    return this.distanceValue;
  }

  set distance(distance: number) {
    if (this.distanceValue === distance) return;

    this.distanceValue = distance;
    this.notify('distance');
  }

  confirmSwipe(distance: number, snapPoints: number[], currentProgress: number, cancelProgress: number): void {
    this.distance = distance;
    this.snapPoints = snapPoints;
    this.initialProgress = currentProgress;
    this.progress = currentProgress;
    this.trackedProgress = currentProgress;
    this.cancelProgress = cancelProgress;

    this.state = State.SCROLLING;
  }

  destroy(): void {
    this.touchpadGesture.destroy();
    this.panGesture.actor?.remove_action(this.panGesture);
  }

  private reset(): void {
    this.state = State.NONE;

    this.snapPoints = [];
    this.initialProgress = 0;
    this.cancelProgress = 0;

    this.progress = 0;
    this.trackedProgress = 0;

    this.cancelled = false;

    this.history.reset();
  }

  private interrupt(): void {
    this.emit('end', 0, this.cancelProgress, true);
    this.panGesture.cancel();
    this.reset();
  }

  private beginGesture(x: number, y: number): void {
    if (this.state === State.SCROLLING) return;

    const rect = new Mtk.Rectangle({ x, y, width: 1, height: 1 });
    this.emit('begin', global.display.get_monitor_index_for_rect(rect));
  }

  private beginPanGesture(panGesture: Clutter.PanGesture): void {
    const coords = panGesture.get_begin_centroid();
    this.beginGesture(coords.x, coords.y);
  }

  private beginTouchpadGesture(time: number, x: number, y: number): void {
    this.history.append(time, 0);
    this.beginGesture(x, y);
  }

  private findClosestPoint(pos: number): number {
    const distances = this.snapPoints.map(x => Math.abs(x - pos));
    return distances.indexOf(Math.min(...distances));
  }

  private rubberband(progress: number): number {
    const first = this.snapPoints[0];
    const last = this.snapPoints[this.snapPoints.length - 1];
    if (progress < first) return first + KestrelUi.rubberband(progress - first, 1);
    if (progress > last) return last + KestrelUi.rubberband(progress - last, 1);
    return progress;
  }

  private updateGesture(delta: number, distance: number): void {
    if (this.state !== State.SCROLLING) return;

    this.trackedProgress += delta / distance;
    this.progress = this.rubberband(this.trackedProgress);

    this.emit('update', this.progress);
  }

  private updatePanGesture(panGesture: Clutter.PanGesture): void {
    const deltaVec = panGesture.get_delta_abs();
    const along = this.orientation === Clutter.Orientation.HORIZONTAL ? deltaVec.get_x() : deltaVec.get_y();
    this.updateGesture(this.gestureDirFactor() * along, this.distanceValue);
  }

  private updateTouchpadGesture(time: number, delta: number, distance: number): void {
    if ((this.allowedModes & Main.actionMode) === 0 || !this.enabled) {
      this.interrupt();
      return;
    }

    if (this.orientation === Clutter.Orientation.HORIZONTAL &&
      Clutter.get_default_text_direction() === Clutter.TextDirection.RTL)
      delta = -delta;

    this.history.append(time, delta);
    this.updateGesture(delta, distance);
  }

  private getEndProgress(velocity: number): number {
    if (this.cancelled) return this.cancelProgress;

    const projected = this.trackedProgress + KestrelUi.projection(velocity);
    const first = this.snapPoints[0];
    const last = this.snapPoints[this.snapPoints.length - 1];
    let index = this.findClosestPoint(clamp(projected, first, last));
    const initial = this.findClosestPoint(this.initialProgress);
    if (index === initial && Math.abs(velocity) >= FLING_VELOCITY)
      index = clamp(index + Math.sign(velocity), 0, this.snapPoints.length - 1);

    return this.snapPoints[index];
  }

  private endGesture(velocity: number, distance: number): void {
    if (this.state !== State.SCROLLING) return;

    if ((this.allowedModes & Main.actionMode) === 0 || !this.enabled) {
      this.interrupt();
      return;
    }

    const progressVelocity = velocity * 1000 / distance;
    const endProgress = this.getEndProgress(progressVelocity);
    const overshoot = this.progress !== this.trackedProgress;

    this.reset();
    this.emit('end', overshoot ? 0 : progressVelocity, endProgress, false);
  }

  private endPanGesture(panGesture: Clutter.PanGesture): void {
    const velocity = panGesture.get_velocity();
    const along = this.orientation === Clutter.Orientation.HORIZONTAL ? velocity.get_x() : velocity.get_y();
    this.endGesture(this.gestureDirFactor() * along, this.distanceValue);
  }

  private endTouchpadGesture(time: number, distance: number): void {
    if ((this.allowedModes & Main.actionMode) === 0 || !this.enabled) {
      this.interrupt();
      return;
    }

    this.history.trim(time);
    this.endGesture(this.history.calculateVelocity(), distance);
  }

  private cancelPanGesture(): void {
    if (this.state !== State.SCROLLING) return;

    this.cancelled = true;
    this.endGesture(0, this.distanceValue);
  }

  private gestureDirFactor(): number {
    if (this.orientation === Clutter.Orientation.HORIZONTAL &&
      Clutter.get_default_text_direction() === Clutter.TextDirection.RTL)
      return 1;

    return -1;
  }
});

export type SwipeTracker = InstanceType<typeof SwipeTracker>;
