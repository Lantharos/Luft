import type Clutter from 'gi://Clutter';

export interface GestureDevice {
  get_dimensions(): [boolean, number, number];
  get_device_type(): Clutter.InputDeviceType;
}

export interface GestureFields {
  type: Clutter.EventType;
  phase: Clutter.TouchpadGesturePhase;
  fingers: number;
  time: number;
  coords: [x: number, y: number];
  delta: [dx: number, dy: number];
  scale: number;
  device: GestureDevice | null;
}

// Stands in for a touchpad gesture event, for gestures that don't come from a touchpad
export function gestureEvent({ type, phase, fingers, time, coords, delta, scale, device }: GestureFields): Clutter.Event {
  return {
    type: () => type,
    get_gesture_phase: () => phase,
    get_touchpad_gesture_finger_count: () => fingers,
    get_time: () => time,
    get_coords: () => coords,
    get_gesture_motion_delta: () => delta,
    get_gesture_motion_delta_unaccelerated: () => delta,
    get_gesture_pinch_scale: () => scale,
    get_state: () => 0,
    get_source_device: () => device,
  } as unknown as Clutter.Event;
}
