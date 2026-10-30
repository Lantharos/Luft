import type Clutter from 'gi://Clutter';

const FRAME = 16;

export type Held = ReturnType<typeof hold>;

export function hold(transitions: Clutter.Timeline[]) {
  for (const transition of transitions) transition.pause();
  return {
    duration: Math.max(...transitions.map(transition => transition.duration)),
    get done() {
      return transitions.every(transition => transition.get_elapsed_time() >= transition.duration);
    },
    step(frames = 1, onFrame = () => {}) {
      for (let frame = 0; frame < frames; frame++) {
        for (const transition of transitions) {
          transition.advance(transition.get_elapsed_time() + FRAME);
          transition.emit('new-frame', transition.get_elapsed_time());
        }
        onFrame();
      }
    },
    release() {
      for (const transition of transitions) transition.start();
    },
  };
}
