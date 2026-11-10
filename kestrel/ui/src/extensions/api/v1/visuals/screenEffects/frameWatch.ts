import type Clutter from 'gi://Clutter';
import type Cogl from 'gi://Cogl';
import GLib from 'gi://GLib';
import GLibUnix from 'gi://GLibUnix';

const PROBE_EVERY_MS = 2000;
const SLOW_FRAME_MS = 250;
const SLOW_PROBES_IN_A_ROW = 3;
const STUCK_FRAME_MS = 1500;
const FENCE_CHECK_MS = 10;

const now = () => GLib.get_monotonic_time() / 1000;

class FenceWait {
  private readonly started = now();
  private seenPending = 0;
  private readySource: number;
  private checkSource: number;

  constructor(private readonly fence: number, private readonly done: (milliseconds: number) => void) {
    this.readySource = GLibUnix.fd_add_full(GLib.PRIORITY_HIGH, fence, GLib.IOCondition.IN, () => {
      this.readySource = 0;
      this.finish();
      return GLib.SOURCE_REMOVE;
    });
    this.checkSource = GLib.timeout_add(GLib.PRIORITY_DEFAULT, FENCE_CHECK_MS, () => {
      this.seenPending = now() - this.started;
      if (this.seenPending < STUCK_FRAME_MS) return GLib.SOURCE_CONTINUE;
      this.checkSource = 0;
      this.finish();
      return GLib.SOURCE_REMOVE;
    });
  }

  private finish(): void {
    this.cancel();
    this.done(this.seenPending);
  }

  cancel(): void {
    if (this.readySource) GLib.source_remove(this.readySource);
    if (this.checkSource) GLib.source_remove(this.checkSource);
    if (this.readySource || this.checkSource) GLib.close(this.fence);
    this.readySource = this.checkSource = 0;
  }
}

export class FrameWatch {
  private timer = 0;
  private paintSignal = 0;
  private slow = 0;
  private fenceWait: FenceWait | null = null;

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
    this.fenceWait?.cancel();
    this.fenceWait = null;
  }

  private disconnect(): void {
    if (!this.paintSignal) return;
    global.stage.disconnect(this.paintSignal);
    this.paintSignal = 0;
  }

  private probe(): void {
    if (this.paintSignal || this.fenceWait) return;
    this.paintSignal = global.stage.connect_after('after-paint', (_stage: Clutter.Stage, view: Clutter.StageView) => this.measure(view));
  }

  private measure(view: Clutter.StageView): void {
    this.disconnect();
    const framebuffer = view.get_onscreen();
    const fence = framebuffer.get_context().get_renderer().get_latest_sync_fd();
    if (fence < 0) this.took(blockUntilDrawn(framebuffer));
    else this.fenceWait = new FenceWait(fence, milliseconds => {
      this.fenceWait = null;
      this.took(milliseconds);
    });
  }

  private took(milliseconds: number): void {
    this.measured();
    this.slow = milliseconds >= SLOW_FRAME_MS ? this.slow + 1 : 0;
    if (milliseconds < STUCK_FRAME_MS && this.slow < SLOW_PROBES_IN_A_ROW) return;
    this.slow = 0;
    this.tooSlow();
  }
}

function blockUntilDrawn(framebuffer: Cogl.Framebuffer): number {
  const started = now();
  framebuffer.finish();
  return now() - started;
}
