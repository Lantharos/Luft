import GLib from 'gi://GLib';

export type Work = Generator<unknown, void, unknown>;
export type Step = () => Work | void;

interface StartupSignals {
  connect(signal: 'startup-complete', callback: () => void): number;
  disconnect(id: number): void;
}

const BUDGET = 3000;
const ready: Work[] = [];
const resumed = new Map<Work, unknown>();
const waiting = new Set<Work>();
const settledWaiters: (() => void)[] = [];
let source = 0;
let deadline = 0;

export function inBudget(): boolean {
  return GLib.get_monotonic_time() < deadline;
}

function* sequence(steps: Step[]): Work {
  for (const step of steps) {
    const work = step();
    if (work) yield* work;
    yield;
  }
}

function schedule(): void {
  source ||= GLib.idle_add(GLib.PRIORITY_LOW, dispatch);
}

function fail(work: Work, error: unknown): void {
  console.error('Kestrel could not prepare a surface', error);
  work.return();
}

function wait(work: Work, promise: Promise<unknown>): void {
  waiting.add(work);
  const resume = (value: unknown) => {
    if (!waiting.delete(work)) return;
    resumed.set(work, value);
    ready.unshift(work);
    schedule();
  };
  promise.then(resume, error => {
    if (waiting.delete(work)) fail(work, error);
  });
}

function dispatch(): boolean {
  deadline = GLib.get_monotonic_time() + BUDGET;
  while (ready.length && inBudget()) {
    const work = ready[0];
    const input = resumed.get(work);
    resumed.delete(work);
    try {
      const { value, done } = work.next(input);
      if (done) ready.shift();
      else if (value instanceof Promise) wait(ready.shift()!, value);
    } catch (error) {
      ready.shift();
      fail(work, error);
    }
  }
  if (ready.length) return GLib.SOURCE_CONTINUE;
  source = 0;
  if (!waiting.size) for (const resolve of settledWaiters.splice(0)) resolve();
  return GLib.SOURCE_REMOVE;
}

export function prewarmSettled(): Promise<void> {
  if (!ready.length && !waiting.size) return Promise.resolve();
  return new Promise(resolve => settledWaiters.push(resolve));
}

export function prewarmSoon(steps: Step[]): () => void {
  const work = sequence(steps);
  ready.push(work);
  schedule();
  return () => {
    const index = ready.indexOf(work);
    if (index >= 0) ready.splice(index, 1);
    waiting.delete(work);
    resumed.delete(work);
    work.return();
  };
}

export function prewarmAfterStartup(layoutManager: StartupSignals, steps: Step[]): () => void {
  let cancel = () => {};
  let startup = layoutManager.connect('startup-complete', () => {
    layoutManager.disconnect(startup);
    startup = 0;
    cancel = prewarmSoon(steps);
  });
  return () => {
    if (startup) layoutManager.disconnect(startup);
    cancel();
  };
}
