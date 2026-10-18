import Clutter from 'gi://Clutter';

import { animateActor, Duration, Gesture, rubberband, Spring } from '../../shared/motion.js';

const DISMISS_SHARE = 0.4;
const FLING_SPEED = 500;
const FADE_SHARE = 0.75;
const FLY_PAST = 48;
const PIXELS_PER_UNIT = 10;
const VELOCITY_WINDOW = 150;

type Axis = 'x' | 'y';

export interface SwipeAwayOptions {
  downward: boolean;
  moved?: () => Clutter.Actor;
  held?: (held: boolean) => void;
  dismissed: (actor: Clutter.Actor) => void;
}

interface Drag {
  axis: Axis;
  actor: Clutter.Actor;
  base: number;
}

interface Fingers {
  pending: [number, number];
  ignored: boolean;
  travelled: number;
  samples: { time: number; distance: number }[];
}

export class SwipeAway {
  private readonly pan: Clutter.PanGesture;
  private drag: Drag | null = null;
  private fingers: Fingers | null = null;
  private dismissing = false;

  constructor(private readonly source: Clutter.Actor, private readonly options: SwipeAwayOptions) {
    source.reactive = true;
    this.pan = new Clutter.PanGesture({
      begin_threshold: Gesture.directionLock,
      pan_axis: options.downward ? Clutter.PanAxis.BOTH : Clutter.PanAxis.X,
      required_button: Clutter.BUTTON_PRIMARY,
    });
    this.pan.connect('recognize', () => {
      const delta = this.pan.get_accumulated_delta_abs();
      this.begin(this.axisOf(delta.get_x(), delta.get_y()) ?? 'x');
      this.followPan();
    });
    this.pan.connect('pan-update', () => this.followPan());
    this.pan.connect('end', () => {
      const velocity = this.pan.get_velocity_abs();
      this.release(this.along(velocity.get_x(), velocity.get_y()) * 1000);
    });
    this.pan.connect('cancel', () => this.release(0));
    source.add_action(this.pan);
    source.connect('scroll-event', (_actor, event: Clutter.Event) => this.scrolled(event));
  }

  dismiss(): void {
    if (this.dismissing) return;
    if (!this.drag) this.begin('x');
    this.flyOut(0);
  }

  private axisOf(x: number, y: number): Axis | null {
    if (Math.abs(y) <= Math.abs(x)) return 'x';
    return this.options.downward ? 'y' : null;
  }

  private along(x: number, y: number): number {
    return this.drag?.axis === 'y' ? y : x;
  }

  private size(): number {
    const { actor, axis } = this.drag!;
    return axis === 'y' ? actor.height : actor.width;
  }

  private offset(): number {
    const { actor, axis } = this.drag!;
    return axis === 'y' ? actor.translation_y : actor.translation_x;
  }

  private begin(axis: Axis): void {
    const actor = this.options.moved?.() ?? this.source;
    for (const property of ['translation-x', 'translation-y', 'opacity']) actor.remove_transition(property);
    this.drag = { axis, actor, base: Math.max(0, axis === 'y' ? actor.translation_y : actor.translation_x) };
    this.options.held?.(true);
  }

  private followPan(): void {
    const delta = this.pan.get_accumulated_delta_abs();
    this.follow(this.along(delta.get_x(), delta.get_y()));
  }

  private follow(distance: number): void {
    if (!this.drag || this.dismissing) return;
    const { actor, axis, base } = this.drag;
    const size = this.size();
    const raw = base + distance;
    const shown = raw >= 0 ? raw : rubberband(raw, size);
    if (axis === 'y') actor.translation_y = shown;
    else actor.translation_x = shown;
    actor.opacity = Math.round(255 * (1 - Math.min(1, Math.max(0, shown) / (size * FADE_SHARE))));
  }

  private release(velocity: number): void {
    if (!this.drag || this.dismissing) return;
    const far = this.offset() > this.size() * DISMISS_SHARE;
    if (velocity > FLING_SPEED || (far && velocity > -FLING_SPEED)) this.flyOut(velocity);
    else this.springBack(velocity);
  }

  private flyOut(velocity: number): void {
    const { actor, axis } = this.drag!;
    this.dismissing = true;
    this.source.reactive = false;
    animateActor(actor, {
      [axis === 'y' ? 'translation_y' : 'translation_x']: this.size() + FLY_PAST,
      spring: Spring.thrown,
      velocity: Math.max(0, velocity),
    });
    animateActor(actor, {
      opacity: 0,
      duration: Duration.quick,
      mode: Clutter.AnimationMode.LINEAR,
      onComplete: () => this.options.dismissed(actor),
    });
  }

  private springBack(velocity: number): void {
    const { actor, axis } = this.drag!;
    this.drag = null;
    animateActor(actor, { opacity: 255, duration: Duration.quick, mode: Clutter.AnimationMode.LINEAR });
    animateActor(actor, { [axis === 'y' ? 'translation_y' : 'translation_x']: 0, spring: Spring.snappy, velocity });
    this.options.held?.(false);
  }

  private scrolled(event: Clutter.Event): boolean {
    if (event.get_scroll_direction() !== Clutter.ScrollDirection.SMOOTH || event.get_scroll_source() !== Clutter.ScrollSource.FINGER)
      return Clutter.EVENT_PROPAGATE;
    const fingers = this.fingers ??= { pending: [0, 0], ignored: false, travelled: 0, samples: [] };
    const [dx, dy] = event.get_scroll_delta();
    const time = event.get_time();
    const handled = !fingers.ignored && !this.dismissing && this.followFingers(fingers, -dx * PIXELS_PER_UNIT, -dy * PIXELS_PER_UNIT, time);
    if (event.get_scroll_finish_flags() !== Clutter.ScrollFinishFlags.NONE) {
      this.fingers = null;
      if (handled) this.release(fingerVelocity(fingers.samples, time));
    }
    return handled ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE;
  }

  private followFingers(fingers: Fingers, x: number, y: number, time: number): boolean {
    if (!this.drag) {
      fingers.pending = [fingers.pending[0] + x, fingers.pending[1] + y];
      if (Math.hypot(...fingers.pending) < Gesture.directionLock) return false;
      const axis = this.axisOf(...fingers.pending);
      if (!axis) {
        fingers.ignored = true;
        return false;
      }
      this.begin(axis);
      [x, y] = fingers.pending;
    }
    const distance = this.along(x, y);
    if (distance * (fingers.samples.at(-1)?.distance ?? 0) < 0) fingers.samples = [];
    fingers.travelled += distance;
    fingers.samples = [...fingers.samples.filter(sample => sample.time >= time - VELOCITY_WINDOW), { time, distance }];
    this.follow(fingers.travelled);
    return true;
  }
}

function fingerVelocity(samples: { time: number; distance: number }[], time: number): number {
  const recent = samples.filter(sample => sample.time >= time - VELOCITY_WINDOW);
  const span = recent.length > 1 ? time - recent[0].time : 0;
  return span > 0 ? recent.slice(1).reduce((sum, sample) => sum + sample.distance, 0) * 1000 / span : 0;
}
