import GLib from 'gi://GLib';

import type { Disposable } from '../api/v1/types.js';

/**
 * Everything one run of an extension made through the API. Disposing the scope takes it all away, and every call into
 * the extension's code goes through `run`, which times it and turns an exception into the extension being switched off.
 */
export class Scope {
  private readonly owned = new Set<Disposable>();
  private readonly cleanups: (() => void)[] = [];
  private busyMicros = 0;
  private closed = false;

  constructor(private readonly failed: (error: unknown) => void) {}

  get cpuMicros(): number {
    return this.busyMicros;
  }

  get open(): boolean {
    return !this.closed;
  }

  disposable(dispose: () => void): Disposable {
    const thing: Disposable = {
      dispose: () => {
        if (this.owned.delete(thing)) dispose();
      },
    };
    this.owned.add(thing);
    return thing;
  }

  onDisable(cleanup: () => void): Disposable {
    this.cleanups.push(cleanup);
    return {
      dispose: () => {
        const index = this.cleanups.indexOf(cleanup);
        if (index >= 0) this.cleanups.splice(index, 1);
      },
    };
  }

  run<Result>(callback: () => Result): Result | undefined {
    if (this.closed) return undefined;
    const started = GLib.get_monotonic_time();
    try {
      const result = callback();
      if (result instanceof Promise) result.catch(error => this.fail(error));
      return result;
    } catch (error) {
      this.fail(error);
      return undefined;
    } finally {
      this.busyMicros += GLib.get_monotonic_time() - started;
    }
  }

  guard<Args extends unknown[], Result>(callback: (...args: Args) => Result): (...args: Args) => Result | undefined {
    return (...args) => this.run(() => callback(...args));
  }

  private fail(error: unknown): void {
    if (this.closed) return;
    this.failed(error);
  }

  dispose(): void {
    if (this.closed) return;
    this.closed = true;
    for (const thing of [...this.owned].reverse()) thing.dispose();
    for (const cleanup of this.cleanups.splice(0)) {
      try {
        cleanup();
      } catch (error) {
        console.warn(`An extension failed to clean up: ${error}`);
      }
    }
  }
}
