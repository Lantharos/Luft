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

export function afterMotion(run: () => void): void {
  if (moving) queued.add(run);
  else run();
}

export function dropAfterMotion(...runs: (() => void)[]): void {
  for (const run of runs) queued.delete(run);
}

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
