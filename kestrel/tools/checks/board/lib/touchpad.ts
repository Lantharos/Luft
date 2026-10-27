import Clutter from 'gi://Clutter';
import {gestureEvent} from 'resource:///com/lantharos/kestrel/kestrel.js';

const PHASES = {
  begin: Clutter.TouchpadGesturePhase.BEGIN,
  update: Clutter.TouchpadGesturePhase.UPDATE,
  end: Clutter.TouchpadGesturePhase.END,
};

export type Phase = keyof typeof PHASES;

interface Motion {
  dx?: number;
  dy?: number;
  scale?: number;
  x?: number;
  y?: number;
  time?: number;
}

let clock = 0;

function gesture(type: Clutter.EventType, phase: Phase, fingers: number, {dx = 0, dy = 0, scale = 1, x = 720, y = 450, time = clock += 16}: Motion) {
  return gestureEvent({type, phase: PHASES[phase], fingers, time, coords: [x, y], delta: [dx, dy], scale, device: null});
}

export const touchpad = {
  swipe: (phase: Phase, fingers: number, dx = 0, dy = 0, x = 720, y = 450) =>
    gesture(Clutter.EventType.TOUCHPAD_SWIPE, phase, fingers, {dx, dy, x, y}),
  pinch: (phase: Phase, fingers: number, scale: number, x?: number, y?: number) =>
    gesture(Clutter.EventType.TOUCHPAD_PINCH, phase, fingers, {scale, x, y}),
  hold: (phase: Phase, fingers: number, duration = 0) =>
    gesture(Clutter.EventType.TOUCHPAD_HOLD, phase, fingers, {time: clock += duration}),
};
