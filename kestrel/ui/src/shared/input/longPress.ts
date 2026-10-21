import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { animateActor, Curve, Duration, reducedMotion } from '../motion.js';

const CUE_SIZE = 44;
const CUE_START = 0.4;
const CUE_POP = 1.3;

const scaleFactor = () => St.ThemeContext.get_for_stage(global.stage).scale_factor;

class HoldCue {
  private readonly actor = new St.Widget({ name: 'kestrel-hold-cue', style_class: 'kestrel-hold-cue', visible: false });

  begin(x: number, y: number): void {
    if (!this.actor.get_parent()) global.stage.add_child(this.actor);
    global.stage.set_child_above_sibling(this.actor, null);
    this.actor.remove_all_transitions();
    const size = CUE_SIZE * scaleFactor();
    const start = reducedMotion() ? 1 : CUE_START;
    this.actor.set_size(size, size);
    this.actor.set_pivot_point(0.5, 0.5);
    this.actor.set_position(Math.round(x - size / 2), Math.round(y - size / 2));
    this.actor.set({ opacity: 0, scale_x: start, scale_y: start });
    this.actor.show();
    const duration = global.stage.context.get_settings().long_press_duration - Duration.quick;
    animateActor(this.actor, { opacity: 255, scale_x: 1, scale_y: 1, delay: Duration.quick, duration, curve: Curve.decelerate });
  }

  end(recognized: boolean): void {
    if (!this.actor.visible) return;
    const scale = recognized && !reducedMotion() ? CUE_POP : this.actor.scale_x;
    animateActor(this.actor, {
      opacity: 0, scale_x: scale, scale_y: scale, duration: recognized ? Duration.quick : Duration.tap, curve: Curve.decelerate,
      onStopped: () => this.actor.hide(),
    });
  }
}

const cue = new HoldCue();

export function longPress(actor: Clutter.Actor, pressed: (x: number, y: number) => void, accepts: (target: Clutter.Actor | null) => boolean): void {
  const gesture = new Clutter.LongPressGesture({ name: 'Kestrel long press' });
  gesture.connect('should-handle-sequence', (_gesture, event: Clutter.Event) => {
    if (event.type() !== Clutter.EventType.TOUCH_BEGIN || !accepts(global.stage.get_event_actor(event))) return false;
    gesture.cancel_threshold = St.Settings.get().drag_threshold * scaleFactor();
    cue.begin(...event.get_coords());
    return true;
  });
  gesture.connect('notify::state', () => {
    if (gesture.state === Clutter.GestureState.RECOGNIZING) {
      cue.end(true);
      const point = gesture.get_coords_abs();
      pressed(point.x, point.y);
    } else if (gesture.state === Clutter.GestureState.CANCELLED) {
      cue.end(false);
    }
  });
  actor.add_action(gesture);
}
