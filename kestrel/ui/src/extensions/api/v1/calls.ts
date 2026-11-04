import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import { cameraMonitor } from '../../../system/privacy/camera.js';
import type { ApiContext } from './context.js';
import type { Calls } from './types.js';

const SETTLE_MS = 3000;

/**
 * Whether an app records from the microphone or films with the camera, as the privacy indicator sees it. A call starts
 * at once and ends only once both have been free for a few seconds. Watched from the first time an extension asks.
 */
class CallState {
  private readonly listeners = new Set<() => void>();
  private watching: (() => void) | null = null;
  private ending = 0;
  active = false;

  get microphone(): boolean {
    return Shell.Mixer.get_default().recording;
  }

  get camera(): boolean {
    return cameraMonitor().cameras_in_use;
  }

  watch(changed: () => void): () => void {
    this.listeners.add(changed);
    return () => this.listeners.delete(changed);
  }

  start(): void {
    if (this.watching) return;
    const mixer = Shell.Mixer.get_default();
    const camera = cameraMonitor();
    const ids = [mixer.connect('notify::recording', () => this.sync()), camera.connect('notify::cameras-in-use', () => this.sync())];
    this.watching = () => {
      mixer.disconnect(ids[0]!);
      camera.disconnect(ids[1]!);
    };
    this.active = this.microphone || this.camera;
  }

  private sync(): void {
    const taken = this.microphone || this.camera;
    if (taken) {
      if (this.ending) GLib.source_remove(this.ending);
      this.ending = 0;
      this.set(true);
    } else if (this.active && !this.ending) {
      this.ending = GLib.timeout_add(GLib.PRIORITY_DEFAULT, SETTLE_MS, () => {
        this.ending = 0;
        this.set(false);
        return GLib.SOURCE_REMOVE;
      });
    }
  }

  private set(active: boolean): void {
    if (this.active === active) return;
    this.active = active;
    for (const listener of [...this.listeners]) listener();
  }
}

const calls = new CallState();

export function callsApi({ scope }: ApiContext): Calls {
  calls.start();
  return {
    get active() {
      return calls.active;
    },
    get microphone() {
      return calls.microphone;
    },
    get camera() {
      return calls.camera;
    },
    onChanged: changed => scope.disposable(calls.watch(scope.guard(changed))),
  };
}
