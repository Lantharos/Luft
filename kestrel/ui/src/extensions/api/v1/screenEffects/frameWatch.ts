import type Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

const PROBE_EVERY_MS = 2000;
const SLOW_FRAME_MS = 250;
const SLOW_PROBES_IN_A_ROW = 3;
const STUCK_FRAME_MS = 1500;

/**
 * Times a frame every couple of seconds while effects are attached: it waits for the GPU right after a paint, which
 * shows what a shader really cost, and only while something paints. Very slow frames mean an effect has to go.
 */
export class FrameWatch {
  private timer = 0;
  private paintSignal = 0;
  private slow = 0;

  constructor(private readonly tooSlow: () => void, private readonly measured: () => void) {}

  start(): void {
    if (this.timer) return;
    this.timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, PROBE_EVERY_MS, () => {
      this.probe();
      return GLib.SOURCE_CONTINUE;
    });
    this.probe();
  }

  stop(): void {
    if (this.timer) GLib.source_remove(this.timer);
    this.timer = 0;
    this.slow = 0;
    this.disconnect();
  }

  private disconnect(): void {
    if (!this.paintSignal) return;
    global.stage.disconnect(this.paintSignal);
    this.paintSignal = 0;
  }

  private probe(): void {
    if (this.paintSignal) return;
    this.paintSignal = global.stage.connect_after('after-paint', (_stage: Clutter.Stage, view: Clutter.StageView) => this.measure(view));
  }

  private measure(view: Clutter.StageView): void {
    this.disconnect();
    const started = GLib.get_monotonic_time();
    view.get_onscreen().finish();
    const milliseconds = (GLib.get_monotonic_time() - started) / 1000;
    this.measured();
    this.slow = milliseconds >= SLOW_FRAME_MS ? this.slow + 1 : 0;
    if (milliseconds < STUCK_FRAME_MS && this.slow < SLOW_PROBES_IN_A_ROW) return;
    this.slow = 0;
    this.tooSlow();
  }
}
