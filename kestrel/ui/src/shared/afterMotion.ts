import GLib from 'gi://GLib';

const queued = new Set<() => void>();
let moving = 0;
let flushing = 0;

function flush(): void {
  flushing = 0;
  if (moving) return;
  const work = [...queued];
  queued.clear();
  for (const run of work) run();
}

/**
 * Runs `run` now, or once the window motion on screen has finished when some is playing,
 * so its work doesn't land in the frames of the animation. Passing the same function again
 * before then runs it once.
 */
export function afterMotion(run: () => void): void {
  if (moving) queued.add(run);
  else run();
}

export function dropAfterMotion(...runs: (() => void)[]): void {
  for (const run of runs) queued.delete(run);
}

/** Marks motion as playing until the returned function is called. */
export function holdMotion(): () => void {
  moving++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--moving || flushing || !queued.size) return;
    flushing = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
      flush();
      return GLib.SOURCE_REMOVE;
    });
  };
}
