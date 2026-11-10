import Clutter from 'gi://Clutter';

import { gestureEvent } from './gestureEvent.js';

const SWIPE_FINGERS = 3;
const BEGIN_BEFORE_WORKSPACE_SWIPE_THRESHOLD = 10;
const PINCH_SLOP_LEAVING_SCROLL_TO_APP = 0.08;
const UNITS_PER_MM = 1000 / 25.4;
const TOUCHPAD_SIZED_SHARE_OF_SCREEN = 0.5;

interface TouchGestureTarget {
  handle(event: Clutter.Event): boolean;
  wantsSwipe(fingers: number, x: number, y: number): boolean;
  wantsPinch(x: number, y: number, pinched: boolean): boolean;
}

type Point = [x: number, y: number];

interface Shape {
  center: Point;
  spread: number;
  fingers: number;
  time: number;
}

function shapeAt(points: Point[], time: number): Shape {
  const center: Point = [0, 0];
  for (const [x, y] of points) {
    center[0] += x / points.length;
    center[1] += y / points.length;
  }
  const spread = points.reduce((sum, [x, y]) => sum + Math.hypot(x - center[0], y - center[1]), 0) / points.length;
  return { center, spread, fingers: points.length, time };
}

function screenShapeOf(gesture: Clutter.Gesture): Shape {
  const events = gesture.get_points().map(point => gesture.get_point_event(point));
  return shapeAt(events.map(event => event.get_coords()), Math.max(...events.map(event => event.get_time())));
}

const slotOf = (event: Clutter.Event) => event.get_event_sequence()?.get_slot() ?? -1;

function touchpadEvent(type: Clutter.EventType, phase: Clutter.TouchpadGesturePhase, shape: Shape, delta: Point, scale: number): Clutter.Event {
  const device = {
    get_dimensions: (): [boolean, number, number] => [true, global.screen_width * TOUCHPAD_SIZED_SHARE_OF_SCREEN / UNITS_PER_MM, global.screen_height * TOUCHPAD_SIZED_SHARE_OF_SCREEN / UNITS_PER_MM],
    get_device_type: () => Clutter.InputDeviceType.TOUCHSCREEN_DEVICE,
  };
  return gestureEvent({ type, phase, fingers: shape.fingers, time: shape.time, coords: shape.center, delta, scale, device });
}

class TouchGesture {
  readonly gesture: Clutter.PanGesture;
  private begin: Shape | null = null;
  private last: Shape | null = null;
  private readonly starts = new Map<number, Point>();
  private grab: Clutter.Grab | null = null;

  constructor(
    private readonly type: Clutter.EventType,
    fingers: [min: number, max: number],
    private readonly wants: (shape: Shape, scale: number) => boolean,
    private readonly target: TouchGestureTarget,
  ) {
    this.gesture = new Clutter.PanGesture({ name: `Kestrel touchscreen ${type === Clutter.EventType.TOUCHPAD_PINCH ? 'pinch' : 'swipe'}`, min_n_points: fingers[0], max_n_points: fingers[1], begin_threshold: BEGIN_BEFORE_WORKSPACE_SWIPE_THRESHOLD });
    this.gesture.connect('should-handle-sequence', (_gesture, event: Clutter.Event) => {
      this.starts.set(slotOf(event), event.get_coords());
      return true;
    });
    this.gesture.connect('notify::state', () => {
      if (this.gesture.state === Clutter.GestureState.WAITING) this.starts.clear();
    });
    this.gesture.connect('may-recognize', () => this.mayRecognize());
    this.gesture.connect('recognize', () => this.send(Clutter.TouchpadGesturePhase.BEGIN));
    this.gesture.connect('pan-update', () => this.send(Clutter.TouchpadGesturePhase.UPDATE));
    this.gesture.connect('end', () => this.finish(Clutter.TouchpadGesturePhase.END));
    this.gesture.connect('cancel', () => this.finish(Clutter.TouchpadGesturePhase.CANCEL));
  }

  private mayRecognize(): boolean {
    const shape = screenShapeOf(this.gesture);
    const begin = this.beginShape();
    return this.wants(shape, begin.spread > 0 ? shape.spread / begin.spread : 1);
  }

  private beginShape(): Shape {
    const events = this.gesture.get_points().map(point => this.gesture.get_point_event(point));
    return shapeAt(events.map(event => this.starts.get(slotOf(event)) ?? event.get_coords()), Math.max(...events.map(event => event.get_time())));
  }

  private send(phase: Clutter.TouchpadGesturePhase): void {
    const shape = screenShapeOf(this.gesture);
    if (phase === Clutter.TouchpadGesturePhase.BEGIN) {
      this.begin = this.last = { ...this.beginShape(), fingers: shape.fingers };
      this.grab = global.stage.grab(global.stage);
    }
    const last = this.last!;
    const alreadyReportedThisMoment = shape.time <= last.time && shape.fingers === last.fingers;
    if (phase === Clutter.TouchpadGesturePhase.UPDATE && alreadyReportedThisMoment) return;
    const delta: Point = shape.fingers === last.fingers ? [shape.center[0] - last.center[0], shape.center[1] - last.center[1]] : [0, 0];
    if (shape.fingers !== this.begin!.fingers) this.begin = { ...shape, spread: shape.spread * this.begin!.spread / Math.max(1, last.spread) };
    this.last = shape;
    const scale = this.begin!.spread > 0 ? shape.spread / this.begin!.spread : 1;
    this.target.handle(touchpadEvent(this.type, phase, phase === Clutter.TouchpadGesturePhase.BEGIN ? this.begin! : shape, delta, scale));
  }

  private finish(phase: Clutter.TouchpadGesturePhase): void {
    this.grab?.dismiss();
    this.grab = null;
    if (!this.last) return;
    const last = this.last;
    const scale = this.begin && this.begin.spread > 0 ? last.spread / this.begin.spread : 1;
    this.begin = this.last = null;
    this.target.handle(touchpadEvent(this.type, phase, last, [0, 0], scale));
  }
}

export class TouchscreenGestures {
  private readonly gestures: TouchGesture[];

  constructor(private readonly target: TouchGestureTarget) {
    this.gestures = [
      new TouchGesture(Clutter.EventType.TOUCHPAD_SWIPE, [SWIPE_FINGERS, 0],
        shape => target.wantsSwipe(shape.fingers, ...shape.center), target),
      new TouchGesture(Clutter.EventType.TOUCHPAD_PINCH, [2, 2],
        (shape, scale) => target.wantsPinch(...shape.center, Math.abs(scale - 1) >= PINCH_SLOP_LEAVING_SCROLL_TO_APP), target),
    ];
    for (const { gesture } of this.gestures) global.stage.add_action_full(gesture.name, Clutter.EventPhase.CAPTURE, gesture);
  }

  claims(gesture: Clutter.Gesture): boolean {
    const shape = screenShapeOf(gesture);
    return shape.fingers >= SWIPE_FINGERS && this.target.wantsSwipe(shape.fingers, ...shape.center);
  }

  destroy(): void {
    for (const { gesture } of this.gestures) global.stage.remove_action(gesture);
  }
}
