import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import type Shell from 'gi://Shell';

import * as KestrelUi from '../../kestrelUi.js';
import * as Main from '../../core/main.js';

const UNITS_PER_MM = 1000 / 25.4;
const TOUCHPAD_FALLBACK_MM = [105, 70];
const TOUCHPAD_SWIPE_SHARE = 2 / 3;
const SCROLL_DISTANCE = [400, 300];
const SCROLL_MULTIPLIER = 10;
const EVENT_HISTORY_THRESHOLD_MS = 150;

export const GESTURE_FINGER_COUNT = 3;

enum TouchpadState {
  NONE,
  PENDING,
  HANDLING,
  IGNORED,
}

interface HistoryEntry {
  time: number;
  delta: number;
}

export class EventHistory {
  private data: HistoryEntry[] = [];
  private heading = 0;

  reset(): void {
    this.data = [];
    this.heading = 0;
  }

  trim(time: number): void {
    const thresholdTime = time - EVENT_HISTORY_THRESHOLD_MS;
    const index = this.data.findIndex(r => r.time >= thresholdTime);
    this.data.splice(0, index);
  }

  append(time: number, delta: number): void {
    this.trim(time);

    if (delta * this.heading < 0) this.data = [{ time: this.data.at(-1)!.time, delta: 0 }];
    if (delta) this.heading = Math.sign(delta);
    this.data.push({ time, delta });
  }

  calculateVelocity(): number {
    if (this.data.length < 2) return 0;

    const firstTime = this.data[0].time;
    const lastTime = this.data[this.data.length - 1].time;
    if (firstTime === lastTime) return 0;

    const totalDelta = this.data.slice(1).map(a => a.delta).reduce((a, b) => a + b);
    return totalDelta / (lastTime - firstTime);
  }
}

export namespace SwipeGesture {
  export interface Signals extends GObject.Object.SignalSignatures {
    'begin': (time: number, x: number, y: number) => void;
    'update': (time: number, delta: number, distance: number) => void;
    'end': (time: number, distance: number) => void;
  }
}

const GESTURE_SIGNALS = {
  'begin': { param_types: [GObject.TYPE_UINT, GObject.TYPE_DOUBLE, GObject.TYPE_DOUBLE] },
  'update': { param_types: [GObject.TYPE_UINT, GObject.TYPE_DOUBLE, GObject.TYPE_DOUBLE] },
  'end': { param_types: [GObject.TYPE_UINT, GObject.TYPE_DOUBLE] },
};

const enabledSpec = () => GObject.ParamSpec.boolean('enabled', null, null, GObject.ParamFlags.READWRITE, true);
const orientationSpec = () => GObject.ParamSpec.enum('orientation', null, null, GObject.ParamFlags.READWRITE,
  Clutter.Orientation, Clutter.Orientation.HORIZONTAL);

export const TouchpadSwipeGesture = GObject.registerClass({
  Properties: {
    'enabled': enabledSpec(),
    'orientation': orientationSpec(),
  },
  Signals: GESTURE_SIGNALS,
}, class TouchpadSwipeGesture extends GObject.Object {
  declare connect: GObject.SignalMethods<this, SwipeGesture.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, SwipeGesture.Signals>['emit'];
  declare enabled: boolean;
  declare orientation: Clutter.Orientation;

  private state = TouchpadState.NONE;
  private cumulativeX = 0;
  private cumulativeY = 0;
  private readonly touchpadSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.peripherals.touchpad' });

  constructor(actor: Clutter.Actor, private readonly allowedModes: Shell.ActionMode) {
    super();
    actor.connectObject('event::touchpad', (target: Clutter.Actor, event: Clutter.Event) => this.handleEvent(target, event), this);
  }

  handleEvent(_actor: Clutter.Actor, event: Clutter.Event): boolean {
    if (event.type() !== Clutter.EventType.TOUCHPAD_SWIPE) return Clutter.EVENT_PROPAGATE;

    if (event.get_gesture_phase() === Clutter.TouchpadGesturePhase.BEGIN) this.state = TouchpadState.NONE;

    if (event.get_touchpad_gesture_finger_count() < GESTURE_FINGER_COUNT) return Clutter.EVENT_PROPAGATE;
    if ((this.allowedModes & Main.actionMode) === 0) return Clutter.EVENT_PROPAGATE;
    if (!this.enabled) return Clutter.EVENT_PROPAGATE;
    if (this.state === TouchpadState.IGNORED) return Clutter.EVENT_PROPAGATE;

    const time = event.get_time();
    const [x, y] = event.get_coords();
    let [dx, dy] = event.get_gesture_motion_delta_unaccelerated();

    if (this.state === TouchpadState.NONE) {
      if (dx === 0 && dy === 0) return Clutter.EVENT_PROPAGATE;

      this.cumulativeX = 0;
      this.cumulativeY = 0;
      this.state = TouchpadState.PENDING;
    }

    if (this.state === TouchpadState.PENDING) {
      this.cumulativeX += dx;
      this.cumulativeY += dy;

      const cdx = this.cumulativeX;
      const cdy = this.cumulativeY;
      if (Math.sqrt(cdx * cdx + cdy * cdy) < KestrelUi.Gesture.directionLock) return Clutter.EVENT_PROPAGATE;

      const gestureOrientation = Math.abs(cdx) > Math.abs(cdy)
        ? Clutter.Orientation.HORIZONTAL
        : Clutter.Orientation.VERTICAL;

      [dx, dy] = [cdx, cdy];
      this.cumulativeX = 0;
      this.cumulativeY = 0;

      if (gestureOrientation !== this.orientation) {
        this.state = TouchpadState.IGNORED;
        return Clutter.EVENT_PROPAGATE;
      }

      this.state = TouchpadState.HANDLING;
      this.emit('begin', time, x, y);
    }

    const vertical = this.orientation === Clutter.Orientation.VERTICAL;
    let delta = vertical ? dy : dx;
    const distance = this.distance(event, vertical);

    switch (event.get_gesture_phase()) {
    case Clutter.TouchpadGesturePhase.BEGIN:
    case Clutter.TouchpadGesturePhase.UPDATE:
      if (this.touchpadSettings.get_boolean('natural-scroll')) delta = -delta;
      this.emit('update', time, delta, distance);
      break;

    case Clutter.TouchpadGesturePhase.END:
    case Clutter.TouchpadGesturePhase.CANCEL:
      this.emit('end', time, distance);
      this.state = TouchpadState.NONE;
      break;
    }

    return this.state === TouchpadState.HANDLING ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE;
  }

  destroy(): void {
    global.stage.disconnectObject(this);
  }

  private distance(event: Clutter.Event, vertical: boolean): number {
    const [found, width, height] = event.get_source_device()?.get_dimensions() ?? [false, 0, 0];
    const [fallbackWidth, fallbackHeight] = TOUCHPAD_FALLBACK_MM;
    const millimetres = vertical ? (found ? height : fallbackHeight) : (found ? width : fallbackWidth);
    return millimetres * UNITS_PER_MM * TOUCHPAD_SWIPE_SHARE;
  }
});

export type TouchpadSwipeGesture = InstanceType<typeof TouchpadSwipeGesture>;

export const ScrollGesture = GObject.registerClass({
  Properties: {
    'enabled': enabledSpec(),
    'orientation': orientationSpec(),
    'scroll-modifiers': GObject.ParamSpec.flags('scroll-modifiers', null, null, GObject.ParamFlags.READWRITE, Clutter.ModifierType, 0),
  },
  Signals: GESTURE_SIGNALS,
}, class ScrollGesture extends GObject.Object {
  declare connect: GObject.SignalMethods<this, SwipeGesture.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, SwipeGesture.Signals>['emit'];
  declare orientation: Clutter.Orientation;
  declare scrollModifiers: Clutter.ModifierType;

  private began = false;
  private enabledValue = true;

  constructor(actor: Clutter.Actor, private readonly allowedModes: Shell.ActionMode) {
    super();
    actor.connect('scroll-event', (_actor, event) => this.handleEvent(event));
  }

  get enabled(): boolean {
    return this.enabledValue;
  }

  set enabled(enabled: boolean) {
    if (this.enabledValue === enabled) return;

    this.enabledValue = enabled;
    this.began = false;
    this.notify('enabled');
  }

  canHandleEvent(event: Clutter.Event, ignoreModifiers = false): boolean {
    if (event.type() !== Clutter.EventType.SCROLL) return false;

    if (event.get_scroll_source() !== Clutter.ScrollSource.FINGER &&
      event.get_source_device()!.get_device_type() !== Clutter.InputDeviceType.TOUCHPAD_DEVICE)
      return false;

    if (!this.enabled) return false;
    if ((this.allowedModes & Main.actionMode) === 0) return false;

    return ignoreModifiers || this.began || !this.scrollModifiers ||
      (event.get_state() & this.scrollModifiers) === this.scrollModifiers;
  }

  handleEvent(event: Clutter.Event, ignoreModifiers = false): boolean {
    if (!this.canHandleEvent(event, ignoreModifiers)) return Clutter.EVENT_PROPAGATE;
    if (event.get_scroll_direction() !== Clutter.ScrollDirection.SMOOTH) return Clutter.EVENT_PROPAGATE;

    const vertical = this.orientation === Clutter.Orientation.VERTICAL;
    const distance = SCROLL_DISTANCE[vertical ? 1 : 0];

    const time = event.get_time();
    const [dx, dy] = event.get_scroll_delta();
    if (dx === 0 && dy === 0) {
      this.emit('end', time, distance);
      this.began = false;
      return Clutter.EVENT_STOP;
    }

    if (!this.began) {
      const [x, y] = event.get_coords();
      this.emit('begin', time, x, y);
      this.began = true;
    }

    const along = vertical || Math.abs(dy) > Math.abs(dx) ? dy : dx;
    this.emit('update', time, along * SCROLL_MULTIPLIER, distance);

    return Clutter.EVENT_STOP;
  }
});

export type ScrollGesture = InstanceType<typeof ScrollGesture>;
