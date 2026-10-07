import Clutter from 'gi://Clutter';

const PHASES = {
  begin: Clutter.TouchpadGesturePhase.BEGIN,
  update: Clutter.TouchpadGesturePhase.UPDATE,
  end: Clutter.TouchpadGesturePhase.END,
};

let clock = 0;

function gesture(type, phase, fingers, {dx = 0, dy = 0, scale = 1, x = 720, y = 450, time = clock += 16}) {
  return {
    type: () => type,
    get_gesture_phase: () => PHASES[phase],
    get_touchpad_gesture_finger_count: () => fingers,
    get_time: () => time,
    get_coords: () => [x, y],
    get_gesture_motion_delta: () => [dx, dy],
    get_gesture_motion_delta_unaccelerated: () => [dx, dy],
    get_gesture_pinch_scale: () => scale,
    get_state: () => 0,
  };
}

export const touchpad = {
  swipe: (phase, fingers, dx = 0, dy = 0, x = 720, y = 450) =>
    gesture(Clutter.EventType.TOUCHPAD_SWIPE, phase, fingers, {dx, dy, x, y}),
  pinch: (phase, fingers, scale, x, y) =>
    gesture(Clutter.EventType.TOUCHPAD_PINCH, phase, fingers, {scale, x, y}),
  hold: (phase, fingers, duration = 0) =>
    gesture(Clutter.EventType.TOUCHPAD_HOLD, phase, fingers, {time: clock += duration}),
};
