import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import {pause} from '../checks/lib/wait.js';

const IDLE_GAP = 100_000;
const QUIET = 150;
const POLL = 16;
const QUIET_TIMEOUT = 8000;
const EACH_FRAME_TIMEOUT = 20_000;

const now = () => GLib.get_monotonic_time();
const playing = new Set<Clutter.Timeline>();

interface PendingFrame {
  updateStart: number;
  paintStart?: number;
  paintEnd?: number;
  gpuEnd?: number;
}

interface RecordedFrame {
  updateStart: number;
  paintStart: number;
  paintEnd: number;
  gpuEnd?: number;
  updateEnd: number;
  cpuNs: number;
}

export interface Interaction {
  name: string;
  first?: string;
  prepare(): Promise<unknown>;
  act(recorder: FrameRecorder): Promise<unknown>;
  finish?(): unknown;
}

interface Spread {
  p50: number;
  p95: number;
  max: number;
}

export type Summary = ReturnType<typeof summarize> & {gpu?: Spread; timelines: Timeline[]};
type Timeline = ReturnType<typeof timelines>[number];

export function eachFrame(steps: number, step: (index: number) => void) {
  const timeline = new Clutter.Timeline({actor: global.stage, duration: EACH_FRAME_TIMEOUT});
  playing.add(timeline);
  const drawn = new Promise<void>((resolve, reject) => {
    let index = 0;
    timeline.connect('new-frame', () => {
      try {
        step(index++);
      } catch (error) {
        reject(error);
        return;
      }
      if (index >= steps) resolve();
    });
    timeline.connect('completed', () => reject(new Error(`Only ${index} of ${steps} frames were drawn`)));
    timeline.start();
  });
  return drawn.finally(() => {
    timeline.stop();
    playing.delete(timeline);
  });
}

function threadCpuNs() {
  const [, contents] = GLib.file_get_contents('/proc/thread-self/schedstat');
  return Number(new TextDecoder().decode(contents).split(' ')[0]);
}

export class FrameRecorder {
  readonly gpu: boolean;
  readonly frames: RecordedFrame[] = [];
  startedAt = 0;
  private signals: number[] = [];
  private lastCpu = 0;
  private lastPaint = 0;

  constructor({gpu = false} = {}) {
    this.gpu = gpu;
  }

  start() {
    const stage = global.stage;
    this.startedAt = now();
    this.lastCpu = threadCpuNs();
    this.lastPaint = 0;
    let frame: PendingFrame | null = null;
    this.signals = [
      stage.connect('before-update', () => (frame = {updateStart: now()})),
      stage.connect('before-paint', () => frame && (frame.paintStart = now())),
      stage.connect_after('after-paint', (_stage, view) => {
        if (!frame) return;
        frame.paintEnd = now();
        if (this.gpu) {
          view.get_framebuffer().finish();
          frame.gpuEnd = now();
        }
      }),
      stage.connect_after('after-update', () => {
        if (!frame?.paintEnd || frame.paintStart === undefined) return;
        const cpu = threadCpuNs();
        this.frames.push({...frame, paintStart: frame.paintStart, paintEnd: frame.paintEnd, updateEnd: now(), cpuNs: cpu - this.lastCpu});
        this.lastCpu = cpu;
        this.lastPaint = frame.paintEnd;
        frame = null;
      }),
    ];
  }

  stop() {
    for (const id of this.signals.splice(0)) global.stage.disconnect(id);
  }

  async quiet() {
    const deadline = now() + QUIET_TIMEOUT * 1000;
    while (now() < deadline && now() - Math.max(this.lastPaint, this.startedAt) < QUIET * 1000) await pause(POLL);
  }
}

export const measured = (action: () => unknown) => async (recorder: FrameRecorder) => {
  recorder.start();
  await action();
  await recorder.quiet();
};

const percentile = (values: number[], fraction: number) => values.length ? values.toSorted((a, b) => a - b)[Math.min(values.length - 1, Math.floor(values.length * fraction))] : 0;
const ms = (microseconds: number) => Math.round(microseconds / 10) / 100;

function spread(values: number[]): Spread {
  return {p50: ms(percentile(values, 0.5)), p95: ms(percentile(values, 0.95)), max: ms(Math.max(0, ...values))};
}

export function summarize(runs: FrameRecorder[], refreshRate: number) {
  const interval = 1e6 / refreshRate;
  const frames = runs.flatMap(run => run.frames);
  let missed = 0;
  let longest = 0;
  for (const {frames: painted} of runs) {
    for (let index = 1; index < painted.length; index++) {
      const gap = painted[index].paintEnd - painted[index - 1].paintEnd;
      if (gap > IDLE_GAP) continue;
      longest = Math.max(longest, gap);
      missed += Math.max(0, Math.round(gap / interval) - 1);
    }
  }
  return {
    frames: frames.length,
    firstFrameMs: ms(Math.max(0, ...runs.map(run => run.frames.length ? run.frames[0].paintEnd - run.startedAt : 0))),
    missed,
    slow: frames.filter(frame => frame.updateEnd - frame.updateStart > interval).length,
    longestIntervalMs: ms(longest),
    cpu: spread(frames.map(frame => frame.cpuNs / 1000)),
    update: spread(frames.map(frame => frame.updateEnd - frame.updateStart)),
    layout: spread(frames.map(frame => frame.paintStart - frame.updateStart)),
    paint: spread(frames.map(frame => frame.paintEnd - frame.paintStart)),
  };
}

export function timelines(runs: FrameRecorder[]) {
  return runs.map(({startedAt, frames}) => ({
    startedAt,
    frames: frames.map(frame => [ms(frame.updateStart - startedAt), ms(frame.paintEnd - startedAt), ms(frame.cpuNs / 1000)]),
  }));
}

export function summarizeGpu(runs: FrameRecorder[]) {
  return spread(runs.flatMap(run => run.frames).map(frame => frame.gpuEnd! - frame.paintEnd));
}
