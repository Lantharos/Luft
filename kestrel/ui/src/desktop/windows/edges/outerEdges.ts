import Meta from 'gi://Meta';

import { ResizeArea } from './resizeArea.js';

const RESIZABLE_TYPES = [Meta.WindowType.NORMAL, Meta.WindowType.DIALOG, Meta.WindowType.MODAL_DIALOG, Meta.WindowType.UTILITY];
const WINDOW_SIGNALS = ['size-changed', 'notify::titlebar-height', 'notify::maximized-horizontally', 'notify::maximized-vertically',
  'notify::fullscreen', 'shown'] as const;

class OuterEdge {
  private readonly area: ResizeArea;
  private readonly signals: number[];

  constructor(private readonly window: Meta.Window, actor: Meta.WindowActor) {
    this.area = new ResizeArea(window);
    actor.insert_child_below(this.area.actor, null);
    this.signals = WINDOW_SIGNALS.map(signal => window.connect(signal, () => this.place()));
    this.place();
  }

  private place(): void {
    const frame = this.window.get_frame_rect();
    const buffer = this.window.get_buffer_rect();
    this.area.actor.visible = !this.window.is_maximized() && !this.window.is_fullscreen();
    this.area.place(frame.x - buffer.x, frame.y - buffer.y, frame.width, frame.height);
  }

  destroy(): void {
    for (const signal of this.signals) this.window.disconnect(signal);
    this.area.actor.destroy();
  }
}

function framedByX11(window: Meta.Window): boolean {
  return window.get_client_type() === Meta.WindowClientType.X11 && window.decorated;
}

/** Whether the window draws nothing outside its frame, such as shadows of its own, so its edges are where people would grab it. */
function drawsNothingOutside(window: Meta.Window): boolean {
  const frame = window.get_frame_rect();
  const buffer = window.get_buffer_rect();
  return frame.x === buffer.x && frame.y === buffer.y && frame.width === buffer.width && frame.height === buffer.height;
}

/**
 * Lets people resize windows that draw nothing outside their frame from a band just outside their edges, so those
 * windows keep their own edges for their content. Windows with Kestrel's title bars get theirs with the bar.
 */
export class OuterEdges {
  private readonly edges = new Map<Meta.Window, OuterEdge>();
  private readonly watched = new Map<Meta.Window, number[]>();
  private readonly createdSignal: number;

  constructor() {
    this.createdSignal = global.display.connect('window-created', (_display, window: Meta.Window) => this.watch(window));
    for (const actor of global.get_window_actors()) this.watch(actor.meta_window!);
  }

  private watch(window: Meta.Window): void {
    if (!RESIZABLE_TYPES.includes(window.get_window_type())) return;
    const signals = (['shown', 'size-changed', 'notify::titlebar-height'] as const).map(signal => window.connect(signal, () => this.sync(window)));
    signals.push(window.connect('unmanaged', () => this.forget(window)));
    this.watched.set(window, signals);
    this.sync(window);
  }

  private sync(window: Meta.Window): void {
    const actor = window.get_compositor_private<Meta.WindowActor>();
    const wanted = !!actor && window.get_titlebar_height() === 0 && !framedByX11(window) && drawsNothingOutside(window);
    const edge = this.edges.get(window);
    if (wanted && !edge) this.edges.set(window, new OuterEdge(window, actor!));
    if (!wanted && edge) {
      edge.destroy();
      this.edges.delete(window);
    }
  }

  private forget(window: Meta.Window): void {
    for (const signal of this.watched.get(window) ?? []) window.disconnect(signal);
    this.watched.delete(window);
    this.edges.get(window)?.destroy();
    this.edges.delete(window);
  }

  destroy(): void {
    for (const window of [...this.watched.keys()]) this.forget(window);
    global.display.disconnect(this.createdSignal);
  }
}
