import type Meta from 'gi://Meta';

import { sharing } from '../privacy/sharing/authority.js';
import { windowCaptureGrant } from '../privacy/sharing/stored.js';

interface Capture {
  readonly window: Meta.Window;
  readonly app: string;
  readonly unshare: () => void;
}

class WindowCaptures {
  private readonly captures = new Map<number, Capture>();
  private readonly listeners = new Set<() => void>();
  private signals: number[] = [];

  get active(): Capture[] {
    return [...this.captures.values()];
  }

  follow(): void {
    this.signals = [
      global.display.connect('window-capture-started', (_display, id: number, window: Meta.Window, app: string | null) => this.started(id, window, app ?? '')),
      global.display.connect('window-capture-ended', (_display, id: number) => this.ended(id)),
    ];
  }

  unfollow(): void {
    for (const id of this.signals.splice(0)) global.display.disconnect(id);
    for (const id of [...this.captures.keys()]) this.ended(id);
  }

  watch(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  stopAll(): void {
    for (const id of [...this.captures.keys()]) global.display.stop_window_capture(id);
  }

  stopUnless(allowed: (app: string) => boolean): void {
    for (const [id, capture] of [...this.captures])
      if (capture.app && !allowed(capture.app)) global.display.stop_window_capture(id);
  }

  private started(id: number, window: Meta.Window, app: string): void {
    const unshare = sharing.begin(app, 'windows-record', () => global.display.stop_window_capture(id), app ? windowCaptureGrant(app) : null);
    this.captures.set(id, { window, app, unshare });
    this.changed();
  }

  private ended(id: number): void {
    const capture = this.captures.get(id);
    if (!capture) return;
    this.captures.delete(id);
    capture.unshare();
    this.changed();
  }

  private changed(): void {
    for (const listener of this.listeners) listener();
  }
}

export const windowCaptures = new WindowCaptures();
