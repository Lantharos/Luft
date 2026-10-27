import Clutter from 'gi://Clutter';

import { gestureEvent } from './gestureEvent.js';

// A touchscreen works like one big touchpad: three or more fingers swipe and two pinch, for whatever takes the
// touchpad's gestures. Fingers nothing wants stay with the app under them, or the desktop's own workspace swipe.
const SWIPE_FINGERS = 3;
// Under the workspace swipe's 16, so a swipe that's wanted here is taken before that one starts
const BEGIN_THRESHOLD = 10;
// Two fingers over a window only count once they spread or close this much, so they still scroll the app otherwise
const PINCH_SLOP = 0.08;
const UNITS_PER_MM = 1000 / 25.4;

export interface TouchGestureTarget {
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

// The gesture's own point coordinates follow the actors under the fingers, which the board scales, so read the screen's
function shapeOf(gesture: Clutter.Gesture): Shape {
  const events = gesture.get_points().map(point => gesture.get_point_event(point));
  return shapeAt(events.map(event => event.get_coords()), Math.max(...events.map(event => event.get_time())));
}

const slotOf = (event: Clutter.Event) => event.get_event_sequence()?.get_slot() ?? -1;

// Gestures that track the touchpad's height cover half the screen's, since a hand travels further over a screen than a touchpad
function touchpadEvent(type: Clutter.EventType, phase: Clutter.TouchpadGesturePhase, shape: Shape, delta: Point, scale: number): Clutter.Event {
  const device = {
    get_dimensions: (): [boolean, number, number] => [true, global.screen_width / 2 / UNITS_PER_MM, global.screen_height / 2 / UNITS_PER_MM],
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
    this.gesture = new Clutter.PanGesture({ name: `Kestrel touchscreen ${type === Clutter.EventType.TOUCHPAD_PINCH ? 'pinch' : 'swipe'}`, min_n_points: fingers[0], max_n_points: fingers[1], begin_threshold: BEGIN_THRESHOLD });
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
    const shape = shapeOf(this.gesture);
    const begin = this.beginShape();
    return this.wants(shape, begin.spread > 0 ? shape.spread / begin.spread : 1);
  }

  private beginShape(): Shape {
    const events = this.gesture.get_points().map(point => this.gesture.get_point_event(point));
    return shapeAt(events.map(event => this.starts.get(slotOf(event)) ?? event.get_coords()), Math.max(...events.map(event => event.get_time())));
  }

  private send(phase: Clutter.TouchpadGesturePhase): void {
    const shape = shapeOf(this.gesture);
    if (phase === Clutter.TouchpadGesturePhase.BEGIN) {
      this.begin = this.last = { ...this.beginShape(), fingers: shape.fingers };
      // Takes the fingers away from the app under them, as the workspace swipe does
      this.grab = global.stage.grab(global.stage);
    }
    const last = this.last!;
    // Each finger's move updates the gesture, so wait for the next moment to report them all as one, as a touchpad does
    if (phase === Clutter.TouchpadGesturePhase.UPDATE && shape.time <= last.time && shape.fingers === last.fingers) return;
    // A finger landing or lifting moves the center without the hand moving
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
        (shape, scale) => target.wantsPinch(...shape.center, Math.abs(scale - 1) >= PINCH_SLOP), target),
    ];
    for (const { gesture } of this.gestures) global.stage.add_action_full(gesture.name, Clutter.EventPhase.CAPTURE, gesture);
  }

  // Whether the fingers of another gesture are a swipe that's wanted here, which that gesture leaves alone then
  claims(gesture: Clutter.Gesture): boolean {
    const shape = shapeOf(gesture);
    return shape.fingers >= SWIPE_FINGERS && this.target.wantsSwipe(shape.fingers, ...shape.center);
  }

  destroy(): void {
    for (const { gesture } of this.gestures) global.stage.remove_action(gesture);
  }
}
